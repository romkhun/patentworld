#!/usr/bin/env python3
"""
Semiconductors Deep Dive — H01L, H10N, H10K
Generates → public/data/semiconductors/
"""
from domain_utils import run_domain_pipeline

CPC_FILTER = """
    (cpc_subclass IN ('H01L', 'H10N', 'H10K'))
"""

SUBFIELD_SQL = """
    CASE
        WHEN cpc_group LIKE 'H01L21%' THEN 'Manufacturing Processes'
        WHEN cpc_group LIKE 'H01L23%' THEN 'Packaging & Interconnects'
        WHEN cpc_group LIKE 'H01L25%' THEN 'Assemblies & Modules'
        WHEN cpc_group LIKE 'H01L27%' THEN 'Integrated Circuits'
        WHEN cpc_group LIKE 'H01L29%' THEN 'Semiconductor Devices'
        WHEN cpc_group LIKE 'H01L31%' THEN 'Photovoltaic Cells'
        WHEN cpc_group LIKE 'H01L33%' THEN 'LEDs & Optoelectronics'
        WHEN cpc_subclass = 'H10K' THEN 'Organic Semiconductors'
        WHEN cpc_subclass = 'H10N' THEN 'Other Solid-State Devices'
        ELSE 'Other Semiconductor'
    END
"""

run_domain_pipeline(
    domain_name="Semiconductor",
    domain_slug="semi",
    data_dir="semiconductors",
    cpc_filter_sql=CPC_FILTER,
    subfield_sql=SUBFIELD_SQL,
    exclude_sections="'H', 'Y'",
    org_start_year=1990,
)
