#!/usr/bin/env python3
"""
ACT 6 Chapter-Specific Enrichments — bundled analyses for individual domains.

Sections:
  5d. AI GPT KPI — distinct CPC sections + HHI by year
  5g. Green EV-Battery coupling — co-occurrence lift H01M/H02J × B60L/B60W
  5h. Semiconductor-Quantum dependence — quantum assignees with prior semi patents
  5i. Systems complexity — team size + claims indexed to baseline (3D, space, AV)
  5c. Blockchain hype cycle — one-and-done entrant share by cohort year
  5f. Digital Health regulatory split — med-device vs Big Tech share

Generates → multiple domain-specific JSON files
"""
import duckdb
from config import (
    CPC_CURRENT_TSV, PATENT_TSV, ASSIGNEE_TSV,
    OUTPUT_DIR, save_json, timed_msg,
)

MASTER = "/tmp/patentview/patent_master.parquet"

con = duckdb.connect()
con.execute("SET threads TO 38")
con.execute("SET memory_limit = '200GB'")

# ══════════════════════════════════════════════════════════════════════════════
# 5d. AI GPT KPI — distinct CPC sections co-occurring with AI patents + HHI
# ══════════════════════════════════════════════════════════════════════════════
timed_msg("5d: AI GPT KPI (CPC section diversity + HHI)")

AI_FILTER = "(cpc_group LIKE 'G06N%' OR cpc_group LIKE 'G06F18%' OR cpc_subclass = 'G06V' OR cpc_group LIKE 'G10L15%' OR cpc_group LIKE 'G06F40%')"

result = con.execute(f"""
    WITH ai_patents AS (
        SELECT DISTINCT patent_id FROM {CPC_CURRENT_TSV()} WHERE {AI_FILTER}
    ),
    ai_sections AS (
        SELECT ap.patent_id, m.grant_year, cpc.cpc_section
        FROM ai_patents ap
        JOIN '{MASTER}' m ON ap.patent_id = m.patent_id
        JOIN {CPC_CURRENT_TSV()} cpc ON ap.patent_id = cpc.patent_id
        WHERE m.grant_year BETWEEN 2000 AND 2025
          AND cpc.cpc_section NOT IN ('G', 'Y')
    ),
    yearly_sections AS (
        SELECT grant_year AS year,
               COUNT(DISTINCT cpc_section) AS distinct_sections,
               COUNT(DISTINCT patent_id) AS ai_patents_with_other
        FROM ai_sections
        GROUP BY grant_year
    ),
    section_shares AS (
        SELECT grant_year AS year, cpc_section,
               COUNT(DISTINCT patent_id) AS cnt
        FROM ai_sections
        GROUP BY grant_year, cpc_section
    ),
    year_totals AS (
        SELECT year, SUM(cnt) AS total FROM section_shares GROUP BY year
    ),
    hhi_parts AS (
        SELECT ss.year,
               POWER(CAST(ss.cnt AS DOUBLE) / yt.total, 2) AS share_sq
        FROM section_shares ss
        JOIN year_totals yt ON ss.year = yt.year
    ),
    hhi AS (
        SELECT year, ROUND(SUM(share_sq), 4) AS hhi
        FROM hhi_parts
        GROUP BY year
    )
    SELECT ys.year, ys.distinct_sections, ys.ai_patents_with_other, h.hhi
    FROM yearly_sections ys
    LEFT JOIN hhi h ON ys.year = h.year
    ORDER BY ys.year
""").fetchall()

rows = [{"year": r[0], "distinct_sections": r[1], "ai_patents_with_other": r[2], "hhi": r[3]} for r in result]
save_json(rows, f"{OUTPUT_DIR}/chapter11/ai_gpt_kpi.json")

# ══════════════════════════════════════════════════════════════════════════════
# 5g. Green EV-Battery coupling — co-occurrence lift over time
# ══════════════════════════════════════════════════════════════════════════════
timed_msg("5g: Green EV-Battery coupling lift")

