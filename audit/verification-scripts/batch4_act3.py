"""
Batch 4: Act 3 (The Inventors) Data Accuracy Audit
Chapters 13-17: inv-top-inventors, inv-generalist-specialist, inv-serial-new, inv-gender, inv-team-size

This script verifies every hardcoded numerical claim in the five Act 3 chapter
page.tsx files against the underlying JSON data files.
"""

import json
import sys
from pathlib import Path

BASE = Path("/home/saerom/projects/patentworld/public/data")
PASS = 0
FAIL = 0
WARN = 0


def check(label: str, expected, actual, tolerance=0.15, pct=False):
    """Compare expected vs actual with tolerance. tolerance is fractional for
    absolute values, and absolute-percentage-point for pct values."""
    global PASS, FAIL, WARN
    if pct:
        diff = abs(expected - actual)
        ok = diff <= tolerance
    else:
        if expected == 0:
            ok = actual == 0
        else:
            ok = abs(expected - actual) / abs(expected) <= tolerance
    status = "PASS" if ok else "FAIL"
    if not ok:
        FAIL += 1
    else:
        PASS += 1
    print(f"  [{status}] {label}: expected={expected}, actual={actual}")


def load(path: str):
    with open(BASE / path) as f:
        return json.load(f)


# =====================================================================
# CHAPTER 13: inv-top-inventors
# =====================================================================
print("=" * 70)
print("CHAPTER 13: Top Inventors")
print("=" * 70)

# -- Superstar concentration --
ss = load("chapter5/superstar_concentration.json")
ss_1976 = next(r for r in ss if r["year"] == 1976)
ss_2024 = next(r for r in ss if r["year"] == 2024)
ss_2025 = next(r for r in ss if r["year"] == 2025)

# Claim: "top 5% account for 63.2% of all patents"
check("Top 5% share (2024, used as headline)", 63.2, ss_2024["top5pct_share"], tolerance=0.5, pct=True)

# Claim: "Annual share rose from 26% to 60%"
check("Top 5% share 1976 (~26%)", 26, ss_1976["top5pct_share"], tolerance=1.0, pct=True)
check("Top 5% share 2025 (~60%)", 60, ss_2025["top5pct_share"], tolerance=1.0, pct=True)

# ConcentrationPanel: top1=27.8, top5=63.2, gini=0.856
check("ConcentrationPanel top1 (2024)", 27.8, ss_2024["top1pct_share"], tolerance=0.5, pct=True)

# -- Prolific inventors --
pi = load("chapter5/prolific_inventors.json")

# Claim: "most prolific inventor holds 6,709 patents"
check("Most prolific inventor patents", 6709, pi[0]["total_patents"])
name = f"{pi[0]['first_name']} {pi[0]['last_name']}"
print(f"  [INFO] Most prolific inventor: {name}")

# Claim: "top 100 each exceed 760 patents"
check("Top 100th inventor exceeds 760", True, pi[99]["total_patents"] >= 760)
print(f"  [INFO] 100th inventor: {pi[99]['first_name']} {pi[99]['last_name']}, patents={pi[99]['total_patents']}")

# -- Citation impact --
si = load("chapter5/star_inventor_impact.json")

# Claim: "Citation impact ranges from 10 to 965"
check("Max avg citations (~965)", 965, si[0]["avg_citations"], tolerance=1.0, pct=True)
check("Min avg citations (~10)", 10, si[99]["avg_citations"], tolerance=1.5, pct=True)

# -- Examiner-inventor overlap --
overlap = load("chapter13/examiner_inventor_overlap.json")
check("Examiner-inventor name matches", 5785, overlap[0]["name_matches"])

# -- Multi-type inventors --
mti = load("chapter13/multi_type_inventors.json")
mti_10plus = next(r for r in mti if r["career_length_bin"] == "10+")
mti_24 = next(r for r in mti if r["career_length_bin"] == "2-4")
mti_59 = next(r for r in mti if r["career_length_bin"] == "5-9")

check("Multi-type 10+ patents pct", 30.7, mti_10plus["multi_type_pct"], tolerance=0.5, pct=True)
check("Multi-type 2-4 patents pct", 8.4, mti_24["multi_type_pct"], tolerance=0.5, pct=True)
check("Multi-type 5-9 patents pct", 18.4, mti_59["multi_type_pct"], tolerance=0.5, pct=True)

print()

# =====================================================================
# CHAPTER 14: inv-generalist-specialist
# =====================================================================
print("=" * 70)
print("CHAPTER 14: Generalist vs. Specialist")
print("=" * 70)

