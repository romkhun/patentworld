#!/usr/bin/env python3
"""
Batch additions for existing chapters — fills gaps identified in audit.

Generates:
  chapter2/  — technology_scurves.json (Addition 2: S-Curve fitting)
  chapter3/  — non_us_by_section.json (Addition 4: Non-US by CPC)
  chapter5/  — inventor_segments.json (Addition 5: Inventor segmentation)
  chapter5/  — inventor_segments_trend.json
  chapter6/  — co_invention_rates.json (Addition 6: US-China Decoupling)
  chapter6/  — co_invention_by_section.json
  chapter9/  — quality_by_country.json (Addition 9: Quality vs Country)
  chapter9/  — self_citation_by_assignee.json (Addition 8: enhanced)
  chapter9/  — self_citation_by_section.json
  chapter11/ — ai_team_comparison.json (Addition 10: AI team size vs non-AI)
  chapter11/ — ai_assignee_type.json
"""
import sys
import time
import numpy as np
import duckdb
from config import (
    PATENT_TSV, CPC_CURRENT_TSV, ASSIGNEE_TSV, INVENTOR_TSV,
    LOCATION_TSV, CITATION_TSV, APPLICATION_TSV,
    OUTPUT_DIR, CPC_SECTION_NAMES, query_to_json, save_json, timed_msg,
)

def log(msg):
    print(msg, flush=True)

con = duckdb.connect()

# AI CPC filter (matching chapter 11)
AI_FILTER = """
    (cpc_group LIKE 'G06N%'
     OR cpc_group LIKE 'G06F18%'
     OR cpc_subclass = 'G06V'
     OR cpc_group LIKE 'G10L15%'
     OR cpc_group LIKE 'G06F40%')
"""

# ═══════════════════════════════════════════════════════════════════════════════
# Addition 2: Technology S-Curves (chapter2)
# ═══════════════════════════════════════════════════════════════════════════════
timed_msg("Addition 2: Technology S-Curves — cumulative counts + logistic fit")

t0 = time.time()
cumulative = con.execute(f"""
    SELECT
        c.cpc_section AS section,
        YEAR(CAST(p.patent_date AS DATE)) AS year,
        COUNT(DISTINCT p.patent_id) AS annual_count
    FROM {PATENT_TSV()} p
    JOIN {CPC_CURRENT_TSV()} c ON p.patent_id = c.patent_id AND c.cpc_sequence = 0
    WHERE p.patent_type = 'utility'
      AND p.patent_date IS NOT NULL
      AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 1976 AND 2025
    GROUP BY section, year
    ORDER BY section, year
""").fetchdf()
log(f"  Query done in {time.time()-t0:.1f}s ({len(cumulative):,} rows)")

from scipy.optimize import curve_fit

def logistic(t, K, r, t0):
    return K / (1 + np.exp(-r * (t - t0)))

