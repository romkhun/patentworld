# Technology Domain Definitions Audit

**Date:** 2026-02-20
**Auditor:** Claude (automated audit)
**Scope:** All 12 Deep Dive technology domains in PatentWorld ACT 6

---

## Summary Table

| # | Domain | Definition Method | CPC Codes Used | Pipeline Script | Disclosed on Page? | Overlaps With |
|---|--------|------------------|----------------|-----------------|-------------------|---------------|
| 1 | 3D Printing | CPC codes only | B33Y, B29C64, B22F10 | `55_3d_printing.py` | Yes (DataNote) | None identified |
| 2 | Agricultural Technology | CPC codes only | A01B, A01C, A01G, A01H, G06Q50/02 | `53_agricultural_technology.py` | Yes (DataNote) | None identified |
| 3 | Artificial Intelligence | CPC codes only | G06N, G06F18, G06V, G10L15, G06F40 | `12_chapter11_ai_patents.py` + `23_chapter11_ai_deep.py` | Yes (DataNote + chart captions) | Quantum Computing (G06N10), Blockchain (partial, see below) |
| 4 | Autonomous Vehicles | CPC codes only | B60W60, G05D1, G06V20/56 | `50_autonomous_vehicles.py` | Yes (DataNote) | AI (G06V20/56 is subset of G06V) |
| 5 | Biotechnology | CPC codes only | C12N15, C12N9, C12Q1/68 | `49_biotechnology.py` | Yes (DataNote) | None identified |
| 6 | Blockchain | CPC codes only | H04L9/0643, G06Q20/0655 | `56_blockchain.py` | Yes (DataNote) | Cybersecurity (H04L9/0643 is subset of H04L9) |
| 7 | Cybersecurity | CPC codes only | G06F21, H04L9, H04L63 | `52_cybersecurity.py` | Yes (DataNote) | Blockchain (H04L9 contains H04L9/0643) |
| 8 | Digital Health | CPC codes only | A61B5, G16H, A61B34 | `54_digital_health.py` | Yes (DataNote) | None identified |
| 9 | Green Innovation | CPC codes only | Y02, Y04S | `29_green_innovation.py` + `57_green_supplement.py` | Yes (DataNote + narrative) | None identified (Y section is cross-cutting by design) |
| 10 | Quantum Computing | CPC codes only | G06N10, H01L39 | `48_quantum_computing.py` | Yes (DataNote, though vague) | AI (G06N10 is subset of G06N), Semiconductors (H01L39 is subset of H01L) |
| 11 | Semiconductors | CPC codes only | H01L, H10N, H10K | `47_semiconductors.py` | Yes (DataNote) | Quantum Computing (H01L39 is subset of H01L) |
| 12 | Space Technology | CPC codes only | B64G, H04B7/185 | `51_space_technology.py` | Yes (DataNote) | None identified |

---

## Detailed Domain Definitions

### 1. 3D Printing (Additive Manufacturing)

**Pipeline script:** `/home/saerom/projects/patentworld/data-pipeline/55_3d_printing.py`
**Page:** `/home/saerom/projects/patentworld/src/app/chapters/3d-printing/page.tsx`
**Start year:** 1990 | **Org start year:** 2005

**CPC Filter (SQL):**
```sql
(cpc_subclass = 'B33Y' OR cpc_group LIKE 'B29C64%' OR cpc_group LIKE 'B22F10%')
```

**CPC Codes:**
| Code | Description |
|------|-------------|
| B33Y | Additive manufacturing (dedicated AM classification) |
| B29C64 | Additive manufacturing of polymeric materials |
| B22F10 | Additive manufacturing of metallic materials |

**Subfields:**
- B33Y10: AM Processes
- B33Y30: AM Equipment
- B33Y40: AM Auxiliary Operations
- B33Y50: AM Data Handling
- B33Y70: AM Materials
- B33Y80: AM Products
- B29C64: Polymer Additive Manufacturing
- B22F10: Metal Additive Manufacturing

**Disclosure on page:** Yes. The DataNote states: "3D printing patents are identified using CPC classifications: B33Y (additive manufacturing, the dedicated classification for AM technologies), B29C64 (additive manufacturing of polymeric materials), and B22F10 (additive manufacturing of metallic materials)."

**Excluded CPC sections for diffusion:** B, Y

---

### 2. Agricultural Technology