# -- Specialization trend --
drift = load("company/inventor_drift.json")
d_1970 = next(r for r in drift if r["decade"] == 1970)
d_2020 = next(r for r in drift if r["decade"] == 2020)

# Claim: "Specialist inventors rose from 20% to 48%"
check("Specialist share 1970s", 20, d_1970["specialist_pct"], tolerance=1.0, pct=True)
check("Specialist share 2020s", 48, d_2020["specialist_pct"], tolerance=1.0, pct=True)

# -- Quality by specialization (2015 values for citations, 2024 for others) --
qs = load("computed/quality_by_specialization.json")

qs_gen_2015 = next(r for r in qs if r["year"] == 2015 and r["group"] == "generalist")
qs_spec_2015 = next(r for r in qs if r["year"] == 2015 and r["group"] == "specialist")
qs_gen_2024 = next(r for r in qs if r["year"] == 2024 and r["group"] == "generalist")
qs_spec_2024 = next(r for r in qs if r["year"] == 2024 and r["group"] == "specialist")

# Claim: "Generalists earn 9.3 citations vs. 8.2 for specialists" (2015)
check("Generalist fwd citations 2015", 9.3, qs_gen_2015["avg_forward_citations"], tolerance=0.5, pct=True)
check("Specialist fwd citations 2015", 8.2, qs_spec_2015["avg_forward_citations"], tolerance=0.5, pct=True)

# Claim: "originality 0.212 vs. 0.165" (2024)
check("Generalist originality 2024", 0.212, qs_gen_2024["avg_originality"], tolerance=0.005, pct=True)
check("Specialist originality 2024", 0.165, qs_spec_2024["avg_originality"], tolerance=0.005, pct=True)

# Claims title: "Specialists Average 15.2 Claims versus 14.3 for Generalists (2024)"
check("Specialist claims 2024", 15.2, qs_spec_2024["avg_num_claims"], tolerance=0.5, pct=True)
check("Generalist claims 2024", 14.3, qs_gen_2024["avg_num_claims"], tolerance=0.5, pct=True)

# Claim: "Generalist Patents Span 2.51 CPC Subclasses versus 2.22 for Specialists (2024)"
check("Generalist scope 2024", 2.51, qs_gen_2024["avg_scope"], tolerance=0.1, pct=True)
check("Specialist scope 2024", 2.22, qs_spec_2024["avg_scope"], tolerance=0.1, pct=True)

# Claim: "Generalists Score 0.040 on Generality versus 0.024 for Specialists (2024)"
check("Generalist generality 2024", 0.040, qs_gen_2024["avg_generality"], tolerance=0.005, pct=True)
check("Specialist generality 2024", 0.024, qs_spec_2024["avg_generality"], tolerance=0.005, pct=True)

# Claim: "Generalists Self-Cite at 13.7% versus 10.7% for Specialists (2024)"
check("Generalist self-cite 2024", 0.137, qs_gen_2024["avg_self_citation_rate"], tolerance=0.005, pct=True)
check("Specialist self-cite 2024", 0.107, qs_spec_2024["avg_self_citation_rate"], tolerance=0.005, pct=True)

# Claim: "Specialists Wait 1,011 Days for Grant versus 973 for Generalists (2024)"
check("Specialist grant lag 2024", 1011, qs_spec_2024["avg_grant_lag_days"], tolerance=5, pct=True)
check("Generalist grant lag 2024", 973, qs_gen_2024["avg_grant_lag_days"], tolerance=5, pct=True)

# -- NPL by inventor type --
npl = load("chapter14/npl_by_inventor_type.json")
npl_spec = next(r for r in npl if r["inventor_type"] == "specialist")
npl_gen = next(r for r in npl if r["inventor_type"] == "generalist")

# Claim: "Specialist Inventors Cite 12.3 Non-Patent References on Average versus 10.9 for Generalists"
check("Specialist avg NPL", 12.3, npl_spec["avg_npl"], tolerance=0.5, pct=True)
check("Generalist avg NPL", 10.9, npl_gen["avg_npl"], tolerance=0.5, pct=True)

print()

# =====================================================================
# CHAPTER 15: inv-serial-new
# =====================================================================
print("=" * 70)
print("CHAPTER 15: Serial Inventors vs. New Entrants")
print("=" * 70)

