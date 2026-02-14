#!/usr/bin/env python3
"""
Green Innovation — Supplementary analyses to harmonize with the
11-analysis template used by all other ACT 5 chapters.

Generates the 7 missing JSON files:
  - green_top_inventors.json
  - green_org_over_time.json
  - green_quality.json
  - green_team_comparison.json
  - green_assignee_type.json
  - green_strategies.json
  - green_diffusion.json

Existing files (green_volume, green_by_category, green_top_companies,
green_by_country, green_ai_trend, green_ai_heatmap) are NOT regenerated.
"""
from domain_utils import run_domain_pipeline

GREEN_FILTER = (
    "(cpc_subclass LIKE 'Y02%' OR cpc_subclass LIKE 'Y04S%' "
    "OR cpc_group LIKE 'Y02%' OR cpc_group LIKE 'Y04S%')"
)

GREEN_CATEGORY_SQL = """
    CASE
        WHEN cpc_group LIKE 'Y02E10%' THEN 'Renewable Energy'
        WHEN cpc_group LIKE 'Y02E60%' THEN 'Batteries & Storage'
        WHEN cpc_group LIKE 'Y02E%' THEN 'Other Energy'
        WHEN cpc_group LIKE 'Y02T%' THEN 'Transportation / EVs'
        WHEN cpc_group LIKE 'Y02C%' THEN 'Carbon Capture'
        WHEN cpc_group LIKE 'Y02P%' THEN 'Industrial Production'
        WHEN cpc_group LIKE 'Y02B%' THEN 'Buildings'
        WHEN cpc_group LIKE 'Y02W%' THEN 'Waste Management'
        WHEN cpc_subclass LIKE 'Y04S%' OR cpc_group LIKE 'Y04S%' THEN 'Smart Grids'
        ELSE 'Other Green'
    END
"""

if __name__ == "__main__":
    run_domain_pipeline(
        domain_name="Green",
        domain_slug="green",
        data_dir="green",
        cpc_filter_sql=GREEN_FILTER,
        subfield_sql=GREEN_CATEGORY_SQL,
        exclude_sections="'Y'",
        start_year=1976,
        org_start_year=2000,
        top_org_limit=15,
    )