**Pipeline script:** `/home/saerom/projects/patentworld/data-pipeline/53_agricultural_technology.py`
**Page:** `/home/saerom/projects/patentworld/src/app/chapters/agricultural-technology/page.tsx`
**Start year:** 1976 | **Org start year:** 2000

**CPC Filter (SQL):**
```sql
(cpc_subclass IN ('A01B', 'A01C', 'A01G', 'A01H') OR cpc_group LIKE 'G06Q50/02%')
```

**CPC Codes:**
| Code | Description |
|------|-------------|
| A01B | Soil Working & Tillage |
| A01C | Planting & Sowing |
| A01G | Horticulture & Forestry |
| A01H | Plant Breeding & Biocides |
| G06Q50/02 | Precision Agriculture |

**Subfields:** Mapped directly from the subclasses above, plus G06Q50/02 as "Precision Agriculture."

**Disclosure on page:** Yes. The DataNote states: "Agricultural technology patents are identified using CPC classifications for soil working (A01B), planting and sowing (A01C), horticulture and forestry (A01G), plant breeding and biocides (A01H, A01N), and precision agriculture (G06Q50/02)."

**Note:** The DataNote mentions A01N (biocides) but the pipeline does NOT include A01N. This is a **discrepancy** -- the page discloses a code that is not in the actual filter.

**Excluded CPC sections for diffusion:** A, Y

---

### 3. Artificial Intelligence

**Pipeline script:** `/home/saerom/projects/patentworld/data-pipeline/12_chapter11_ai_patents.py` (main)
**Deep analysis:** `/home/saerom/projects/patentworld/data-pipeline/23_chapter11_ai_deep.py`
**Page:** `/home/saerom/projects/patentworld/src/app/chapters/ai-patents/page.tsx`
**Start year:** 1976 | **Org start year:** default (2000)

**CPC Filter (SQL):**
```sql
(cpc_group LIKE 'G06N%'
 OR cpc_group LIKE 'G06F18%'
 OR cpc_subclass = 'G06V'
 OR cpc_group LIKE 'G10L15%'
 OR cpc_group LIKE 'G06F40%')
```

**CPC Codes:**
| Code | Description |
|------|-------------|
| G06N | Computing arrangements based on specific computational models (neural networks, ML, genetic algorithms, fuzzy logic) |
| G06F18 | Pattern recognition (classification, clustering, feature extraction) |
| G06V | Image or video recognition or understanding |
| G10L15 | Speech recognition |
| G06F40 | Natural language processing (NLP/text) |

**Subfields:**
- G06N3: Neural Networks / Deep Learning
- G06N20: Machine Learning
- G06N5: Knowledge-Based Systems
- G06N7: Probabilistic / Fuzzy
- G06N10: Quantum Computing (note: also captured by Quantum Computing domain)
- G06F18: Pattern Recognition
- G06V: Computer Vision
- G10L15: Speech Recognition
- G06F40: Natural Language Processing

**Disclosure on page:** Yes. The DataNote states: "AI patents are identified using CPC classifications: G06N (computational models including neural networks and machine learning), G06F18 (pattern recognition), G06V (image/video recognition), G10L15 (speech recognition), and G06F40 (natural language processing)." Also disclosed in chart captions (e.g., the first chart caption explicitly lists all five CPC codes).

**Note:** The pipeline docstring mentions G06T (image data processing / generative image models) as a "Key CPC class for AI" but G06T is **NOT included** in the actual AI_CLASSES_SQL filter. This is a **docstring discrepancy** -- G06T is listed in the comments but not in the executed code.

**Excluded CPC sections for GPT diffusion:** G, Y

---

### 4. Autonomous Vehicles & ADAS

**Pipeline script:** `/home/saerom/projects/patentworld/data-pipeline/50_autonomous_vehicles.py`
**Page:** `/home/saerom/projects/patentworld/src/app/chapters/autonomous-vehicles/page.tsx`
**Start year:** 1990 | **Org start year:** 2005

**CPC Filter (SQL):**
```sql
(cpc_group LIKE 'B60W60%' OR cpc_group LIKE 'G05D1%' OR cpc_group LIKE 'G06V20/56%')
```

**CPC Codes:**
| Code | Description |
|------|-------------|
| B60W60 | Autonomous driving systems (conjoint control) |
| G05D1 | Control of position, course, altitude of vehicles |
| G06V20/56 | Scene understanding (visual recognition for driving) |

