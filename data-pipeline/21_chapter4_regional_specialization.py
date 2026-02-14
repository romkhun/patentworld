#!/usr/bin/env python3
"""
Analysis #6 – Regional Specialization Index (Location Quotient)
LQ = (share of tech X in metro) / (share of tech X nationally)

Output: chapter4/regional_specialization.json
"""
import duckdb
from config import (
    PATENT_TSV, CPC_CURRENT_TSV, INVENTOR_TSV, LOCATION_TSV,
    OUTPUT_DIR, query_to_json, timed_msg,
)

OUT = f"{OUTPUT_DIR}/chapter4"
con = duckdb.connect()

timed_msg("regional_specialization: Location Quotient per city × CPC section")

query_to_json(con, f"""
    WITH patent_recent AS (
        SELECT patent_id
        FROM {PATENT_TSV()}
        WHERE patent_type = 'utility'
          AND patent_date IS NOT NULL
          AND YEAR(CAST(patent_date AS DATE)) BETWEEN 2010 AND 2025
    ),
    patent_location AS (
        SELECT DISTINCT pr.patent_id,
               l.disambig_city AS city,
               l.disambig_state AS state,
               l.disambig_country AS country
        FROM patent_recent pr
        JOIN {INVENTOR_TSV()} i ON pr.patent_id = i.patent_id AND i.inventor_sequence = 0
        JOIN {LOCATION_TSV()} l ON i.location_id = l.location_id
        WHERE l.disambig_country = 'US'
          AND l.disambig_city IS NOT NULL
          AND l.disambig_state IS NOT NULL
    ),
    patent_section AS (
        SELECT DISTINCT pl.patent_id, pl.city, pl.state,
               LEFT(cpc.cpc_section, 1) AS section
        FROM patent_location pl
        JOIN {CPC_CURRENT_TSV()} cpc ON pl.patent_id = cpc.patent_id AND cpc.cpc_sequence = 0
        WHERE LEFT(cpc.cpc_section, 1) != 'Y'
    ),
    -- Metro patents by section
    metro_section AS (
        SELECT city, state, section, COUNT(*) AS metro_section_count
        FROM patent_section
        GROUP BY city, state, section
    ),
    metro_total AS (
        SELECT city, state, SUM(metro_section_count) AS metro_total
        FROM metro_section
        GROUP BY city, state
        HAVING SUM(metro_section_count) >= 500
    ),
    national_section AS (
        SELECT section, COUNT(*) AS nat_section_count
        FROM patent_section
        GROUP BY section
    ),
    national_total AS (
        SELECT SUM(nat_section_count) AS nat_total FROM national_section
    )
    SELECT
        ms.city,
        ms.state,
        mt.metro_total AS total_patents,
        ms.section,
        ms.metro_section_count,
        ROUND(
            (CAST(ms.metro_section_count AS DOUBLE) / mt.metro_total) /
            (CAST(ns.nat_section_count AS DOUBLE) / nt.nat_total),
            2
        ) AS location_quotient
    FROM metro_section ms
    JOIN metro_total mt ON ms.city = mt.city AND ms.state = mt.state
    JOIN national_section ns ON ms.section = ns.section
    CROSS JOIN national_total nt
    ORDER BY ms.city, ms.state, ms.section
""", f"{OUT}/regional_specialization.json")

con.close()
print("\n=== Regional Specialization complete ===\n")
