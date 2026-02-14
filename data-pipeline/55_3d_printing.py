#!/usr/bin/env python3
"""
3D Printing / Additive Manufacturing Deep Dive — B33Y, B29C64/, B22F10/
Generates → public/data/3dprint/
"""
from domain_utils import run_domain_pipeline

CPC_FILTER = """
    (cpc_subclass = 'B33Y' OR cpc_group LIKE 'B29C64%' OR cpc_group LIKE 'B22F10%')
"""

SUBFIELD_SQL = """
    CASE
        WHEN cpc_group LIKE 'B33Y10%' THEN 'AM Processes'
        WHEN cpc_group LIKE 'B33Y30%' THEN 'AM Equipment'
        WHEN cpc_group LIKE 'B33Y40%' THEN 'AM Auxiliary Operations'
        WHEN cpc_group LIKE 'B33Y50%' THEN 'AM Data Handling'
        WHEN cpc_group LIKE 'B33Y70%' THEN 'AM Materials'
        WHEN cpc_group LIKE 'B33Y80%' THEN 'AM Products'
        WHEN cpc_group LIKE 'B29C64%' THEN 'Polymer Additive Manufacturing'
        WHEN cpc_group LIKE 'B22F10%' THEN 'Metal Additive Manufacturing'
        ELSE 'Other 3D Printing'
    END
"""

run_domain_pipeline(
    domain_name="3DPrint",
    domain_slug="3dprint",
    data_dir="3dprint",
    cpc_filter_sql=CPC_FILTER,
    subfield_sql=SUBFIELD_SQL,
    exclude_sections="'B', 'Y'",
    start_year=1990,
    org_start_year=2005,
)