**Subfields:**
- B60W60: Autonomous Driving Systems
- G05D1/00, G05D1/02: Navigation & Path Planning
- G05D1 (other): Vehicle Control
- G06V20/56: Scene Understanding

**Disclosure on page:** Yes. The DataNote states: "AV patents are identified using CPC classifications: G05D1 (control of position, course, or altitude of land, water, air, or space vehicles), B60W (conjoint control of vehicle sub-units), and G08G (traffic control systems)."

**Note:** The DataNote mentions B60W (broadly) and G08G, but the actual pipeline uses B60W60 (more specific) and does NOT include G08G at all. It uses G06V20/56 instead. This is a **significant discrepancy** -- the DataNote discloses different codes than what the pipeline actually uses.

**Excluded CPC sections for diffusion:** B, G, Y

---

### 5. Biotechnology & Gene Editing

**Pipeline script:** `/home/saerom/projects/patentworld/data-pipeline/49_biotechnology.py`
**Page:** `/home/saerom/projects/patentworld/src/app/chapters/biotechnology/page.tsx`
**Start year:** 1976 | **Org start year:** 2000

**CPC Filter (SQL):**
```sql
(cpc_group LIKE 'C12N15%' OR cpc_group LIKE 'C12N9%' OR cpc_group LIKE 'C12Q1/68%')
```

**CPC Codes:**
| Code | Description |
|------|-------------|
| C12N15 | Mutation or genetic engineering; DNA or RNA concerning genetic engineering, vectors |
| C12N9 | Enzymes, e.g., ligases; Proenzymes; Compositions thereof |
| C12Q1/68 | Measuring or testing involving nucleic acids |

**Subfields:**
- C12N15/09, C12N15/11: Gene Editing & Modification
- C12N15/63, C12N15/79, C12N15/85: Expression Vectors
- C12N15/1 (except /11): Recombinant DNA
- C12N9: Enzyme Engineering
- C12Q1/68: Nucleic Acid Detection
- C12N15 (other): Other Genetic Engineering

**Disclosure on page:** Yes. The DataNote states: "Biotechnology patents are identified using CPC classifications related to genetic engineering and molecular biology, including C12N (microorganisms, enzymes, and mutation or genetic engineering), C12Q (measuring or testing involving enzymes or microorganisms), and related codes."

**Note:** The DataNote mentions broader codes (C12N, C12Q) than the pipeline actually uses (C12N15, C12N9, C12Q1/68). The pipeline does NOT capture all of C12N or C12Q -- only specific subgroups. This is a **disclosure discrepancy** -- the DataNote implies broader coverage than the pipeline delivers.

**Excluded CPC sections for diffusion:** C, Y

---

### 6. Blockchain & Decentralized Systems

**Pipeline script:** `/home/saerom/projects/patentworld/data-pipeline/56_blockchain.py`
**Page:** `/home/saerom/projects/patentworld/src/app/chapters/blockchain/page.tsx`
**Start year:** 2000 | **Org start year:** 2015

**CPC Filter (SQL):**
```sql
(cpc_group LIKE 'H04L9/0643%' OR cpc_group LIKE 'G06Q20/0655%')
```

**CPC Codes:**
| Code | Description |
|------|-------------|
| H04L9/0643 | Distributed ledger technology & consensus mechanisms |
| G06Q20/0655 | Cryptocurrency & digital money |

**Subfields:**
- H04L9/0643: Distributed Ledger & Consensus
- G06Q20/0655: Cryptocurrency & Digital Money

**Disclosure on page:** Yes. The DataNote states: "Blockchain patents are identified using CPC classifications for distributed ledger technology, consensus mechanisms, and cryptocurrency-related inventions."

**Note:** The DataNote does not list the specific CPC group codes (H04L9/0643, G06Q20/0655). This is a very narrow definition (only 2 specific group codes). The DataNote correctly notes: "Due to the narrow range of CPC codes that define this domain, blockchain represents the smallest technology area by patent volume in this study."

**Excluded CPC sections for diffusion:** G, H, Y

---

### 7. Cybersecurity

**Pipeline script:** `/home/saerom/projects/patentworld/data-pipeline/52_cybersecurity.py`
**Page:** `/home/saerom/projects/patentworld/src/app/chapters/cybersecurity/page.tsx`
**Start year:** 1976 | **Org start year:** 2000

