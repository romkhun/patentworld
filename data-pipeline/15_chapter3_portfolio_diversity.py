#!/usr/bin/env python3
"""
Analysis #2 – Patent Portfolio Diversity Score
For top assignees, compute Shannon entropy across CPC subclasses over time.
Higher entropy = more diverse portfolio.

Output: chapter3/portfolio_diversity.json
"""
import duckdb, math
from config import (
    PATENT_TSV, CPC_CURRENT_TSV, ASSIGNEE_TSV,
    OUTPUT_DIR, save_json, timed_msg,
)

OUT = f"{OUTPUT_DIR}/chapter3"
con = duckdb.connect()

timed_msg("portfolio_diversity: Shannon entropy for top assignees over time")

# Step 1: Identify top 25 assignees by total patent count
top_orgs = con.execute(f"""
    SELECT a.disambig_assignee_organization AS organization, COUNT(DISTINCT a.patent_id) AS total
    FROM {ASSIGNEE_TSV()} a
    JOIN {PATENT_TSV()} p ON a.patent_id = p.patent_id
    WHERE p.patent_type = 'utility'
      AND a.assignee_sequence = 0
      AND a.disambig_assignee_organization IS NOT NULL
      AND a.disambig_assignee_organization != ''
    GROUP BY a.disambig_assignee_organization
    ORDER BY total DESC
    LIMIT 25
""").fetchdf()['organization'].tolist()

print(f"  Top {len(top_orgs)} organizations identified")

# Step 2: For each org, compute Shannon entropy per 5-year period
# Shannon entropy H = -Σ(p_i * ln(p_i)) where p_i = share of patents in CPC subclass i
result = con.execute(f"""
    WITH patent_base AS (
        SELECT p.patent_id,
               CAST(FLOOR(YEAR(CAST(p.patent_date AS DATE)) / 5) * 5 AS INTEGER) AS period_start,
               a.disambig_assignee_organization AS organization
        FROM {PATENT_TSV()} p
        JOIN {ASSIGNEE_TSV()} a ON p.patent_id = a.patent_id AND a.assignee_sequence = 0
        WHERE p.patent_type = 'utility'
          AND p.patent_date IS NOT NULL
          AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 1976 AND 2025
          AND a.disambig_assignee_organization IN ({','.join(f"'{o.replace(chr(39), chr(39)+chr(39))}'" for o in top_orgs)})
    ),
    patent_subclass AS (
        SELECT DISTINCT pb.patent_id, pb.period_start, pb.organization,
               cpc.cpc_subclass
        FROM patent_base pb
        JOIN {CPC_CURRENT_TSV()} cpc ON pb.patent_id = cpc.patent_id
        WHERE cpc.cpc_subclass IS NOT NULL
    ),
    org_period_subclass AS (
        SELECT organization, period_start, cpc_subclass,
               COUNT(DISTINCT patent_id) AS cnt
        FROM patent_subclass
        GROUP BY organization, period_start, cpc_subclass
    ),
    org_period_total AS (
        SELECT organization, period_start, SUM(cnt) AS total
        FROM org_period_subclass
        GROUP BY organization, period_start
    ),
    shares AS (
        SELECT ops.organization, ops.period_start, ops.cpc_subclass,
               CAST(ops.cnt AS DOUBLE) / opt.total AS share
        FROM org_period_subclass ops
        JOIN org_period_total opt ON ops.organization = opt.organization
            AND ops.period_start = opt.period_start
    )
    SELECT
        organization,
        period_start,
        CONCAT(CAST(period_start AS VARCHAR), '-', CAST(period_start + 4 AS VARCHAR)) AS period,
        COUNT(DISTINCT cpc_subclass) AS num_subclasses,
        ROUND(-SUM(share * LN(share)), 3) AS shannon_entropy,
        SUM(CASE WHEN share > 0 THEN 1 ELSE 0 END) AS active_subclasses
    FROM shares
    GROUP BY organization, period_start
    ORDER BY organization, period_start
""").fetchdf()

records = result.to_dict(orient='records')
# Clean types
for r in records:
    r['period_start'] = int(r['period_start'])
    r['num_subclasses'] = int(r['num_subclasses'])
    r['active_subclasses'] = int(r['active_subclasses'])
    r['shannon_entropy'] = float(r['shannon_entropy']) if r['shannon_entropy'] is not None else 0.0

save_json(records, f"{OUT}/portfolio_diversity.json")

con.close()
print("\n=== Portfolio Diversity complete ===\n")
