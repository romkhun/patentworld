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
  title?: string;
  class_name?: string;
  early_count: number;
  late_count: number;
  pct_change: number;
  direction?: string;
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

// Chapter 11 (AI Patents) types
export interface AIPatentsPerYear {
  year: number;
  total_patents: number;
  ai_patents: number;
  ai_pct: number;
}

export interface AIBySubfield {
  year: number;
  subfield: string;
  count: number;
}

export interface AITopAssignee {
  organization: string;
  ai_patents: number;
  first_year: number;
  last_year: number;
}

export interface AITopInventor {
  first_name: string;
  last_name: string;
  ai_patents: number;
  first_year: number;
  last_year: number;
}

export interface AIGeography {
  country: string;
  state: string | null;
  ai_patents: number;
  first_year: number;
  last_year: number;
}

export interface AIOrgOverTime {
  year: number;
  organization: string;
  count: number;
}

export interface AIQuality {
  year: number;
  patent_count: number;
  avg_claims: number;
  avg_backward_cites: number;
  avg_scope: number;
  avg_team_size: number;
}

// Inventor movement types
export interface InventorFlow {
  from_state?: string;
  to_state?: string;
  from_country?: string;
  to_country?: string;
  flow_count: number;
}

export interface InventorMobilityTrend {
  year: number;
  total_patents_with_prev: number;
  intl_moves: number;
  domestic_moves: number;
  intl_mobility_pct: number;
  domestic_mobility_pct: number;
}

// Chapter 10: Patent Law types
export interface HHIBySection {
  period_start: number;
  period: string;
  section: string;
  total_patents: number;
  hhi: number;
}

export interface ApplicationsVsGrants {
  year: number;
  applications: number;
  grants: number;
  grant_to_application_ratio: number | null;
}

export interface ConvergenceEntry {
  era: string;
  section_row: string;
  section_col: string;
  co_occurrence_pct: number;
  patent_count: number;
}

// Analysis #2: Portfolio Diversity
export interface PortfolioDiversity {
  organization: string;
  period_start: number;
  period: string;
  num_subclasses: number;
  shannon_entropy: number;
  active_subclasses: number;
}

// Analysis #4: Superstar Inventor Concentration
export interface SuperstarConcentration {
  year: number;
  total_patents: number;
  top1pct_patents: number;
  top5pct_patents: number;
  top1pct_share: number;
  top5pct_share: number;
  remaining_share: number;
}

// Analysis #17: Solo Inventors
export interface SoloInventorTrend {
  year: number;
  total_patents: number;
  solo_patents: number;
  solo_pct: number;
}

export interface SoloInventorBySection {
  section: string;
  solo_count: number;
  team_count: number;
  solo_pct: number;
}

// Analysis #18: First-Time Inventors
export interface FirstTimeInventor {
  year: number;
  total_patents: number;
  patents_with_debut: number;
  debut_pct: number;
}

// Analysis #8: Citation Lag
export interface CitationLagBySection {
  section: string;
  decade: number;
  decade_label: string;
  citation_count: number;
  avg_lag_days: number;
  median_lag_days: number;
  avg_lag_years: number;
  median_lag_years: number;
}

export interface CitationLagTrend {
  year: number;
  citation_count: number;
  avg_lag_years: number;
  median_lag_years: number;
}

// Analysis #10: Composite Quality Index
export interface CompositeQualityIndex {
  year: number;
  section: string;
  patent_count: number;
  avg_z_cites: number;
  avg_z_claims: number;
  avg_z_scope: number;
  avg_z_lag: number;
  composite_index: number;
}

// Analysis #1: Friction Maps
export interface FrictionMapEntry {
  section: string;
  period_start: number;
  period: string;
  patent_count: number;
  avg_lag_days: number;
  median_lag_days: number;
  avg_lag_years: number;
  median_lag_years: number;
}

// Analysis #3: Inventor Mobility
export interface InventorMobilityCitation {
  mobility: string;
  patent_count: number;
  avg_citations: number;
  median_citations: number;
}

export interface InventorMobilityByDecade {
  decade: number;
  decade_label: string;
  total_inventors: number;
  mobile_inventors: number;
  mobility_rate: number;
}

// Analysis #6: Regional Specialization
export interface RegionalSpecialization {
  city: string;
  state: string;
  total_patents: number;
  section: string;
  metro_section_count: number;
  location_quotient: number;
}

// Analysis #9: Sleeping Beauty
export interface SleepingBeauty {
  patent_id: string;
  grant_year: number;
  section: string;
  cpc_subclass: string;
  early_cites: number;
  avg_early_rate: number;
  burst_citations: number;
  burst_year_after_grant: number;
  total_fwd_cites: number;
}

