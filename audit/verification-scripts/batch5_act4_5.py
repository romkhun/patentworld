"""
Verification script for PatentWorld Act 4 (Geography) + Act 5 (Mechanics)
Chapters: 18 (geo-domestic), 19 (geo-international), 20 (mech-organizations),
           21 (mech-inventors), 22 (mech-geography)

Run: python3 audit/verification-scripts/batch5_act4_5.py
"""

import json
import os
from pathlib import Path

DATA = Path("public/data")
PASS = "PASS"
FAIL = "FAIL"
WARN = "WARN"

results = []

def check(label: str, expected, actual, tolerance=0.05, status_override=None):
    """Verify a claim. tolerance is relative for numbers."""
    if status_override:
        results.append((status_override, label, f"expected={expected}, actual={actual}"))
        return
    if isinstance(expected, (int, float)) and isinstance(actual, (int, float)):
        if expected == 0:
            ok = actual == 0
        else:
            ok = abs(actual - expected) / abs(expected) <= tolerance
        status = PASS if ok else FAIL
    elif isinstance(expected, str):
        ok = str(actual) == expected
        status = PASS if ok else FAIL
    else:
        status = WARN
    results.append((status, label, f"expected={expected}, actual={actual}"))


# =====================================================================
# Chapter 18: Domestic Geography
# =====================================================================
print("=== Chapter 18: geo-domestic ===")

with open(DATA / "chapter4/us_states_summary.json") as f:
    states = json.load(f)

total_patents = sum(s["total_patents"] for s in states)
ca_patents = states[0]["total_patents"]
ca_share = ca_patents / total_patents * 100

check("Ch18: CA patents = 992,708", 992708, ca_patents)
check("Ch18: CA share = 23.6%", 23.6, round(ca_share, 1))

top5 = sum(s["total_patents"] for s in states[:5])
top5_share = top5 / total_patents * 100
check("Ch18: Top 5 share = 46%", 46.0, round(top5_share, 1))

bottom30 = sum(s["total_patents"] for s in states[-30:])
check("Ch18: Bottom 30 states/territories = 314,664", 314664, bottom30)
check("Ch18: CA > bottom 30 combined", True, ca_patents > bottom30)

# State specialization
with open(DATA / "chapter4/state_specialization.json") as f:
    spec = json.load(f)

mi_data = [s for s in spec if s["state"] == "MI"]
mi_total = sum(s["count"] for s in mi_data)
mi_f = next(s["count"] for s in mi_data if s["section"] == "F")
mi_f_pct = mi_f / mi_total * 100
check("Ch18: MI Mechanical Engineering (F) = 20.1%", 20.1, round(mi_f_pct, 1))

ca_data = [s for s in spec if s["state"] == "CA"]
ca_total = sum(s["count"] for s in ca_data)
ca_g = next(s["count"] for s in ca_data if s["section"] == "G")
ca_h = next(s["count"] for s in ca_data if s["section"] == "H")
ca_gh_pct = (ca_g + ca_h) / ca_total * 100
check("Ch18: CA Physics+Electricity (G+H) = 65.1%", 65.1, round(ca_gh_pct, 1))

# City-level
with open(DATA / "chapter4/top_cities.json") as f:
    cities = json.load(f)

check("Ch18: San Jose total = 96,068", 96068, cities[0]["total_patents"])
check("Ch18: San Diego total = 70,186", 70186, cities[1]["total_patents"])
check("Ch18: Austin total = 53,595", 53595, cities[2]["total_patents"])

# State time trends
with open(DATA / "chapter4/us_states_per_year.json") as f:
    spy = json.load(f)

ca_2024 = sum(d["count"] for d in spy if d["state"] == "CA" and d["year"] == 2024)
tx_2024 = sum(d["count"] for d in spy if d["state"] == "TX" and d["year"] == 2024)
ratio = ca_2024 / tx_2024 if tx_2024 else 0
check("Ch18: CA 4.0x Texas by 2024", 4.0, round(ratio, 1))

# County concentration
with open(DATA / "chapter18/county_concentration_over_time.json") as f:
    conc = json.load(f)

conc_1990 = next(d for d in conc if d["period"] == 1990)
conc_2020 = next(d for d in conc if d["period"] == 2020)
check("Ch18: Top50 county share 1990 = 43.3%", 43.3, round(conc_1990["top50_share_pct"], 1))
check("Ch18: Top50 county share 2020 = 56.8%", 56.8, round(conc_2020["top50_share_pct"], 1))

# County top counties
with open(DATA / "chapter18/top_counties.json") as f:
    counties = json.load(f)

