# Technology Domain Definition Registry

**Audit Section:** 1.4 -- Technology Domain Definitions
**Date:** 2026-02-21 (second revision)
**Scope:** All 12 Deep Dive domains (Chapters 23--34)
**Auditor method:** Line-by-line comparison of pipeline SQL filters, chapter DataNote disclosures, and cross-domain scripts

---

## 1. Summary of Findings

All 12 Deep Dive domains are defined **exclusively by CPC (Cooperative Patent Classification) codes**. No domain uses keyword searches, patent ID lists, or any other identification method. Eleven of the twelve domains use the shared `domain_utils.py` pipeline framework (`run_domain_pipeline()`), which produces a standardized set of 11 JSON data files per domain. Green Innovation was originally built with a bespoke script (`29_green_innovation.py`) but was later harmonized via `57_green_supplement.py` to match the 11-analysis template. AI uses bespoke scripts (`12_chapter11_ai_patents.py` and `23_chapter11_ai_deep.py`) that are functionally equivalent but store data in `chapter11/` with different naming conventions.

**Definition disclosure:** All 12 chapters disclose their CPC definitions in a `<DataNote>` component at the bottom of each chapter page. Two minor disclosure inaccuracies remain (see section 6).

**Domain overlap:** Four pairwise CPC-level overlaps exist (where one domain's filter is a strict subset of another's). Three of the four overlap pairs are disclosed on both sides; one pair (AV-AI) is disclosed only in the AI chapter, not the AV chapter. An additional pair (Quantum-Semiconductor via H01L39) is disclosed only in the Quantum chapter, not the Semiconductor chapter. A cross-domain spillover analysis (`72_act6_cross_domain.py`) quantifies pairwise co-classification lift across all 12 domains and is presented in the Deep Dive Overview chapter.

**Framework consistency:** All 12 domains use CPC-based classification with a consistent methodology: "A patent is classified as [domain]-related if **any** of its CPC codes fall within these categories." This OR-based approach is uniform across all domains.

---

## 2. Summary Table

| # | Ch. | Domain | Definition Method | CPC Codes Used | Pipeline Script(s) | Disclosed on Chapter Page? | Overlaps With | Overlap Disclosed? |
|---|-----|--------|-------------------|----------------|---------------------|----------------------------|---------------|-------------------|
| 1 | 23 | 3D Printing | CPC codes | B33Y, B29C64, B22F10 | `55_3d_printing.py` | Yes | None | N/A |
| 2 | 24 | Agricultural Technology | CPC codes | A01B, A01C, A01G, A01H, G06Q50/02 | `53_agricultural_technology.py` | Yes | None | N/A |
| 3 | 25 | Artificial Intelligence | CPC codes | G06N, G06F18, G06V, G10L15, G06F40 | `12_chapter11_ai_patents.py`, `23_chapter11_ai_deep.py` | Yes | Quantum (G06N10), AV (G06V20/56) | Yes (AI DataNote) |
| 4 | 26 | Autonomous Vehicles | CPC codes | B60W60, G05D1, G06V20/56 | `50_autonomous_vehicles.py` | Yes | AI (G06V20/56) | No (disclosed only in AI ch.) |
| 5 | 27 | Biotechnology | CPC codes | C12N15, C12N9, C12Q1/68 | `49_biotechnology.py` | Yes | None | N/A |
| 6 | 28 | Blockchain | CPC codes | H04L9/0643, G06Q20/0655 | `56_blockchain.py` | Yes | Cybersecurity (H04L9/0643 subset of H04L9) | Yes (both DataNotes) |
| 7 | 29 | Cybersecurity | CPC codes | G06F21, H04L9, H04L63 | `52_cybersecurity.py` | Yes | Blockchain (H04L9/0643 subset of H04L9) | Yes (both DataNotes) |
| 8 | 30 | Digital Health | CPC codes | A61B5, G16H, A61B34 | `54_digital_health.py` | Yes | None | N/A |
| 9 | 31 | Green Innovation | CPC codes | Y02, Y04S | `29_green_innovation.py`, `57_green_supplement.py` | Yes | None (Y is cross-sectional by design) | N/A |
| 10 | 32 | Quantum Computing | CPC codes | G06N10, H01L39 | `48_quantum_computing.py` | Yes | AI (G06N10), Semiconductors (H01L39) | Yes (Quantum DataNote) |
| 11 | 33 | Semiconductors | CPC codes | H01L, H10N, H10K | `47_semiconductors.py` | Yes | Quantum (H01L39 subset of H01L) | No (disclosed only in Quantum ch.) |
| 12 | 34 | Space Technology | CPC codes | B64G, H04B7/185 | `51_space_technology.py` | Yes | None | N/A |

---

## 3. Detailed Domain Definitions

### 3.1 3D Printing & Additive Manufacturing (Chapter 23)

