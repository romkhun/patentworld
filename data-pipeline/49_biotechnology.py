#!/usr/bin/env python3
"""
Biotechnology & Gene Editing Deep Dive — C12N15/, C12N9/, C12Q1/68
Generates → public/data/biotech/
"""
from domain_utils import run_domain_pipeline

CPC_FILTER = """
    (cpc_group LIKE 'C12N15%' OR cpc_group LIKE 'C12N9%' OR cpc_group LIKE 'C12Q1/68%')
"""

SUBFIELD_SQL = """
    CASE
        WHEN cpc_group LIKE 'C12N15/09%' OR cpc_group LIKE 'C12N15/11%' THEN 'Gene Editing & Modification'
        WHEN cpc_group LIKE 'C12N15/63%' OR cpc_group LIKE 'C12N15/79%' OR cpc_group LIKE 'C12N15/85%' THEN 'Expression Vectors'
        WHEN cpc_group LIKE 'C12N15/1%' AND NOT (cpc_group LIKE 'C12N15/11%') THEN 'Recombinant DNA'
        WHEN cpc_group LIKE 'C12N9%' THEN 'Enzyme Engineering'
        WHEN cpc_group LIKE 'C12Q1/68%' THEN 'Nucleic Acid Detection'
        WHEN cpc_group LIKE 'C12N15%' THEN 'Other Genetic Engineering'
        ELSE 'Other Biotech'
    END
"""

run_domain_pipeline(
    domain_name="Biotech",
    domain_slug="biotech",
    data_dir="biotech",
    cpc_filter_sql=CPC_FILTER,
    subfield_sql=SUBFIELD_SQL,
    exclude_sections="'C', 'Y'",
)
