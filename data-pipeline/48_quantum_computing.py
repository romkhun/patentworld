#!/usr/bin/env python3
"""
Quantum Computing Deep Dive — G06N10/, H01L39/
Generates → public/data/quantum/
"""
from domain_utils import run_domain_pipeline

CPC_FILTER = """
    (cpc_group LIKE 'G06N10%' OR cpc_group LIKE 'H01L39%')
"""

SUBFIELD_SQL = """
    CASE
        WHEN cpc_group LIKE 'G06N10/20%' THEN 'Quantum Algorithms'
        WHEN cpc_group LIKE 'G06N10/40%' THEN 'Physical Realizations'
        WHEN cpc_group LIKE 'G06N10/60%' THEN 'Quantum Annealing'
        WHEN cpc_group LIKE 'G06N10/70%' THEN 'Error Correction'
        WHEN cpc_group LIKE 'G06N10/80%' THEN 'Quantum Programming'
        WHEN cpc_group LIKE 'G06N10%' THEN 'Other Quantum Computing'
        WHEN cpc_group LIKE 'H01L39%' THEN 'Superconducting Devices'
        ELSE 'Other Quantum'
    END
"""

run_domain_pipeline(
    domain_name="Quantum",
    domain_slug="quantum",
    data_dir="quantum",
    cpc_filter_sql=CPC_FILTER,
    subfield_sql=SUBFIELD_SQL,
    exclude_sections="'G', 'Y'",
    start_year=1990,
    org_start_year=2005,
)