scurve_results = []
for section in sorted(cumulative['section'].unique()):
    if section not in CPC_SECTION_NAMES:
        continue
    sec_data = cumulative[cumulative['section'] == section].sort_values('year')
    years = sec_data['year'].values.astype(float)
    counts = sec_data['annual_count'].values.astype(float)
    cum_counts = np.cumsum(counts)

    # Recent 5-year volume and growth rate
    recent_5yr = int(counts[-5:].sum()) if len(counts) >= 5 else int(counts.sum())
    current_growth = float(counts[-1] / counts[-6] - 1) * 100 if len(counts) >= 6 and counts[-6] > 0 else 0.0

    try:
        p0 = [cum_counts[-1] * 2, 0.1, years.mean()]
        bounds = ([cum_counts[-1] * 0.5, 0.001, 1970], [cum_counts[-1] * 20, 1.0, 2030])
        popt, _ = curve_fit(logistic, years, cum_counts, p0=p0, bounds=bounds, maxfev=10000)
        K, r, t0_fit = popt
        current_pct = float(cum_counts[-1] / K * 100) if K > 0 else 100

        if current_pct < 10:
            stage = 'Emerging'
        elif current_pct < 50:
            stage = 'Growth'
        elif current_pct < 90:
            stage = 'Mature'
        else:
            stage = 'Saturated'

        fitted_values = [round(float(logistic(y, K, r, t0_fit)), 0) for y in years]
    except Exception as e:
        K, r, t0_fit = cum_counts[-1] * 2, 0.05, 2000
        stage = 'Unknown'
        current_pct = 50
        fitted_values = [0] * len(years)
        log(f"  WARNING: Curve fit failed for section {section}: {e}")

    scurve_results.append({
        'section': section,
        'section_name': CPC_SECTION_NAMES.get(section, section),
        'K': round(float(K), 0),
        'r': round(float(r), 4),
        't0': round(float(t0_fit), 1),
        'lifecycle_stage': stage,
        'current_pct_of_K': round(current_pct, 1),
        'current_growth_rate': round(current_growth, 1),
        'cumulative_total': int(cum_counts[-1]),
        'recent_5yr_volume': recent_5yr,
        'years': [int(y) for y in years],
        'actual_cumulative': [int(c) for c in cum_counts],
        'fitted_cumulative': fitted_values,
    })
    log(f"  {section} ({CPC_SECTION_NAMES.get(section,'')}): K={K:,.0f} r={r:.4f} stage={stage}")

save_json(scurve_results, f"{OUTPUT_DIR}/chapter2/technology_scurves.json")

# ═══════════════════════════════════════════════════════════════════════════════
# Addition 4: Non-US Assignees by CPC Section (chapter3)
# ═══════════════════════════════════════════════════════════════════════════════
timed_msg("Addition 4: Non-US assignees by CPC section over time")

query_to_json(con, f"""
    SELECT
        YEAR(CAST(p.patent_date AS DATE)) AS year,
        c.cpc_section AS section,
        CASE
            WHEN l.disambig_country = 'US' THEN 'United States'
            WHEN l.disambig_country = 'JP' THEN 'Japan'
            WHEN l.disambig_country = 'KR' THEN 'South Korea'
            WHEN l.disambig_country = 'CN' THEN 'China'
            WHEN l.disambig_country = 'DE' THEN 'Germany'
            WHEN l.disambig_country IN ('FR','GB','IT','NL','SE','CH','FI','AT','BE','DK','ES','IE','NO') THEN 'Rest of Europe'
            ELSE 'Rest of World'
        END AS country,
        COUNT(DISTINCT p.patent_id) AS count
    FROM {PATENT_TSV()} p
    JOIN {CPC_CURRENT_TSV()} c ON p.patent_id = c.patent_id AND c.cpc_sequence = 0
    JOIN {ASSIGNEE_TSV()} a ON p.patent_id = a.patent_id AND a.assignee_sequence = 0
    JOIN {LOCATION_TSV()} l ON a.location_id = l.location_id
    WHERE p.patent_type = 'utility'
      AND p.patent_date IS NOT NULL
      AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 1976 AND 2025
      AND c.cpc_section IN ('A','B','C','D','E','F','G','H')
    GROUP BY year, section, country
    ORDER BY year, section, country
""", f"{OUTPUT_DIR}/chapter3/non_us_by_section.json")

# ═══════════════════════════════════════════════════════════════════════════════
# Addition 5: Inventor Segmentation (chapter5)
# ═══════════════════════════════════════════════════════════════════════════════
timed_msg("Addition 5: Inventor segmentation (one-hit to mega)")

