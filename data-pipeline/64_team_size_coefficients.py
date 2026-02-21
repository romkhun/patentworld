#!/usr/bin/env python3
"""
Team Size Coefficients — Analysis 5 for Chapter 3 (inv-team-size).

Frisch-Waugh-Lovell OLS: demean within (grant_year × cpc_section × assignee_bin),
then cohort_norm_5y ~ team_size_dummies.
Clustered SEs by assignee. Interaction with convergence dummy. By-decade marginal effects.

Output: public/data/chapter3/team_size_coefficients.json
"""
import time
import numpy as np
import duckdb
from config import OUTPUT_DIR, save_json, timed_msg

MASTER = "/tmp/patentview/patent_master.parquet"
OUT = f"{OUTPUT_DIR}/chapter3"
con = duckdb.connect()
con.execute("SET threads TO 38")

# ── Step 1: Load and prepare data ─────────────────────────────────────────────
timed_msg("Step 1: Load master and compute cohort-normalized citations")
t0 = time.time()

df = con.execute(f"""
    WITH base AS (
        SELECT
            patent_id,
            grant_year,
            cpc_section,
            team_size,
            team_size_cat,
            fwd_cite_5y,
            primary_assignee_org,
            is_multi_section
        FROM '{MASTER}'
        WHERE grant_year BETWEEN 1976 AND 2020
          AND cpc_section IS NOT NULL
          AND cpc_section NOT IN ('Y', 'D')
    ),
    cohort_mean AS (
        SELECT grant_year, cpc_section, AVG(fwd_cite_5y) AS cm
        FROM base
        GROUP BY grant_year, cpc_section
    )
    SELECT
        b.patent_id,
        b.grant_year,
        b.cpc_section,
        b.team_size,
        b.team_size_cat,
        CASE WHEN cm.cm > 0 THEN b.fwd_cite_5y / cm.cm ELSE 0 END AS cohort_norm_5y,
        b.primary_assignee_org,
        b.is_multi_section,
        CASE
            WHEN b.grant_year < 1990 THEN '1976-1989'
            WHEN b.grant_year < 2000 THEN '1990-1999'
            WHEN b.grant_year < 2010 THEN '2000-2009'
            ELSE '2010-2020'
        END AS decade
    FROM base b
    JOIN cohort_mean cm ON b.grant_year = cm.grant_year AND b.cpc_section = cm.cpc_section
""").fetchdf()
print(f"  Loaded {len(df):,} rows in {time.time()-t0:.1f}s")

# ── Step 2: FWL — demean within groups ────────────────────────────────────────
timed_msg("Step 2: Frisch-Waugh-Lovell demeaning")
t0 = time.time()

# Create assignee size bins
assignee_counts = df.groupby('primary_assignee_org').size()
def assign_bin(org):
    if org is None or str(org).strip() == '':
        return 'none'
    c = assignee_counts.get(org, 0)
    if c < 10:
        return 'small'
    elif c < 100:
        return 'medium'
    elif c < 1000:
        return 'large'
    else:
        return 'mega'

df['assignee_bin'] = df['primary_assignee_org'].map(assign_bin)

# Group demeaning
group_cols = ['grant_year', 'cpc_section', 'assignee_bin']
group_means = df.groupby(group_cols)['cohort_norm_5y'].transform('mean')
df['y_demean'] = df['cohort_norm_5y'] - group_means

# Team size dummies (reference: Solo)
categories = ['2-3', '4-6', '7+']
for cat in categories:
    df[f'ts_{cat}'] = (df['team_size_cat'] == cat).astype(float)
    # Demean dummies within groups
    group_means_d = df.groupby(group_cols)[f'ts_{cat}'].transform('mean')
    df[f'ts_{cat}_dm'] = df[f'ts_{cat}'] - group_means_d

print(f"  Demeaning done in {time.time()-t0:.1f}s")

# ── Step 3: OLS regression ────────────────────────────────────────────────────
timed_msg("Step 3: OLS regression with clustered standard errors")
t0 = time.time()

X_cols = [f'ts_{cat}_dm' for cat in categories]
X = df[X_cols].values
y = df['y_demean'].values

# Drop NaN
mask = ~(np.isnan(y) | np.any(np.isnan(X), axis=1))
X = X[mask]
y = y[mask]

# OLS: beta = (X'X)^{-1} X'y
XtX = X.T @ X
Xty = X.T @ y
beta = np.linalg.solve(XtX, Xty)
residuals = y - X @ beta

# Clustered SEs by assignee — vectorized via pandas groupby
import pandas as pd
clusters = df.loc[mask, 'primary_assignee_org'].fillna('__none__').values
n, k = X.shape
G = len(np.unique(clusters))

XtX_inv = np.linalg.inv(XtX)

# Build score matrix: each row is X_i * e_i (k columns)
score_matrix = X * residuals[:, np.newaxis]  # n × k

