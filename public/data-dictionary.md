# PatentWorld Data Dictionary

**Version:** 2026-Q1
**Description:** Schema reference for all JSON data files served by PatentWorld. Data derived from USPTO PatentsView bulk download (February 2026). Data directories are organized by analytical topic; individual chapter pages may draw from multiple directories.

## Coverage

| Dimension | Value |
|-----------|-------|
| Patents | 9.36 million |
| Period | 1976--2025 (through September) |
| Patent types | utility, design, plant, reissue |

---

## Source Tables

These are the upstream PatentsView tables from which all PatentWorld data is derived.

| Table | Description |
|-------|-------------|
| `g_patent` | Core patent records (patent_id, patent_date, patent_type, num_claims) |
| `g_application` | Application records (filing_date, series_code) |
| `g_cpc_current` | CPC classifications (cpc_section, cpc_subsection, cpc_group, cpc_subgroup) |
| `g_assignee_disambiguated` | Assignee/organization records (assignee_id, organization, assignee_type) |
| `g_inventor_disambiguated` | Inventor records (inventor_id, name_first, name_last, gender_code) |
| `g_location_disambiguated` | Geographic locations (state, city, country, latitude, longitude) |
| `g_us_patent_citation` | US patent citation pairs (patent_id, citation_patent_id) |
| `g_gov_interest` | Government interest statements (patent_id, gi_statement) |
| `g_gov_interest_org` | Government interest organizations (patent_id, organization_id, name) |

---

## Chapter-to-Data-Directory Mapping

Each chapter page on PatentWorld loads data from one or more JSON directories under `/data/`. The **primary** directory holds the main data; **also** lists additional directories used.

### Act 1: The System

| Chapter slug | Primary | Also | Description |
|--------------|---------|------|-------------|
| `system-patent-count` | chapter1 | -- | Patent counts by year and type, grant lag trends, pendency statistics |
| `system-patent-quality` | chapter9 | chapter1, chapter2, chapter6 | Quality metrics: claims, citations, scope, originality, generality, sleeping beauties, self-citation |
| `system-patent-fields` | chapter2 | chapter3, chapter6, chapter7, chapter9, chapter10 | CPC section distribution, field dynamics, class-level changes, technology S-curves, WIPO sector mapping |
| `system-convergence` | chapter7 | -- | Technology convergence: cross-section patents, convergence pairs, friction maps |
| `system-language` | chapter12 | -- | NLP topic modeling: 25 topics from 8.45M patent abstracts, entropy trends |
| `system-patent-law` | chapter13 | -- | Patent law timeline: 21 legislative and judicial events, filing impact analysis |
| `system-public-investment` | chapter6 | -- | Government-funded patent trends by agency, technology field heatmap |

### Act 2: The Organizations

| Chapter slug | Primary | Also | Description |
|--------------|---------|------|-------------|
| `org-composition` | chapter3 | -- | Corporate vs. individual, domestic vs. foreign assignee composition by country |
| `org-patent-count` | chapter3 | chapter2, chapter9 | Top assignee rankings, concentration ratios, design patents, blockbuster Lorenz curves |
| `org-patent-quality` | company | -- | Citation impact, blockbuster rates, citation half-lives across top filers |
| `org-patent-portfolio` | company | -- | Portfolio diversity, competitive proximity, JSD, technology pivots |
| `org-company-profiles` | company | -- | Individual company profiles, quality metrics, design patents, patent mortality |

### Act 3: The Inventors

| Chapter slug | Primary | Also | Description |
|--------------|---------|------|-------------|
| `inv-top-inventors` | chapter5 | -- | Top inventor rankings, productivity distribution, citation impact by prolificacy |
| `inv-generalist-specialist` | chapter14 | -- | Generalist vs. specialist inventors, CPC breadth, quality comparison |
| `inv-serial-new` | chapter5 | -- | First-time vs. serial inventors, experience cohorts, productivity trajectories |
| `inv-gender` | chapter5 | -- | Gender trends in patenting, quality by gender, field composition |
| `inv-team-size` | chapter5 | -- | Team size trends, solo vs. team quality, regression analysis |

### Act 4: The Geography

| Chapter slug | Primary | Also | Description |
|--------------|---------|------|-------------|
| `geo-domestic` | chapter4 | -- | State and city-level patent geography, technology specialization |
| `geo-international` | chapter4 | -- | International inventor geography, quality by country, bilateral flows |

