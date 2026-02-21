"""
Batch 3 - Act 2 (The Organizations) Data Accuracy Audit
Chapters 8-12: org-composition, org-patent-count, org-patent-quality, org-patent-portfolio, org-company-profiles
"""

import json
import os
from pathlib import Path

BASE = Path("/home/saerom/projects/patentworld/public/data")

def load(path: str):
    full = BASE / path
    if not full.exists():
        return None
    with open(full) as f:
        return json.load(f)

findings = []

def check(chapter: str, claim: str, expected, actual, match: bool, note: str = ""):
    status = "PASS" if match else "FAIL"
    findings.append({
        "chapter": chapter,
        "claim": claim,
        "expected": expected,
        "actual": actual,
        "status": status,
        "note": note,
    })
    print(f"  [{status}] {claim}")
    if not match:
        print(f"         Expected: {expected}")
        print(f"         Actual:   {actual}")
        if note:
            print(f"         Note:     {note}")

# ============================================================================
# CHAPTER 8: org-composition
# ============================================================================
print("\n" + "="*80)
print("CHAPTER 8: Assignee Composition")
print("="*80)

# ── Claim 1: "Corporate assignees grew from 94% to 99%" ──
types = load("chapter3/assignee_types_per_year.json")
if types:
    # 1976 corporate share
    y1976 = [r for r in types if r["year"] == 1976]
    total_1976 = sum(r["count"] for r in y1976)
    corp_1976 = next((r["count"] for r in y1976 if r["category"] == "Corporate"), 0)
    pct_1976 = round(corp_1976 / total_1976 * 100, 1)
    check("Ch8", "Corporate share in 1976 ~94%", "~94%", f"{pct_1976}%",
          93.0 <= pct_1976 <= 95.0)

    # 2024 corporate share
    y2024 = [r for r in types if r["year"] == 2024]
    total_2024 = sum(r["count"] for r in y2024)
    corp_2024 = next((r["count"] for r in y2024 if r["category"] == "Corporate"), 0)
    pct_2024 = round(corp_2024 / total_2024 * 100, 1)
    check("Ch8", "Corporate share in 2024 ~99%", "~99%", f"{pct_2024}%",
          98.5 <= pct_2024 <= 99.5)

# ── Claim 2: "Foreign assignees surpassed US-based around 2007" ──
dvf = load("chapter3/domestic_vs_foreign.json")
if dvf:
    crossover_year = None
    for year in range(1976, 2025):
        yd = [r for r in dvf if r["year"] == year]
        us = next((r["count"] for r in yd if r["origin"] == "US"), 0)
        foreign = next((r["count"] for r in yd if r["origin"] == "Foreign"), 0)
        if foreign > us and crossover_year is None:
            crossover_year = year
    check("Ch8", "Foreign surpassed US around 2007", "~2007", str(crossover_year),
          crossover_year is not None and abs(crossover_year - 2007) <= 1)

    # 2024 foreign share
    y2024_dvf = [r for r in dvf if r["year"] == 2024]
    total_2024_dvf = sum(r["count"] for r in y2024_dvf if r["origin"] in ("US", "Foreign"))
    foreign_2024 = next((r["count"] for r in y2024_dvf if r["origin"] == "Foreign"), 0)
    pct_foreign_2024 = round(foreign_2024 / total_2024_dvf * 100, 1)
    check("Ch8", "Foreign share in 2024 = 54.5% (chart title)", "54.5%", f"{pct_foreign_2024}%",
          abs(pct_foreign_2024 - 54.5) < 0.5)

    # Average foreign share in 2020s
    twenties = [r for r in dvf if 2020 <= r["year"] <= 2024]
    us_20s = sum(r["count"] for r in twenties if r["origin"] == "US")
    foreign_20s = sum(r["count"] for r in twenties if r["origin"] == "Foreign")
    avg_foreign_20s = round(foreign_20s / (us_20s + foreign_20s) * 100, 1)
    check("Ch8", "Foreign averaging 53% in the 2020s", "~53%", f"{avg_foreign_20s}%",
          52.0 <= avg_foreign_20s <= 55.0)