**CPC Filter (SQL):**
```sql
(cpc_group LIKE 'G06F21%' OR cpc_group LIKE 'H04L9%' OR cpc_group LIKE 'H04L63%')
```

**CPC Codes:**
| Code | Description |
|------|-------------|
| G06F21 | Security arrangements for protecting computers, components thereof, programs or data against unauthorised activity |
| H04L9 | Cryptographic mechanisms or cryptographic arrangements for secret or secure communication |
| H04L63 | Network security protocols |

**Subfields:**
- G06F21/3, G06F21/4: Authentication & Access Control
- G06F21/5: System Security
- G06F21/6, G06F21/7: Data Protection
- H04L9: Cryptography
- H04L63: Network Security
- G06F21 (other): Other Computer Security

**Disclosure on page:** Yes. The DataNote states: "Cybersecurity patents are identified using CPC classifications related to cryptographic mechanisms (H04L9), security arrangements for computer systems (G06F21), network security protocols (H04L63), data protection (G06F21/60-62), and related security classifications."

**Excluded CPC sections for diffusion:** G, H, Y

---

### 8. Digital Health & Medical Devices

**Pipeline script:** `/home/saerom/projects/patentworld/data-pipeline/54_digital_health.py`
**Page:** `/home/saerom/projects/patentworld/src/app/chapters/digital-health/page.tsx`
**Start year:** 1976 | **Org start year:** 2000

**CPC Filter (SQL):**
```sql
(cpc_group LIKE 'A61B5%' OR cpc_subclass = 'G16H' OR cpc_group LIKE 'A61B34%')
```

**CPC Codes:**
| Code | Description |
|------|-------------|
| A61B5 | Detecting, measuring or recording for diagnostic purposes (patient monitoring) |
| G16H | Healthcare informatics (electronic health records, clinical decision support, etc.) |
| A61B34 | Computer-aided surgery; surgical robotics |

**Subfields:**
- A61B5/02, A61B5/04: Vital Signs Monitoring
- A61B5/05: Diagnostic Imaging
- A61B5/07, A61B5/08: Physiological Signals
- A61B5 (other): Other Patient Monitoring
- G16H10: Electronic Health Records
- G16H20: Clinical Decision Support
- G16H30: Medical Imaging Informatics
- G16H40: Healthcare IT Infrastructure
- G16H50: Biomedical Data Analytics
- G16H (other): Other Health Informatics
- A61B34: Surgical Robotics

**Disclosure on page:** Yes. The DataNote states: "Digital health patents are identified using CPC classifications spanning patient monitoring (A61B5), diagnostic imaging (A61B6, A61B8), electronic health records (G16H10), clinical decision support (G16H50), health informatics (G16H), surgical robotics (A61B34), and related medical device codes."

**Note:** The DataNote mentions A61B6 and A61B8 (diagnostic imaging), but the pipeline does NOT include these codes. The pipeline uses A61B5 (patient monitoring) but not A61B6 or A61B8. This is another **disclosure discrepancy**.

**Excluded CPC sections for diffusion:** A, G, Y

---

### 9. Green Innovation

**Pipeline script:** `/home/saerom/projects/patentworld/data-pipeline/29_green_innovation.py` (original)
**Supplement:** `/home/saerom/projects/patentworld/data-pipeline/57_green_supplement.py` (harmonized template)
**Page:** `/home/saerom/projects/patentworld/src/app/chapters/green-innovation/page.tsx`
**Start year:** 1976 | **Org start year:** 2000

**CPC Filter (SQL):**
```sql
(cpc_subclass LIKE 'Y02%' OR cpc_subclass LIKE 'Y04S%'
 OR cpc_group LIKE 'Y02%' OR cpc_group LIKE 'Y04S%')
```

**CPC Codes:**
| Code | Description |
|------|-------------|
| Y02 | Climate change mitigation technologies |
| Y04S | Smart grids |

**Sub-categories:**
- Y02E10: Renewable Energy
- Y02E60: Batteries & Storage
- Y02E (other): Other Energy
- Y02T: Transportation / EVs
- Y02C: Carbon Capture
- Y02P: Industrial Production
- Y02B: Buildings
- Y02W: Waste Management
- Y04S: Smart Grids