### Act 5: The Mechanics

| Chapter slug | Primary | Also | Description |
|--------------|---------|------|-------------|
| `mech-organizations` | company | -- | Organizational exploration-exploitation, co-patenting networks, citation flows |
| `mech-inventors` | chapter5 | chapter3, chapter4, chapter21 | Inventor collaboration networks, mobility event studies, international mobility |
| `mech-geography` | chapter22 | -- | International co-invention trends and bilateral patent flows |

### Act 6: Deep Dives

| Chapter slug | Primary | Description |
|--------------|---------|-------------|
| `3d-printing` | 3dprint | Additive manufacturing domain: concentration, entry velocity, subfield diversity |
| `agricultural-technology` | agtech | Agricultural technology domain analysis |
| `ai-patents` | chapter11 | Artificial intelligence domain: volume, growth, organizational rankings, quality metrics |
| `autonomous-vehicles` | av | Autonomous vehicles domain analysis |
| `biotechnology` | biotech | Biotechnology domain analysis |
| `blockchain` | blockchain | Blockchain / distributed ledger domain analysis |
| `cybersecurity` | cyber | Cybersecurity domain analysis |
| `digital-health` | digihealth | Digital health domain analysis |
| `green-innovation` | green | Green innovation / climate technology domain analysis |
| `quantum-computing` | quantum | Quantum computing domain analysis |
| `semiconductors` | semiconductors | Semiconductor domain analysis |
| `space-technology` | space | Space technology domain analysis |

### Cross-Domain

| Chapter slug | Primary | Description |
|--------------|---------|-------------|
| `deep-dive-overview` | act6 | Cross-domain comparison metrics: volume, growth, concentration, quality, spillover |

### Shared Data

| Directory | Description |
|-----------|-------------|
| `computed` | Pre-computed quality metrics (originality, generality, scope) for all patents |
| `explore` | Interactive exploration data powering the Explore page search functionality |

---

## Derived Metrics

These are the analytical metrics computed from raw PatentsView data and used throughout PatentWorld.

| Metric | Definition |
|--------|------------|
| **Originality** | 1 - HHI of backward citation CPC sections. Range 0 to ~1. |
| **Generality** | 1 - HHI of forward citation CPC sections. Range 0 to ~1. |
| **Blockbuster rate** | Share of patents in top 1% of 5-year forward citations within grant-year x CPC section cohort. |
| **Dud rate** | Share of patents with zero 5-year forward citations. |
| **Shannon entropy** | H = -SUM(p_i * log(p_i)). Log base 2 for topic modeling, natural log for portfolio diversity. |
| **HHI** | SUM(s_i^2) x 10,000. Concentration index (0 = fragmented, 10,000 = monopoly). |
| **CR4** | Combined patent share of top 4 organizations in a domain. |
| **Exploration score** | Share of patents in CPC classes new to the firm in the prior 5 years. |
| **Grant lag** | Days between application filing date and grant date. |
| **Cohort normalization** | Patent citations divided by mean citations in same grant-year x CPC section. |
| **Modified Gini** | Directional concentration index derived from the Lorenz curve comparing blockbuster patent share to overall patent share. Positive values indicate large patent holders capture a disproportionate share of blockbuster patents; negative values indicate the reverse. Differs from the standard Gini coefficient (bounded [0, 1]) in that it measures relative concentration deviation and can take negative values. |

---

## Technology Domain CPC Codes

CPC class and subclass codes used to define each technology domain in the Deep Dives.

| Domain | CPC codes |
|--------|-----------|
| **AI** | G06N, G06F18, G06V, G10L15, G06F40 |
| **Green** | Y02 (all subclasses) |
| **Semiconductors** | H01L, H10N, H10K |
| **Quantum computing** | G06N10, H01L39 |
| **Cybersecurity** | H04L9, G06F21, H04L63 |
| **Biotechnology** | C12N15, C12N9, C12Q1/68 |
| **Digital health** | A61B5, G16H, A61B34 |
| **Agricultural technology** | A01B, A01C, A01G, A01H, G06Q50/02 |
| **Autonomous vehicles** | B60W60, G05D1, G06V20/56 |
| **Space technology** | B64G, H01Q (satellite antennas) |
| **3D printing** | B29C64, B33Y, B22F10 |
| **Blockchain** | H04L9/0643, G06Q20/06 |