# ── Claim 3: Japan accounts for 1.4 million US patents ──
non_us = load("chapter3/non_us_by_section.json")
if non_us:
    japan_total = sum(r["count"] for r in non_us if r["country"] == "Japan")
    check("Ch8", "Japan accounts for 1.4 million US patents", "~1,400,000",
          f"{japan_total:,}",
          1_350_000 <= japan_total <= 1_500_000)

    # South Korea 359K
    sk_total = sum(r["count"] for r in non_us if r["country"] == "South Korea")
    check("Ch8", "South Korea 359K patents", "~359,000", f"{sk_total:,}",
          350_000 <= sk_total <= 370_000)

    # China 222K
    china_total = sum(r["count"] for r in non_us if r["country"] == "China")
    check("Ch8", "China 222K patents", "~222,000", f"{china_total:,}",
          215_000 <= china_total <= 230_000)

# ── Claim 4: PCT route 0% to 22.2% ──
filing_route = load("chapter8/filing_route_over_time.json")
if filing_route:
    y2024_fr = next((r for r in filing_route if r["year"] == 2024), None)
    if y2024_fr:
        pct_2024_pct = y2024_fr.get("pct_share_pct", None)
        check("Ch8", "PCT route 22.2% in 2024", "22.2%", f"{pct_2024_pct}%",
              pct_2024_pct is not None and abs(pct_2024_pct - 22.2) < 0.5)

# ── Claim 5: CR4 peaked at 13.2% in 1985, fell to 5.8% in 2024 ──
law_conc = load("chapter8/law_firm_concentration.json")
if law_conc:
    y1985_lc = next((r for r in law_conc if r["year"] == 1985), None)
    y2024_lc = next((r for r in law_conc if r["year"] == 2024), None)
    if y1985_lc:
        check("Ch8", "CR4 peak 13.2% in 1985", "13.2%", f"{y1985_lc.get('cr4_pct', 'N/A')}%",
              y1985_lc.get("cr4_pct") is not None and abs(y1985_lc["cr4_pct"] - 13.2) < 0.2)
    if y2024_lc:
        check("Ch8", "CR4 = 5.8% in 2024", "5.8%", f"{y2024_lc.get('cr4_pct', 'N/A')}%",
              y2024_lc.get("cr4_pct") is not None and abs(y2024_lc["cr4_pct"] - 5.8) < 0.2)
    # CR10 from 22.6% to 11.9%
    if y1985_lc:
        cr10_peak = max(law_conc, key=lambda r: r.get("cr10_pct", 0))
        check("Ch8", "CR10 peaked at ~22.6%", "22.6%", f"{cr10_peak.get('cr10_pct', 'N/A')}% in {cr10_peak.get('year', '?')}",
              cr10_peak.get("cr10_pct") is not None and abs(cr10_peak["cr10_pct"] - 22.6) < 1.0)
    if y2024_lc:
        check("Ch8", "CR10 = 11.9% in 2024", "11.9%", f"{y2024_lc.get('cr10_pct', 'N/A')}%",
              y2024_lc.get("cr10_pct") is not None and abs(y2024_lc["cr10_pct"] - 11.9) < 0.5)

# ── Claim 6: Sughrue Mion leads with 90,279 patents ──
top_lf = load("chapter8/top_law_firms.json")
if top_lf:
    top1 = top_lf[0] if top_lf else None
    check("Ch8", "Sughrue Mion leads law firms", "Sughrue Mion",
          top1.get("firm", "") if top1 else "N/A",
          top1 is not None and "Sughrue" in top1.get("firm", ""))
    check("Ch8", "Sughrue Mion has 90,279 patents", "90,279",
          str(top1.get("total_patents", "N/A")) if top1 else "N/A",
          top1 is not None and top1.get("total_patents") == 90279)

    # Fish & Richardson 75,528
    fish = next((r for r in top_lf if "Fish" in r.get("firm", "")), None)
    check("Ch8", "Fish & Richardson 75,528 patents", "75,528",
          str(fish.get("total_patents", "N/A")) if fish else "N/A",
          fish is not None and fish.get("total_patents") == 75528)

    # Birch Stewart 71,132
    birch = next((r for r in top_lf if "Birch" in r.get("firm", "")), None)
    check("Ch8", "Birch Stewart 71,132 patents", "71,132",
          str(birch.get("total_patents", "N/A")) if birch else "N/A",
          birch is not None and birch.get("total_patents") == 71132)

# ── Claim 7: Individual inventors under 2% ──
if types:
    # Check recent years
    for yr in [2020, 2021, 2022, 2023, 2024]:
        yr_data = [r for r in types if r["year"] == yr]
        total = sum(r["count"] for r in yr_data)
        indiv = next((r["count"] for r in yr_data if r["category"] == "Individual"), 0)
        pct = round(indiv / total * 100, 2)
        check("Ch8", f"Individual inventors under 2% in {yr}", "<2%", f"{pct}%", pct < 2.0)

