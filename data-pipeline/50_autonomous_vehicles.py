#!/usr/bin/env python3
"""
Autonomous Vehicles & ADAS Deep Dive — B60W60/, G05D1/, G06V20/56
Generates → public/data/av/
"""
from domain_utils import run_domain_pipeline

CPC_FILTER = """
    (cpc_group LIKE 'B60W60%' OR cpc_group LIKE 'G05D1%' OR cpc_group LIKE 'G06V20/56%')
"""

SUBFIELD_SQL = """
    CASE
        WHEN cpc_group LIKE 'B60W60%' THEN 'Autonomous Driving Systems'
        WHEN cpc_group LIKE 'G05D1/00%' OR cpc_group LIKE 'G05D1/02%' THEN 'Navigation & Path Planning'
        WHEN cpc_group LIKE 'G05D1%' THEN 'Vehicle Control'
        WHEN cpc_group LIKE 'G06V20/56%' THEN 'Scene Understanding'
        ELSE 'Other AV'
    END
"""

run_domain_pipeline(
    domain_name="AV",
    domain_slug="av",
    data_dir="av",
    cpc_filter_sql=CPC_FILTER,
    subfield_sql=SUBFIELD_SQL,
    exclude_sections="'B', 'G', 'Y'",
    start_year=1990,
    org_start_year=2005,
)