// Analysis #11: AI Strategies
export interface AIStrategy {
  organization: string;
  subfield: string;
  patent_count: number;
}

// Analysis #12: AI as GPT
export interface AIGPTDiffusion {
  year: number;
  section: string;
  ai_patents_with_section: number;
  total_ai: number;
  pct_of_ai: number;
}

// Analysis #13: Technology Half-Life
export interface TechnologyHalfLife {
  section: string;
  half_life_years: number | null;
  total_citations: number;
}

export interface TechnologyDecayCurve {
  section: string;
  years_after: number;
  citations: number;
  pct_of_total: number;
}

// Analysis #16: Gender Deep Dive
export interface GenderByTech {
  section: string;
  gender: string;
  count: number;
}

export interface GenderTeamQuality {
  team_gender: string;
  patent_count: number;
  avg_citations: number;
  median_citations: number;
}

export interface GenderSectionTrend {
  period_start: number;
  period: string;
  section: string;
  total_inventors: number;
  female_inventors: number;
  female_pct: number;
}

// Analysis #5: Innovation Diffusion
export interface InnovationDiffusionEntry {
  tech_area: string;
  period_start: number;
  period: string;
  city: string;
  state: string;
  country: string;
  lat: number;
  lng: number;
  patent_count: number;
}

// Analyses #7, #14: Network Metrics
export interface NetworkMetricsByDecade {
  decade: number;
  decade_label: string;
  num_nodes: number;
  num_edges: number;
  num_patents: number;
  avg_degree: number;
  avg_team_size: number;
}

export interface BridgeInventor {
  inventor_id: string;
  first_name: string;
  last_name: string;
  num_orgs: number;
  total_patents: number;
}

// Chapter 13 (Topic Modeling) types
export interface TopicDefinition {
  id: number;
  name: string;
  top_words: string[];
  patent_count: number;
}

export interface TopicPrevalence {
  year: number;
  topic: number;
  topic_name: string;
  count: number;
  share: number;
}

export interface TopicCPCMatrix {
  section: string;
  section_name: string;
  topic: number;
  topic_name: string;
  count: number;
  share: number;
}

export interface TopicUMAPPoint {
  patent_id: string;
  x: number;
  y: number;
  topic: number;
  topic_name: string;
  year: number;
  section: string;
}

export interface TopicNoveltyTrend {
  year: number;
  median_entropy: number;
  avg_entropy: number;
  patent_count: number;
}

export interface TopicNoveltyPatent {
  patent_id: string;
  year: number;
  section: string;
  topic: number;
  topic_name: string;
  entropy: number;
}

// Green Innovation chapter types
export interface GreenVolume {
  year: number;
  green_count: number;
  total_patents: number;
  green_pct: number;
}

export interface GreenByCategory {
  year: number;
  category: string;
  count: number;
}

export interface GreenByCountry {
  year: number;
  country: string;
  count: number;
}

export interface GreenTopCompany {
  organization: string;
  total_green: number;
  category: string;
  category_count: number;
}

export interface GreenAITrend {
  year: number;
  green_ai_count: number;
}

export interface GreenAIHeatmap {
  green_category: string;
  ai_subfield: string;
  count: number;
}

// Addition 2: S-Curves
export interface TechnologySCurve {
  section: string;
  section_name: string;
  K: number;
  r: number;
  t0: number;
  lifecycle_stage: string;
  current_pct_of_K: number;
  current_growth_rate: number;
  cumulative_total: number;
  recent_5yr_volume: number;
  years: number[];
  actual_cumulative: number[];
  fitted_cumulative: number[];
}

// Addition 4: Non-US by CPC section
export interface NonUSBySection {
  year: number;
  section: string;
  country: string;
  count: number;
}

// Addition 5: Inventor segments
export interface InventorSegment {
  segment: string;
  inventor_count: number;
  total_patents: number;
  avg_patents: number;
  patent_share: number;
  inventor_share: number;
}

export interface InventorSegmentTrend {
  year: number;
  total_inventors: number;
  one_hit_count: number;
  one_hit_pct: number;
}

// Addition 6: US-China co-invention
export interface CoInventionRate {
  year: number;
  partner: string;
  co_count: number;
  us_patents: number;
  co_invention_rate: number;
}

export interface CoInventionBySection {
  year: number;
  section: string;
  us_cn_count: number;
}