# ── Claim 8: Government ~4% in late 1970s ──
if types:
    y1976_govt = next((r["count"] for r in types if r["year"] == 1976 and r["category"] == "Government"), 0)
    pct_govt_1976 = round(y1976_govt / total_1976 * 100, 1)
    check("Ch8", "Government ~4% in late 1970s", "~4%", f"{pct_govt_1976}%",
          3.0 <= pct_govt_1976 <= 5.0)

# ── Claim 9: Over 60% domestic in late 1970s ──
if dvf:
    y1976_dvf = [r for r in dvf if r["year"] == 1976]
    us_1976 = next((r["count"] for r in y1976_dvf if r["origin"] == "US"), 0)
    foreign_1976 = next((r["count"] for r in y1976_dvf if r["origin"] == "Foreign"), 0)
    pct_us_1976 = round(us_1976 / (us_1976 + foreign_1976) * 100, 1)
    check("Ch8", "Over 60% domestic in late 1970s", ">60%", f"{pct_us_1976}%",
          pct_us_1976 > 60)

# ── Claim 10: ConcentrationPanel top1=15.2, top5=28.4, gini=0.891 ──
print("\n  [INFO] ConcentrationPanel (top1=15.2, top5=28.4, gini=0.891) - these are hardcoded props, need to verify against data")

# ── Claim 11: Domestic share 69% to 53% ──
if filing_route:
    y1980_fr = next((r for r in filing_route if r["year"] == 1980), None)
    y2024_fr = next((r for r in filing_route if r["year"] == 2024), None)
    if y1980_fr:
        check("Ch8", "Domestic share ~69% in early period", "~69%",
              f"{y1980_fr.get('domestic_share_pct', 'N/A')}%",
              y1980_fr.get("domestic_share_pct") is not None and abs(y1980_fr["domestic_share_pct"] - 69) < 5)
    if y2024_fr:
        check("Ch8", "Domestic share ~53% in 2024", "~53%",
              f"{y2024_fr.get('domestic_share_pct', 'N/A')}%",
              y2024_fr.get("domestic_share_pct") is not None and abs(y2024_fr["domestic_share_pct"] - 53) < 3)

# ============================================================================
# CHAPTER 9: org-patent-count
# ============================================================================
print("\n" + "="*80)
print("CHAPTER 9: Organizational Patent Count")
print("="*80)

top_assignees = load("chapter3/top_assignees.json")
if top_assignees:
    ibm = top_assignees[0]
    samsung = top_assignees[1]

    # ── Claim 1: IBM leads with 161,888 ──
    check("Ch9", "IBM leads with 161,888 cumulative grants",
          "161,888", str(ibm["total_patents"]),
          ibm["total_patents"] == 161888 and "IBM" in ibm["organization"])

    # ── Claim 2: Samsung trails by fewer than 4,000 ──
    gap = ibm["total_patents"] - samsung["total_patents"]
    check("Ch9", "Samsung trails by fewer than 4,000 patents",
          "<4,000", str(gap),
          gap < 4000 and "SAMSUNG" in samsung["organization"])

    # ── Claim 3: CRITICAL superlative - IBM actually leads ALL assignees ──
    max_org = max(top_assignees, key=lambda r: r["total_patents"])
    check("Ch9", "SUPERLATIVE: IBM has the most patents of ALL assignees",
          "IBM", f"{max_org['organization']} ({max_org['total_patents']:,})",
          "IBM" in max_org["organization"])

# ── Claim 4: Samsung peaked at 9,716 annual grants in 2024 ──
orgs_time = load("chapter3/top_orgs_over_time.json")
if orgs_time:
    samsung_time = [r for r in orgs_time if "SAMSUNG" in r.get("organization", "")]
    if samsung_time:
        samsung_2024 = next((r for r in samsung_time if r["year"] == 2024), None)
        samsung_peak = max(samsung_time, key=lambda r: r["count"])
        check("Ch9", "Samsung peaked at 9,716 annual grants in 2024",
              "9,716 in 2024",
              f"{samsung_peak['count']:,} in {samsung_peak['year']}",
              samsung_peak["count"] == 9716 and samsung_peak["year"] == 2024)

    # IBM peaked at 9,257 in 2019
    ibm_time = [r for r in orgs_time if "International Business Machines" in r.get("organization", "")]
    if ibm_time:
        ibm_peak = max(ibm_time, key=lambda r: r["count"])
        check("Ch9", "IBM peaked at 9,257 in 2019",
              "9,257 in 2019",
              f"{ibm_peak['count']:,} in {ibm_peak['year']}",
              ibm_peak["count"] == 9257 and ibm_peak["year"] == 2019)

    # Samsung surpassed IBM in 2007
    for year in range(2000, 2025):
        s_count = next((r["count"] for r in samsung_time if r["year"] == year), 0)
        i_count = next((r["count"] for r in ibm_time if r["year"] == year), 0)
        if s_count > i_count:
            check("Ch9", "Samsung surpassed IBM in annual grants in 2007",
                  "2007", str(year),
                  abs(year - 2007) <= 1)
            break