result = con.execute(f"""
    WITH green_patents AS (
        SELECT DISTINCT patent_id FROM {CPC_CURRENT_TSV()}
        WHERE cpc_subclass LIKE 'Y02%' OR cpc_group LIKE 'Y02%'
    ),
    ev_patents AS (
        SELECT DISTINCT patent_id FROM {CPC_CURRENT_TSV()}
        WHERE cpc_group LIKE 'B60L%' OR cpc_group LIKE 'B60W%'
    ),
    battery_patents AS (
        SELECT DISTINCT patent_id FROM {CPC_CURRENT_TSV()}
        WHERE cpc_group LIKE 'H01M%' OR cpc_group LIKE 'H02J%'
    ),
    green_with_year AS (
        SELECT gp.patent_id, m.grant_year
        FROM green_patents gp
        JOIN '{MASTER}' m ON gp.patent_id = m.patent_id
        WHERE m.grant_year BETWEEN 2000 AND 2025
    ),
    yearly_stats AS (
        SELECT
            gwy.grant_year AS year,
            COUNT(DISTINCT gwy.patent_id) AS total_green,
            COUNT(DISTINCT CASE WHEN ev.patent_id IS NOT NULL THEN gwy.patent_id END) AS green_ev,
            COUNT(DISTINCT CASE WHEN bat.patent_id IS NOT NULL THEN gwy.patent_id END) AS green_battery,
            COUNT(DISTINCT CASE WHEN ev.patent_id IS NOT NULL AND bat.patent_id IS NOT NULL THEN gwy.patent_id END) AS green_ev_battery
        FROM green_with_year gwy
        LEFT JOIN ev_patents ev ON gwy.patent_id = ev.patent_id
        LEFT JOIN battery_patents bat ON gwy.patent_id = bat.patent_id
        GROUP BY gwy.grant_year
    )
    SELECT
        year,
        total_green,
        green_ev,
        green_battery,
        green_ev_battery,
        CASE WHEN total_green > 0 AND green_ev > 0 AND green_battery > 0
             THEN ROUND(
                 (CAST(green_ev_battery AS DOUBLE) / total_green)
                 / ((CAST(green_ev AS DOUBLE) / total_green) * (CAST(green_battery AS DOUBLE) / total_green)),
                 3)
             ELSE NULL END AS lift
    FROM yearly_stats
    ORDER BY year
""").fetchall()

rows = [{"year": r[0], "total_green": r[1], "green_ev": r[2], "green_battery": r[3],
         "green_ev_battery": r[4], "lift": r[5]} for r in result]
save_json(rows, f"{OUTPUT_DIR}/green/green_ev_battery_coupling.json")

# ══════════════════════════════════════════════════════════════════════════════
# 5h. Semiconductor-Quantum dependence — quantum assignees with prior semi patents
# ══════════════════════════════════════════════════════════════════════════════
timed_msg("5h: Semiconductor-Quantum dependence")

result = con.execute(f"""
    WITH quantum_patents AS (
        SELECT DISTINCT patent_id FROM {CPC_CURRENT_TSV()}
        WHERE cpc_group LIKE 'G06N10%' OR cpc_group LIKE 'H01L39%'
    ),
    semi_patents AS (
        SELECT DISTINCT patent_id FROM {CPC_CURRENT_TSV()}
        WHERE cpc_subclass IN ('H01L', 'H10N', 'H10K')
    ),
    quantum_assignees AS (
        SELECT DISTINCT m.primary_assignee_id, MIN(m.grant_year) AS first_quantum_year
        FROM '{MASTER}' m
        JOIN quantum_patents qp ON m.patent_id = qp.patent_id
        WHERE m.primary_assignee_id IS NOT NULL
        GROUP BY m.primary_assignee_id
    ),
    semi_history AS (
        SELECT DISTINCT m.primary_assignee_id, MIN(m.grant_year) AS first_semi_year
        FROM '{MASTER}' m
        JOIN semi_patents sp ON m.patent_id = sp.patent_id
        WHERE m.primary_assignee_id IS NOT NULL
        GROUP BY m.primary_assignee_id
    ),
    joined AS (
        SELECT
            qa.primary_assignee_id,
            qa.first_quantum_year,
            sh.first_semi_year,
            CASE WHEN sh.first_semi_year IS NOT NULL AND sh.first_semi_year < qa.first_quantum_year
                 THEN TRUE ELSE FALSE END AS had_prior_semi
        FROM quantum_assignees qa
        LEFT JOIN semi_history sh ON qa.primary_assignee_id = sh.primary_assignee_id
    ),
    by_cohort AS (
        SELECT
            FLOOR(first_quantum_year / 5) * 5 AS cohort,
            COUNT(*) AS total_assignees,
            SUM(CASE WHEN had_prior_semi THEN 1 ELSE 0 END) AS with_semi_experience,
            ROUND(100.0 * SUM(CASE WHEN had_prior_semi THEN 1 ELSE 0 END) / COUNT(*), 1) AS pct_with_semi
        FROM joined
        WHERE first_quantum_year BETWEEN 2000 AND 2024
        GROUP BY cohort
    )
    SELECT cohort, total_assignees, with_semi_experience, pct_with_semi
    FROM by_cohort
    ORDER BY cohort
""").fetchall()

