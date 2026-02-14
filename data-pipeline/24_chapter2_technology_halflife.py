#!/usr/bin/env python3
"""
Analysis #13 – The Half-Life of Technology
Measure how quickly patents become obsolete via forward citation decay curves.

Output: chapter2/technology_halflife.json
"""
import duckdb
from config import (
    PATENT_TSV, CPC_CURRENT_TSV, CITATION_TSV,
    OUTPUT_DIR, query_to_json, save_json, timed_msg,
)
import numpy as np

OUT = f"{OUTPUT_DIR}/chapter2"
con = duckdb.connect()

timed_msg("technology_halflife: citation decay by CPC section")

# Get raw citation decay data per section
decay_data = con.execute(f"""
    WITH cited AS (
        SELECT p.patent_id, CAST(p.patent_date AS DATE) AS grant_date,
               LEFT(cpc.cpc_section, 1) AS section
        FROM {PATENT_TSV()} p
        JOIN {CPC_CURRENT_TSV()} cpc ON p.patent_id = cpc.patent_id AND cpc.cpc_sequence = 0
        WHERE p.patent_type = 'utility'
          AND p.patent_date IS NOT NULL
          AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 1976 AND 2010
          AND LEFT(cpc.cpc_section, 1) != 'Y'
    ),
    citing AS (
        SELECT patent_id, CAST(patent_date AS DATE) AS grant_date
        FROM {PATENT_TSV()}
        WHERE patent_date IS NOT NULL
    ),
    cite_age AS (
        SELECT
            cd.section,
            LEAST(CAST(DATEDIFF('day', cd.grant_date, cg.grant_date) / 365.25 AS INTEGER), 30) AS years_after,
            COUNT(*) AS cites
        FROM {CITATION_TSV()} c
        JOIN cited cd ON c.citation_patent_id = cd.patent_id
        JOIN citing cg ON c.patent_id = cg.patent_id
        WHERE DATEDIFF('day', cd.grant_date, cg.grant_date) > 0
        GROUP BY cd.section, years_after
    )
    SELECT section, years_after, cites
    FROM cite_age
    WHERE years_after BETWEEN 0 AND 30
    ORDER BY section, years_after
""").fetchdf()

# Compute half-life per section
sections = decay_data['section'].unique()
results = []
for section in sorted(sections):
    sdata = decay_data[decay_data['section'] == section].sort_values('years_after')
    years = sdata['years_after'].values
    cites = sdata['cites'].values
    cum = np.cumsum(cites)
    total = cum[-1] if len(cum) > 0 else 0
    if total == 0:
        continue
    cum_pct = cum / total
    # Find half-life: year where 50% of cumulative citations received
    half_life = None
    for i, pct in enumerate(cum_pct):
        if pct >= 0.5:
            half_life = float(years[i])
            # Interpolate
            if i > 0:
                prev_pct = cum_pct[i-1]
                half_life = float(years[i-1]) + (0.5 - prev_pct) / (pct - prev_pct)
            break
    results.append({
        'section': section,
        'half_life_years': round(half_life, 1) if half_life else None,
        'total_citations': int(total),
    })

# Also save the decay curves for visualization
curve_records = []
for _, row in decay_data.iterrows():
    section = row['section']
    sdata = decay_data[decay_data['section'] == section]
    total = sdata['cites'].sum()
    curve_records.append({
        'section': row['section'],
        'years_after': int(row['years_after']),
        'citations': int(row['cites']),
        'pct_of_total': round(100.0 * row['cites'] / total, 2) if total > 0 else 0,
    })

save_json(results, f"{OUT}/technology_halflife.json")
save_json(curve_records, f"{OUT}/technology_decay_curves.json")

con.close()
print("\n=== Technology Half-Life complete ===\n")