t0 = time.time()
segments_df = con.execute(f"""
    WITH inventor_counts AS (
        SELECT
            i.inventor_id,
            COUNT(DISTINCT p.patent_id) AS total_patents
        FROM {INVENTOR_TSV()} i
        JOIN {PATENT_TSV()} p ON i.patent_id = p.patent_id
        WHERE p.patent_type = 'utility'
          AND p.patent_date IS NOT NULL
        GROUP BY i.inventor_id
    ),
    segmented AS (
        SELECT
            inventor_id,
            total_patents,
            CASE
                WHEN total_patents = 1 THEN 'One-Hit Wonder'
                WHEN total_patents BETWEEN 2 AND 9 THEN 'Occasional'
                WHEN total_patents BETWEEN 10 AND 49 THEN 'Prolific'
                WHEN total_patents BETWEEN 50 AND 99 THEN 'Superstar'
                ELSE 'Mega-Inventor'
            END AS segment
        FROM inventor_counts
    )
    SELECT
        segment,
        COUNT(*) AS inventor_count,
        SUM(total_patents) AS total_patents,
        AVG(total_patents) AS avg_patents
    FROM segmented
    GROUP BY segment
    ORDER BY
        CASE segment
            WHEN 'One-Hit Wonder' THEN 1
            WHEN 'Occasional' THEN 2
            WHEN 'Prolific' THEN 3
            WHEN 'Superstar' THEN 4
            WHEN 'Mega-Inventor' THEN 5
        END
""").fetchdf()
log(f"  Segment query done in {time.time()-t0:.1f}s")

# Compute shares
total_patents_all = segments_df['total_patents'].sum()
total_inventors_all = segments_df['inventor_count'].sum()
segment_records = []
for _, row in segments_df.iterrows():
    segment_records.append({
        'segment': row['segment'],
        'inventor_count': int(row['inventor_count']),
        'total_patents': int(row['total_patents']),
        'avg_patents': round(float(row['avg_patents']), 1),
        'patent_share': round(100 * float(row['total_patents']) / total_patents_all, 2),
        'inventor_share': round(100 * float(row['inventor_count']) / total_inventors_all, 2),
    })
save_json(segment_records, f"{OUTPUT_DIR}/chapter5/inventor_segments.json")

# Trend: one-hit wonder share over time
timed_msg("Addition 5b: One-hit wonder share trend")

query_to_json(con, f"""
    WITH inventor_first AS (
        SELECT
            i.inventor_id,
            MIN(YEAR(CAST(p.patent_date AS DATE))) AS first_year
        FROM {INVENTOR_TSV()} i
        JOIN {PATENT_TSV()} p ON i.patent_id = p.patent_id
        WHERE p.patent_type = 'utility'
          AND p.patent_date IS NOT NULL
        GROUP BY i.inventor_id
    ),
    inventor_counts AS (
        SELECT inventor_id, COUNT(DISTINCT patent_id) AS total_patents
        FROM {INVENTOR_TSV()}
        GROUP BY inventor_id
    ),
    cohort AS (
        SELECT
            f.first_year AS cohort_year,
            CASE WHEN c.total_patents = 1 THEN 1 ELSE 0 END AS is_one_hit,
            c.total_patents
        FROM inventor_first f
        JOIN inventor_counts c ON f.inventor_id = c.inventor_id
        WHERE f.first_year BETWEEN 1976 AND 2020
    )
    SELECT
        cohort_year AS year,
        COUNT(*) AS total_inventors,
        SUM(is_one_hit) AS one_hit_count,
        ROUND(100.0 * SUM(is_one_hit) / COUNT(*), 2) AS one_hit_pct
    FROM cohort
    GROUP BY cohort_year
    ORDER BY cohort_year
""", f"{OUTPUT_DIR}/chapter5/inventor_segments_trend.json")

# ═══════════════════════════════════════════════════════════════════════════════
# Addition 6: US-China Decoupling (chapter6)
# ═══════════════════════════════════════════════════════════════════════════════
timed_msg("Addition 6: US-China co-invention rates")