**Disclosure on page:** Yes. The DataNote fully discloses: "Green patents are identified using CPC classifications Y02 (climate change mitigation technologies) and Y04S (smart grids). Sub-categories are mapped from Y02 sub-codes: Y02E10 -> Renewable Energy, Y02E60 -> Batteries & Storage, Y02T -> Transportation/EVs, Y02C -> Carbon Capture, Y02P -> Industrial Production, Y02B -> Buildings, Y02W -> Waste Management, Y04S -> Smart Grids."

**Note:** Green Innovation is unique in using the Y section (cross-sectional tagging codes), which means these codes co-exist with primary CPC codes from other sections. By design, Y02/Y04S codes do NOT replace other classifications.

**Excluded CPC sections for diffusion:** Y

---

### 10. Quantum Computing

**Pipeline script:** `/home/saerom/projects/patentworld/data-pipeline/48_quantum_computing.py`
**Page:** `/home/saerom/projects/patentworld/src/app/chapters/quantum-computing/page.tsx`
**Start year:** 1990 | **Org start year:** 2005

**CPC Filter (SQL):**
```sql
(cpc_group LIKE 'G06N10%' OR cpc_group LIKE 'H01L39%')
```

**CPC Codes:**
| Code | Description |
|------|-------------|
| G06N10 | Quantum computing (computational models) |
| H01L39 | Superconducting devices (including Josephson-effect devices) |

**Subfields:**
- G06N10/20: Quantum Algorithms
- G06N10/40: Physical Realizations
- G06N10/60: Quantum Annealing
- G06N10/70: Error Correction
- G06N10/80: Quantum Programming
- G06N10 (other): Other Quantum Computing
- H01L39: Superconducting Devices

**Disclosure on page:** Partial. The DataNote states: "Quantum computing patents are identified using CPC classifications related to quantum computing hardware, algorithms, error correction, and related technologies." This is **vague** -- it does not list the specific CPC codes (G06N10, H01L39).

**Excluded CPC sections for diffusion:** G, Y

---

### 11. Semiconductors

**Pipeline script:** `/home/saerom/projects/patentworld/data-pipeline/47_semiconductors.py`
**Page:** `/home/saerom/projects/patentworld/src/app/chapters/semiconductors/page.tsx`
**Start year:** 1976 | **Org start year:** 1990

**CPC Filter (SQL):**
```sql
(cpc_subclass IN ('H01L', 'H10N', 'H10K'))
```

**CPC Codes:**
| Code | Description |
|------|-------------|
| H01L | Semiconductor devices; Electric solid-state devices not otherwise provided for |
| H10N | Other solid-state devices (restructured from former H01L groups) |
| H10K | Organic electric solid-state devices |

**Subfields:**
- H01L21: Manufacturing Processes
- H01L23: Packaging & Interconnects
- H01L25: Assemblies & Modules
- H01L27: Integrated Circuits
- H01L29: Semiconductor Devices
- H01L31: Photovoltaic Cells
- H01L33: LEDs & Optoelectronics
- H10K: Organic Semiconductors
- H10N: Other Solid-State Devices

**Disclosure on page:** Yes. The DataNote states: "Semiconductor patents are identified using CPC classification H01L, which covers semiconductor devices, processes, and related solid-state technology including integrated circuits, LEDs, photovoltaic cells, and thermoelectric devices."

**Note:** The DataNote only mentions H01L but the pipeline also includes H10N and H10K (which were restructured out of H01L). This is a minor **disclosure omission** -- H10N and H10K are not mentioned in the DataNote.

**Excluded CPC sections for diffusion:** H, Y

---

### 12. Space Technology

**Pipeline script:** `/home/saerom/projects/patentworld/data-pipeline/51_space_technology.py`
**Page:** `/home/saerom/projects/patentworld/src/app/chapters/space-technology/page.tsx`
**Start year:** 1976 | **Org start year:** 2000

**CPC Filter (SQL):**
```sql
(cpc_subclass = 'B64G' OR cpc_group LIKE 'H04B7/185%')
```

**CPC Codes:**
| Code | Description |
|------|-------------|
| B64G | Cosmonautics; Vehicles or equipment therefor (spacecraft, satellites) |
| H04B7/185 | Space-based communication links (satellite communications) |

**Subfields:**
- B64G1/10: Satellite Design
- B64G1/22, B64G1/24, B64G1/40: Propulsion Systems
- B64G1/42, B64G1/44: Attitude Control & Life Support
- B64G1/64: Re-Entry Systems
- B64G1/66: Arrangements for Landing
- H04B7/185: Space Communications
- B64G (other): Other Spacecraft

