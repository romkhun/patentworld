#!/usr/bin/env python3
"""
67: Unified Interdisciplinarity Trend — Section 13a

Compute a z-scored composite interdisciplinarity index per year:
  - Mean CPC subclasses per patent (scope)
  - Multi-section share (% of patents spanning 2+ CPC sections)
  - Topic entropy placeholder (if available, otherwise uses scope-based proxy)

Output: public/data/chapter10/interdisciplinarity_unified.json
"""
import time
import duckdb
from config import OUTPUT_DIR, save_json, timed_msg

MASTER = "/tmp/patentview/patent_master.parquet"
OUT = f"{OUTPUT_DIR}/chapter10"
con = duckdb.connect()
con.execute("SET threads TO 38")

timed_msg("Computing interdisciplinarity trend")
t0 = time.time()

result = con.execute(f"""
    WITH yearly AS (
        SELECT
            grant_year AS year,
            AVG(CAST(scope AS DOUBLE)) AS mean_scope,
            AVG(CAST(n_cpc_sections AS DOUBLE)) AS mean_cpc_sections,
            AVG(CASE WHEN is_multi_section THEN 1.0 ELSE 0.0 END) * 100 AS multi_section_pct,
            COUNT(*) AS patent_count
        FROM '{MASTER}'
        WHERE grant_year BETWEEN 1976 AND 2024
          AND cpc_section IS NOT NULL
        GROUP BY grant_year
    ),
    stats AS (
        SELECT
            AVG(mean_scope) AS mu_scope,
            STDDEV(mean_scope) AS sd_scope,
            AVG(mean_cpc_sections) AS mu_cpc,
            STDDEV(mean_cpc_sections) AS sd_cpc,
            AVG(multi_section_pct) AS mu_multi,
            STDDEV(multi_section_pct) AS sd_multi
        FROM yearly
    )
    SELECT
        y.year,
        ROUND(y.mean_scope, 4) AS mean_scope,
        ROUND(y.mean_cpc_sections, 4) AS mean_cpc_sections,
        ROUND(y.multi_section_pct, 2) AS multi_section_pct,
        y.patent_count,
        ROUND((y.mean_scope - s.mu_scope) / NULLIF(s.sd_scope, 0), 4) AS z_scope,
        ROUND((y.mean_cpc_sections - s.mu_cpc) / NULLIF(s.sd_cpc, 0), 4) AS z_cpc_sections,
        ROUND((y.multi_section_pct - s.mu_multi) / NULLIF(s.sd_multi, 0), 4) AS z_multi_section,
        ROUND(
            ((y.mean_scope - s.mu_scope) / NULLIF(s.sd_scope, 0) +
             (y.mean_cpc_sections - s.mu_cpc) / NULLIF(s.sd_cpc, 0) +
             (y.multi_section_pct - s.mu_multi) / NULLIF(s.sd_multi, 0)) / 3.0
        , 4) AS z_composite
    FROM yearly y, stats s
    ORDER BY y.year
""").fetchdf()

save_json(result.to_dict(orient="records"), f"{OUT}/interdisciplinarity_unified.json")
print(f"  Done in {time.time()-t0:.1f}s ({len(result)} rows)")

con.close()
print("\n=== 67_interdisciplinarity_trend complete ===\n")