query_to_json(con, f"""
    WITH patent_countries AS (
        SELECT
            i.patent_id,
            l.disambig_country AS country
        FROM {INVENTOR_TSV()} i
        JOIN {LOCATION_TSV()} l ON i.location_id = l.location_id
        WHERE l.disambig_country IS NOT NULL
    ),
    us_patents AS (
        SELECT DISTINCT patent_id
        FROM patent_countries WHERE country = 'US'
    ),
    us_total AS (
        SELECT
            YEAR(CAST(p.patent_date AS DATE)) AS year,
            COUNT(DISTINCT p.patent_id) AS us_patents
        FROM us_patents up
        JOIN {PATENT_TSV()} p ON up.patent_id = p.patent_id
        WHERE p.patent_type = 'utility'
          AND p.patent_date IS NOT NULL
          AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 1976 AND 2025
        GROUP BY year
    ),
    co_invented AS (
        SELECT
            YEAR(CAST(p.patent_date AS DATE)) AS year,
            pc.country AS partner_country,
            COUNT(DISTINCT p.patent_id) AS co_count
        FROM us_patents up
        JOIN patent_countries pc ON up.patent_id = pc.patent_id AND pc.country != 'US'
        JOIN {PATENT_TSV()} p ON up.patent_id = p.patent_id
        WHERE p.patent_type = 'utility'
          AND p.patent_date IS NOT NULL
          AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 1976 AND 2025
          AND pc.country IN ('CN','JP','KR','DE','GB','IN')
        GROUP BY year, partner_country
    )
    SELECT
        ci.year,
        CASE ci.partner_country
            WHEN 'CN' THEN 'China'
            WHEN 'JP' THEN 'Japan'
            WHEN 'KR' THEN 'South Korea'
            WHEN 'DE' THEN 'Germany'
            WHEN 'GB' THEN 'United Kingdom'
            WHEN 'IN' THEN 'India'
        END AS partner,
        ci.co_count,
        ut.us_patents,
        ROUND(100.0 * ci.co_count / ut.us_patents, 3) AS co_invention_rate
    FROM co_invented ci
    JOIN us_total ut ON ci.year = ut.year
    ORDER BY ci.year, ci.partner_country
""", f"{OUTPUT_DIR}/chapter6/co_invention_rates.json")

# US-China by CPC section
timed_msg("Addition 6b: US-China co-invention by CPC section")

query_to_json(con, f"""
    WITH patent_countries AS (
        SELECT DISTINCT i.patent_id, l.disambig_country AS country
        FROM {INVENTOR_TSV()} i
        JOIN {LOCATION_TSV()} l ON i.location_id = l.location_id
        WHERE l.disambig_country IS NOT NULL
    ),
    us_cn_patents AS (
        SELECT DISTINCT us.patent_id
        FROM patent_countries us
        JOIN patent_countries cn ON us.patent_id = cn.patent_id
        WHERE us.country = 'US' AND cn.country = 'CN'
    ),
    by_section AS (
        SELECT
            YEAR(CAST(p.patent_date AS DATE)) AS year,
            c.cpc_section AS section,
            COUNT(DISTINCT uc.patent_id) AS us_cn_count
        FROM us_cn_patents uc
        JOIN {PATENT_TSV()} p ON uc.patent_id = p.patent_id
        JOIN {CPC_CURRENT_TSV()} c ON uc.patent_id = c.patent_id AND c.cpc_sequence = 0
        WHERE p.patent_type = 'utility'
          AND p.patent_date IS NOT NULL
          AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 2000 AND 2025
          AND c.cpc_section IN ('A','B','C','G','H')
        GROUP BY year, section
    )
    SELECT * FROM by_section ORDER BY year, section
""", f"{OUTPUT_DIR}/chapter6/co_invention_us_china_by_section.json")

# ═══════════════════════════════════════════════════════════════════════════════
# Addition 8: Enhanced Self-Citation (chapter9)
# ═══════════════════════════════════════════════════════════════════════════════
timed_msg("Addition 8: Self-citation by top 20 assignees")