# -- First-time inventor entries --
ie = load("chapter5/inventor_entry.json")
ie_1979 = next(r for r in ie if r["year"] == 1979)
ie_2019 = next(r for r in ie if r["year"] == 2019)

# Claim: "first-time entries peaked at 140,490 in 2019"
check("New inventors peak 2019", 140490, ie_2019["new_inventors"])

# Claim: "35,126 in 1979"
check("New inventors 1979", 35126, ie_1979["new_inventors"])

# -- First-time share --
fti = load("chapter5/first_time_inventors.json")
fti_1977 = next(r for r in fti if r["year"] == 1977)
fti_2025 = next(r for r in fti if r["year"] == 2025)

# Claim: "share fell from 71% to 26%"
check("First-time share 1977 (~71%)", 71, fti_1977["debut_pct"], tolerance=1.5, pct=True)
check("First-time share 2025 (~26%)", 26, fti_2025["debut_pct"], tolerance=1.5, pct=True)

# -- Inventor segments --
seg = load("chapter5/inventor_segments.json")
one_hit = next(r for r in seg if r["segment"] == "One-Hit Wonder")

# Claim: "43% of inventors file only a single patent"
check("One-Hit inventor share", 43, one_hit["inventor_share"], tolerance=1.0, pct=True)

# Claim: "12% produce 61%"
prolific_inv = sum(r["inventor_share"] for r in seg if r["segment"] in ["Prolific", "Superstar", "Mega-Inventor"])
prolific_pat = sum(r["patent_share"] for r in seg if r["segment"] in ["Prolific", "Superstar", "Mega-Inventor"])
check("Prolific+ inventor share (~12%)", 12, prolific_inv, tolerance=1.0, pct=True)
check("Prolific+ patent share (~61%)", 61, prolific_pat, tolerance=1.0, pct=True)

# -- Career survival --
lon = load("chapter5/inventor_longevity.json")
surv_5yr = {r["cohort"]: r["survival_pct"] for r in lon if r["career_length"] == 5}

# Claim: "37-51% survive past five years"
min_surv = min(surv_5yr.values())
max_surv = max(surv_5yr.values())
check("Min 5yr survival (~37%)", 37, min_surv, tolerance=2.0, pct=True)
check("Max 5yr survival (~51%)", 51, max_surv, tolerance=2.0, pct=True)

# -- Career productivity curve --
careers = load("company/inventor_careers.json")
curves = careers["curves"]

# Claim: "Productivity rises from 1.4 to 2.1 patents per year"
check("Career year 0 avg patents (~1.4)", 1.4, curves[0]["avg_patents"], tolerance=0.1, pct=True)
# Year 5 avg is 2.088
check("Career year 5 avg patents (~2.1)", 2.1, curves[5]["avg_patents"], tolerance=0.1, pct=True)

print()

# =====================================================================
# CHAPTER 16: inv-gender
# =====================================================================
print("=" * 70)
print("CHAPTER 16: Gender and Patenting")
print("=" * 70)

# -- Gender per year --
gpy = load("chapter5/gender_per_year.json")


def gender_pct(year):
    m = sum(r["count"] for r in gpy if r["year"] == year and r["gender"] == "M")
    f = sum(r["count"] for r in gpy if r["year"] == year and r["gender"] == "F")
    return 100 * f / (m + f) if (m + f) > 0 else 0


# Claim: "Female inventor share rose from 2.8% in 1976 to 14.9% in 2025"
check("Female pct 1976", 2.8, gender_pct(1976), tolerance=0.3, pct=True)
check("Female pct 2025", 14.9, gender_pct(2025), tolerance=0.3, pct=True)

# -- Gender team quality --
gtq = load("chapter5/gender_team_quality.json")
all_male = next(r for r in gtq if r["team_gender"] == "All Male")
mixed = next(r for r in gtq if r["team_gender"] == "Mixed Gender")
all_female = next(r for r in gtq if r["team_gender"] == "All Female")

# Claim: "All-male teams 14.2 citations, mixed-gender 12.6, all-female 9.5"
check("All-male avg citations", 14.2, all_male["avg_citations"], tolerance=0.3, pct=True)
check("Mixed-gender avg citations", 12.6, mixed["avg_citations"], tolerance=0.3, pct=True)
check("All-female avg citations", 9.5, all_female["avg_citations"], tolerance=0.3, pct=True)

# -- Gender by sector --
gbs = load("chapter5/gender_by_sector.json")
sectors = {}
for row in gbs:
    s = row["sector"]
    if s not in sectors:
        sectors[s] = {}
    sectors[s][row["gender"]] = row["count"]