# ── Claim 5: Top 100 hold 32-39% of corporate patents ──
conc = load("chapter3/concentration.json")
if conc:
    top100_shares = [r["top100_share"] for r in conc if "top100_share" in r]
    min_share = min(top100_shares)
    max_share = max(top100_shares)
    check("Ch9", "Top 100 hold 32-39% of corporate patents",
          "32-39%", f"{min_share:.1f}%-{max_share:.1f}%",
          31 <= min_share and max_share <= 40)

# ── Claim 6: Design patents - Samsung (13,094), Nike (9,189), LG (6,720) ──
design = load("company/design_patents.json")
if design and "top_filers" in design:
    tf = design["top_filers"]
    samsung_design = next((r for r in tf if "Samsung" in r.get("company", "")), None)
    nike_design = next((r for r in tf if "Nike" in r.get("company", "")), None)
    lg_design = next((r for r in tf if "LG" in r.get("company", "")), None)

    check("Ch9", "Samsung leads design patents with 13,094",
          "13,094", str(samsung_design.get("design_patents", "N/A")) if samsung_design else "NOT FOUND",
          samsung_design is not None and samsung_design.get("design_patents") == 13094)
    check("Ch9", "Nike has 9,189 design patents",
          "9,189", str(nike_design.get("design_patents", "N/A")) if nike_design else "NOT FOUND",
          nike_design is not None and nike_design.get("design_patents") == 9189)
    check("Ch9", "LG has 6,720 design patents",
          "6,720", str(lg_design.get("design_patents", "N/A")) if lg_design else "NOT FOUND",
          lg_design is not None and lg_design.get("design_patents") == 6720)

# ── Claim 7: Only 9 of 50 top filers survived all five decades ──
mortality = load("company/corporate_mortality.json")
if mortality:
    continuous = mortality.get("continuous_companies", [])
    n_continuous = len(continuous)
    check("Ch9", "Only 9 of 50 survived all five decades",
          "9", str(n_continuous),
          n_continuous == 9)
    pct_survival = round(n_continuous / 50 * 100, 0)
    check("Ch9", "18% cumulative survival rate",
          "18%", f"{pct_survival}%",
          pct_survival == 18)

# ── Claim 8: Blockbuster Lorenz Gini 0.161 to -0.069 ──
lorenz = load("chapter2/blockbuster_lorenz.json")
if lorenz:
    first_decade = lorenz[0]
    last_decade = lorenz[-1]
    check("Ch9", "Gini 0.161 in 1976-1989",
          "0.161", f"{first_decade.get('gini', 'N/A')} ({first_decade.get('decade', '?')})",
          abs(first_decade.get("gini", 999) - 0.161) < 0.005)
    check("Ch9", "Gini -0.069 in 2010-2020",
          "-0.069", f"{last_decade.get('gini', 'N/A')} ({last_decade.get('decade', '?')})",
          abs(last_decade.get("gini", 999) - (-0.069)) < 0.005)

# ── Claim 9: Huawei continuation share 80.9% ──
cont_share = load("chapter9/continuation_share_by_firm.json")
if cont_share:
    huawei_cs = next((r for r in cont_share if "Huawei" in r.get("organization", "")), None)
    check("Ch9", "Huawei leads continuation share at 80.9%",
          "80.9%", f"{huawei_cs.get('continuation_share_pct', 'N/A')}%" if huawei_cs else "NOT FOUND",
          huawei_cs is not None and abs(huawei_cs.get("continuation_share_pct", 0) - 80.9) < 0.2)
    # Check it's actually the top
    if cont_share:
        top_cont = max(cont_share, key=lambda r: r.get("continuation_share_pct", 0))
        check("Ch9", "SUPERLATIVE: Huawei has highest continuation share",
              "Huawei", f"{top_cont.get('organization', 'N/A')} ({top_cont.get('continuation_share_pct', 'N/A')}%)",
              "Huawei" in top_cont.get("organization", ""))

