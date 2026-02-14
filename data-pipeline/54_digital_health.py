#!/usr/bin/env python3
"""
Digital Health & Medical Devices Deep Dive — A61B5/, G16H, A61B34/
Generates → public/data/digihealth/
"""
from domain_utils import run_domain_pipeline

CPC_FILTER = """
    (cpc_group LIKE 'A61B5%' OR cpc_subclass = 'G16H' OR cpc_group LIKE 'A61B34%')
"""

SUBFIELD_SQL = """
    CASE
        WHEN cpc_group LIKE 'A61B5/02%' OR cpc_group LIKE 'A61B5/04%' THEN 'Vital Signs Monitoring'
        WHEN cpc_group LIKE 'A61B5/05%' THEN 'Diagnostic Imaging'
        WHEN cpc_group LIKE 'A61B5/07%' OR cpc_group LIKE 'A61B5/08%' THEN 'Physiological Signals'
        WHEN cpc_group LIKE 'A61B5%' THEN 'Other Patient Monitoring'
        WHEN cpc_group LIKE 'G16H10%' THEN 'Electronic Health Records'
        WHEN cpc_group LIKE 'G16H20%' THEN 'Clinical Decision Support'
        WHEN cpc_group LIKE 'G16H30%' THEN 'Medical Imaging Informatics'
        WHEN cpc_group LIKE 'G16H40%' THEN 'Healthcare IT Infrastructure'
        WHEN cpc_group LIKE 'G16H50%' THEN 'Biomedical Data Analytics'
        WHEN cpc_group LIKE 'G16H%' THEN 'Other Health Informatics'
        WHEN cpc_group LIKE 'A61B34%' THEN 'Surgical Robotics'
        ELSE 'Other Digital Health'
    END
"""

run_domain_pipeline(
    domain_name="DigiHealth",
    domain_slug="digihealth",
    data_dir="digihealth",
    cpc_filter_sql=CPC_FILTER,
    subfield_sql=SUBFIELD_SQL,
    exclude_sections="'A', 'G', 'Y'",
)