**Disclosure on page:** Yes. The DataNote states: "Space patents are identified using CPC classifications related to spacecraft and satellite technology, including B64G (cosmonautics and vehicles or equipment therefor), H04B7/185 (space-based communication links), and related codes."

**Excluded CPC sections for diffusion:** B, H, Y

---

## Overlap Matrix

The following matrix identifies CPC code overlaps where a single patent could be counted in multiple domains. "Yes" means a patent with the overlapping code would appear in BOTH domains.

|  | 3D Print | AgTech | AI | AV | Biotech | Blockchain | Cyber | DigiHealth | Green | Quantum | Semi | Space |
|--|----------|--------|----|----|---------|------------|-------|------------|-------|---------|------|-------|
| **3D Print** | - | | | | | | | | | | | |
| **AgTech** | | - | | | | | | | | | | |
| **AI** | | | - | **YES** | | | | | | **YES** | | |
| **AV** | | | **YES** | - | | | | | | | | |
| **Biotech** | | | | | - | | | | | | | |
| **Blockchain** | | | | | | - | **YES** | | | | | |
| **Cyber** | | | | | | **YES** | - | | | | | |
| **DigiHealth** | | | | | | | | - | | | | |
| **Green** | | | | | | | | | - | | | |
| **Quantum** | | | **YES** | | | | | | | - | **YES** | |
| **Semi** | | | | | | | | | | **YES** | - | |
| **Space** | | | | | | | | | | | | - |

### Overlap Details

#### 1. AI <-> Quantum Computing (G06N10)
- **Overlap code:** G06N10 (Quantum Computing within computational models)
- **AI filter:** `cpc_group LIKE 'G06N%'` captures ALL of G06N, including G06N10
- **Quantum filter:** `cpc_group LIKE 'G06N10%'` specifically targets G06N10
- **Impact:** Every quantum computing patent classified under G06N10 is ALSO counted as an AI patent. The AI subfield breakdown even labels G06N10 as "Quantum Computing" within the AI chapter.
- **Disclosed?** Not explicitly. The AI chapter's subfield chart shows "Quantum Computing" as a subfield of AI, which implicitly acknowledges the overlap, but no text states that these patents are also counted in the Quantum Computing chapter.

#### 2. AI <-> Autonomous Vehicles (G06V20/56)
- **Overlap code:** G06V20/56 (Scene understanding for driving)
- **AI filter:** `cpc_subclass = 'G06V'` captures ALL of G06V, including G06V20/56
- **AV filter:** `cpc_group LIKE 'G06V20/56%'` specifically targets G06V20/56
- **Impact:** Every AV patent classified under G06V20/56 is ALSO counted as an AI patent. However, an AV patent classified only under B60W60 or G05D1 would NOT appear in AI.
- **Disclosed?** Not explicitly. The AV chapter mentions the "convergence of AI" in narrative but does not state that some AV patents are simultaneously counted in the AI domain.

#### 3. Blockchain <-> Cybersecurity (H04L9/0643)
- **Overlap code:** H04L9/0643 (Distributed ledger within cryptographic mechanisms)
- **Cybersecurity filter:** `cpc_group LIKE 'H04L9%'` captures ALL of H04L9, including H04L9/0643
- **Blockchain filter:** `cpc_group LIKE 'H04L9/0643%'` specifically targets H04L9/0643
- **Impact:** Every blockchain patent classified under H04L9/0643 is ALSO counted as a Cybersecurity patent (under the "Cryptography" subfield). This is a **complete subset overlap** -- all DLT-type blockchain patents appear in both domains.
- **Disclosed?** Not explicitly. Neither chapter mentions that blockchain patents overlap with cybersecurity counts.

#### 4. Quantum Computing <-> Semiconductors (H01L39)
- **Overlap code:** H01L39 (Superconducting devices)
- **Semiconductor filter:** `cpc_subclass IN ('H01L', 'H10N', 'H10K')` captures ALL of H01L, including H01L39
- **Quantum filter:** `cpc_group LIKE 'H01L39%'` specifically targets H01L39
- **Impact:** Every quantum computing patent classified under H01L39 (superconducting devices) is ALSO counted as a Semiconductor patent. The Quantum chapter explicitly notes this relationship (with a chart showing semiconductor dependence of quantum entrants).
- **Disclosed?** Partially. The Quantum chapter includes a "Quantum-Semiconductor Dependence" analysis, but it does not explicitly state that H01L39 patents are double-counted across both domains.