chem_m = sectors["Chemistry"].get("M", 0)
chem_f = sectors["Chemistry"].get("F", 0)
chem_pct = 100 * chem_f / (chem_m + chem_f)

mech_m = sectors["Mechanical engineering"].get("M", 0)
mech_f = sectors["Mechanical engineering"].get("F", 0)
mech_pct = 100 * mech_f / (mech_m + mech_f)

# Claim: "Chemistry leads at 14.6%"
check("Chemistry female pct", 14.6, chem_pct, tolerance=0.3, pct=True)

# Claim: "Mechanical Engineering lowest at 5.4%"
check("Mechanical Eng female pct", 5.4, mech_pct, tolerance=0.3, pct=True)

# -- Gender section trend --
gst = load("chapter5/gender_section_trend.json")

# Claim: "Chemistry... reaching 23.4%"
chem_latest = [r for r in gst if r["section"] == "C"]
chem_latest.sort(key=lambda r: r["period_start"], reverse=True)
check("Chemistry latest period female pct (~23.4%)", 23.4, chem_latest[0]["female_pct"], tolerance=0.5, pct=True)

# Claim: "Female Inventor Shares Range from 8.2% (Fixed Constructions) to 23.4% (Chemistry)"
# This refers to the latest period
e_latest = [r for r in gst if r["section"] == "E"]
e_latest.sort(key=lambda r: r["period_start"], reverse=True)
check("Fixed Constr latest female pct (~8.2%)", 8.2, e_latest[0]["female_pct"], tolerance=0.5, pct=True)

print()

# =====================================================================
# CHAPTER 17: inv-team-size
# =====================================================================
print("=" * 70)
print("CHAPTER 17: Team Size and Collaboration")
print("=" * 70)

# -- Team size per year --
ts = load("chapter5/team_size_per_year.json")
ts_1976 = next(r for r in ts if r["year"] == 1976)
ts_2025 = next(r for r in ts if r["year"] == 2025)

# Claim: "Average team size increased from 1.7 to 3.2"
check("Avg team size 1976", 1.7, ts_1976["avg_team_size"], tolerance=0.1, pct=True)
check("Avg team size 2025", 3.2, ts_2025["avg_team_size"], tolerance=0.1, pct=True)

# Claim: "solo-inventor share fell from 58% to 23%"
check("Solo share 1976 (~58%)", 58, ts_1976["solo_pct"], tolerance=1.0, pct=True)
check("Solo share 2025 (~23%)", 23, ts_2025["solo_pct"], tolerance=1.0, pct=True)

# Claim: "from 2.5% to 21%" (large teams 5+)
check("Large team 1976 (~2.5%)", 2.5, ts_1976["large_team_pct"], tolerance=0.3, pct=True)
check("Large team 2025 (~21%)", 21, ts_2025["large_team_pct"], tolerance=1.0, pct=True)

# -- Quality by team size --
qt = load("computed/quality_by_team_size.json")
qt_solo_2024 = next(r for r in qt if r["year"] == 2024 and r["group"] == "Solo")
qt_7plus_2024 = next(r for r in qt if r["year"] == 2024 and r["group"] == "7+")

# Claim: "Teams of 7+ average 16.7 claims vs. 11.6 for solo"
check("7+ team claims 2024", 16.7, qt_7plus_2024["avg_num_claims"], tolerance=0.5, pct=True)
check("Solo claims 2024", 11.6, qt_solo_2024["avg_num_claims"], tolerance=0.5, pct=True)

# -- Solo by section --
sbs = load("chapter5/solo_inventors_by_section.json")
sec_C = next(r for r in sbs if r["section"] == "C")
sec_E = next(r for r in sbs if r["section"] == "E")

# Claim: "Chemistry (C) lowest at 13%"
check("Section C solo pct (~13%)", 13, sec_C["solo_pct"], tolerance=1.0, pct=True)

# Claim: "Fixed Constructions (E) highest at ~39%"
check("Section E solo pct (~39%)", 39, sec_E["solo_pct"], tolerance=1.0, pct=True)

print()

# =====================================================================
# SUMMARY
# =====================================================================
print("=" * 70)
print(f"SUMMARY: {PASS} PASS, {FAIL} FAIL, {WARN} WARN")
print("=" * 70)

if FAIL > 0:
    print("\nFailed checks require manual review.")
    sys.exit(1)
else:
    print("\nAll checks passed.")
    sys.exit(0)