# ============================================================================
# CHAPTER 10: org-patent-quality
# ============================================================================
print("\n" + "="*80)
print("CHAPTER 10: Organizational Patent Quality")
print("="*80)

# ── Claim 1: Amazon blockbuster rate 6.7% ──
scatter = load("company/firm_quality_scatter.json")
if scatter:
    amazon_sc = next((r for r in scatter if r.get("company") == "Amazon"), None)
    check("Ch10", "Amazon blockbuster rate = 6.7%",
          "6.7%", f"{amazon_sc.get('blockbuster_rate', 'N/A')}%" if amazon_sc else "NOT FOUND",
          amazon_sc is not None and abs(amazon_sc.get("blockbuster_rate", 0) - 6.7) < 0.2)

    # CRITICAL: Amazon leads ALL companies in blockbuster rate
    max_bb = max(scatter, key=lambda r: r.get("blockbuster_rate", 0))
    check("Ch10", "SUPERLATIVE: Amazon has highest blockbuster rate of ALL firms",
          "Amazon", f"{max_bb.get('company', 'N/A')} ({max_bb.get('blockbuster_rate', 'N/A')}%)",
          max_bb.get("company") == "Amazon")

    # 18 of 50 firms exceed 50% dud rate
    high_dud = [r for r in scatter if r.get("dud_rate", 0) > 50]
    check("Ch10", "18 of 50 firms exceed 50% dud rate",
          "18", str(len(high_dud)),
          len(high_dud) == 18)

    # Amazon dud rate 18.3%
    check("Ch10", "Amazon dud rate = 18.3%",
          "18.3%", f"{amazon_sc.get('dud_rate', 'N/A')}%" if amazon_sc else "NOT FOUND",
          amazon_sc is not None and abs(amazon_sc.get("dud_rate", 0) - 18.3) < 0.5)

# ── Claim 2: Microsoft leads avg citations at 30.7 ──
cit_impact = load("chapter3/firm_citation_impact.json")
if cit_impact:
    ms_entries = [r for r in cit_impact if "Microsoft" in r.get("organization", "")]
    # Microsoft Corporation (not the licensing entity)
    ms = next((r for r in cit_impact if r.get("organization") == "Microsoft Corporation"), None)
    check("Ch10", "Microsoft avg citations = 30.7",
          "30.7", f"{ms.get('avg_citations_received', 'N/A')}" if ms else "NOT FOUND",
          ms is not None and abs(ms.get("avg_citations_received", 0) - 30.7) < 0.5)

    # CRITICAL: Microsoft leads ALL companies in average citations
    max_cite = max(cit_impact, key=lambda r: r.get("avg_citations_received", 0))
    check("Ch10", "SUPERLATIVE: Microsoft leads in average citations of ALL firms in data",
          "Microsoft Corporation", f"{max_cite.get('organization', 'N/A')} ({max_cite.get('avg_citations_received', 'N/A')})",
          "Microsoft" in max_cite.get("organization", ""))

    # IBM 5.6x average-to-median ratio
    ibm_cit = next((r for r in cit_impact if "International Business Machines" in r.get("organization", "")), None)
    if ibm_cit:
        avg = ibm_cit.get("avg_citations_received", 0)
        med = ibm_cit.get("median_citations_received", 0)
        ratio = round(avg / med, 1) if med > 0 else None
        check("Ch10", "IBM 5.6x average-to-median ratio",
              "5.6x", f"{ratio}x",
              ratio is not None and abs(ratio - 5.6) < 0.3)

# ── Claim 3: Canon self-citation 47.6%, TSMC 38.4%, Micron 25.3% ──
self_cite = load("chapter9/self_citation_by_assignee.json")
if self_cite:
    canon_sc = next((r for r in self_cite if "Canon" in r.get("organization", "")), None)
    tsmc_sc = next((r for r in self_cite if "TAIWAN SEMICONDUCTOR" in r.get("organization", "")), None)
    micron_sc = next((r for r in self_cite if "Micron" in r.get("organization", "")), None)

    check("Ch10", "Canon self-citation rate = 47.6%",
          "47.6%", f"{canon_sc.get('self_cite_rate', 'N/A')}%" if canon_sc else "NOT FOUND",
          canon_sc is not None and abs(canon_sc.get("self_cite_rate", 0) - 47.6) < 0.5)
    check("Ch10", "TSMC self-citation rate = 38.4%",
          "38.4%", f"{tsmc_sc.get('self_cite_rate', 'N/A')}%" if tsmc_sc else "NOT FOUND",
          tsmc_sc is not None and abs(tsmc_sc.get("self_cite_rate", 0) - 38.4) < 0.5)
    check("Ch10", "Micron self-citation rate = 25.3%",
          "25.3%", f"{micron_sc.get('self_cite_rate', 'N/A')}%" if micron_sc else "NOT FOUND",
          micron_sc is not None and abs(micron_sc.get("self_cite_rate", 0) - 25.3) < 0.5)

    # Canon leads all self-citation
    max_sc = max(self_cite, key=lambda r: r.get("self_cite_rate", 0))
    check("Ch10", "SUPERLATIVE: Canon has highest self-citation rate",
          "Canon", f"{max_sc.get('organization', 'N/A')} ({max_sc.get('self_cite_rate', 'N/A')}%)",
          "Canon" in max_sc.get("organization", ""))

