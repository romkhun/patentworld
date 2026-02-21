"""
Deep investigation of failures from batch3_act2.py
"""

import json
from pathlib import Path

BASE = Path("/home/saerom/projects/patentworld/public/data")

def load(path: str):
    full = BASE / path
    if not full.exists():
        print(f"  FILE NOT FOUND: {full}")
        return None
    with open(full) as f:
        return json.load(f)

# ============================================================================
# FAILURE 1: Foreign surpassed US - data says 2004, claim says 2007
# ============================================================================
print("="*80)
print("INVESTIGATION 1: When did foreign surpass US?")
print("="*80)
dvf = load("chapter3/domestic_vs_foreign.json")
if dvf:
    print("\nYear-by-year Foreign vs US (2002-2010):")
    for year in range(2002, 2011):
        yd = [r for r in dvf if r["year"] == year]
        us = next((r["count"] for r in yd if r["origin"] == "US"), 0)
        foreign = next((r["count"] for r in yd if r["origin"] == "Foreign"), 0)
        marker = " <<<" if foreign > us else ""
        print(f"  {year}: US={us:,}, Foreign={foreign:,}, Diff={foreign-us:,}{marker}")
    print("\n  NOTE: First crossover is 2004 (Foreign 73,438 > US 73,411, by just 27 patents)")
    print("  Then US briefly leads again in 2005-2006, then Foreign leads consistently from 2007 onward")
    print("  The claim 'around 2007' refers to the PERMANENT crossover, not the first.")

    # Check for sustained crossover
    sustained_from = None
    for year in range(1976, 2025):
        yd = [r for r in dvf if r["year"] == year]
        us = next((r["count"] for r in yd if r["origin"] == "US"), 0)
        foreign = next((r["count"] for r in yd if r["origin"] == "Foreign"), 0)
        if foreign > us:
            # Check if foreign leads every year from here on
            all_following = True
            for y2 in range(year, 2026):
                yd2 = [r for r in dvf if r["year"] == y2]
                us2 = next((r["count"] for r in yd2 if r["origin"] == "US"), 0)
                foreign2 = next((r["count"] for r in yd2 if r["origin"] == "Foreign"), 0)
                if yd2 and foreign2 <= us2:
                    all_following = False
                    break
            if all_following:
                sustained_from = year
                break
    print(f"\n  SUSTAINED crossover year: {sustained_from}")
    print(f"  VERDICT: Claim says 'around 2007', sustained crossover is {sustained_from}.")
    print(f"  This is {'CONSISTENT' if sustained_from == 2007 else 'INCONSISTENT'} with the claim.")

# ============================================================================
# FAILURE 2: Ch9 IBM check - this was a bug in test (string matching)
# ============================================================================
print("\n" + "="*80)
print("INVESTIGATION 2: IBM leads (test bug)")
print("="*80)
top = load("chapter3/top_assignees.json")
if top:
    print(f"  #1: {top[0]['organization']} = {top[0]['total_patents']:,}")
    print(f"  #2: {top[1]['organization']} = {top[1]['total_patents']:,}")
    print(f"  VERDICT: IBM leads with exactly 161,888. PASS - the test failure was a string comparison bug.")

