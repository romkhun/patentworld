# PatentsView Data Deepening Log

## Phase 0: Setup and Data Acquisition

### 0a. Environment and Pipeline Discovery

- **Data preprocessing pipeline:** Python scripts with Polars (user preference)
- **Raw PatentsView tables:** `/media/saerom/saerom-ssd/Dropbox (Penn)/Research/PatentsView/`
- **Processed JSON data:** `/home/saerom/projects/patentworld/public/data/`
- **Framework:** Next.js 14 with static export, client-side JSON loading via `useChapterData` hook

### 0b. Table Availability

| Table | Available | Size (compressed) | Notes |
|-------|-----------|-------------------|-------|
| g_application | YES | 68M | |
| g_us_rel_doc | YES | 260M | |
| g_us_term_of_grant | YES | 34M | |
| g_other_reference | YES | 4.1G | Largest table |
| g_foreign_citation | YES | 696M | |
| g_claims_YYYY | **NO** | — | Not downloaded |
| g_figures | YES | 51M | |
| g_detail_desc_text_YYYY | **NO** | — | Not downloaded |
| g_brf_sum_text_YYYY | **NO** | — | Not downloaded |
| g_examiner_not_disambiguated | YES | 188M | |
| g_attorney_disambiguated | YES | 63M | |
| g_foreign_priority | YES | 68M | |
| g_pct_data | YES | 38M | |
| g_wipo_technology | YES | 51M | |
| g_ipc_at_issue | YES | 373M | |
| g_cpc_at_issue | YES | 320M | |
| pg_published_application | **NO** | — | Pre-grant, not downloaded |
| pg_granted_pgpubs_crosswalk | **NO** | — | Pre-grant, not downloaded |
| pg_inventor_disambiguated | **NO** | — | Pre-grant, not downloaded |
| pg_gov_interest_org (pre-grant) | **NO** | — | Pre-grant, not downloaded |

### 0c. Feasibility Assessment

| Analysis | Phase | Status | Reason |
|----------|-------|--------|--------|
| 1: Application-Year vs Grant-Year | 1 | FEASIBLE | g_application available |
| 2: Continuation/Division Chains | 2 | FEASIBLE | g_us_rel_doc available |
| 3: Pre-Grant Publication | 8 | **INFEASIBLE** | pg_published_application not available |
| 4: Independent vs. Dependent Claims | 4 | **INFEASIBLE** | g_claims_YYYY not available |
| 5: NPL Citations | 3 | FEASIBLE | g_other_reference available |
| 6: Foreign Citation Share | 3 | FEASIBLE | g_foreign_citation available |
| 7: Specification Length | 4 | **INFEASIBLE** | g_detail_desc_text_YYYY not available |
| 8: Drawing Complexity | 4 | FEASIBLE | g_figures available |
| 9: CPC at Issue vs Current | 5 | FEASIBLE | g_cpc_at_issue available |
| 10: WIPO Technology Fields | 5 | FEASIBLE | g_wipo_technology available |
| 11: IPC Convergence | 5 | FEASIBLE | g_ipc_at_issue available |
| 12: Brief Summary NMF | 4 | **INFEASIBLE** | g_brf_sum_text_YYYY not available |
| 13: Examiner Art Groups (Alice) | 7 | FEASIBLE | g_examiner available |
| 14: Terminal Disclaimers | 2 | FEASIBLE | g_us_term_of_grant available |
| 15: Patent Term Adjustment | 2 | FEASIBLE | g_us_term_of_grant available |
| 16: Gov Contract Concentration | 8 | FEASIBLE | g_gov_interest_contracts available |
| 17: Gov Interest Grant Rates | 8 | **INFEASIBLE** | pg_gov_interest_org not available |
| 18: Filing Route (PCT/Direct) | 6 | FEASIBLE | g_foreign_priority + g_pct_data available |
| 19: Law Firm Concentration | 7 | FEASIBLE | g_attorney_disambiguated available |
| 20: Continuation by Firm | 2 | FEASIBLE | g_us_rel_doc available |
| 21: NPL by Firm | 3 | FEASIBLE | g_other_reference available |
| 22: Foreign Citation by Firm | 3 | FEASIBLE | g_foreign_citation available |
| 23: WIPO Portfolio Scope | 5 | FEASIBLE | g_wipo_technology available |
| 24: Examiner-Inventor Overlap | 7 | FEASIBLE | g_examiner available |
| 25: Multi-Institution Inventors | 9 | FEASIBLE | existing tables |
| 26: NPL by Inventor Type | 3 | FEASIBLE | g_other_reference available |
| 27: Application-to-Grant Funnel | 8 | **INFEASIBLE** | pg_inventor_disambiguated not available |
| 28: Gender by Filing Route | 6 | FEASIBLE | g_foreign_priority + g_pct_data available |
| 29: Cross-Institutional Collab | 9 | FEASIBLE | existing tables |
| 30: County-Level Geography | 9 | FEASIBLE | g_location_disambiguated available |
| 31: Inventor Geoclustering | 9 | FEASIBLE | g_location_disambiguated available |
| 32: Priority Country | 6 | FEASIBLE | g_foreign_priority available |
| 33: PCT by Country | 6 | FEASIBLE | g_pct_data available |
| 34: Examiner vs. Applicant Citations | 3 | TBD | Need to check citation_category field |
| 35: Inventor International Mobility | 6 | FEASIBLE | existing tables |
| 36: Cross-Border Citation Localization | 3 | FEASIBLE | existing tables |
| 37: NPL by ACT 6 Domain | 3 | FEASIBLE | g_other_reference available |
| 38: Continuation by ACT 6 Domain | 2 | FEASIBLE | g_us_rel_doc available |
| 39: App-Year for ACT 6 Domains | 1 | FEASIBLE | g_application available |

**Summary: 33 FEASIBLE, 6 INFEASIBLE**

---

## Phase 1: Application-Year Foundation

(Processing...)