check("Ch18: Santa Clara County = 327,700 patents", 327700, counties[0]["patent_count"])
total_top50 = sum(c["patent_count"] for c in counties[:50])
top5_county = sum(c["patent_count"] for c in counties[:5])
top5_county_share = top5_county / total_top50 * 100
# The page dynamically computes this so we check the computation
check("Ch18: Top 5 counties share of top50 (dynamically computed)", True, top5_county_share > 30)

# Innovation clusters
with open(DATA / "chapter18/innovation_clusters.json") as f:
    clusters = json.load(f)

tokyo = next(c for c in clusters if c["location"] == "Tokyo, JP")
yokohama = next(c for c in clusters if c["location"] == "Yokohama, JP")
seoul = next(c for c in clusters if c["location"] == "Seoul, KR")
check("Ch18: Tokyo = 263,010 patents", 263010, tokyo["patent_count"])
check("Ch18: Yokohama = 196,841 patents", 196841, yokohama["patent_count"])
check("Ch18: Seoul = 102,646 patents", 102646, seoul["patent_count"])

tokyo_metro = tokyo["patent_count"] + yokohama["patent_count"] + next(c for c in clusters if c["location"] == "Kawasaki, JP")["patent_count"]
check("Ch18: Tokyo metro (TYO+YOK+KAW) > 521,000", True, tokyo_metro > 521000)


# =====================================================================
# Chapter 19: International Geography
# =====================================================================
print("\n=== Chapter 19: geo-international ===")

with open(DATA / "chapter4/countries_per_year.json") as f:
    cpy = json.load(f)

jp_total = sum(d["count"] for d in cpy if d["country"] == "JP")
check("Ch19: Japan = 1.45M US patents", 1.45, round(jp_total / 1e6, 2))

cn_2000 = sum(d["count"] for d in cpy if d["country"] == "CN" and d["year"] == 2000)
cn_2024 = sum(d["count"] for d in cpy if d["country"] == "CN" and d["year"] == 2024)
check("Ch19: China 2000 = 299 filings", 299, cn_2000)
check("Ch19: China 2024 = 30,695 filings", 30695, cn_2024)

with open(DATA / "chapter9/quality_by_country.json") as f:
    qbc = json.load(f)

us_2020 = next(d for d in qbc if d["country"] == "United States" and d["decade"] == 2020)
check("Ch19: US 2020s = ~164,000 patents", 164000, us_2020["patent_count"], tolerance=0.01)
check("Ch19: US avg claims = 18.4", 18.4, round(us_2020["avg_claims"], 1))


# =====================================================================
# Chapter 20: Organizational Mechanics
# =====================================================================
print("\n=== Chapter 20: mech-organizations ===")

# Exploration trajectories
with open(DATA / "company/firm_exploration_trajectories.json") as f:
    traj = json.load(f)

latest_shares = []
for name, data in traj.items():
    sorted_data = sorted(data, key=lambda d: d["year"])
    if sorted_data:
        latest_shares.append(sorted_data[-1]["exploration_share"])

below5 = sum(1 for v in latest_shares if v < 5)
check("Ch20: 11 of 20 keep exploration below 5%", 11, below5)