query_to_json(con, f"""
    WITH top_assignees AS (
        SELECT disambig_assignee_organization AS organization, COUNT(DISTINCT patent_id) AS total
        FROM {ASSIGNEE_TSV()}
        WHERE disambig_assignee_organization IS NOT NULL
          AND disambig_assignee_organization != ''
          AND assignee_sequence = 0
        GROUP BY organization
        ORDER BY total DESC
        LIMIT 20
    ),
    cite_pairs AS (
        SELECT
            cit.patent_id AS citing_id,
            cit.citation_patent_id AS cited_id,
            a1.disambig_assignee_organization AS citing_org,
            a2.disambig_assignee_organization AS cited_org
        FROM {CITATION_TSV()} cit
        JOIN {ASSIGNEE_TSV()} a1 ON cit.patent_id = a1.patent_id AND a1.assignee_sequence = 0
        JOIN {ASSIGNEE_TSV()} a2 ON cit.citation_patent_id = a2.patent_id AND a2.assignee_sequence = 0
        WHERE a1.disambig_assignee_organization IN (SELECT organization FROM top_assignees)
    )
    SELECT
        citing_org AS organization,
        COUNT(*) AS total_citations,
        SUM(CASE WHEN citing_org = cited_org THEN 1 ELSE 0 END) AS self_citations,
        ROUND(100.0 * SUM(CASE WHEN citing_org = cited_org THEN 1 ELSE 0 END) / COUNT(*), 2) AS self_cite_rate
    FROM cite_pairs
    GROUP BY citing_org
    ORDER BY self_cite_rate DESC
""", f"{OUTPUT_DIR}/chapter9/self_citation_by_assignee.json")

# Self-citation by CPC section × decade
timed_msg("Addition 8b: Self-citation by CPC section × decade")

query_to_json(con, f"""
    WITH cite_pairs AS (
        SELECT
            cit.patent_id AS citing_id,
            YEAR(CAST(p.patent_date AS DATE)) AS citing_year,
            c.cpc_section AS section,
            a1.disambig_assignee_organization AS citing_org,
            a2.disambig_assignee_organization AS cited_org
        FROM {CITATION_TSV()} cit
        JOIN {PATENT_TSV()} p ON cit.patent_id = p.patent_id
        JOIN {CPC_CURRENT_TSV()} c ON cit.patent_id = c.patent_id AND c.cpc_sequence = 0
        JOIN {ASSIGNEE_TSV()} a1 ON cit.patent_id = a1.patent_id AND a1.assignee_sequence = 0
        JOIN {ASSIGNEE_TSV()} a2 ON cit.citation_patent_id = a2.patent_id AND a2.assignee_sequence = 0
        WHERE p.patent_type = 'utility'
          AND p.patent_date IS NOT NULL
          AND c.cpc_section IN ('A','B','C','D','E','F','G','H')
    )
    SELECT
        FLOOR(citing_year / 10) * 10 AS decade,
        section,
        COUNT(*) AS total_citations,
        SUM(CASE WHEN citing_org = cited_org THEN 1 ELSE 0 END) AS self_citations,
        ROUND(100.0 * SUM(CASE WHEN citing_org = cited_org THEN 1 ELSE 0 END) / COUNT(*), 2) AS self_cite_rate
    FROM cite_pairs
    WHERE citing_year BETWEEN 1980 AND 2025
    GROUP BY decade, section
    ORDER BY decade, section
""", f"{OUTPUT_DIR}/chapter9/self_citation_by_section.json")

# ═══════════════════════════════════════════════════════════════════════════════
# Addition 9: Quality by Country (chapter9)
# ═══════════════════════════════════════════════════════════════════════════════
timed_msg("Addition 9: Patent quality by country")