---

## Disclosure Assessment

### Disclosure Quality Rating

| Domain | CPC Codes in DataNote? | Specific Codes Listed? | Overlaps Mentioned? | Rating |
|--------|----------------------|----------------------|-------------------|--------|
| 3D Printing | Yes | Yes (B33Y, B29C64, B22F10) | N/A | Good |
| Agricultural Technology | Yes but with error | Partially (mentions A01N which is not used) | N/A | Fair - has discrepancy |
| Artificial Intelligence | Yes | Yes (G06N, G06F18, G06V, G10L15, G06F40) | No | Good |
| Autonomous Vehicles | Yes but with errors | Wrong codes listed (G08G not used; G06V20/56 not mentioned; B60W vs B60W60) | No | Poor - significant discrepancies |
| Biotechnology | Yes but overstated | Broader codes listed than actually used (C12N vs C12N15) | N/A | Fair - implies broader scope |
| Blockchain | Yes | No specific codes listed | No | Fair - vague |
| Cybersecurity | Yes | Yes (H04L9, G06F21, H04L63) | No | Good |
| Digital Health | Yes but with errors | Mentions A61B6, A61B8 which are not in pipeline | N/A | Fair - has discrepancy |
| Green Innovation | Yes | Yes - full sub-code mapping provided | N/A | Excellent |
| Quantum Computing | Yes | No specific codes listed | No | Poor - vague |
| Semiconductors | Partial | Only mentions H01L (omits H10N, H10K) | No | Fair - omits codes |
| Space Technology | Yes | Yes (B64G, H04B7/185) | N/A | Good |

---

## Issues Found

### Critical Issues

1. **Autonomous Vehicles DataNote discloses wrong CPC codes.** The DataNote lists B60W (broad), G05D1, and G08G (traffic control), but the pipeline actually uses B60W60 (specific), G05D1, and G06V20/56 (scene understanding). G08G is not used at all; G06V20/56 is used but not disclosed.

2. **Undisclosed cross-domain overlaps.** Four overlap pairs exist where patents are counted in multiple domains, and none are explicitly disclosed to readers:
   - AI + Quantum Computing (G06N10 subset)
   - AI + Autonomous Vehicles (G06V20/56 subset)
   - Cybersecurity + Blockchain (H04L9/0643 subset)
   - Semiconductors + Quantum Computing (H01L39 subset)

### Moderate Issues

3. **Agricultural Technology DataNote mentions A01N but pipeline does not include it.** The page says "plant breeding and biocides (A01H, A01N)" but only A01H is in the filter.

4. **Biotechnology DataNote implies broader scope than pipeline.** The DataNote says "C12N" and "C12Q" but the pipeline only uses C12N15, C12N9, and C12Q1/68.

5. **Digital Health DataNote mentions A61B6 and A61B8 but pipeline does not include them.** These are diagnostic imaging codes that would add substantial patent volume if included.

6. **Semiconductors DataNote omits H10N and H10K.** These codes (organic semiconductors and other solid-state devices) were restructured out of H01L and are included in the pipeline but not disclosed.

7. **Quantum Computing DataNote is vague.** It does not list the specific CPC codes (G06N10, H01L39), making reproducibility difficult.

8. **AI pipeline docstring mentions G06T but G06T is not in the actual filter.** The docstring at the top of `12_chapter11_ai_patents.py` lists G06T (image data processing / generative image models) as a "Key CPC class for AI" but the actual AI_CLASSES_SQL does not include it. This could confuse anyone reading the pipeline code.

### Minor Issues

9. **No cross-domain overlap disclosure anywhere on the site.** The deep-dive-overview page or methodology page should ideally state that domains can overlap and a single patent may appear in multiple domains.

10. **Blockchain definition is very narrow.** Only two specific CPC group codes are used (H04L9/0643 and G06Q20/0655), which may miss blockchain-related patents classified under other codes (e.g., G06F16/27 for distributed databases, G06Q2220/00 for DeFi).

---

## Completeness Assessment

### Potentially Missing CPC Codes by Domain

