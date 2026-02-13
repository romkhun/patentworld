// Chapter 1 types
export interface PatentsPerYear {
  year: number;
  patent_type: string;
  count: number;
}

export interface PatentsPerMonth {
  month: string;
  count: number;
}

export interface ClaimsPerYear {
  year: number;
  avg_claims: number;
  median_claims: number;
  count: number;
}

export interface GrantLag {
  year: number;
  avg_lag_days: number;
  median_lag_days: number;
  count: number;
}

export interface HeroStats {
  total_patents: number;
  first_year: number;
  last_year: number;
  peak_year: number;
  peak_year_count: number;
}

// Chapter 2 types
export interface SectorPerYear {
  year: number;
  sector: string;
  count: number;
}

export interface FieldPerYear {
  year: number;
  sector: string;
  field: string;
  patent_count: number;
}

export interface CPCSectionPerYear {
  year: number;
  section: string;
  count: number;
}

export interface CPCClassChange {
  cpc_class: string;
  title: string;
  early_count: number;
  late_count: number;
  pct_change: number;
}

export interface TechDiversity {
  year: number;
  diversity_index: number;
}

// Chapter 3 types
export interface AssigneeTypePerYear {
  year: number;
  category: string;
  count: number;
}

export interface TopAssignee {
  organization: string;
  total_patents: number;
  first_year: number;
  last_year: number;
}

export interface OrgOverTime {
  organization: string;
  year: number;
  count: number;
  rank: number;
}

export interface DomesticVsForeign {
  year: number;
  origin: string;
  count: number;
}

export interface Concentration {
  period_start: number;
  period: string;
  top10_share: number;
  top50_share: number;
  top100_share: number;
}

// Chapter 4 types
export interface StatePerYear {
  year: number;
  state: string;
  count: number;
}

export interface StateSummary {
  state: string;
  total_patents: number;
  unique_inventors: number;
}

export interface CountryPerYear {
  year: number;
  country: string;
  count: number;
}

export interface TopCity {
  city: string;
  state: string;
  lat: number;
  lng: number;
  total_patents: number;
}

export interface StateSpecialization {
  state: string;
  section: string;
  count: number;
}

// Chapter 5 types
export interface TeamSizePerYear {
  year: number;
  avg_team_size: number;
  median_team_size: number;
  solo_pct: number;
  large_team_pct: number;
  total_patents: number;
}

export interface GenderPerYear {
  year: number;
  gender: string;
  count: number;
}

export interface GenderBySector {
  sector: string;
  gender: string;
  count: number;
}

export interface ProlificInventor {
  inventor_id: string;
  first_name: string;
  last_name: string;
  total_patents: number;
  first_year: number;
  last_year: number;
  gender: string;
}

export interface InventorEntry {
  year: number;
  new_inventors: number;
}

// Chapter 6 types
export interface CitationsPerYear {
  year: number;
  avg_citations: number;
  median_citations: number;
  total_patents: number;
}

export interface CitationCategory {
  year: number;
  category: string;
  count: number;
}

export interface CitationLag {
  year: number;
  avg_lag_days: number;
  median_lag_days: number;
  total_citations: number;
}

export interface GovFundedPerYear {
  year: number;
  count: number;
}

export interface GovAgency {
  agency: string;
  total_patents: number;
}

// Explore types
export interface ExploreAssignee {
  organization: string;
  total_patents: number;
  first_year: number;
  last_year: number;
}

export interface ExploreInventor {
  inventor_id: string;
  first_name: string;
  last_name: string;
  total_patents: number;
  first_year: number;
  last_year: number;
  gender: string;
}

export interface CPCClassSummary {
  section: string;
  cpc_class: string;
  class_name: string;
  total_patents: number;
}

export interface WIPOFieldSummary {
  sector: string;
  field: string;
  field_id: number;
  total_patents: number;
}

// Chapter 7 types
export interface GrantLagBySector {
  period: number;
  sector: string;
  avg_lag_days: number;
  median_lag_days: number;
  count: number;
}

export interface CrossDomain {
  year: number;
  total: number;
  single_section: number;
  two_sections: number;
  three_plus_sections: number;
  multi_section_pct: number;
}

export interface IntlCollaboration {
  year: number;
  total_patents: number;
  intl_collab_count: number;
  intl_collab_pct: number;
}

export interface CorpDiversification {
  organization: string;
  section: string;
  era: string;
  count: number;
}

export interface InnovationVelocity {
  year: number;
  sector: string;
  count: number;
  prev_count: number | null;
  yoy_growth_pct: number | null;
}

// Chapter 2 treemap type
export interface CPCTreemapEntry {
  section: string;
  cpc_class: string;
  class_name: string;
  patent_count: number;
}

// Network types (shared by firm & inventor networks)
export interface NetworkNode {
  id: string;
  name: string;
  patents: number;
}

export interface NetworkEdge {
  source: string;
  target: string;
  weight: number;
}

export interface NetworkData {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
}

// Chapter 3 deep analysis types
export interface FirmCitationImpact {
  organization: string;
  total_patents: number;
  avg_citations_received: number;
  median_citations_received: number;
  p90_citations_received: number;
}

export interface FirmTechEvolution {
  organization: string;
  period: string;
  section: string;
  count: number;
}

// Chapter 5 deep analysis types
export interface InventorLongevity {
  cohort: string;
  career_length: number;
  survival_pct: number;
}

export interface StarInventorImpact {
  inventor_id: string;
  first_name: string;
  last_name: string;
  total_patents: number;
  avg_citations: number;
  median_citations: number;
  max_citations: number;
}

// Chapter 9: Patent Quality types
export interface QualityTrend {
  year: number;
  avg_claims: number;
  median_claims: number;
  avg_backward_cites: number;
  median_backward_cites: number;
  avg_forward_cites_5yr: number;
  median_forward_cites_5yr: number;
  avg_scope: number;
  median_scope: number;
  avg_inventors: number;
  median_inventors: number;
  avg_grant_lag_days: number;
  median_grant_lag_days: number;
}

export interface OriginalityGenerality {
  year: number;
  avg_originality: number;
  avg_generality: number;
  median_originality: number;
  median_generality: number;
}

export interface SelfCitationRate {
  year: number;
  avg_self_cite_rate: number;
  median_self_cite_rate: number;
}

export interface QualityBySector {
  period: string;
  sector: string;
  avg_forward_cites: number;
  avg_claims: number;
  avg_scope: number;
  avg_originality: number;
}

export interface BreakthroughPatent {
  year: number;
  total_patents: number;
  breakthrough_count: number;
  breakthrough_pct: number;
}

// Generic data wrapper
export interface ChapterData<T> {
  data: T[];
  metadata?: Record<string, any>;
}