query_to_json(con, f"""
    WITH country_stats AS (
        SELECT
            CASE
                WHEN l.disambig_country = 'US' THEN 'United States'
                WHEN l.disambig_country = 'JP' THEN 'Japan'
                WHEN l.disambig_country = 'KR' THEN 'South Korea'
                WHEN l.disambig_country = 'CN' THEN 'China'
                WHEN l.disambig_country = 'DE' THEN 'Germany'
                WHEN l.disambig_country = 'TW' THEN 'Taiwan'
                WHEN l.disambig_country = 'GB' THEN 'United Kingdom'
                WHEN l.disambig_country = 'FR' THEN 'France'
                WHEN l.disambig_country = 'CA' THEN 'Canada'
                WHEN l.disambig_country = 'IL' THEN 'Israel'
                WHEN l.disambig_country = 'CH' THEN 'Switzerland'
                WHEN l.disambig_country = 'NL' THEN 'Netherlands'
                WHEN l.disambig_country = 'SE' THEN 'Sweden'
                WHEN l.disambig_country = 'FI' THEN 'Finland'
                WHEN l.disambig_country = 'IN' THEN 'India'
                ELSE NULL
            END AS country,
            FLOOR(YEAR(CAST(p.patent_date AS DATE)) / 10) * 10 AS decade,
            COUNT(DISTINCT p.patent_id) AS patent_count,
            AVG(p.num_claims) AS avg_claims
        FROM {PATENT_TSV()} p
        JOIN {ASSIGNEE_TSV()} a ON p.patent_id = a.patent_id AND a.assignee_sequence = 0
        JOIN {LOCATION_TSV()} l ON a.location_id = l.location_id
        WHERE p.patent_type = 'utility'
          AND p.patent_date IS NOT NULL
          AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 1976 AND 2020
          AND l.disambig_country IS NOT NULL
        GROUP BY country, decade
        HAVING country IS NOT NULL AND patent_count >= 100
    )
    SELECT * FROM country_stats
    ORDER BY decade, patent_count DESC
""", f"{OUTPUT_DIR}/chapter9/quality_by_country.json")

# ═══════════════════════════════════════════════════════════════════════════════
# Addition 10: AI Team Size Comparison + Assignee Type (chapter11)
# ═══════════════════════════════════════════════════════════════════════════════
timed_msg("Addition 10: AI vs Non-AI team size comparison")

query_to_json(con, f"""
    WITH ai_patents AS (
        SELECT DISTINCT patent_id FROM {CPC_CURRENT_TSV()} WHERE {AI_FILTER}
    ),
    patent_team AS (
        SELECT
            p.patent_id,
            YEAR(CAST(p.patent_date AS DATE)) AS year,
            COUNT(DISTINCT i.inventor_id) AS team_size,
            CASE WHEN ap.patent_id IS NOT NULL THEN 'AI' ELSE 'Non-AI' END AS category
        FROM {PATENT_TSV()} p
        JOIN {INVENTOR_TSV()} i ON p.patent_id = i.patent_id
        LEFT JOIN ai_patents ap ON p.patent_id = ap.patent_id
        WHERE p.patent_type = 'utility'
          AND p.patent_date IS NOT NULL
          AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 1990 AND 2025
        GROUP BY p.patent_id, year, category
    )
    SELECT
        year,
        category,
        COUNT(*) AS patent_count,
        AVG(team_size) AS avg_team_size,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY team_size) AS median_team_size
    FROM patent_team
    GROUP BY year, category
    ORDER BY year, category
""", f"{OUTPUT_DIR}/chapter11/ai_team_comparison.json")

# AI assignee type breakdown
timed_msg("Addition 10b: AI patent assignee type trend")

query_to_json(con, f"""
    WITH ai_patents AS (
        SELECT DISTINCT patent_id FROM {CPC_CURRENT_TSV()} WHERE {AI_FILTER}
    )
    SELECT
        YEAR(CAST(p.patent_date AS DATE)) AS year,
        CASE
            WHEN a.assignee_type IN (2, 3) THEN 'Corporate'
            WHEN a.assignee_type IN (6, 7) THEN 'Government'
            WHEN a.assignee_type IN (4, 5) THEN 'Individual'
            ELSE 'University/Other'
        END AS assignee_category,
        COUNT(DISTINCT p.patent_id) AS count
    FROM ai_patents ap
    JOIN {PATENT_TSV()} p ON ap.patent_id = p.patent_id
    JOIN {ASSIGNEE_TSV()} a ON p.patent_id = a.patent_id AND a.assignee_sequence = 0
    WHERE p.patent_type = 'utility'
      AND p.patent_date IS NOT NULL
      AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 1990 AND 2025
    GROUP BY year, assignee_category
    ORDER BY year, assignee_category
""", f"{OUTPUT_DIR}/chapter11/ai_assignee_type.json")

timed_msg("All batch additions complete!")
con.close()
