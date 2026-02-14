#!/usr/bin/env python3
"""
Agricultural Technology Deep Dive — A01B, A01C, A01G, A01H, G06Q50/02
Generates → public/data/agtech/
"""
from domain_utils import run_domain_pipeline

CPC_FILTER = """
    (cpc_subclass IN ('A01B', 'A01C', 'A01G', 'A01H') OR cpc_group LIKE 'G06Q50/02%')
"""

SUBFIELD_SQL = """
    CASE
        WHEN cpc_subclass = 'A01B' THEN 'Soil Working & Tillage'
        WHEN cpc_subclass = 'A01C' THEN 'Planting & Sowing'
        WHEN cpc_subclass = 'A01G' THEN 'Horticulture & Forestry'
        WHEN cpc_subclass = 'A01H' THEN 'Plant Breeding & Biocides'
        WHEN cpc_group LIKE 'G06Q50/02%' THEN 'Precision Agriculture'
        ELSE 'Other AgTech'
    END
"""

run_domain_pipeline(
    domain_name="AgTech",
    domain_slug="agtech",
    data_dir="agtech",
    cpc_filter_sql=CPC_FILTER,
    subfield_sql=SUBFIELD_SQL,
    exclude_sections="'A', 'Y'",
)