rows = [{"cohort": int(r[0]), "total_assignees": r[1], "with_semi_experience": r[2], "pct_with_semi": r[3]} for r in result]
save_json(rows, f"{OUTPUT_DIR}/quantum/quantum_semiconductor_dependence.json")

# ══════════════════════════════════════════════════════════════════════════════
# 5i. Systems complexity — team size + claims indexed to system baseline
# ══════════════════════════════════════════════════════════════════════════════
timed_msg("5i: Systems complexity (3D-printing, Space, AV)")

SYSTEMS_DOMAINS = {
    "3D Printing": "(cpc_subclass = 'B33Y' OR cpc_group LIKE 'B33Y%' OR cpc_group LIKE 'B29C64%' OR cpc_group LIKE 'B22F10%')",
    "Space":       "(cpc_subclass = 'B64G' OR cpc_group LIKE 'H04B7/185%')",
    "AV":          "(cpc_group LIKE 'B60W60%' OR cpc_group LIKE 'G05D1%' OR cpc_group LIKE 'G06V20/56%')",
}

# System baseline
baseline = con.execute(f"""
    SELECT
        FLOOR(grant_year / 5) * 5 AS period,
        ROUND(AVG(team_size), 3) AS sys_team_size,
        ROUND(AVG(num_claims), 3) AS sys_claims
    FROM '{MASTER}'
    WHERE grant_year BETWEEN 1990 AND 2024
    GROUP BY period
    ORDER BY period
""").fetchall()
baseline_dict = {int(r[0]): {"sys_team_size": r[1], "sys_claims": r[2]} for r in baseline}

complexity_rows = []
for domain_name, filt in SYSTEMS_DOMAINS.items():
    result = con.execute(f"""
        WITH dom AS (
            SELECT DISTINCT patent_id FROM {CPC_CURRENT_TSV()} WHERE {filt}
        )
        SELECT
            FLOOR(m.grant_year / 5) * 5 AS period,
            ROUND(AVG(m.team_size), 3) AS mean_team_size,
            ROUND(AVG(m.num_claims), 3) AS mean_claims,
            COUNT(*) AS patent_count
        FROM '{MASTER}' m
        JOIN dom d ON m.patent_id = d.patent_id
        WHERE m.grant_year BETWEEN 1990 AND 2024
        GROUP BY period
        ORDER BY period
    """).fetchall()

    for r in result:
        period = int(r[0])
        bl = baseline_dict.get(period, {"sys_team_size": 1, "sys_claims": 1})
        complexity_rows.append({
            "domain": domain_name,
            "period": period,
            "mean_team_size": r[1],
            "mean_claims": r[2],
            "patent_count": r[3],
            "team_size_index": round(r[1] / bl["sys_team_size"], 3) if bl["sys_team_size"] else None,
            "claims_index": round(r[2] / bl["sys_claims"], 3) if bl["sys_claims"] else None,
        })

save_json(complexity_rows, f"{OUTPUT_DIR}/act6/systems_complexity.json")

# ══════════════════════════════════════════════════════════════════════════════
# 5c. Blockchain hype cycle — one-and-done entrant share by cohort year
# ══════════════════════════════════════════════════════════════════════════════
timed_msg("5c: Blockchain hype cycle (one-and-done entrants)")

BLOCKCHAIN_FILTER = "(cpc_group LIKE 'H04L9/0643%' OR cpc_group LIKE 'G06Q20/0655%')"