**Pipeline script:** `/home/saerom/projects/patentworld/data-pipeline/55_3d_printing.py`
**Page:** `/home/saerom/projects/patentworld/src/app/chapters/3d-printing/page.tsx`
**Data directory:** `public/data/3dprint/`
**Start year:** 1990 | **Org start year:** 2005

**CPC Filter (SQL):**
```sql
(cpc_subclass = 'B33Y' OR cpc_group LIKE 'B29C64%' OR cpc_group LIKE 'B22F10%')
```

| CPC Code | Description | Filter Level |
|---|---|---|
| B33Y | Additive manufacturing (dedicated AM classification) | Subclass |
| B29C64 | Polymer additive manufacturing | Group |
| B22F10 | Metal additive manufacturing | Group |

**Subfield Mapping (8 subfields):**
- B33Y10 -> AM Processes
- B33Y30 -> AM Equipment
- B33Y40 -> AM Auxiliary Operations
- B33Y50 -> AM Data Handling
- B33Y70 -> AM Materials
- B33Y80 -> AM Products
- B29C64 -> Polymer Additive Manufacturing
- B22F10 -> Metal Additive Manufacturing

**Diffusion Excludes:** B, Y
**DataNote Disclosure:** Complete. Lists B33Y, B29C64, B22F10 with descriptions.
**Overlap with other domains:** None
**Overlap Disclosed:** N/A

---

### 3.2 Agricultural Technology (Chapter 24)

**Pipeline script:** `/home/saerom/projects/patentworld/data-pipeline/53_agricultural_technology.py`
**Page:** `/home/saerom/projects/patentworld/src/app/chapters/agricultural-technology/page.tsx`
**Data directory:** `public/data/agtech/`
**Start year:** 1976 | **Org start year:** 2000

**CPC Filter (SQL):**
```sql
(cpc_subclass IN ('A01B', 'A01C', 'A01G', 'A01H') OR cpc_group LIKE 'G06Q50/02%')
```

| CPC Code | Description | Filter Level |
|---|---|---|
| A01B | Soil Working & Tillage | Subclass |
| A01C | Planting & Sowing | Subclass |
| A01G | Horticulture & Forestry | Subclass |
| A01H | Plant Breeding & Biocides | Subclass |
| G06Q50/02 | Precision Agriculture | Sub-group |

**Subfield Mapping (5 subfields):** Mapped directly from the subclasses above plus precision agriculture.

**Diffusion Excludes:** A, Y
**DataNote Disclosure:** Complete. Lists all 5 codes and explicitly notes: "A01N (biocides) is excluded from the filter to focus on core agricultural innovation rather than chemical pest control."
**Overlap with other domains:** None
**Overlap Disclosed:** N/A

---

### 3.3 Artificial Intelligence (Chapter 25)

**Pipeline scripts:** `/home/saerom/projects/patentworld/data-pipeline/12_chapter11_ai_patents.py` (base), `/home/saerom/projects/patentworld/data-pipeline/23_chapter11_ai_deep.py` (strategies + GPT diffusion)
**Page:** `/home/saerom/projects/patentworld/src/app/chapters/ai-patents/page.tsx`
**Data directory:** `public/data/chapter11/`
**Start year:** 1976

**CPC Filter (SQL):**
```sql
(cpc_group LIKE 'G06N%'
 OR cpc_group LIKE 'G06F18%'
 OR cpc_subclass = 'G06V'
 OR cpc_group LIKE 'G10L15%'
 OR cpc_group LIKE 'G06F40%')
```

| CPC Code | Description | Filter Level |
|---|---|---|
| G06N | Computing arrangements (neural networks, ML, genetic algorithms, fuzzy logic) | Group (all sub-groups) |
| G06F18 | Pattern recognition | Group |
| G06V | Image/video recognition | Subclass |
| G10L15 | Speech recognition | Group |
| G06F40 | Natural language processing | Group |

**Subfield Mapping (10 subfields):**
- G06N3 -> Neural Networks / Deep Learning
- G06N20 -> Machine Learning
- G06N5 -> Knowledge-Based Systems
- G06N7 -> Probabilistic / Fuzzy
- G06N10 -> Quantum Computing (also counted in Quantum Computing domain)
- Other G06N -> Other Computational Models
- G06F18 -> Pattern Recognition
- G06V -> Computer Vision
- G10L15 -> Speech Recognition
- G06F40 -> Natural Language Processing

**Diffusion Excludes:** G, Y
**DataNote Disclosure:** Complete. Lists all 5 CPC groups. Explicitly states: "the AI domain overlaps with two other Deep Dive domains -- quantum computing patents (G06N10) fall within the broader G06N prefix, and autonomous vehicle scene-understanding patents (G06V20/56) fall within G06V. Patents in these overlapping codes are counted in both domains."
**Overlap with other domains:** Quantum Computing (G06N10 is a subset of G06N), Autonomous Vehicles (G06V20/56 is a subset of G06V)
**Overlap Disclosed:** Yes -- both AI-Quantum and AI-AV overlaps disclosed in the AI chapter DataNote.