# ── Claim 4: Citation half-lives: Huawei 6.3, US Air Force 14.3 ──
half_life = load("company/citation_half_life.json")
if half_life:
    huawei_hl = next((r for r in half_life if "Huawei" in r.get("company", "")), None)
    usaf_hl = next((r for r in half_life if "Air Force" in r.get("company", "")), None)

    check("Ch10", "Huawei citation half-life = 6.3 years",
          "6.3", f"{huawei_hl.get('half_life_years', 'N/A')}" if huawei_hl else "NOT FOUND",
          huawei_hl is not None and abs(huawei_hl.get("half_life_years", 0) - 6.3) < 0.2)
    check("Ch10", "US Air Force citation half-life = 14.3 years",
          "14.3", f"{usaf_hl.get('half_life_years', 'N/A')}" if usaf_hl else "NOT FOUND",
          usaf_hl is not None and abs(usaf_hl.get("half_life_years", 0) - 14.3) < 0.2)

    # Check range claims
    min_hl = min(half_life, key=lambda r: r.get("half_life_years", 999))
    max_hl = max(half_life, key=lambda r: r.get("half_life_years", 0))
    check("Ch10", "SUPERLATIVE: Huawei has shortest half-life",
          "Huawei", f"{min_hl.get('company', 'N/A')} ({min_hl.get('half_life_years', 'N/A')} years)",
          "Huawei" in min_hl.get("company", ""))
    check("Ch10", "SUPERLATIVE: US Air Force has longest half-life",
          "US Air Force", f"{max_hl.get('company', 'N/A')} ({max_hl.get('half_life_years', 'N/A')} years)",
          "Air Force" in max_hl.get("company", ""))

# ── Claim 5: NPL - Apple leads at 35.9 ──
npl = load("chapter10/npl_by_firm.json")
if npl:
    apple_npl = next((r for r in npl if "Apple" in r.get("organization", "")), None)
    check("Ch10", "Apple leads NPL at 35.9 avg citations",
          "35.9", f"{apple_npl.get('avg_npl_citations', 'N/A')}" if apple_npl else "NOT FOUND",
          apple_npl is not None and abs(apple_npl.get("avg_npl_citations", 0) - 35.9) < 0.5)
    # Check superlative
    max_npl = max(npl, key=lambda r: r.get("avg_npl_citations", 0))
    check("Ch10", "SUPERLATIVE: Apple leads ALL firms in NPL citation intensity",
          "Apple", f"{max_npl.get('organization', 'N/A')} ({max_npl.get('avg_npl_citations', 'N/A')})",
          "Apple" in max_npl.get("organization", ""))

# ── Claim 6: Huawei foreign prior art 78.3%, IBM 11.4% ──
foreign_cite = load("chapter10/foreign_citation_by_firm.json")
if foreign_cite:
    huawei_fc = next((r for r in foreign_cite if "Huawei" in r.get("organization", "")), None)
    ibm_fc = next((r for r in foreign_cite if "International Business Machines" in r.get("organization", "")), None)

    check("Ch10", "Huawei foreign citation share = 78.3%",
          "78.3%", f"{huawei_fc.get('foreign_citation_share_pct', 'N/A')}%" if huawei_fc else "NOT FOUND",
          huawei_fc is not None and abs(huawei_fc.get("foreign_citation_share_pct", 0) - 78.3) < 0.5)
    check("Ch10", "IBM foreign citation share = 11.4%",
          "11.4%", f"{ibm_fc.get('foreign_citation_share_pct', 'N/A')}%" if ibm_fc else "NOT FOUND",
          ibm_fc is not None and abs(ibm_fc.get("foreign_citation_share_pct", 0) - 11.4) < 0.5)

    # Huawei leads foreign citation share
    max_fc = max(foreign_cite, key=lambda r: r.get("foreign_citation_share_pct", 0))
    check("Ch10", "SUPERLATIVE: Huawei has highest foreign citation share",
          "Huawei", f"{max_fc.get('organization', 'N/A')} ({max_fc.get('foreign_citation_share_pct', 'N/A')}%)",
          "Huawei" in max_fc.get("organization", ""))

