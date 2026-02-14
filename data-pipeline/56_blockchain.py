#!/usr/bin/env python3
"""
Blockchain & Decentralized Systems Deep Dive — H04L9/0643, G06Q20/0655
Generates → public/data/blockchain/
"""
from domain_utils import run_domain_pipeline

CPC_FILTER = """
    (cpc_group LIKE 'H04L9/0643%' OR cpc_group LIKE 'G06Q20/0655%')
"""

SUBFIELD_SQL = """
    CASE
        WHEN cpc_group LIKE 'H04L9/0643%' THEN 'Distributed Ledger & Consensus'
        WHEN cpc_group LIKE 'G06Q20/0655%' THEN 'Cryptocurrency & Digital Money'
        ELSE 'Other Blockchain'
    END
"""

run_domain_pipeline(
    domain_name="Blockchain",
    domain_slug="blockchain",
    data_dir="blockchain",
    cpc_filter_sql=CPC_FILTER,
    subfield_sql=SUBFIELD_SQL,
    exclude_sections="'G', 'H', 'Y'",
    start_year=2000,
    org_start_year=2015,
)