**NOTES:**
1. AI is the only domain that does NOT use the shared `domain_utils.py` framework. It uses bespoke scripts that store data in `chapter11/` rather than a domain-named directory, and use different field names (e.g., `ai_patents` vs. `domain_patents`).
2. The pipeline docstring at the top of `12_chapter11_ai_patents.py` (line 13) lists "G06T (Image data processing, generative image models)" as a "Key CPC class for AI" but G06T is NOT included in the actual SQL filter. This is a documentation-only discrepancy; the computed data are correct.

---

### 3.4 Autonomous Vehicles & ADAS (Chapter 26)

**Pipeline script:** `/home/saerom/projects/patentworld/data-pipeline/50_autonomous_vehicles.py`
**Page:** `/home/saerom/projects/patentworld/src/app/chapters/autonomous-vehicles/page.tsx`
**Data directory:** `public/data/av/`
**Start year:** 1990 | **Org start year:** 2005

**CPC Filter (SQL):**
```sql
(cpc_group LIKE 'B60W60%' OR cpc_group LIKE 'G05D1%' OR cpc_group LIKE 'G06V20/56%')
```

| CPC Code | Description | Filter Level |
|---|---|---|
| B60W60 | Autonomous driving systems | Group |
| G05D1 | Control of position, course, altitude of vehicles | Group |
| G06V20/56 | Scene understanding for driving environments | Sub-group |

**Subfield Mapping (4 subfields):**
- B60W60 -> Autonomous Driving Systems
- G05D1/00, G05D1/02 -> Navigation & Path Planning
- Other G05D1 -> Vehicle Control
- G06V20/56 -> Scene Understanding