# ── Claim 7: "35 of 48 top firms saw median forward citations fall to zero by 2019" (title) ──
firm_quality = load("company/firm_quality_distribution.json")
if firm_quality:
    count_zero_median = 0
    total_firms = 0
    for firm, years in firm_quality.items():
        total_firms += 1
        y2019 = next((y for y in years if y.get("year") == 2019), None)
        if y2019 and y2019.get("p50", None) is not None and y2019["p50"] == 0:
            count_zero_median += 1
    check("Ch10", "35 of 48 firms saw median citations fall to zero by 2019",
          "35 of 48", f"{count_zero_median} of {total_firms}",
          count_zero_median == 35 and total_firms == 48,
          note="'35 of 48' is in chart title for firm quality fan chart")

# ============================================================================
# CHAPTER 11: org-patent-portfolio
# ============================================================================
print("\n" + "="*80)
print("CHAPTER 11: Patent Portfolio")
print("="*80)

# ── Claim 1: 248 companies cluster into 8 industries ──
overlap = load("company/portfolio_overlap.json")
if overlap:
    n_companies = len(set(r.get("company", "") for r in overlap))
    n_industries = len(set(r.get("industry", "") for r in overlap))
    check("Ch11", "248 companies cluster", "248", str(n_companies),
          n_companies == 248)
    check("Ch11", "8 industry clusters", "8", str(n_industries),
          n_industries == 8)

# ── Claim 2: Mitsubishi Electric Shannon entropy 6.7 across 229 CPC subclasses ──
div = load("company/portfolio_diversification_b3.json")
if div:
    mitsubishi = [r for r in div if "Mitsubishi Electric" in r.get("company", "")]
    if mitsubishi:
        peak_me = max(mitsubishi, key=lambda r: r.get("shannon_entropy", 0))
        check("Ch11", "Mitsubishi Electric peak Shannon entropy = 6.7",
              "6.7", f"{peak_me.get('shannon_entropy', 'N/A')}",
              abs(peak_me.get("shannon_entropy", 0) - 6.7) < 0.15)
        # Check 229 CPC subclasses
        check("Ch11", "Mitsubishi Electric 229 CPC subclasses",
              "229", f"{peak_me.get('n_subclasses', 'N/A')}",
              peak_me.get("n_subclasses") == 229,
              note="Check if n_subclasses field exists")

# ── Claim 3: IBM 88,600 G-section patents (2001-2025) ──
corp_div = load("chapter7/corp_diversification.json")
if corp_div:
    ibm_g = [r for r in corp_div if "International Business Machines" in r.get("organization", "")
             and r.get("section") == "G" and r.get("era") == "late"]
    if ibm_g:
        ibm_g_count = ibm_g[0]["count"]
        check("Ch11", "IBM 88,600 G-section patents (late era)",
              "~88,600", f"{ibm_g_count:,}",
              abs(ibm_g_count - 88600) < 500)

    # Samsung 79,400 H-section
    samsung_h = [r for r in corp_div if "SAMSUNG" in r.get("organization", "")
                 and r.get("section") == "H" and r.get("era") == "late"]
    if samsung_h:
        samsung_h_count = samsung_h[0]["count"]
        check("Ch11", "Samsung 79,400 H-section patents (late era)",
              "~79,400", f"{samsung_h_count:,}",
              abs(samsung_h_count - 79400) < 500)

# ── Claim 4: 51 detected pivots across 20 companies ──
pivots = load("company/pivot_detection.json")
if pivots:
    detected = [r for r in pivots if r.get("is_pivot")]
    n_pivots = len(detected)
    n_pivot_companies = len(set(r.get("company", "") for r in detected))
    check("Ch11", "51 detected pivots", "51", str(n_pivots),
          n_pivots == 51)
    check("Ch11", "20 companies with pivots", "20", str(n_pivot_companies),
          n_pivot_companies == 20)