| Domain | Potentially Missing Codes | Rationale |
|--------|--------------------------|-----------|
| AI | G06T (image data processing, mentioned in docstring but not used) | Could capture generative image models |
| Agricultural Technology | A01D (harvesting), A01N (biocides, mentioned in DataNote but not used), A01K (animal husbandry) | Standard agtech codes |
| Autonomous Vehicles | G08G (traffic control, mentioned in DataNote but not used), B60R (vehicle safety) | Safety systems are core to ADAS |
| Blockchain | G06F16/27 (distributed databases), H04L67/1097 (P2P), G06Q2220 (DeFi) | Very narrow definition |
| Digital Health | A61B6, A61B8 (mentioned in DataNote but not used), G06T7 (medical image analysis) | Diagnostic imaging is core to digital health |
| Green Innovation | Definition is comprehensive using Y02/Y04S tagging system | N/A |
| Semiconductors | Definition is comprehensive (H01L + H10N + H10K) | N/A |
| Space Technology | B64D (space launch equipment), H01Q3/26 (satellite antennas) | Launch systems are relevant |

---

## File Reference

| File | Purpose |
|------|---------|
| `/home/saerom/projects/patentworld/data-pipeline/domain_utils.py` | Shared pipeline framework for all domain scripts |
| `/home/saerom/projects/patentworld/data-pipeline/12_chapter11_ai_patents.py` | AI patents main pipeline |
| `/home/saerom/projects/patentworld/data-pipeline/23_chapter11_ai_deep.py` | AI deep analysis (strategies + GPT diffusion) |
| `/home/saerom/projects/patentworld/data-pipeline/29_green_innovation.py` | Green innovation original pipeline |
| `/home/saerom/projects/patentworld/data-pipeline/47_semiconductors.py` | Semiconductors pipeline |
| `/home/saerom/projects/patentworld/data-pipeline/48_quantum_computing.py` | Quantum computing pipeline |
| `/home/saerom/projects/patentworld/data-pipeline/49_biotechnology.py` | Biotechnology pipeline |
| `/home/saerom/projects/patentworld/data-pipeline/50_autonomous_vehicles.py` | Autonomous vehicles pipeline |
| `/home/saerom/projects/patentworld/data-pipeline/51_space_technology.py` | Space technology pipeline |
| `/home/saerom/projects/patentworld/data-pipeline/52_cybersecurity.py` | Cybersecurity pipeline |
| `/home/saerom/projects/patentworld/data-pipeline/53_agricultural_technology.py` | Agricultural technology pipeline |
| `/home/saerom/projects/patentworld/data-pipeline/54_digital_health.py` | Digital health pipeline |
| `/home/saerom/projects/patentworld/data-pipeline/55_3d_printing.py` | 3D printing pipeline |
| `/home/saerom/projects/patentworld/data-pipeline/56_blockchain.py` | Blockchain pipeline |
| `/home/saerom/projects/patentworld/data-pipeline/57_green_supplement.py` | Green innovation harmonized supplement |
| `/home/saerom/projects/patentworld/src/app/chapters/ai-patents/page.tsx` | AI chapter page |
| `/home/saerom/projects/patentworld/src/app/chapters/green-innovation/page.tsx` | Green innovation chapter page |
| `/home/saerom/projects/patentworld/src/app/chapters/semiconductors/page.tsx` | Semiconductors chapter page |
| `/home/saerom/projects/patentworld/src/app/chapters/quantum-computing/page.tsx` | Quantum computing chapter page |
| `/home/saerom/projects/patentworld/src/app/chapters/biotechnology/page.tsx` | Biotechnology chapter page |
| `/home/saerom/projects/patentworld/src/app/chapters/autonomous-vehicles/page.tsx` | Autonomous vehicles chapter page |
| `/home/saerom/projects/patentworld/src/app/chapters/cybersecurity/page.tsx` | Cybersecurity chapter page |
| `/home/saerom/projects/patentworld/src/app/chapters/digital-health/page.tsx` | Digital health chapter page |
| `/home/saerom/projects/patentworld/src/app/chapters/3d-printing/page.tsx` | 3D printing chapter page |
| `/home/saerom/projects/patentworld/src/app/chapters/blockchain/page.tsx` | Blockchain chapter page |
| `/home/saerom/projects/patentworld/src/app/chapters/space-technology/page.tsx` | Space technology chapter page |
| `/home/saerom/projects/patentworld/src/app/chapters/agricultural-technology/page.tsx` | Agricultural technology chapter page |
