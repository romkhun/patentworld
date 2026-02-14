#!/usr/bin/env python3
"""
Analysis #5 – Innovation Diffusion
Geographic spread of technology areas over time.
Output as city-level patent counts per year per section for map visualization.

Output: chapter4/innovation_diffusion.json
"""
import duckdb
from config import (
    PATENT_TSV, CPC_CURRENT_TSV, INVENTOR_TSV, LOCATION_TSV,
    OUTPUT_DIR, query_to_json, timed_msg,
)

OUT = f"{OUTPUT_DIR}/chapter4"
con = duckdb.connect()

timed_msg("innovation_diffusion: geographic spread of AI, biotech, clean energy by 5-year period")

# Focus on 3 interesting technology areas: AI (G06N), Biotech (C12), Clean Energy (Y02E → use F03/F24/H02S)
query_to_json(con, f"""
    WITH patent_year AS (
        SELECT patent_id, YEAR(CAST(patent_date AS DATE)) AS yr
        FROM {PATENT_TSV()}
        WHERE patent_type = 'utility' AND patent_date IS NOT NULL
          AND YEAR(CAST(patent_date AS DATE)) BETWEEN 1976 AND 2025
    ),
    tech_patents AS (
        SELECT DISTINCT cpc.patent_id,
            CASE
                WHEN cpc.cpc_group LIKE 'G06N%' OR cpc.cpc_group LIKE 'G06F18%'
                     OR cpc.cpc_subclass = 'G06V' THEN 'AI'
                WHEN cpc.cpc_subclass LIKE 'C12%' OR cpc.cpc_subclass LIKE 'A61K%' THEN 'Biotech & Pharma'
                WHEN cpc.cpc_subclass LIKE 'H01M%' OR cpc.cpc_subclass LIKE 'H02S%'
                     OR cpc.cpc_subclass LIKE 'F03D%' OR cpc.cpc_subclass LIKE 'F24S%' THEN 'Clean Energy'
            END AS tech_area
        FROM {CPC_CURRENT_TSV()} cpc
        WHERE cpc.cpc_group LIKE 'G06N%' OR cpc.cpc_group LIKE 'G06F18%' OR cpc.cpc_subclass = 'G06V'
           OR cpc.cpc_subclass LIKE 'C12%' OR cpc.cpc_subclass LIKE 'A61K%'
           OR cpc.cpc_subclass LIKE 'H01M%' OR cpc.cpc_subclass LIKE 'H02S%'
           OR cpc.cpc_subclass LIKE 'F03D%' OR cpc.cpc_subclass LIKE 'F24S%'
    ),
    with_location AS (
        SELECT tp.patent_id, tp.tech_area, py.yr,
               l.disambig_city AS city,
               l.disambig_state AS state,
               l.disambig_country AS country,
               l.latitude AS lat,
               l.longitude AS lng
        FROM tech_patents tp
        JOIN patent_year py ON tp.patent_id = py.patent_id
        JOIN {INVENTOR_TSV()} i ON tp.patent_id = i.patent_id AND i.inventor_sequence = 0
        JOIN {LOCATION_TSV()} l ON i.location_id = l.location_id
        WHERE l.latitude IS NOT NULL AND l.longitude IS NOT NULL
    )
    SELECT
        tech_area,
        CAST(FLOOR(yr / 5) * 5 AS INTEGER) AS period_start,
        CONCAT(CAST(CAST(FLOOR(yr / 5) * 5 AS INTEGER) AS VARCHAR), '-', CAST(CAST(FLOOR(yr / 5) * 5 AS INTEGER) + 4 AS VARCHAR)) AS period,
        city,
        state,
        country,
        ROUND(AVG(lat), 4) AS lat,
        ROUND(AVG(lng), 4) AS lng,
        COUNT(DISTINCT patent_id) AS patent_count
    FROM with_location
    GROUP BY tech_area, period_start, city, state, country
    HAVING COUNT(DISTINCT patent_id) >= 5
    ORDER BY tech_area, period_start, patent_count DESC
""", f"{OUT}/innovation_diffusion.json")

con.close()
print("\n=== Innovation Diffusion complete ===\n")