# ── Claim 5: WIPO diversity - US Air Force 3.14, Ericsson 1.40 ──
wipo = load("chapter11/wipo_portfolio_diversity.json")
if wipo:
    usaf_wipo = next((r for r in wipo if "Air Force" in r.get("organization", "")), None)
    ericsson_wipo = next((r for r in wipo if "Ericsson" in r.get("organization", "")), None)

    check("Ch11", "US Air Force WIPO entropy = 3.14",
          "3.14", f"{usaf_wipo.get('wipo_shannon_entropy', 'N/A')}" if usaf_wipo else "NOT FOUND",
          usaf_wipo is not None and abs(usaf_wipo.get("wipo_shannon_entropy", 0) - 3.14) < 0.05)
    check("Ch11", "Ericsson WIPO entropy = 1.40",
          "1.40", f"{ericsson_wipo.get('wipo_shannon_entropy', 'N/A')}" if ericsson_wipo else "NOT FOUND",
          ericsson_wipo is not None and abs(ericsson_wipo.get("wipo_shannon_entropy", 0) - 1.40) < 0.05)

    # WIPO: US Air Force leads
    max_wipo = max(wipo, key=lambda r: r.get("wipo_shannon_entropy", 0))
    check("Ch11", "SUPERLATIVE: US Air Force leads WIPO diversity",
          "US Air Force", f"{max_wipo.get('organization', 'N/A')} ({max_wipo.get('wipo_shannon_entropy', 'N/A')})",
          "Air Force" in max_wipo.get("organization", ""))

    # Ericsson is lowest
    min_wipo = min(wipo, key=lambda r: r.get("wipo_shannon_entropy", 999))
    check("Ch11", "SUPERLATIVE: Ericsson has lowest WIPO diversity",
          "Ericsson", f"{min_wipo.get('organization', 'N/A')} ({min_wipo.get('wipo_shannon_entropy', 'N/A')})",
          "Ericsson" in min_wipo.get("organization", ""))

# ============================================================================
# CHAPTER 12: org-company-profiles
# ============================================================================
print("\n" + "="*80)
print("CHAPTER 12: Interactive Company Profiles")
print("="*80)

# Chapter 12 is primarily interactive dashboard - claims are mostly inherited from other chapters
# But let's verify the data files are loadable and consistent

profiles = load("company/company_profiles.json")
if profiles:
    check("Ch12", "Company profiles data loads successfully",
          "True", "True", True)
    n_companies = len(profiles)
    check("Ch12", "Company profiles contain data",
          ">0 companies", f"{n_companies} companies",
          n_companies > 0)

    # Verify IBM data exists and is consistent
    ibm_profile = next((p for p in profiles if p.get("company") == "IBM"), None)
    if ibm_profile:
        ibm_total = sum(y.get("patent_count", 0) for y in ibm_profile.get("years", []))
        check("Ch12", "IBM profile total patents consistent with Ch9 data",
              "~161,888", f"{ibm_total:,}",
              abs(ibm_total - 161888) < 5000,
              note="Profile may use slightly different aggregation")

strategy = load("company/strategy_profiles.json")
if strategy:
    n_strategy = len(strategy)
    check("Ch12", "Strategy profiles data loads",
          ">0", str(n_strategy),
          n_strategy > 0)

speed = load("company/corporate_speed.json")
if speed:
    n_speed = len(set(r.get("company", "") for r in speed))
    check("Ch12", "Corporate speed data loads",
          ">0 companies", f"{n_speed} companies",
          n_speed > 0)

# ============================================================================
# SUMMARY
# ============================================================================
print("\n" + "="*80)
print("SUMMARY")
print("="*80)

n_pass = sum(1 for f in findings if f["status"] == "PASS")
n_fail = sum(1 for f in findings if f["status"] == "FAIL")
total = len(findings)

print(f"\nTotal checks: {total}")
print(f"PASS: {n_pass}")
print(f"FAIL: {n_fail}")
print(f"Pass rate: {n_pass/total*100:.1f}%")

if n_fail > 0:
    print(f"\n{'='*80}")
    print("FAILURES:")
    print(f"{'='*80}")
    for f in findings:
        if f["status"] == "FAIL":
            print(f"\n  [{f['chapter']}] {f['claim']}")
            print(f"    Expected: {f['expected']}")
            print(f"    Actual:   {f['actual']}")
            if f['note']:
                print(f"    Note:     {f['note']}")

# Save structured findings for report generation
with open("/home/saerom/projects/patentworld/audit/results/batch3_act2_raw.json", "w") as f:
    json.dump(findings, f, indent=2)

print(f"\nRaw findings saved to audit/results/batch3_act2_raw.json")