result = con.execute(f"""
    WITH bc_patents AS (
        SELECT DISTINCT patent_id FROM {CPC_CURRENT_TSV()} WHERE {BLOCKCHAIN_FILTER}
    ),
    assignee_years AS (
        SELECT
            m.primary_assignee_id,
            m.grant_year
        FROM '{MASTER}' m
        JOIN bc_patents bp ON m.patent_id = bp.patent_id
        WHERE m.primary_assignee_id IS NOT NULL
          AND m.grant_year BETWEEN 2010 AND 2024
    ),
    assignee_profile AS (
        SELECT
            primary_assignee_id,
            MIN(grant_year) AS entry_year,
            COUNT(DISTINCT grant_year) AS active_years,
            COUNT(*) AS total_patents
        FROM assignee_years
        GROUP BY primary_assignee_id
    ),
    by_cohort AS (
        SELECT
            entry_year AS cohort_year,
            COUNT(*) AS total_entrants,
            SUM(CASE WHEN total_patents = 1 THEN 1 ELSE 0 END) AS one_and_done,
            ROUND(100.0 * SUM(CASE WHEN total_patents = 1 THEN 1 ELSE 0 END) / COUNT(*), 1) AS one_and_done_pct
        FROM assignee_profile
        GROUP BY entry_year
    )
    SELECT cohort_year, total_entrants, one_and_done, one_and_done_pct
    FROM by_cohort
    ORDER BY cohort_year
""").fetchall()

rows = [{"cohort_year": r[0], "total_entrants": r[1], "one_and_done": r[2], "one_and_done_pct": r[3]} for r in result]
save_json(rows, f"{OUTPUT_DIR}/blockchain/blockchain_hype_cycle.json")

# ══════════════════════════════════════════════════════════════════════════════
# 5f. Digital Health regulatory split — med-device vs Big Tech share
# ══════════════════════════════════════════════════════════════════════════════
timed_msg("5f: Digital Health regulatory split (med-device vs Big Tech)")

DH_FILTER = "(cpc_group LIKE 'A61B5%' OR cpc_subclass = 'G16H' OR cpc_group LIKE 'A61B34%')"

# Big tech assignees in digital health
BIG_TECH = [
    'Apple Inc.', 'Google LLC', 'Alphabet Inc.', 'Microsoft Corporation',
    'Amazon Technologies, Inc.', 'Samsung Electronics Co., Ltd.',
    'Meta Platforms, Inc.', 'Facebook, Inc.',
]
# Traditional med-device firms
MED_DEVICE = [
    'Medtronic, Inc.', 'Medtronic Inc.', 'Becton, Dickinson and Company',
    'Boston Scientific Corporation', 'Stryker Corporation',
    'Johnson & Johnson', 'Siemens Healthcare GmbH', 'Siemens Healthineers AG',
    'GE Healthcare', 'Philips Electronics', 'Koninklijke Philips N.V.',
    'Abbott Laboratories', 'Edwards Lifesciences Corporation',
    'Baxter International Inc.', 'Intuitive Surgical, Inc.',
]

big_tech_str = ", ".join(f"'{b}'" for b in BIG_TECH)
med_device_str = ", ".join(f"'{m}'" for m in MED_DEVICE)

result = con.execute(f"""
    WITH dh_patents AS (
        SELECT DISTINCT patent_id FROM {CPC_CURRENT_TSV()} WHERE {DH_FILTER}
    ),
    dh_with_year AS (
        SELECT m.patent_id, m.grant_year, m.primary_assignee_org
        FROM '{MASTER}' m
        JOIN dh_patents dp ON m.patent_id = dp.patent_id
        WHERE m.grant_year BETWEEN 2000 AND 2025
    ),
    classified AS (
        SELECT
            grant_year AS year,
            CASE
                WHEN primary_assignee_org IN ({big_tech_str}) THEN 'Big Tech'
                WHEN primary_assignee_org IN ({med_device_str}) THEN 'Med Device'
                ELSE 'Other'
            END AS category,
            patent_id
        FROM dh_with_year
    )
    SELECT
        year,
        category,
        COUNT(DISTINCT patent_id) AS patent_count
    FROM classified
    GROUP BY year, category
    ORDER BY year, category
""").fetchall()

rows = [{"year": r[0], "category": r[1], "patent_count": r[2]} for r in result]
save_json(rows, f"{OUTPUT_DIR}/digihealth/digihealth_regulatory_split.json")

con.close()
print("\n=== 75_act6_enrichments complete ===\n")
