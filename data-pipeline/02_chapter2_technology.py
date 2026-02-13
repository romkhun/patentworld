#!/usr/bin/env python3
"""
Chapter 2 – The Technology Revolution
Generates: wipo_sectors_per_year, wipo_fields_per_year, cpc_sections_per_year,
           cpc_class_change, tech_diversity
"""
import duckdb
from config import (
    PATENT_TSV, CPC_CURRENT_TSV, CPC_TITLE_TSV, WIPO_TSV, OUTPUT_DIR,
    CPC_SECTION_NAMES, query_to_json, save_json, timed_msg,
)

OUT = f"{OUTPUT_DIR}/chapter2"
con = duckdb.connect()

# ── a) WIPO sectors per year ──────────────────────────────────────────────────
timed_msg("wipo_sectors_per_year: patent counts by WIPO sector and year")
query_to_json(con, f"""
    SELECT
        YEAR(CAST(p.patent_date AS DATE)) AS year,
        w.wipo_sector_title AS sector,
        COUNT(*) AS count
    FROM {PATENT_TSV()} p
    JOIN {WIPO_TSV()} w ON p.patent_id = w.patent_id AND w.wipo_field_sequence = 0
    WHERE p.patent_date IS NOT NULL
      AND p.patent_type = 'utility'
      AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 1976 AND 2025
    GROUP BY year, sector
    ORDER BY year, sector
""", f"{OUT}/wipo_sectors_per_year.json")

# ── b) WIPO fields per year ──────────────────────────────────────────────────
timed_msg("wipo_fields_per_year: patent counts by WIPO field and year")
query_to_json(con, f"""
    SELECT
        YEAR(CAST(p.patent_date AS DATE)) AS year,
        w.wipo_sector_title AS sector,
        w.wipo_field_title AS field,
        COUNT(*) AS count
    FROM {PATENT_TSV()} p
    JOIN {WIPO_TSV()} w ON p.patent_id = w.patent_id AND w.wipo_field_sequence = 0
    WHERE p.patent_date IS NOT NULL
      AND p.patent_type = 'utility'
      AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 1976 AND 2025
    GROUP BY year, sector, field
    ORDER BY year, sector, field
""", f"{OUT}/wipo_fields_per_year.json")

# ── c) CPC sections per year ─────────────────────────────────────────────────
timed_msg("cpc_sections_per_year: patent counts by CPC section and year")
query_to_json(con, f"""
    SELECT
        YEAR(CAST(p.patent_date AS DATE)) AS year,
        c.cpc_section AS section,
        COUNT(*) AS count
    FROM {PATENT_TSV()} p
    JOIN {CPC_CURRENT_TSV()} c ON p.patent_id = c.patent_id AND c.cpc_sequence = 0
    WHERE p.patent_date IS NOT NULL
      AND p.patent_type = 'utility'
      AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 1976 AND 2025
    GROUP BY year, section
    ORDER BY year, section
""", f"{OUT}/cpc_sections_per_year.json")

# ── d) CPC class change (2000-2010 vs 2015-2025) ─────────────────────────────
timed_msg("cpc_class_change: growing and declining CPC classes")
records = con.execute(f"""
    WITH base AS (
        SELECT
            YEAR(CAST(p.patent_date AS DATE)) AS year,
            c.cpc_group AS cpc_class
        FROM {PATENT_TSV()} p
        JOIN {CPC_CURRENT_TSV()} c ON p.patent_id = c.patent_id AND c.cpc_sequence = 0
        WHERE p.patent_date IS NOT NULL
          AND p.patent_type = 'utility'
          AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 2000 AND 2025
    ),
    early AS (
        SELECT cpc_class, COUNT(*) AS early_count
        FROM base WHERE year BETWEEN 2000 AND 2010
        GROUP BY cpc_class
    ),
    late AS (
        SELECT cpc_class, COUNT(*) AS late_count
        FROM base WHERE year BETWEEN 2015 AND 2025
        GROUP BY cpc_class
    ),
    combined AS (
        SELECT
            COALESCE(e.cpc_class, l.cpc_class) AS cpc_class,
            COALESCE(e.early_count, 0) AS early_count,
            COALESCE(l.late_count, 0) AS late_count,
            CASE WHEN COALESCE(e.early_count, 0) > 0
                THEN ROUND(100.0 * (COALESCE(l.late_count, 0) - e.early_count) / e.early_count, 1)
                ELSE NULL END AS pct_change
        FROM early e
        FULL OUTER JOIN late l ON e.cpc_class = l.cpc_class
    ),
    ranked AS (
        SELECT c.*,
            t.cpc_group_title AS class_name
        FROM combined c
        LEFT JOIN {CPC_TITLE_TSV()} t ON c.cpc_class = t.cpc_group
        WHERE c.early_count >= 100 AND c.late_count >= 100
          AND c.pct_change IS NOT NULL
    )
    SELECT * FROM (
        (SELECT *, 'growing' AS direction FROM ranked ORDER BY pct_change DESC LIMIT 15)
        UNION ALL
        (SELECT *, 'declining' AS direction FROM ranked ORDER BY pct_change ASC LIMIT 15)
    )
    ORDER BY direction, pct_change DESC
""").fetchdf().to_dict(orient="records")
save_json(records, f"{OUT}/cpc_class_change.json")
print(f"  {len(records)} rows")

# ── e) Tech diversity (1 - HHI of CPC sections) ──────────────────────────────
timed_msg("tech_diversity: Herfindahl-based diversity index per year")
query_to_json(con, f"""
    WITH section_counts AS (
        SELECT
            YEAR(CAST(p.patent_date AS DATE)) AS year,
            c.cpc_section AS section,
            COUNT(*) AS cnt
        FROM {PATENT_TSV()} p
        JOIN {CPC_CURRENT_TSV()} c ON p.patent_id = c.patent_id AND c.cpc_sequence = 0
        WHERE p.patent_date IS NOT NULL
          AND p.patent_type = 'utility'
          AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 1976 AND 2025
        GROUP BY year, section
    ),
    year_totals AS (
        SELECT year, SUM(cnt) AS total FROM section_counts GROUP BY year
    ),
    hhi AS (
        SELECT
            sc.year,
            SUM(POWER(sc.cnt * 1.0 / yt.total, 2)) AS hhi
        FROM section_counts sc
        JOIN year_totals yt ON sc.year = yt.year
        GROUP BY sc.year
    )
    SELECT
        year,
        ROUND(1.0 - hhi, 4) AS diversity_index,
        ROUND(hhi, 4) AS hhi
    FROM hhi
    ORDER BY year
""", f"{OUT}/tech_diversity.json")

con.close()
print("\n=== Chapter 2 complete ===\n")