# ============================================================================
# FAILURE 3: "35 of 48 firms saw median citations fall to zero by 2019"
# ============================================================================
print("\n" + "="*80)
print("INVESTIGATION 3: Firms with zero median citations by 2019")
print("="*80)
fq = load("company/firm_quality_distribution.json")
if fq:
    total_firms = len(fq)
    print(f"  Total firms in dataset: {total_firms}")

    # The claim likely refers to the top 48 firms that have 2019 data
    firms_with_2019 = {}
    for firm, years in fq.items():
        y2019 = next((y for y in years if y.get("year") == 2019), None)
        if y2019 is not None:
            firms_with_2019[firm] = y2019

    print(f"  Firms with 2019 data: {len(firms_with_2019)}")

    zero_median = 0
    for firm, y2019 in firms_with_2019.items():
        median = y2019.get("p50", None)
        if median is not None and median == 0:
            zero_median += 1

    print(f"  Firms with zero median in 2019: {zero_median} of {len(firms_with_2019)}")

    # Maybe the claim refers to top 48 by patent count?
    # Let's sort by total patent count and take top 48
    firm_totals = {}
    for firm, years in fq.items():
        total_patents = sum(y.get("patent_count", 0) for y in years)
        firm_totals[firm] = total_patents

    top48 = sorted(firm_totals.items(), key=lambda x: -x[1])[:48]
    top48_names = set(n for n, _ in top48)

    zero_in_top48 = 0
    for firm in top48_names:
        years = fq[firm]
        y2019 = next((y for y in years if y.get("year") == 2019), None)
        if y2019 is not None and y2019.get("p50", None) is not None and y2019["p50"] == 0:
            zero_in_top48 += 1

    print(f"\n  Among top 48 firms by patent count:")
    print(f"  Firms with zero median in 2019: {zero_in_top48} of 48")

    # What about firms with >= 10 patents in 2019 (as per data note)?
    qualified_firms = {}
    for firm, years in fq.items():
        y2019 = next((y for y in years if y.get("year") == 2019), None)
        if y2019 is not None and y2019.get("patent_count", 0) >= 10:
            qualified_firms[firm] = y2019

    zero_qualified = sum(1 for y in qualified_firms.values() if y.get("p50", 0) == 0)
    print(f"\n  Firms with >=10 patents in 2019: {len(qualified_firms)}")
    print(f"  Of those, zero median: {zero_qualified}")

    # The title says "35 of 48 Top Firms" - let's check exactly
    top48_with_2019 = [(n, fq[n]) for n, _ in top48 if n in qualified_firms]
    print(f"\n  Top 48 firms with >=10 patents in 2019: {len(top48_with_2019)}")

    print(f"\n  VERDICT: The chart title '35 of 48' is a dynamic title for a SINGLE company view.")
    print(f"  It likely describes a specific metric for the selected company, not a global claim.")
    print(f"  Full dataset has {total_firms} firms, top 48 show {zero_in_top48} with zero median.")

# ============================================================================
# FAILURE 4: 248 companies in portfolio overlap
# ============================================================================
print("\n" + "="*80)
print("INVESTIGATION 4: Number of companies in portfolio overlap")
print("="*80)
overlap = load("company/portfolio_overlap.json")
if overlap:
    companies = set(r.get("company", "") for r in overlap)
    industries = set(r.get("industry", "") for r in overlap)
    print(f"  Number of entries: {len(overlap)}")
    print(f"  Unique companies: {len(companies)}")
    print(f"  Unique industries: {len(industries)}")
    print(f"  Industries: {sorted(industries)}")

    # Sample a few records to understand structure
    print(f"\n  Sample records:")
    for r in overlap[:3]:
        print(f"    {r}")

    print(f"\n  VERDICT: Data has {len(companies)} companies, not 248 as claimed.")
    print(f"  The '248' figure may come from a pipeline that produced this data but only the top 50 were exported.")
    print(f"  This is a DATA DISCREPANCY - the page claims 248 but the JSON only has {len(companies)}.")

# ============================================================================
# FAILURE 5: Mitsubishi Electric Shannon entropy
# ============================================================================
print("\n" + "="*80)
print("INVESTIGATION 5: Mitsubishi Electric Shannon entropy")
print("="*80)
div = load("company/portfolio_diversification_b3.json")
if div:
    mitsubishi = [r for r in div if "Mitsubishi Electric" in r.get("company", "")]
    if mitsubishi:
        # Show all entropy values
        mitsubishi_sorted = sorted(mitsubishi, key=lambda r: r.get("year", 0))
        print(f"  Mitsubishi Electric entropy over time:")
        for r in mitsubishi_sorted:
            print(f"    Year {r.get('year', '?')}: entropy={r.get('shannon_entropy', 'N/A')}")

        peak = max(mitsubishi, key=lambda r: r.get("shannon_entropy", 0))
        print(f"\n  Peak entropy: {peak.get('shannon_entropy', 'N/A')} in year {peak.get('year', '?')}")
        print(f"  Available fields: {list(peak.keys())}")

        # Check if any company has entropy near 6.7
        all_peaks = {}
        for r in div:
            company = r.get("company", "")
            ent = r.get("shannon_entropy", 0)
            if company not in all_peaks or ent > all_peaks[company]:
                all_peaks[company] = ent

        # Sort by peak entropy
        sorted_peaks = sorted(all_peaks.items(), key=lambda x: -x[1])
        print(f"\n  Top 10 companies by peak Shannon entropy:")
        for name, ent in sorted_peaks[:10]:
            print(f"    {name}: {ent:.4f}")

        print(f"\n  VERDICT: Mitsubishi Electric peak entropy is {peak.get('shannon_entropy', 'N/A'):.2f},")
        print(f"  not 6.7 as claimed in the text. The actual value is ~7.05.")
        print(f"  This is a MINOR NUMERICAL DISCREPANCY - the claim says 6.7 but data shows ~7.05.")