**Diffusion Excludes:** B, G, Y
**DataNote Disclosure:** Complete. Correctly lists G05D1, B60W60, and G06V20/56 with descriptions and subfield mappings.
**Overlap with other domains:** AI (G06V20/56 is a subset of AI's G06V filter)
**Overlap Disclosed:** No -- the AV DataNote does not mention the AI overlap. It is disclosed only in the AI chapter's DataNote.

**ISSUE:** Chart caption on line 313 of `page.tsx` still references incorrect CPC codes "G05D1, B60W, G08G" instead of the correct "B60W60, G05D1, G06V20/56". The DataNote (lines 902-915) is correct, but this caption is inconsistent.

---

### 3.5 Biotechnology & Gene Editing (Chapter 27)

**Pipeline script:** `/home/saerom/projects/patentworld/data-pipeline/49_biotechnology.py`
**Page:** `/home/saerom/projects/patentworld/src/app/chapters/biotechnology/page.tsx`
**Data directory:** `public/data/biotech/`
**Start year:** 1976 | **Org start year:** 2000

**CPC Filter (SQL):**
```sql
(cpc_group LIKE 'C12N15%' OR cpc_group LIKE 'C12N9%' OR cpc_group LIKE 'C12Q1/68%')
```

| CPC Code | Description | Filter Level |
|---|---|---|
| C12N15 | Mutation or genetic engineering | Group |
| C12N9 | Enzymes and proenzymes | Group |
| C12Q1/68 | Nucleic acid detection | Sub-group |

**Subfield Mapping (6 subfields):**
- C12N15/09, C12N15/11 -> Gene Editing & Modification
- C12N15/63, C12N15/79, C12N15/85 -> Expression Vectors
- C12N15/1x (not /11) -> Recombinant DNA
- C12N9 -> Enzyme Engineering
- C12Q1/68 -> Nucleic Acid Detection
- Other C12N15 -> Other Genetic Engineering

**Diffusion Excludes:** C, Y
**DataNote Disclosure:** Complete. Lists specific CPC groups C12N15, C12N9, C12Q1/68 and notes these are "targeted codes" that "capture core molecular biotechnology while excluding broader C12N and C12Q categories that include conventional microbiology."
**Overlap with other domains:** None
**Overlap Disclosed:** N/A

---

### 3.6 Blockchain & Decentralized Systems (Chapter 28)

**Pipeline script:** `/home/saerom/projects/patentworld/data-pipeline/56_blockchain.py`
**Page:** `/home/saerom/projects/patentworld/src/app/chapters/blockchain/page.tsx`
**Data directory:** `public/data/blockchain/`
**Start year:** 2000 | **Org start year:** 2015

**CPC Filter (SQL):**
```sql
(cpc_group LIKE 'H04L9/0643%' OR cpc_group LIKE 'G06Q20/0655%')
```

| CPC Code | Description | Filter Level |
|---|---|---|
| H04L9/0643 | Distributed ledger & consensus | Sub-group |
| G06Q20/0655 | Cryptocurrency & digital money | Sub-group |

**Subfield Mapping (2 subfields):**
- H04L9/0643 -> Distributed Ledger & Consensus
- G06Q20/0655 -> Cryptocurrency & Digital Money

**Diffusion Excludes:** G, H, Y
**DataNote Disclosure:** Mostly complete. Lists H04L9/0643 correctly. States "G06Q20/06 (digital currency and payment schemes)" -- the DataNote says G06Q20/06 but the pipeline actually uses the narrower G06Q20/0655. This is a minor inaccuracy: the DataNote implies a broader code than is actually applied. The DataNote correctly states: "H04L9/0643 patents also overlap with the cybersecurity domain, which uses the broader H04L9 cryptographic mechanisms filter, and are counted in both domains."
**Overlap with other domains:** Cybersecurity (H04L9/0643 is a subset of Cybersecurity's H04L9 filter)
**Overlap Disclosed:** Yes -- disclosed in both the Blockchain and Cybersecurity DataNotes.

---

### 3.7 Cybersecurity (Chapter 29)

**Pipeline script:** `/home/saerom/projects/patentworld/data-pipeline/52_cybersecurity.py`
**Page:** `/home/saerom/projects/patentworld/src/app/chapters/cybersecurity/page.tsx`
**Data directory:** `public/data/cyber/`
**Start year:** 1976 | **Org start year:** 2000

**CPC Filter (SQL):**
```sql
(cpc_group LIKE 'G06F21%' OR cpc_group LIKE 'H04L9%' OR cpc_group LIKE 'H04L63%')
```

| CPC Code | Description | Filter Level |
|---|---|---|
| G06F21 | Security arrangements for computer systems | Group |
| H04L9 | Cryptographic mechanisms | Group |
| H04L63 | Network security protocols | Group |

**Subfield Mapping (6 subfields):**
- G06F21/3x, G06F21/4x -> Authentication & Access Control
- G06F21/5x -> System Security
- G06F21/6x, G06F21/7x -> Data Protection
- H04L9 -> Cryptography
- H04L63 -> Network Security
- Other G06F21 -> Other Computer Security

**Diffusion Excludes:** G, H, Y
**DataNote Disclosure:** Complete. Lists H04L9, G06F21, H04L63 and states: "blockchain patents using H04L9/0643 (distributed ledger technology) overlap with the cybersecurity domain's H04L9 cryptographic mechanisms filter and are counted in both domains."
**Overlap with other domains:** Blockchain (H04L9/0643 is a subset of H04L9)
**Overlap Disclosed:** Yes -- disclosed in both the Cybersecurity and Blockchain DataNotes.

---

### 3.8 Digital Health & Medical Devices (Chapter 30)

**Pipeline script:** `/home/saerom/projects/patentworld/data-pipeline/54_digital_health.py`
**Page:** `/home/saerom/projects/patentworld/src/app/chapters/digital-health/page.tsx`
**Data directory:** `public/data/digihealth/`
**Start year:** 1976 | **Org start year:** 2000

**CPC Filter (SQL):**
```sql
(cpc_group LIKE 'A61B5%' OR cpc_subclass = 'G16H' OR cpc_group LIKE 'A61B34%')
```

| CPC Code | Description | Filter Level |
|---|---|---|
| A61B5 | Patient monitoring / diagnosis | Group |
| G16H | Health informatics (EHR, clinical decision support, etc.) | Subclass |
| A61B34 | Surgical robotics | Group |

**Subfield Mapping (11 subfields):**
- A61B5/02, A61B5/04 -> Vital Signs Monitoring
- A61B5/05 -> Diagnostic Imaging
- A61B5/07, A61B5/08 -> Physiological Signals
- Other A61B5 -> Other Patient Monitoring
- G16H10 -> Electronic Health Records
- G16H20 -> Clinical Decision Support
- G16H30 -> Medical Imaging Informatics
- G16H40 -> Healthcare IT Infrastructure
- G16H50 -> Biomedical Data Analytics
- Other G16H -> Other Health Informatics
- A61B34 -> Surgical Robotics

**Diffusion Excludes:** A, G, Y
**DataNote Disclosure:** Complete. Lists A61B5, G16H, A61B34, and explicitly notes: "diagnostic imaging codes A61B6 and A61B8 are not included in the filter, as these primarily cover traditional radiology equipment rather than digital health applications."
**Overlap with other domains:** None
**Overlap Disclosed:** N/A

---

### 3.9 Green Innovation (Chapter 31)

**Pipeline scripts:** `/home/saerom/projects/patentworld/data-pipeline/29_green_innovation.py` (original bespoke), `/home/saerom/projects/patentworld/data-pipeline/57_green_supplement.py` (harmonization)
**Page:** `/home/saerom/projects/patentworld/src/app/chapters/green-innovation/page.tsx`
**Data directory:** `public/data/green/`
**Start year:** 1976 | **Org start year:** 2000

**CPC Filter (SQL):**
```sql
(cpc_subclass LIKE 'Y02%' OR cpc_subclass LIKE 'Y04S%' OR cpc_group LIKE 'Y02%' OR cpc_group LIKE 'Y04S%')
```

| CPC Code | Description | Filter Level |
|---|---|---|
| Y02 | Climate change mitigation technologies | Cross-sectional subclass |
| Y04S | Smart grids | Cross-sectional subclass |

**Subfield Mapping (9 subfields):**
- Y02E10 -> Renewable Energy
- Y02E60 -> Batteries & Storage
- Other Y02E -> Other Energy
- Y02T -> Transportation / EVs
- Y02C -> Carbon Capture
- Y02P -> Industrial Production
- Y02B -> Buildings
- Y02W -> Waste Management
- Y04S -> Smart Grids

**Diffusion Excludes:** Y only
**DataNote Disclosure:** Complete. Full sub-code mapping provided (Y02E10, Y02E60, Y02T, Y02C, Y02P, Y02B, Y02W, Y04S). Notes the AI intersection methodology.
**Overlap with other domains:** None at the CPC filter level (Y02/Y04S are cross-sectional tagging codes applied alongside primary CPC codes; patents can be co-classified under both Y02 and other domain codes such as H01L31 for photovoltaic cells, but this is a co-classification pattern, not a filter subset overlap)
**Overlap Disclosed:** N/A

**UNIQUE FEATURES:** Green Innovation has additional analyses not in the standard template:
- `green_ai_trend.json` -- AI-Green patent intersection over time
- `green_ai_heatmap.json` -- Green sub-category x AI subfield heatmap
- `green_ev_battery_coupling.json` -- EV-Battery co-occurrence lift (from `75_act6_enrichments.py`)
- `green_volume.json`, `green_by_category.json`, `green_by_country.json`, `green_top_companies.json` -- from original bespoke script

---

### 3.10 Quantum Computing (Chapter 32)

**Pipeline script:** `/home/saerom/projects/patentworld/data-pipeline/48_quantum_computing.py`
**Page:** `/home/saerom/projects/patentworld/src/app/chapters/quantum-computing/page.tsx`
**Data directory:** `public/data/quantum/`
**Start year:** 1990 | **Org start year:** 2005

**CPC Filter (SQL):**
```sql
(cpc_group LIKE 'G06N10%' OR cpc_group LIKE 'H01L39%')
```

| CPC Code | Description | Filter Level |
|---|---|---|
| G06N10 | Quantum computing algorithms and architectures | Group |
| H01L39 | Superconducting devices | Group |

**Subfield Mapping (7 subfields):**
- G06N10/20 -> Quantum Algorithms
- G06N10/40 -> Physical Realizations
- G06N10/60 -> Quantum Annealing
- G06N10/70 -> Error Correction
- G06N10/80 -> Quantum Programming
- Other G06N10 -> Other Quantum Computing
- H01L39 -> Superconducting Devices

**Diffusion Excludes:** G, Y
**DataNote Disclosure:** Complete. Lists G06N10 and H01L39 by name and states: "G06N10 patents are also counted in the AI domain (which uses the broader G06N prefix), and H01L39 patents overlap with the semiconductor domain."
**Overlap with other domains:** AI (G06N10 is a subset of AI's G06N filter), Semiconductors (H01L39 is a subset of Semiconductors' H01L filter)
**Overlap Disclosed:** Yes -- both overlaps are disclosed in the Quantum Computing chapter's DataNote.

**ADDITIONAL DATA:** `quantum_semiconductor_dependence.json` (from `75_act6_enrichments.py`) -- measures share of quantum assignees with prior semiconductor patents.

---

### 3.11 Semiconductors (Chapter 33)

**Pipeline script:** `/home/saerom/projects/patentworld/data-pipeline/47_semiconductors.py`
**Page:** `/home/saerom/projects/patentworld/src/app/chapters/semiconductors/page.tsx`
**Data directory:** `public/data/semiconductors/`
**Start year:** 1976 | **Org start year:** 1990

**CPC Filter (SQL):**
```sql
(cpc_subclass IN ('H01L', 'H10N', 'H10K'))
```

| CPC Code | Description | Filter Level |
|---|---|---|
| H01L | Semiconductor devices, processes, solid-state technology | Subclass |
| H10N | Other solid-state devices (thermoelectric, piezoelectric) | Subclass |
| H10K | Organic solid-state devices | Subclass |

**Subfield Mapping (9 subfields):**
- H01L21 -> Manufacturing Processes
- H01L23 -> Packaging & Interconnects
- H01L25 -> Assemblies & Modules
- H01L27 -> Integrated Circuits
- H01L29 -> Semiconductor Devices
- H01L31 -> Photovoltaic Cells
- H01L33 -> LEDs & Optoelectronics
- H10K -> Organic Semiconductors
- H10N -> Other Solid-State Devices

**Diffusion Excludes:** H, Y
**DataNote Disclosure:** Complete. Lists all three subclasses H01L, H10N, and H10K. Notes the diffusion analysis excludes Section H.
**Overlap with other domains:** Quantum Computing (H01L39 is a subset of H01L)
**Overlap Disclosed:** No -- the Semiconductor DataNote does not mention the Quantum Computing overlap. It is disclosed only in the Quantum Computing chapter's DataNote.

---

### 3.12 Space Technology (Chapter 34)

**Pipeline script:** `/home/saerom/projects/patentworld/data-pipeline/51_space_technology.py`
**Page:** `/home/saerom/projects/patentworld/src/app/chapters/space-technology/page.tsx`
**Data directory:** `public/data/space/`
**Start year:** 1976 | **Org start year:** 2000

**CPC Filter (SQL):**
```sql
(cpc_subclass = 'B64G' OR cpc_group LIKE 'H04B7/185%')
```

| CPC Code | Description | Filter Level |
|---|---|---|
| B64G | Cosmonautics; vehicles or equipment therefor | Subclass |
| H04B7/185 | Space-based communication links | Sub-group |

**Subfield Mapping (7 subfields):**
- B64G1/10 -> Satellite Design
- B64G1/22, B64G1/24, B64G1/40 -> Propulsion Systems
- B64G1/42, B64G1/44 -> Attitude Control & Life Support
- B64G1/64 -> Re-Entry Systems
- B64G1/66 -> Arrangements for Landing
- H04B7/185 -> Space Communications
- Other B64G -> Other Spacecraft

**Diffusion Excludes:** B, H, Y
**DataNote Disclosure:** Complete. Lists B64G and H04B7/185 with subfield mappings.
**Overlap with other domains:** None
**Overlap Disclosed:** N/A

---

## 4. Cross-Domain Overlap Matrix

The following matrix identifies CPC code overlaps where one domain's filter is a strict subset of another domain's filter, meaning a single patent is guaranteed to be counted in both domains.

|  | 3DPrint | AgTech | AI | AV | Biotech | Blockchain | Cyber | DigiHealth | Green | Quantum | Semi | Space |
|--|---------|--------|----|----|---------|------------|-------|------------|-------|---------|------|-------|
| **3DPrint** | - | | | | | | | | | | | |
| **AgTech** | | - | | | | | | | | | | |
| **AI** | | | - | **G06V20/56** | | | | | | **G06N10** | | |
| **AV** | | | **G06V20/56** | - | | | | | | | | |
| **Biotech** | | | | | - | | | | | | | |
| **Blockchain** | | | | | | - | **H04L9/0643** | | | | | |
| **Cyber** | | | | | | **H04L9/0643** | - | | | | | |
| **DigiHealth** | | | | | | | | - | | | | |
| **Green** | | | | | | | | | - | | | |
| **Quantum** | | | **G06N10** | | | | | | | - | **H01L39** | |
| **Semi** | | | | | | | | | | **H01L39** | - | |
| **Space** | | | | | | | | | | | | - |

### Overlap Disclosure Status

| Overlap Pair | Mechanism | Disclosed in Superset Domain? | Disclosed in Subset Domain? | Where Disclosed |
|---|---|---|---|---|
| AI <-> Quantum Computing | G06N10 subset of G06N | Yes (AI DataNote) | Yes (Quantum DataNote) | Both chapters |
| AI <-> Autonomous Vehicles | G06V20/56 subset of G06V | Yes (AI DataNote) | **No** (AV DataNote silent) | AI chapter only |
| Cybersecurity <-> Blockchain | H04L9/0643 subset of H04L9 | Yes (Cyber DataNote) | Yes (Blockchain DataNote) | Both chapters |
| Semiconductors <-> Quantum Computing | H01L39 subset of H01L | **No** (Semi DataNote silent) | Yes (Quantum DataNote) | Quantum chapter only |

**Observation:** Two of four overlap pairs are disclosed in both relevant chapters (AI-Quantum, Cyber-Blockchain). Two pairs are disclosed in only one chapter (AI-AV is in AI only; Semi-Quantum is in Quantum only). Ideally all overlaps should be disclosed on both sides so a reader visiting either chapter is aware.

### Quantitative Spillover (act6_spillover.json)

The `72_act6_cross_domain.py` script computes pairwise co-classification lift for all 66 domain pairs:

```
lift = observed_co_occurrence / expected_co_occurrence_under_independence
```

This captures not only the four definitional subset overlaps above but also co-classification patterns where the same patent carries codes from two different domains even though neither domain's filter is a subset of the other (e.g., a solar cell patent classified under both Y02E10 and H01L31). The Deep Dive Overview chapter presents the results.

---

## 5. Framework Consistency Analysis

### 5.1 Standard Pipeline Output

All 12 domains produce these 13 JSON files (with domain-specific prefixes):

| # | File Pattern | Analysis |
|---|---|---|
| 1 | `{slug}_per_year.json` | Annual patent counts + share |
| 2 | `{slug}_by_subfield.json` | Sub-category breakdown over time |
| 3 | `{slug}_top_assignees.json` | Top 50 assignees |
| 4 | `{slug}_org_over_time.json` | Top 15 org rankings over time |
| 5 | `{slug}_top_inventors.json` | Top 50 inventors |
| 6 | `{slug}_geography.json` | Top 100 country+state locations |
| 7 | `{slug}_quality.json` | Claims, backward cites, scope, team size |
| 8 | `{slug}_team_comparison.json` | Domain vs. non-domain team size |
| 9 | `{slug}_assignee_type.json` | Corporate/govt/university/individual |
| 10 | `{slug}_strategies.json` | Subfield portfolio for top 20 orgs |
| 11 | `{slug}_diffusion.json` | Cross-CPC-section co-classification |
| 12 | `{slug}_entrant_incumbent.json` | Entrant vs. incumbent decomposition |
| 13 | `{slug}_quality_bifurcation.json` | Top-decile citation share |

AI outputs the same analyses but with `ai_` prefix instead of `{slug}_` prefix, stored in `chapter11/` rather than a domain-named directory.

### 5.2 CPC Filter Granularity

| Level | Domains |
|---|---|
| **Subclass level** (broadest) | Semiconductors (H01L, H10N, H10K), AgTech (A01B, A01C, A01G, A01H), Space (B64G), 3D Printing (B33Y), Digital Health (G16H) |
| **Group level** (moderate) | AI (G06N, G06F18, etc.), Cybersecurity (G06F21, H04L9, H04L63), Biotech (C12N15, C12N9, C12Q1/68), AV (B60W60, G05D1, G06V20/56), Green (Y02, Y04S), Quantum (G06N10, H01L39) |
| **Sub-group level** (narrowest) | Blockchain (H04L9/0643, G06Q20/0655), AgTech precision ag (G06Q50/02), Space comms (H04B7/185), AV scene understanding (G06V20/56) |

### 5.3 Start Year Variation

| Start Year | Domains |
|---|---|
| 1976 (default) | AI, AgTech, Biotech, Cybersecurity, Digital Health, Green, Semiconductors, Space |
| 1990 | 3D Printing, Autonomous Vehicles, Quantum Computing |
| 2000 | Blockchain |

### 5.4 Cross-Domain Comparison Consistency

Script `72_act6_cross_domain.py` duplicates all 12 CPC filters in its `DOMAINS` dictionary (lines 21-34). **Verification result:** All 12 filters match their individual pipeline scripts exactly, with one minor addition: the `72_act6_cross_domain.py` 3D Printing filter adds `cpc_group LIKE 'B33Y%'` alongside `cpc_subclass = 'B33Y'` -- this is redundant (both match the same patents) but not incorrect.

---

## 6. Issues Found and Status

### 6.1 Issues Resolved Since Prior Audits

| Issue | Status |
|---|---|
| AV DataNote disclosed wrong CPC codes (B60W, G08G instead of B60W60, G06V20/56) | **FIXED** -- DataNote now correctly lists B60W60, G05D1, G06V20/56 |
| Biotech DataNote implied broader scope (C12N, C12Q instead of C12N15, C12N9, C12Q1/68) | **FIXED** -- DataNote now lists specific groups and notes exclusion of broader categories |
| Digital Health DataNote listed A61B6, A61B8 as included | **FIXED** -- DataNote now explicitly notes these are "not included in the filter" |
| Semiconductor DataNote omitted H10N, H10K | **FIXED** -- DataNote now lists all three subclasses |
| Quantum Computing DataNote was vague (no specific codes) | **FIXED** -- DataNote now lists G06N10 and H01L39 explicitly |
| AgTech DataNote listed A01N as included | **FIXED** -- DataNote now notes "A01N (biocides) is excluded from the filter" |
| Cross-domain overlaps not disclosed | **MOSTLY FIXED** -- AI, Quantum, Blockchain, and Cybersecurity DataNotes now document overlaps |

### 6.2 Remaining Issues

**Medium:**

1. **AV chart caption still references wrong CPC codes.** Line 313 of `/home/saerom/projects/patentworld/src/app/chapters/autonomous-vehicles/page.tsx` contains the caption text `"AV-related CPC codes (G05D1, B60W, G08G)"`. The correct codes per the actual pipeline filter are B60W60, G05D1, and G06V20/56. The DataNote (lines 902-915) is correct, but this chart caption remains inconsistent with both the DataNote and the pipeline.

2. **AV DataNote does not disclose the AI overlap.** The AV DataNote does not mention that G06V20/56 (scene understanding) patents are also counted in the AI domain. The overlap is disclosed only in the AI chapter. A reader visiting only the AV chapter would be unaware.

3. **Semiconductor DataNote does not disclose the Quantum overlap.** The Semiconductor DataNote does not mention that H01L39 (superconducting devices) patents are also counted in the Quantum Computing domain. The overlap is disclosed only in the Quantum chapter.

4. **Blockchain DataNote discloses broader code than actually used.** The DataNote says "G06Q20/06 (digital currency and payment schemes)" but the pipeline filter uses the narrower `G06Q20/0655`. G06Q20/06 would include additional sub-groups beyond G06Q20/0655. The DataNote implies a broader definition than is actually applied.

**Minor:**

5. **AI pipeline docstring mentions G06T but filter does not include it.** The docstring at the top of `12_chapter11_ai_patents.py` lists G06T (image data processing) as a "Key CPC class" but the SQL filter omits it. This is documentation-only; the computed data are correct.

6. **AI uses bespoke scripts instead of shared framework.** AI stores data in `chapter11/` rather than a domain-named directory and uses slightly different field names (e.g., `ai_patents` vs. `domain_patents`). This creates a maintenance asymmetry but has no impact on correctness.

7. **Green Innovation has dual data structure.** The original bespoke script produces non-standard file names (`green_volume.json`, `green_by_category.json`, `green_top_companies.json`, `green_by_country.json`) alongside the harmonized standard files, creating some redundancy.

8. **No centralized definition file.** Domain CPC definitions are embedded in individual Python scripts and duplicated in `72_act6_cross_domain.py`. A shared configuration file would reduce the risk of definition drift.

9. **Blockchain definition is very narrow.** Only two CPC sub-groups are used (H04L9/0643, G06Q20/0655), which may miss blockchain-related patents classified under other codes. This is a design choice rather than an error, and the DataNote acknowledges it.

---

## 7. File Location Reference

| Resource | Path |
|---|---|
| Domain utility framework | `/home/saerom/projects/patentworld/data-pipeline/domain_utils.py` |
| Cross-domain comparison | `/home/saerom/projects/patentworld/data-pipeline/72_act6_cross_domain.py` |
| Cross-domain enrichments | `/home/saerom/projects/patentworld/data-pipeline/75_act6_enrichments.py` |
| Chapter constants | `/home/saerom/projects/patentworld/src/lib/constants.ts` |
| 3D Printing pipeline | `/home/saerom/projects/patentworld/data-pipeline/55_3d_printing.py` |
| 3D Printing page | `/home/saerom/projects/patentworld/src/app/chapters/3d-printing/page.tsx` |
| AgTech pipeline | `/home/saerom/projects/patentworld/data-pipeline/53_agricultural_technology.py` |
| AgTech page | `/home/saerom/projects/patentworld/src/app/chapters/agricultural-technology/page.tsx` |
| AI pipeline (base) | `/home/saerom/projects/patentworld/data-pipeline/12_chapter11_ai_patents.py` |
| AI pipeline (deep) | `/home/saerom/projects/patentworld/data-pipeline/23_chapter11_ai_deep.py` |
| AI page | `/home/saerom/projects/patentworld/src/app/chapters/ai-patents/page.tsx` |
| AV pipeline | `/home/saerom/projects/patentworld/data-pipeline/50_autonomous_vehicles.py` |
| AV page | `/home/saerom/projects/patentworld/src/app/chapters/autonomous-vehicles/page.tsx` |
| Biotech pipeline | `/home/saerom/projects/patentworld/data-pipeline/49_biotechnology.py` |
| Biotech page | `/home/saerom/projects/patentworld/src/app/chapters/biotechnology/page.tsx` |
| Blockchain pipeline | `/home/saerom/projects/patentworld/data-pipeline/56_blockchain.py` |
| Blockchain page | `/home/saerom/projects/patentworld/src/app/chapters/blockchain/page.tsx` |
| Cybersecurity pipeline | `/home/saerom/projects/patentworld/data-pipeline/52_cybersecurity.py` |
| Cybersecurity page | `/home/saerom/projects/patentworld/src/app/chapters/cybersecurity/page.tsx` |
| Digital Health pipeline | `/home/saerom/projects/patentworld/data-pipeline/54_digital_health.py` |
| Digital Health page | `/home/saerom/projects/patentworld/src/app/chapters/digital-health/page.tsx` |
| Green pipeline (original) | `/home/saerom/projects/patentworld/data-pipeline/29_green_innovation.py` |
| Green pipeline (supplement) | `/home/saerom/projects/patentworld/data-pipeline/57_green_supplement.py` |
| Green page | `/home/saerom/projects/patentworld/src/app/chapters/green-innovation/page.tsx` |
| Quantum pipeline | `/home/saerom/projects/patentworld/data-pipeline/48_quantum_computing.py` |
| Quantum page | `/home/saerom/projects/patentworld/src/app/chapters/quantum-computing/page.tsx` |
| Semiconductor pipeline | `/home/saerom/projects/patentworld/data-pipeline/47_semiconductors.py` |
| Semiconductor page | `/home/saerom/projects/patentworld/src/app/chapters/semiconductors/page.tsx` |
| Space pipeline | `/home/saerom/projects/patentworld/data-pipeline/51_space_technology.py` |
| Space page | `/home/saerom/projects/patentworld/src/app/chapters/space-technology/page.tsx` |
| Deep Dive Overview page | `/home/saerom/projects/patentworld/src/app/chapters/deep-dive-overview/page.tsx` |
| Spillover data | `/home/saerom/projects/patentworld/public/data/act6/act6_spillover.json` |