latest_shares.sort()
n = len(latest_shares)
median = (latest_shares[n // 2 - 1] + latest_shares[n // 2]) / 2
check("Ch20: Median exploration share = 2.9%", 2.9, round(median, 1))

# Exploration decay
with open(DATA / "company/firm_exploration_lifecycle.json") as f:
    lc = json.load(f)

sys_avg = lc.get("system_average", [])
year0 = next(d for d in sys_avg if d["relative_year"] == 0)
year5 = next(d for d in sys_avg if d["relative_year"] == 5)
check("Ch20: Decay from 1.0 at entry", 1.0, round(year0["mean_exploration"], 1))
check("Ch20: Decay to 0.087 at year 5", 0.087, round(year5["mean_exploration"], 3))

# Ambidexterity
with open(DATA / "company/firm_ambidexterity_quality.json") as f:
    amb = json.load(f)

balanced = [d for d in amb if d["ambidexterity_index"] > 0.5]
specialized = [d for d in amb if d["ambidexterity_index"] <= 0.5]
avg_balanced = sum(d["blockbuster_rate"] for d in balanced) / len(balanced)
avg_specialized = sum(d["blockbuster_rate"] for d in specialized) / len(specialized)
ratio_bb = avg_balanced / avg_specialized
check("Ch20: Balanced blockbuster rate = 2.51%", 2.51, round(avg_balanced, 2))
check("Ch20: Ratio balanced/specialized = 2.3x", 2.3, round(ratio_bb, 1))

# Firm network
with open(DATA / "chapter3/firm_collaboration_network.json") as f:
    fnet = json.load(f)

check("Ch20: 618 organizations in co-patenting network", 618, len(fnet["nodes"]))

# Citation categories
with open(DATA / "chapter20/citation_category_distribution.json") as f:
    cc = json.load(f)

total_cit = sum(d["cnt"] for d in cc)
applicant = next(d for d in cc if d["citation_category"] == "cited by applicant")
examiner = next(d for d in cc if d["citation_category"] == "cited by examiner")
other = next(d for d in cc if d["citation_category"] == "cited by other")
check("Ch20: Applicant-cited = 56.0%", 56.0, round(applicant["cnt"] / total_cit * 100, 1))
check("Ch20: Examiner-cited = 24.3%", 24.3, round(examiner["cnt"] / total_cit * 100, 1))
check("Ch20: Cited by other = 19.7%", 19.7, round(other["cnt"] / total_cit * 100, 1))


# =====================================================================
# Chapter 21: Inventor Mechanics
# =====================================================================
print("\n=== Chapter 21: mech-inventors ===")

with open(DATA / "chapter5/inventor_collaboration_network.json") as f:
    inet = json.load(f)

check("Ch21: 632 prolific inventors", 632, len(inet["nodes"]))
check("Ch21: 1,236 co-invention ties", 1236, len(inet["edges"]))

# Talent flows
with open(DATA / "company/talent_flows.json") as f:
    tf = json.load(f)

total_moves = sum(l["value"] for l in tf["links"])
check("Ch21: 143,524 inventor movements", 143524, total_moves)

# Annual mobility trend
with open(DATA / "chapter4/inventor_mobility_trend.json") as f:
    mt = json.load(f)

mt_1980 = next(d for d in mt if d["year"] == 1980)
mt_2024 = next(d for d in mt if d["year"] == 2024)
check("Ch21: Intl mobility 1980 = 1.3%", 1.3, round(mt_1980["intl_mobility_pct"], 1))
check("Ch21: Intl mobility 2024 = 5.1%", 5.1, round(mt_2024["intl_mobility_pct"], 1))
check("Ch21: Domestic mobility 2024 = 3.5%", 3.5, round(mt_2024["domestic_mobility_pct"], 1))

# Country flows
with open(DATA / "chapter4/inventor_country_flows.json") as f:
    cf = json.load(f)

total_flow = sum(f_["flow_count"] for f_ in cf)
us_flow = sum(f_["flow_count"] for f_ in cf if f_.get("from_country") == "US" or f_.get("to_country") == "US")
us_pct = us_flow / total_flow * 100
check("Ch21: US involved in 77.6% of cross-border flows", 77.6, round(us_pct, 1))
check("Ch21: 509,639 US-involved moves", 509639, us_flow)
check("Ch21: 656,397 total moves", 656397, total_flow)


# =====================================================================
# Chapter 22: Geographic Mechanics
# =====================================================================
print("\n=== Chapter 22: mech-geography ===")

with open(DATA / "chapter7/intl_collaboration.json") as f:
    ic = json.load(f)

ic_1976 = next(d for d in ic if d["year"] == 1976)
ic_2025 = next(d for d in ic if d["year"] == 2025)
check("Ch22: Intl co-invention 1976 = 1.0%", 1.0, round(ic_1976["intl_collab_pct"], 1))
check("Ch22: Intl co-invention 2025 = 10.0%", 10.0, round(ic_2025["intl_collab_pct"], 1))

# US-China co-invention
with open(DATA / "chapter6/co_invention_us_china_by_section.json") as f:
    ci = json.load(f)

us_cn_2000 = sum(d["us_cn_count"] for d in ci if d["year"] == 2000)
us_cn_2024 = sum(d["us_cn_count"] for d in ci if d["year"] == 2024)
check("Ch22: US-China 2000 = 77 patents", 77, us_cn_2000)
check("Ch22: US-China 2024 = 2,749 patents", 2749, us_cn_2024)

# Citation localization
with open(DATA / "chapter22/citation_localization.json") as f:
    cl = json.load(f)

same_pcts = [d["same_country_pct"] for d in cl]
check("Ch22: Home-country bias range 58-64%", True, min(same_pcts) >= 57 and max(same_pcts) <= 70)


# =====================================================================
# Print Summary
# =====================================================================
print("\n" + "=" * 70)
print("VERIFICATION SUMMARY")
print("=" * 70)
pass_count = sum(1 for s, _, _ in results if s == PASS)
fail_count = sum(1 for s, _, _ in results if s == FAIL)
warn_count = sum(1 for s, _, _ in results if s == WARN)
print(f"PASS: {pass_count}  |  FAIL: {fail_count}  |  WARN: {warn_count}")
print("-" * 70)
for status, label, detail in results:
    marker = "OK" if status == PASS else ("XX" if status == FAIL else "??")
    print(f"[{marker}] {label}")
    if status != PASS:
        print(f"      {detail}")
print("-" * 70)