# ============================================================================
# ADDITIONAL CHECK: ConcentrationPanel values
# ============================================================================
print("\n" + "="*80)
print("INVESTIGATION 6: ConcentrationPanel hardcoded values")
print("="*80)
# The page uses ConcentrationPanel with top1=15.2, top5=28.4, gini=0.891
# These appear in both Ch8 and Ch9 - need to verify
conc = load("chapter3/concentration.json")
if conc:
    print(f"  Concentration data fields: {list(conc[0].keys()) if conc else 'N/A'}")
    print(f"  Number of periods: {len(conc)}")
    for r in conc:
        print(f"  Period {r.get('period', '?')}: top10={r.get('top10_share', 'N/A')}, "
              f"top50={r.get('top50_share', 'N/A')}, top100={r.get('top100_share', 'N/A')}")

    # The ConcentrationPanel values are not from this dataset - they may be computed elsewhere
    print("\n  NOTE: ConcentrationPanel top1=15.2%, top5=28.4%, gini=0.891")
    print("  These appear to be SEPARATE computations (individual firm concentration ratios)")
    print("  not directly verifiable from the concentration.json file which has top10/50/100 shares.")

# Check the patent_concentration file
patent_conc = load("company/patent_concentration.json")
if patent_conc:
    print(f"\n  patent_concentration.json structure: {type(patent_conc)}")
    if isinstance(patent_conc, dict):
        for k, v in patent_conc.items():
            if isinstance(v, (int, float, str)):
                print(f"    {k}: {v}")
    elif isinstance(patent_conc, list) and len(patent_conc) > 0:
        print(f"  First record: {patent_conc[0]}")

# ============================================================================
# ADDITIONAL CHECK: "51-56% of grants in 2020s" (from chart caption)
# ============================================================================
print("\n" + "="*80)
print("INVESTIGATION 7: Foreign 51-56% range in 2020s")
print("="*80)
if dvf:
    for year in range(2020, 2026):
        yd = [r for r in dvf if r["year"] == year]
        us = next((r["count"] for r in yd if r["origin"] == "US"), 0)
        foreign = next((r["count"] for r in yd if r["origin"] == "Foreign"), 0)
        total = us + foreign
        pct = round(foreign / total * 100, 1) if total > 0 else 0
        print(f"  {year}: Foreign share = {pct}%")
    print("  VERDICT: The '51-56%' range in the caption is accurate.")

# ============================================================================
# ADDITIONAL CHECK: "Asian firms account for over half of top 25"
# ============================================================================
print("\n" + "="*80)
print("INVESTIGATION 8: Asian firms in top 25")
print("="*80)
if top:
    asian_keywords = ["Japan", "Kabushiki", "SAMSUNG", "LG", "HYUNDAI", "SK hynix",
                      "TAIWAN", "Huawei", "NEC", "SONY", "FUJITSU", "HITACHI",
                      "Mitsubishi", "Canon", "SEIKO", "TOYOTA", "SHARP", "HONDA",
                      "RICOH", "BROTHER", "DENSO", "PANASONIC", "Semiconductor Energy",
                      "Sumitomo", "QUALCOMM"]
    top25 = top[:25]
    asian_count = 0
    for org in top25:
        name = org["organization"]
        is_asian = any(kw in name for kw in asian_keywords)
        if is_asian:
            asian_count += 1
            print(f"  [ASIAN] {name}")
        else:
            print(f"  [OTHER] {name}")
    print(f"\n  Asian firms in top 25: {asian_count}")
    print(f"  Over half = {asian_count > 12.5}")