# Sum scores within clusters using pandas groupby (vectorized, fast)
score_df = pd.DataFrame(score_matrix, columns=[f's{i}' for i in range(k)])
score_df['cluster'] = clusters
cluster_scores = score_df.groupby('cluster').sum().values  # G × k

# B = Σ_g (score_g' × score_g) = cluster_scores.T @ cluster_scores
B = cluster_scores.T @ cluster_scores

scale = (G / (G - 1)) * ((n - 1) / (n - k))
V_cluster = scale * XtX_inv @ B @ XtX_inv
se_cluster = np.sqrt(np.diag(V_cluster))

# Build results
coef_results = [{'category': 'Solo', 'coefficient': 0.0, 'se': 0.0, 'ci_lower': 0.0, 'ci_upper': 0.0}]
for i, cat in enumerate(categories):
    coef_results.append({
        'category': cat,
        'coefficient': round(float(beta[i]), 6),
        'se': round(float(se_cluster[i]), 6),
        'ci_lower': round(float(beta[i] - 1.96 * se_cluster[i]), 6),
        'ci_upper': round(float(beta[i] + 1.96 * se_cluster[i]), 6),
    })
print(f"  Main regression done in {time.time()-t0:.1f}s")

# ── Step 4: Interaction with convergence dummy ────────────────────────────────
timed_msg("Step 4: Interaction with multi-section (convergence) dummy")
t0 = time.time()

# Add interaction terms
df['multi'] = df['is_multi_section'].astype(float)
for cat in categories:
    df[f'ts_{cat}_multi'] = df[f'ts_{cat}'] * df['multi']
    group_means_i = df.groupby(group_cols)[f'ts_{cat}_multi'].transform('mean')
    df[f'ts_{cat}_multi_dm'] = df[f'ts_{cat}_multi'] - group_means_i

# Demean multi dummy
group_means_m = df.groupby(group_cols)['multi'].transform('mean')
df['multi_dm'] = df['multi'] - group_means_m

X_int_cols = [f'ts_{cat}_dm' for cat in categories] + ['multi_dm'] + [f'ts_{cat}_multi_dm' for cat in categories]
X_int = df[X_int_cols].values[mask]

# Handle NaN in new columns
mask2 = ~np.any(np.isnan(X_int), axis=1)
X_int = X_int[mask2]
y_int = y[mask2]

beta_int = np.linalg.solve(X_int.T @ X_int, X_int.T @ y_int)

interaction_results = {
    'main_effects': {cat: round(float(beta_int[i]), 6) for i, cat in enumerate(categories)},
    'convergence_effect': round(float(beta_int[len(categories)]), 6),
    'interactions': {cat: round(float(beta_int[len(categories) + 1 + i]), 6) for i, cat in enumerate(categories)},
}
print(f"  Interaction done in {time.time()-t0:.1f}s")

# ── Step 5: By-decade marginal effects ────────────────────────────────────────
timed_msg("Step 5: By-decade marginal effects")
t0 = time.time()

decade_results = []
for decade in ['1976-1989', '1990-1999', '2000-2009', '2010-2020']:
    sub = df[df['decade'] == decade]
    X_d = sub[X_cols].values
    y_d = sub['y_demean'].values
    m2 = ~(np.isnan(y_d) | np.any(np.isnan(X_d), axis=1))
    X_d = X_d[m2]
    y_d = y_d[m2]
    if len(X_d) < 100:
        continue
    try:
        beta_d = np.linalg.solve(X_d.T @ X_d, X_d.T @ y_d)
        resid_d = y_d - X_d @ beta_d
        se_d = np.sqrt(np.diag(np.sum(resid_d**2) / (len(y_d) - len(categories)) * np.linalg.inv(X_d.T @ X_d)))
    except np.linalg.LinAlgError:
        continue

    for i, cat in enumerate(categories):
        decade_results.append({
            'decade': decade,
            'category': cat,
            'coefficient': round(float(beta_d[i]), 6),
            'se': round(float(se_d[i]), 6),
            'ci_lower': round(float(beta_d[i] - 1.96 * se_d[i]), 6),
            'ci_upper': round(float(beta_d[i] + 1.96 * se_d[i]), 6),
        })
print(f"  By-decade done in {time.time()-t0:.1f}s")

# ── Save output ───────────────────────────────────────────────────────────────
output = {
    'main_coefficients': coef_results,
    'interaction': interaction_results,
    'by_decade': decade_results,
    'metadata': {
        'n_patents': int(n),
        'n_clusters': int(G),
        'reference_category': 'Solo',
        'dependent_variable': 'cohort_norm_5y',
        'fixed_effects': 'grant_year × cpc_section × assignee_bin',
    }
}
save_json(output, f"{OUT}/team_size_coefficients.json")

con.close()
print("\n=== 64_team_size_coefficients complete ===\n")
