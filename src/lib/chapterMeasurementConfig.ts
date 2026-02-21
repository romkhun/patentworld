import type { ChapterMeasurementMeta } from '@/lib/types';

/**
 * Measurement metadata for every chapter.
 * Keys are chapter slugs matching the CHAPTERS array in constants.ts.
 */
export const CHAPTER_MEASUREMENTS: Record<string, ChapterMeasurementMeta> = {
  'system-patent-count': {
    dataVintage: 'PatentsView 2025-Q1',
    taxonomy: 'CPC',
    notes: 'Utility patents only; excludes design and plant patents.',
  },
  'system-patent-quality': {
    dataVintage: 'PatentsView 2025-Q1',
    taxonomy: 'CPC',
    outcomeWindow: '5-year forward citations',
    outcomeThrough: 2020,
    normalization: 'Cohort (year × CPC section)',
    notes: 'Citation counts truncated after 2020 due to incomplete citation windows.',
  },
  'system-patent-fields': {
    dataVintage: 'PatentsView 2025-Q1',
    taxonomy: 'CPC + WIPO',
    notes: 'CPC sections for broad analysis; WIPO sectors for velocity calculations.',
  },
  'system-convergence': {
    dataVintage: 'PatentsView 2025-Q1',
    taxonomy: 'CPC',
    notes: 'Multi-section defined as patent assigned to ≥2 CPC sections. Y section excluded.',
  },
  'system-language': {
    dataVintage: 'PatentsView 2025-Q1',
    taxonomy: 'CPC',
  },
  'system-patent-law': {
    dataVintage: 'PatentsView 2025-Q1',
    taxonomy: 'CPC',
    notes: 'Applications vs grants comparison; includes pending application estimates.',
  },
  'system-public-investment': {
    dataVintage: 'PatentsView 2025-Q1',
    taxonomy: 'CPC',
    normalization: 'Cohort (year × CPC section)',
    notes: 'Government interest derived from patent disclosure statements.',
  },
  'org-composition': {
    dataVintage: 'PatentsView 2025-Q1',
    taxonomy: 'CPC',
    notes: 'Assignee types based on PatentsView disambiguated assignee categories.',
  },
  'org-patent-count': {
    dataVintage: 'PatentsView 2025-Q1',
    taxonomy: 'CPC',
    outcomeWindow: '5-year forward citations',
    outcomeThrough: 2020,
    notes: 'Assignee matching uses disambiguated assignee IDs; mergers tracked imperfectly.',
  },
  'org-patent-quality': {
    dataVintage: 'PatentsView 2025-Q1',
    taxonomy: 'CPC',
    outcomeWindow: '5-year forward citations',
    outcomeThrough: 2020,
    normalization: 'Cohort (year × CPC section)',
  },
  'org-patent-portfolio': {
    dataVintage: 'PatentsView 2025-Q1',
    taxonomy: 'CPC',
    notes: 'Portfolio diversity measured via Shannon entropy of CPC subclass distribution.',
  },
  'org-company-profiles': {
    dataVintage: 'PatentsView 2025-Q1',
    taxonomy: 'CPC',
    outcomeWindow: '5-year forward citations',
    outcomeThrough: 2020,
  },
  'inv-team-size': {
    dataVintage: 'PatentsView 2025-Q1',
    taxonomy: 'CPC',
    outcomeWindow: '5-year forward citations',
    outcomeThrough: 2020,
    normalization: 'Cohort (year × CPC section × assignee bin)',
    notes: 'Team size from disambiguated inventor count per patent.',
  },
  'inv-gender': {
    dataVintage: 'PatentsView 2025-Q1',
    taxonomy: 'CPC',
    outcomeWindow: '5-year forward citations',
    outcomeThrough: 2020,
    notes: 'Gender inferred from inventor first names using PatentsView gender_code field.',
  },
  'inv-top-inventors': {
    dataVintage: 'PatentsView 2025-Q1',
    taxonomy: 'CPC',
    outcomeWindow: '5-year forward citations',
    outcomeThrough: 2020,
    notes: 'Rankings rely on PatentsView disambiguated inventor IDs. Splitting errors may undercount prolific inventors; lumping errors may overcount.',
  },
  'inv-serial-new': {
    dataVintage: 'PatentsView 2025-Q1',
    taxonomy: 'CPC',
    outcomeWindow: '5-year forward citations',
    outcomeThrough: 2020,
    notes: 'Serial vs. new classification relies on disambiguated inventor IDs. Splitting errors may misclassify serial inventors as new.',
  },
  'inv-generalist-specialist': {
    dataVintage: 'PatentsView 2025-Q1',
    taxonomy: 'CPC',
    outcomeWindow: '5-year forward citations',
    outcomeThrough: 2020,
  },
  'mech-geography': {
    dataVintage: 'PatentsView 2025-Q1',
    taxonomy: 'CPC',
    notes: 'Inventor locations from PatentsView disambiguated location.',
  },
  'mech-organizations': {
    dataVintage: 'PatentsView 2025-Q1',
    taxonomy: 'CPC',
    outcomeWindow: '5-year forward citations',
    outcomeThrough: 2020,
    notes: 'Exploration index: composite of tech newness, citation newness, external sourcing.',
  },
  'mech-inventors': {
    dataVintage: 'PatentsView 2025-Q1',
    taxonomy: 'CPC',
    outcomeWindow: '5-year forward citations',
    outcomeThrough: 2020,
    notes: 'Inventor mobility identified via assignee changes between consecutive patents. Both inventor and assignee disambiguation affect mobility detection accuracy.',
  },
  'geo-international': {
    dataVintage: 'PatentsView 2025-Q1',
    taxonomy: 'CPC',
    outcomeWindow: '5-year forward citations',
    outcomeThrough: 2020,
  },
  'ai-patents': {
    dataVintage: 'PatentsView 2025-Q1',
    taxonomy: 'CPC',
    notes: 'AI patents identified via CPC subclass G06N + keyword filtering.',
  },
  'green-innovation': {
    dataVintage: 'PatentsView 2025-Q1',
    taxonomy: 'CPC (Y02/Y04)',
    notes: 'Green patents identified via CPC Y02 and Y04S tags.',
  },
  'biotechnology': {
    dataVintage: 'PatentsView 2025-Q1',
    taxonomy: 'CPC',
  },
  'blockchain': {
    dataVintage: 'PatentsView 2025-Q1',
    taxonomy: 'CPC',
  },
  '3d-printing': {
    dataVintage: 'PatentsView 2025-Q1',
    taxonomy: 'CPC',
  },
  'agricultural-technology': {
    dataVintage: 'PatentsView 2025-Q1',
    taxonomy: 'CPC',
  },
  'geo-domestic': {
    dataVintage: 'PatentsView 2025-Q1',
    taxonomy: 'CPC',
    notes: 'Inventor locations from PatentsView disambiguated location.',
  },
  'semiconductors': {
    dataVintage: 'PatentsView 2025-Q1',
    taxonomy: 'CPC',
  },
  'cybersecurity': {
    dataVintage: 'PatentsView 2025-Q1',
    taxonomy: 'CPC',
  },
  'autonomous-vehicles': {
    dataVintage: 'PatentsView 2025-Q1',
    taxonomy: 'CPC',
  },
  'space-technology': {
    dataVintage: 'PatentsView 2025-Q1',
    taxonomy: 'CPC',
  },
  'quantum-computing': {
    dataVintage: 'PatentsView 2025-Q1',
    taxonomy: 'CPC',
  },
  'digital-health': {
    dataVintage: 'PatentsView 2025-Q1',
    taxonomy: 'CPC',
  },
};