// Addition 8: Self-citation enhanced
export interface SelfCitationByAssignee {
  organization: string;
  total_citations: number;
  self_citations: number;
  self_cite_rate: number;
}

export interface SelfCitationBySection {
  decade: number;
  section: string;
  total_citations: number;
  self_citations: number;
  self_cite_rate: number;
}

// Addition 9: Quality by country
export interface QualityByCountry {
  country: string;
  decade: number;
  patent_count: number;
  avg_claims: number;
}

// Addition 10: AI team comparison
export interface AITeamComparison {
  year: number;
  category: string;
  patent_count: number;
  avg_team_size: number;
  median_team_size: number;
}

export interface AIAssigneeType {
  year: number;
  assignee_category: string;
  count: number;
}

// Chapter 14: Company Innovation Profiles types

export interface CompanyYearMetrics {
  year: number;
  patent_count: number;
  cpc_breadth: number;
  inventor_count: number;
  avg_team_size: number;
  median_citations_5yr: number;
  top10_share: number;
  self_citation_rate: number;
  avg_claims: number;
  intl_inventor_share: number;
  new_inventor_share: number;
  primary_cpc: string;
  cpc_distribution: Record<string, number>;
}

export interface CompanyProfile {
  company: string;
  years: CompanyYearMetrics[];
}

export interface TrajectoryArchetype {
  company: string;
  archetype: string;
  normalized_series: number[];
  peak_year: number;
  peak_count: number;
  current_count: number;
}

export interface CorporateMortality {
  decades: { decade: string; companies: { company: string; rank: number }[] }[];
  survival_rates: Record<string, number>;
  continuous_companies: string[];
}

export interface PortfolioDiversificationB3 {
  company: string;
  year: number;
  shannon_entropy: number;
  num_subclasses: number;
}

export interface PivotDetection {
  company: string;
  window_start: number;
  window_end: number;
  jsd: number;
  is_pivot: boolean;
  top_gaining_cpc: string;
  top_losing_cpc: string;
}

export interface PatentConcentration {
  year: number;
  section: string;
  hhi: number;
  c4: number;
}

export interface CorporateCitationFlow {
  decade: string;
  source: string;
  target: string;
  citation_count: number;
}

export interface TechLeadership {
  window: string;
  section: string;
  company: string;
  citations_received: number;
  rank: number;
}

export interface CitationHalfLife {
  company: string;
  half_life_years: number;
  total_citations: number;
  patent_count: number;
}

export interface InventorCareerCurve {
  career_year: number;
  avg_patents: number;
  median_patents: number;
  p25_patents: number;
  p75_patents: number;
  inventor_count: number;
}

export interface InventorCareerDuration {
  duration: number;
  count: number;
}

export interface InventorDrift {
  decade: number;
  specialist_pct: number;
  moderate_pct: number;
  generalist_pct: number;
  inventor_count: number;
}

export interface ComebackInventor {
  gap_years: number;
  count: number;
  avg_patents_before: number;
  avg_patents_after: number;
  changed_assignee_pct: number;
  changed_cpc_pct: number;
}

export interface DesignPatentTrend {
  year: number;
  utility_count: number;
  design_count: number;
  design_share: number;
}

export interface DesignTopFiler {
  company: string;
  design_patents: number;
}

export interface ClaimsAnalysis {
  year: number;
  median_claims: number;
  p90_claims: number;
  avg_claims: number;
}

export interface ClaimsBySection {
  decade: string;
  section: string;
  median_claims: number;
  avg_claims: number;
}

export interface ClaimMonster {
  patent_id: string;
  year: number;
  claims: number;
  section: string;
  assignee: string;
}

export interface TalentFlowNode {
  name: string;
  net_flow: number;
}

export interface TalentFlowLink {
  source: number;
  target: number;
  value: number;
}

export interface TalentFlowData {
  nodes: TalentFlowNode[];
  links: TalentFlowLink[];
}

export interface PortfolioOverlapPoint {
  company: string;
  x: number;
  y: number;
  industry: string;
  decade: string;
  top_cpc: string;
}

export interface StrategyDimension {
  dimension: string;
  [company: string]: number | string;
}

export interface StrategyProfile {
  company: string;
  breadth: number;
  depth: number;
  defensiveness: number;
  influence: number;
  science_intensity: number;
  speed: number;
  collaboration: number;
  freshness: number;
}

export interface CorporateSpeed {
  company: string;
  year: number;
  avg_grant_lag_days: number;
  median_grant_lag_days: number;
  patent_count: number;
}

// Generic data wrapper
export interface ChapterData<T> {
  data: T[];
  metadata?: Record<string, any>;
}
