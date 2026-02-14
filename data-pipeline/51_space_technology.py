#!/usr/bin/env python3
"""
Space Technology Deep Dive — B64G, H04B7/185
Generates → public/data/space/
"""
from domain_utils import run_domain_pipeline

CPC_FILTER = """
    (cpc_subclass = 'B64G' OR cpc_group LIKE 'H04B7/185%')
"""

SUBFIELD_SQL = """
    CASE
        WHEN cpc_group LIKE 'B64G1/10%' THEN 'Satellite Design'
        WHEN cpc_group LIKE 'B64G1/22%' OR cpc_group LIKE 'B64G1/24%' OR cpc_group LIKE 'B64G1/40%' THEN 'Propulsion Systems'
        WHEN cpc_group LIKE 'B64G1/42%' OR cpc_group LIKE 'B64G1/44%' THEN 'Attitude Control & Life Support'
        WHEN cpc_group LIKE 'B64G1/64%' THEN 'Re-Entry Systems'
        WHEN cpc_group LIKE 'B64G1/66%' THEN 'Arrangements for Landing'
        WHEN cpc_group LIKE 'H04B7/185%' THEN 'Space Communications'
        WHEN cpc_group LIKE 'B64G%' THEN 'Other Spacecraft'
        ELSE 'Other Space'
    END
"""

run_domain_pipeline(
    domain_name="Space",
    domain_slug="space",
    data_dir="space",
    cpc_filter_sql=CPC_FILTER,
    subfield_sql=SUBFIELD_SQL,
    exclude_sections="'B', 'H', 'Y'",
)
