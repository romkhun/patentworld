#!/usr/bin/env python3
"""
Cybersecurity Deep Dive — G06F21/, H04L9/, H04L63/
Generates → public/data/cyber/
"""
from domain_utils import run_domain_pipeline

CPC_FILTER = """
    (cpc_group LIKE 'G06F21%' OR cpc_group LIKE 'H04L9%' OR cpc_group LIKE 'H04L63%')
"""

SUBFIELD_SQL = """
    CASE
        WHEN cpc_group LIKE 'G06F21/3%' OR cpc_group LIKE 'G06F21/4%' THEN 'Authentication & Access Control'
        WHEN cpc_group LIKE 'G06F21/5%' THEN 'System Security'
        WHEN cpc_group LIKE 'G06F21/6%' OR cpc_group LIKE 'G06F21/7%' THEN 'Data Protection'
        WHEN cpc_group LIKE 'H04L9%' THEN 'Cryptography'
        WHEN cpc_group LIKE 'H04L63%' THEN 'Network Security'
        WHEN cpc_group LIKE 'G06F21%' THEN 'Other Computer Security'
        ELSE 'Other Cybersecurity'
    END
"""

run_domain_pipeline(
    domain_name="Cyber",
    domain_slug="cyber",
    data_dir="cyber",
    cpc_filter_sql=CPC_FILTER,
    subfield_sql=SUBFIELD_SQL,
    exclude_sections="'G', 'H', 'Y'",
)
