#!/usr/bin/env python3
"""
Batch 7 Deep-Dive B: Verify hardcoded numbers for chapters 29-34
(Cybersecurity, Digital Health, Green Innovation, Quantum Computing, Semiconductors, Space Technology)
"""

import json
import math
from pathlib import Path

DATA = Path("/home/saerom/projects/patentworld/public/data")
results = []

def log(msg):
    results.append(msg)
    print(msg)

def load(path):
    with open(DATA / path) as f:
        return json.load(f)

# ============================================================
#  Helper: Compute CR4 from org_over_time + per_year data
# ============================================================
def compute_cr4(org_over_time, per_year_data, year_key='year', count_key='count', total_key='domain_patents'):
    """Return dict of year -> cr4_pct"""
    py_map = {}
    for d in per_year_data:
        py_map[d[year_key]] = d[total_key]

    years = sorted(set(d[year_key] for d in org_over_time))
    cr4 = {}
    for year in years:
        year_orgs = sorted(
            [d for d in org_over_time if d[year_key] == year],
            key=lambda x: x[count_key], reverse=True
        )
        top4 = sum(d[count_key] for d in year_orgs[:4])
        total = py_map.get(year, 1)
        if total > 0:
            cr4[year] = round(top4 / total * 100, 1)
    return cr4

def compute_velocity(top_assignees):
    """Return dict of decade_label -> velocity"""
    cohorts = {}
    for d in top_assignees:
        dec_start = (d['first_year'] // 10) * 10
        label = f"{dec_start}s"
        if label not in cohorts:
            cohorts[label] = {'count': 0, 'totalPat': 0, 'totalSpan': 0}
        cohorts[label]['count'] += 1
        cohorts[label]['totalPat'] += d['domain_patents']
        cohorts[label]['totalSpan'] += max(1, d['last_year'] - d['first_year'] + 1)

    result = {}
    for label, c in sorted(cohorts.items()):
        if c['count'] >= 3:
            result[label] = round(c['totalPat'] / c['totalSpan'], 1)
    return result

def compute_entropy(by_subfield, subfield_key='subfield'):
    """Return dict of year -> normalized entropy"""
    years = sorted(set(d['year'] for d in by_subfield))
    entropy = {}
    for year in years:
        year_data = [d for d in by_subfield if d['year'] == year and d['count'] > 0]
        total = sum(d['count'] for d in year_data)
        N = len(year_data)
        if total == 0 or N <= 1:
            continue
        H = -sum((d['count']/total) * math.log(d['count']/total) for d in year_data)
        entropy[year] = round(H / math.log(N), 3)
    return entropy


log("=" * 80)
log("BATCH 7 DEEP-DIVE B: DATA ACCURACY AUDIT")
log("=" * 80)

# ============================================================
# 1. CYBERSECURITY (Ch29)
# ============================================================
log("\n" + "=" * 70)
log("CHAPTER 29: CYBERSECURITY")
log("=" * 70)

cyber_oot = load("cyber/cyber_org_over_time.json")
cyber_py = load("cyber/cyber_per_year.json")
cyber_ta = load("cyber/cyber_top_assignees.json")
cyber_sf = load("cyber/cyber_by_subfield.json")

# CR4: "concentration declined from 32.4% to 9.4%"
cyber_cr4 = compute_cr4(cyber_oot, cyber_py)
# The claim says "32.4% in 1980" and "9.4% by 2025"
log("\n--- CR4 Concentration ---")
# Find early high
early_cr4 = {y: v for y, v in cyber_cr4.items() if y <= 1985 and v > 0}
log(f"  Early CR4 values (<=1985): {early_cr4}")
log(f"  CR4 in 1980: {cyber_cr4.get(1980, 'N/A')}")
late_cr4 = {y: v for y, v in cyber_cr4.items() if y >= 2023}
log(f"  Late CR4 values (>=2023): {late_cr4}")
log(f"  CR4 in 2025: {cyber_cr4.get(2025, 'N/A')}")
log(f"  CLAIM: 'declined from 32.4% to 9.4%'")
cr4_1980 = cyber_cr4.get(1980)
cr4_2025 = cyber_cr4.get(2025)
if cr4_1980 is not None and cr4_2025 is not None:
    log(f"  VERDICT: 1980={cr4_1980}% (claim 32.4%), 2025={cr4_2025}% (claim 9.4%) -> {'MATCH' if cr4_1980 == 32.4 and cr4_2025 == 9.4 else 'MISMATCH'}")

# Velocity: "reached 105.8 for 2010s, 1.4-fold over 1970s"
cyber_vel = compute_velocity(cyber_ta)
log("\n--- Entry Velocity ---")
log(f"  Velocity by decade: {cyber_vel}")
vel_2010s = cyber_vel.get('2010s')
vel_1970s = cyber_vel.get('1970s')
log(f"  CLAIM: 'velocity reached 105.8 for 2010s, 1.4-fold over 1970s'")
if vel_2010s is not None and vel_1970s is not None:
    fold = round(vel_2010s / vel_1970s, 1) if vel_1970s > 0 else None
    log(f"  VERDICT: 2010s={vel_2010s} (claim 105.8), 1970s={vel_1970s} (claim ~77.9), fold={fold} (claim 1.4)")
    log(f"  Match 2010s: {'YES' if vel_2010s == 105.8 else 'NO'}, Match fold: {'YES' if fold == 1.4 else 'NO'}")

# Subfield crossover: "network security surpassed cryptography around 2003"
log("\n--- Subfield Crossover ---")
for year in range(2000, 2007):
    crypto = sum(d['count'] for d in cyber_sf if d['year'] == year and 'rypt' in d['subfield'].lower())
    network = sum(d['count'] for d in cyber_sf if d['year'] == year and 'network' in d['subfield'].lower())
    log(f"  {year}: Cryptography={crypto}, Network Security={network}")

# Entropy: "0.83 in 1978 to 0.94 by 2025"
cyber_entropy = compute_entropy(cyber_sf)
log("\n--- Subfield Diversity ---")
early_entropy = {y: v for y, v in cyber_entropy.items() if y <= 1980}
log(f"  Early entropy (<=1980): {early_entropy}")
log(f"  Entropy 1978: {cyber_entropy.get(1978, 'N/A')}")
log(f"  Entropy 2025: {cyber_entropy.get(2025, 'N/A')}")
log(f"  CLAIM: '0.83 in 1978 to 0.94 by 2025'")


# ============================================================
# 2. DIGITAL HEALTH (Ch30)
# ============================================================
log("\n" + "=" * 70)
log("CHAPTER 30: DIGITAL HEALTH")
log("=" * 70)

dh_oot = load("digihealth/digihealth_org_over_time.json")
dh_py = load("digihealth/digihealth_per_year.json")
dh_ta = load("digihealth/digihealth_top_assignees.json")
dh_sf = load("digihealth/digihealth_by_subfield.json")

# Velocity: "jumped 3.4-fold from 22.5 to 77.5"
dh_vel = compute_velocity(dh_ta)
log("\n--- Entry Velocity ---")
log(f"  Velocity by decade: {dh_vel}")
dh_vel_1970s = dh_vel.get('1970s')
dh_vel_2010s = dh_vel.get('2010s')
log(f"  CLAIM: 'velocity jumped 3.4-fold from 22.5 to 77.5'")
if dh_vel_1970s is not None and dh_vel_2010s is not None:
    fold = round(dh_vel_2010s / dh_vel_1970s, 1) if dh_vel_1970s > 0 else None
    log(f"  VERDICT: 1970s={dh_vel_1970s} (claim 22.5), 2010s={dh_vel_2010s} (claim 77.5), fold={fold} (claim 3.4)")

# Top assignees: "Philips 2,909, Medtronic 2,302, Intuitive Surgical 1,994"
log("\n--- Top Assignees ---")
for d in sorted(dh_ta, key=lambda x: x['domain_patents'], reverse=True)[:10]:
    log(f"  {d['organization']}: {d['domain_patents']}")
# Check specific claims
philips_count = sum(d['domain_patents'] for d in dh_ta if 'philips' in d['organization'].lower())
medtronic_count = sum(d['domain_patents'] for d in dh_ta if 'medtronic' in d['organization'].lower())
intuitive_count = sum(d['domain_patents'] for d in dh_ta if 'intuitive' in d['organization'].lower())
log(f"  CLAIM: Philips=2,909, Medtronic=2,302, Intuitive Surgical=1,994")
log(f"  DATA: Philips={philips_count}, Medtronic={medtronic_count}, Intuitive={intuitive_count}")

# Diversity: "rose from 0.48 to 0.92"
dh_entropy = compute_entropy(dh_sf)
log("\n--- Subfield Diversity ---")
early_e = {y: v for y, v in dh_entropy.items() if y <= 1980}
log(f"  Early entropy (<=1980): {early_e}")
log(f"  Entropy 1976: {dh_entropy.get(1976, 'N/A')}")
log(f"  Entropy 2025: {dh_entropy.get(2025, 'N/A')}")
log(f"  CLAIM: 'diversity rose from 0.48 to 0.92'")

# CR4: "Peaked at 12.0% in 2009 Before Declining to 6.8% by 2025"
dh_cr4 = compute_cr4(dh_oot, dh_py)
log("\n--- CR4 Concentration ---")
peak_yr = max(dh_cr4, key=dh_cr4.get)
log(f"  Peak CR4: {peak_yr} = {dh_cr4[peak_yr]}%")
log(f"  CR4 in 2009: {dh_cr4.get(2009, 'N/A')}")
log(f"  CR4 in 2025: {dh_cr4.get(2025, 'N/A')}")
log(f"  CLAIM: 'Peaked at 12.0% in 2009, declined to 6.8% by 2025'")


# ============================================================
# 3. GREEN INNOVATION (Ch31)
# ============================================================
log("\n" + "=" * 70)
log("CHAPTER 31: GREEN INNOVATION")
log("=" * 70)

green_vol = load("green/green_volume.json")
green_oot = load("green/green_org_over_time.json")
green_ta = load("green/green_top_assignees.json")
green_cat = load("green/green_by_category.json")
green_companies = load("green/green_top_companies.json")

# Velocity: "1.8-fold from 68 to 122"
green_vel = compute_velocity(green_ta)
log("\n--- Entry Velocity ---")
log(f"  Velocity by decade: {green_vel}")
gv_1970s = green_vel.get('1970s')
gv_2000s = green_vel.get('2000s')
log(f"  CLAIM: '1.8-fold velocity from 68 to 122'")
if gv_1970s is not None and gv_2000s is not None:
    fold = round(gv_2000s / gv_1970s, 1) if gv_1970s > 0 else None
    log(f"  VERDICT: 1970s={gv_1970s} (claim 68), 2000s={gv_2000s} (claim 122), fold={fold} (claim 1.8)")

# Category counts: "Battery 7,363, EV 5,818, Renewable 3,453 by 2024"
log("\n--- Category Counts for 2024 ---")
cats_2024 = {d['category']: d['count'] for d in green_cat if d['year'] == 2024}
log(f"  All categories in 2024: {cats_2024}")
# Look for battery/storage, transport/EV, renewable
for cat, count in sorted(cats_2024.items(), key=lambda x: x[1], reverse=True):
    log(f"    {cat}: {count}")
log(f"  CLAIM: 'Battery 7,363, EV 5,818, Renewable 3,453 by 2024'")

# Top companies: "Samsung 13,771, Toyota 12,636, GE 10,812"
log("\n--- Top Companies ---")
# Deduplicate
company_totals = {}
for d in green_companies:
    org = d['organization']
    if org not in company_totals:
        company_totals[org] = d['total_green']
for org, total in sorted(company_totals.items(), key=lambda x: x[1], reverse=True)[:10]:
    log(f"  {org}: {total}")
log(f"  CLAIM: Samsung=13,771, Toyota=12,636, GE=10,812")

# CR4: "Peaked at 10.7% in 2011 Before Declining to 5.7% by 2025"
green_cr4 = compute_cr4(green_oot, green_vol, total_key='green_count')
log("\n--- CR4 Concentration ---")
if green_cr4:
    peak_yr = max(green_cr4, key=green_cr4.get)
    log(f"  Peak CR4: {peak_yr} = {green_cr4[peak_yr]}%")
    log(f"  CR4 in 2011: {green_cr4.get(2011, 'N/A')}")
    log(f"  CR4 in 2025: {green_cr4.get(2025, 'N/A')}")
log(f"  CLAIM: 'Peaked at 10.7% in 2011, declined to 5.7% by 2025'")


# ============================================================
# 4. QUANTUM COMPUTING (Ch32)
# ============================================================
log("\n" + "=" * 70)
log("CHAPTER 32: QUANTUM COMPUTING")
log("=" * 70)

quantum_oot = load("quantum/quantum_org_over_time.json")
quantum_py = load("quantum/quantum_per_year.json")
quantum_ta = load("quantum/quantum_top_assignees.json")
quantum_sf = load("quantum/quantum_by_subfield.json")

# CR4: "top four holding 28.4% in 2025, down from 76.9% in 2003"
quantum_cr4 = compute_cr4(quantum_oot, quantum_py)
log("\n--- CR4 Concentration ---")
log(f"  CR4 in 2003: {quantum_cr4.get(2003, 'N/A')}")
log(f"  CR4 in 2025: {quantum_cr4.get(2025, 'N/A')}")
log(f"  CLAIM: 'top four holding 28.4% in 2025, down from 76.9% in 2003'")

# Entropy: "0.78 in 2006 to 0.95 by 2025"
quantum_entropy = compute_entropy(quantum_sf)
log("\n--- Subfield Diversity ---")
log(f"  Entropy 2006: {quantum_entropy.get(2006, 'N/A')}")
log(f"  Entropy 2025: {quantum_entropy.get(2025, 'N/A')}")
log(f"  CLAIM: '0.78 in 2006 to 0.95 by 2025'")

# Velocity: "2020s Entrants Average 6.0 Patents per Year, Similar to 2010s Entrants at 5.9"
quantum_vel = compute_velocity(quantum_ta)
log("\n--- Entry Velocity ---")
log(f"  Velocity by decade: {quantum_vel}")
log(f"  CLAIM: '2020s at 6.0, 2010s at 5.9'")


# ============================================================
# 5. SEMICONDUCTORS (Ch33)
# ============================================================
log("\n" + "=" * 70)
log("CHAPTER 33: SEMICONDUCTORS")
log("=" * 70)

semi_oot = load("semiconductors/semi_org_over_time.json")
semi_py = load("semiconductors/semi_per_year.json")
semi_ta = load("semiconductors/semi_top_assignees.json")
semi_sf = load("semiconductors/semi_by_subfield.json")

# CR4: "11.3% in 1977 to 32.6% in 2023"
semi_cr4 = compute_cr4(semi_oot, semi_py)
log("\n--- CR4 Concentration ---")
log(f"  CR4 in 1977: {semi_cr4.get(1977, 'N/A')}")
log(f"  CR4 in 2023: {semi_cr4.get(2023, 'N/A')}")
early_vals = {y: v for y, v in semi_cr4.items() if y <= 1980}
log(f"  Early CR4 (<=1980): {early_vals}")
log(f"  CLAIM: '11.3% in 1977 to 32.6% in 2023'")

# Velocity: "entry velocity plateaued at 197"
semi_vel = compute_velocity(semi_ta)
log("\n--- Entry Velocity ---")
log(f"  Velocity by decade: {semi_vel}")
log(f"  CLAIM: 'entry velocity plateaued at 197'")


# ============================================================
# 6. SPACE TECHNOLOGY (Ch34)
# ============================================================
log("\n" + "=" * 70)
log("CHAPTER 34: SPACE TECHNOLOGY")
log("=" * 70)

space_oot = load("space/space_org_over_time.json")
space_py = load("space/space_per_year.json")
space_ta = load("space/space_top_assignees.json")
space_sf = load("space/space_by_subfield.json")

# CR4: "fluctuated between 4.9% and 36.7%"
space_cr4 = compute_cr4(space_oot, space_py)
log("\n--- CR4 Concentration ---")
if space_cr4:
    min_cr4 = min(v for v in space_cr4.values() if v > 0)
    max_cr4 = max(space_cr4.values())
    min_yr = [y for y, v in space_cr4.items() if v == min_cr4][0]
    max_yr = [y for y, v in space_cr4.items() if v == max_cr4][0]
    log(f"  Min CR4: {min_yr} = {min_cr4}%")
    log(f"  Max CR4: {max_yr} = {max_cr4}%")
    log(f"  CLAIM: 'fluctuated between 4.9% and 36.7%'")


# ============================================================
# CROSS-DOMAIN SUPERLATIVE VERIFICATION
# ============================================================
log("\n" + "=" * 80)
log("CROSS-DOMAIN SUPERLATIVE VERIFICATION")
log("=" * 80)

# Load ALL 12 domains' data for cross-comparison
# We need org_over_time and per_year for each domain

# List all domain directories with their data file patterns
domains_config = {
    'AI': ('chapter19/ai_org_over_time.json', 'chapter19/ai_per_year.json', 'chapter19/ai_top_assignees.json'),
    'Biotech': ('biotech/biotech_org_over_time.json', 'biotech/biotech_per_year.json', 'biotech/biotech_top_assignees.json'),
    'Blockchain': ('blockchain/blockchain_org_over_time.json', 'blockchain/blockchain_per_year.json', 'blockchain/blockchain_top_assignees.json'),
    'Cyber': ('cyber/cyber_org_over_time.json', 'cyber/cyber_per_year.json', 'cyber/cyber_top_assignees.json'),
    'DigiHealth': ('digihealth/digihealth_org_over_time.json', 'digihealth/digihealth_per_year.json', 'digihealth/digihealth_top_assignees.json'),
    'Green': ('green/green_org_over_time.json', 'green/green_volume.json', 'green/green_top_assignees.json'),
    'Quantum': ('quantum/quantum_org_over_time.json', 'quantum/quantum_per_year.json', 'quantum/quantum_top_assignees.json'),
    'Semiconductor': ('semiconductors/semi_org_over_time.json', 'semiconductors/semi_per_year.json', 'semiconductors/semi_top_assignees.json'),
    'Space': ('space/space_org_over_time.json', 'space/space_per_year.json', 'space/space_top_assignees.json'),
    '3DPrint': ('3dprint/3dprint_org_over_time.json', '3dprint/3dprint_per_year.json', '3dprint/3dprint_top_assignees.json'),
    'AgTech': ('agtech/agtech_org_over_time.json', 'agtech/agtech_per_year.json', 'agtech/agtech_top_assignees.json'),
    'AV': ('av/av_org_over_time.json', 'av/av_per_year.json', 'av/av_top_assignees.json'),
}

# Compute CR4 for all domains
all_cr4 = {}
all_cr4_recent = {}  # Most recent year
all_cr4_ranges = {}  # (min, max) range

for domain, (oot_file, py_file, ta_file) in domains_config.items():
    try:
        oot = load(oot_file)
        py = load(py_file)
        total_key = 'green_count' if domain == 'Green' else 'domain_patents'
        cr4 = compute_cr4(oot, py, total_key=total_key)
        if cr4:
            all_cr4[domain] = cr4
            # Most recent year
            max_yr = max(cr4.keys())
            all_cr4_recent[domain] = (max_yr, cr4[max_yr])
            # Range (excluding zero)
            nonzero = [v for v in cr4.values() if v > 0]
            if nonzero:
                all_cr4_ranges[domain] = (min(nonzero), max(nonzero), max(nonzero) - min(nonzero))
    except Exception as e:
        log(f"  WARNING: Could not load {domain}: {e}")

# SUPERLATIVE 1: "Quantum computing remains the most concentrated"
log("\n--- SUPERLATIVE: 'Quantum computing remains the most concentrated' ---")
log("  Most recent CR4 by domain:")
for domain, (yr, val) in sorted(all_cr4_recent.items(), key=lambda x: x[1][1], reverse=True):
    log(f"    {domain}: {val}% (year {yr})")
most_concentrated = max(all_cr4_recent, key=lambda x: all_cr4_recent[x][1])
log(f"  VERDICT: Most concentrated = {most_concentrated} at {all_cr4_recent[most_concentrated][1]}%")
log(f"  CLAIM matches: {'YES' if most_concentrated == 'Quantum' else 'NO - ' + most_concentrated + ' is more concentrated'}")

# SUPERLATIVE 2: "Semiconductors — the only domain showing sustained consolidation (rising CR4)"
log("\n--- SUPERLATIVE: 'Semiconductors — only domain with sustained consolidation' ---")
log("  CR4 trend (early vs recent) by domain:")
for domain, cr4 in all_cr4.items():
    years = sorted(cr4.keys())
    if len(years) < 10:
        continue
    early_avg = sum(cr4[y] for y in years[:5]) / 5
    recent_avg = sum(cr4[y] for y in years[-5:]) / 5
    change = recent_avg - early_avg
    direction = "RISING" if change > 2 else ("FALLING" if change < -2 else "STABLE")
    log(f"    {domain}: early_avg={early_avg:.1f}%, recent_avg={recent_avg:.1f}%, change={change:+.1f}% ({direction})")

# SUPERLATIVE 3: "Space technology — widest range among all domains"
log("\n--- SUPERLATIVE: 'Space technology — widest range among all domains' ---")
log("  CR4 range by domain:")
for domain, (mn, mx, rng) in sorted(all_cr4_ranges.items(), key=lambda x: x[1][2], reverse=True):
    log(f"    {domain}: min={mn}%, max={mx}%, range={rng:.1f}%")
widest = max(all_cr4_ranges, key=lambda x: all_cr4_ranges[x][2])
log(f"  VERDICT: Widest range = {widest} at {all_cr4_ranges[widest][2]:.1f}%")
log(f"  CLAIM matches: {'YES' if widest == 'Space' else 'NO - ' + widest + ' has wider range'}")

# SUPERLATIVE 4: "Quantum — only domain where early entrants patent faster"
log("\n--- SUPERLATIVE: 'Quantum — only domain where early entrants patent faster' ---")
all_velocities = {}
for domain, (oot_file, py_file, ta_file) in domains_config.items():
    try:
        ta = load(ta_file)
        vel = compute_velocity(ta)
        all_velocities[domain] = vel
    except:
        pass

log("  Velocity trends by domain:")
for domain, vel in all_velocities.items():
    decades = sorted(vel.keys())
    if len(decades) >= 2:
        first_val = vel[decades[0]]
        last_val = vel[decades[-1]]
        direction = "EARLY FASTER" if first_val > last_val else "LATER FASTER"
        log(f"    {domain}: {decades[0]}={first_val}, {decades[-1]}={last_val} -> {direction}")

# The claim says early entrants (1990s) at 11.0 were excluded from cohort analysis but are faster
# Let's check unfiltered
log("\n  Quantum unfiltered velocity (including <3 org cohorts):")
quantum_cohorts_all = {}
for d in quantum_ta:
    dec_start = (d['first_year'] // 10) * 10
    label = f"{dec_start}s"
    if label not in quantum_cohorts_all:
        quantum_cohorts_all[label] = {'count': 0, 'totalPat': 0, 'totalSpan': 0}
    quantum_cohorts_all[label]['count'] += 1
    quantum_cohorts_all[label]['totalPat'] += d['domain_patents']
    quantum_cohorts_all[label]['totalSpan'] += max(1, d['last_year'] - d['first_year'] + 1)
for label, c in sorted(quantum_cohorts_all.items()):
    vel = round(c['totalPat'] / c['totalSpan'], 1) if c['totalSpan'] > 0 else 0
    log(f"    {label}: velocity={vel}, n_orgs={c['count']}")

# SUPERLATIVE 5: "Biotechnology achieved the lowest top-four concentration" (check if mentioned)
log("\n--- SUPERLATIVE: 'Biotechnology achieved the lowest top-four concentration' ---")
# Find biotech's most recent CR4
if 'Biotech' in all_cr4_recent:
    log(f"  Biotech recent CR4: {all_cr4_recent['Biotech']}")
    # Find minimum
    min_domain = min(all_cr4_recent, key=lambda x: all_cr4_recent[x][1])
    log(f"  Lowest recent CR4: {min_domain} at {all_cr4_recent[min_domain][1]}%")
    log(f"  CLAIM matches: {'YES' if min_domain == 'Biotech' else 'NO - ' + min_domain + ' is lower'}")


# ============================================================
# ADDITIONAL SPECIFIC NUMBER VERIFICATION
# ============================================================
log("\n" + "=" * 80)
log("ADDITIONAL NUMBER VERIFICATION")
log("=" * 80)

# Green: total green patents and peak
log("\n--- Green Total and Peak ---")
total_green = sum(d['green_count'] for d in green_vol)
peak = max(green_vol, key=lambda x: x['green_count'])
log(f"  Total green patents: {total_green}")
log(f"  Peak year: {peak['year']} with {peak['green_count']} patents, {peak.get('green_pct', 'N/A')}%")
log(f"  CLAIM (dynamic): 'total {total_green}, peak at {peak[\"green_count\"]} in {peak[\"year\"]}'")

# Green AI trend: "41 in 2010 to 1,238 in 2023"
green_ai = load("green/green_ai_trend.json")
ai_2010 = next((d['green_ai_count'] for d in green_ai if d['year'] == 2010), None)
ai_2023 = next((d['green_ai_count'] for d in green_ai if d['year'] == 2023), None)
log(f"\n--- Green AI Trend ---")
log(f"  2010: {ai_2010} (claim 41)")
log(f"  2023: {ai_2023} (claim 1,238)")
if ai_2010 and ai_2023:
    fold = round(ai_2023 / ai_2010, 0) if ai_2010 > 0 else None
    log(f"  Fold increase: {fold}x (claim 30x)")

# Cyber: Filing peak "18,090 in 2019", Grant peak "17,323 in 2022"
log("\n--- Cyber Filing vs Grant ---")
cyber_fvg = load("act6/act6_domain_filing_vs_grant.json")
cyber_filings = {d['year']: d['count'] for d in cyber_fvg if d['domain'] == 'Cyber' and d['series'] == 'filing_year'}
cyber_grants = {d['year']: d['count'] for d in cyber_fvg if d['domain'] == 'Cyber' and d['series'] == 'grant_year'}
if cyber_filings:
    f_peak_yr = max(cyber_filings, key=cyber_filings.get)
    log(f"  Filing peak: {f_peak_yr} = {cyber_filings[f_peak_yr]} (claim: 2019 = 18,090)")
if cyber_grants:
    g_peak_yr = max(cyber_grants, key=cyber_grants.get)
    log(f"  Grant peak: {g_peak_yr} = {cyber_grants[g_peak_yr]} (claim: 2022 = 17,323)")

# DigiHealth: Filing peak "11,827 in 2019", Grant peak "12,766 in 2024"
log("\n--- DigiHealth Filing vs Grant ---")
dh_filings = {d['year']: d['count'] for d in cyber_fvg if d['domain'] == 'DigiHealth' and d['series'] == 'filing_year'}
dh_grants = {d['year']: d['count'] for d in cyber_fvg if d['domain'] == 'DigiHealth' and d['series'] == 'grant_year'}
if dh_filings:
    f_peak_yr = max(dh_filings, key=dh_filings.get)
    log(f"  Filing peak: {f_peak_yr} = {dh_filings[f_peak_yr]} (claim: 2019 = 11,827)")
if dh_grants:
    g_peak_yr = max(dh_grants, key=dh_grants.get)
    log(f"  Grant peak: {g_peak_yr} = {dh_grants[g_peak_yr]} (claim: 2024 = 12,766)")

# Green: Filing peak, Grant peak
log("\n--- Green Filing vs Grant ---")
green_filings = {d['year']: d['count'] for d in cyber_fvg if d['domain'] == 'Green' and d['series'] == 'filing_year'}
green_grants = {d['year']: d['count'] for d in cyber_fvg if d['domain'] == 'Green' and d['series'] == 'grant_year'}
if green_filings:
    f_peak_yr = max(green_filings, key=green_filings.get)
    log(f"  Filing peak: {f_peak_yr} = {green_filings[f_peak_yr]} (claim: 2019 = 34,133)")
if green_grants:
    g_peak_yr = max(green_grants, key=green_grants.get)
    log(f"  Grant peak: {g_peak_yr} = {green_grants[g_peak_yr]} (claim: 2019 = 35,693)")

# Quantum: Filing peak "579 in 2021", Grant peak "660 in 2024"
log("\n--- Quantum Filing vs Grant ---")
q_filings = {d['year']: d['count'] for d in cyber_fvg if d['domain'] == 'Quantum' and d['series'] == 'filing_year'}
q_grants = {d['year']: d['count'] for d in cyber_fvg if d['domain'] == 'Quantum' and d['series'] == 'grant_year'}
if q_filings:
    f_peak_yr = max(q_filings, key=q_filings.get)
    log(f"  Filing peak: {f_peak_yr} = {q_filings[f_peak_yr]} (claim: 2021 = 579)")
if q_grants:
    g_peak_yr = max(q_grants, key=q_grants.get)
    log(f"  Grant peak: {g_peak_yr} = {q_grants[g_peak_yr]} (claim: 2024 = 660)")

# Semi: Filing peak "24,463 in 2019", Grant peak "22,511 in 2020"
log("\n--- Semiconductor Filing vs Grant ---")
s_filings = {d['year']: d['count'] for d in cyber_fvg if d['domain'] == 'Semiconductor' and d['series'] == 'filing_year'}
s_grants = {d['year']: d['count'] for d in cyber_fvg if d['domain'] == 'Semiconductor' and d['series'] == 'grant_year'}
if s_filings:
    f_peak_yr = max(s_filings, key=s_filings.get)
    log(f"  Filing peak: {f_peak_yr} = {s_filings[f_peak_yr]} (claim: 2019 = 24,463)")
if s_grants:
    g_peak_yr = max(s_grants, key=s_grants.get)
    log(f"  Grant peak: {g_peak_yr} = {s_grants[g_peak_yr]} (claim: 2020 = 22,511)")

# Space: Filing peak "977 in 2020", Grant peak "1,069 in 2024"
log("\n--- Space Filing vs Grant ---")
sp_filings = {d['year']: d['count'] for d in cyber_fvg if d['domain'] == 'Space' and d['series'] == 'filing_year'}
sp_grants = {d['year']: d['count'] for d in cyber_fvg if d['domain'] == 'Space' and d['series'] == 'grant_year'}
if sp_filings:
    f_peak_yr = max(sp_filings, key=sp_filings.get)
    log(f"  Filing peak: {f_peak_yr} = {sp_filings[f_peak_yr]} (claim: 2020 = 977)")
if sp_grants:
    g_peak_yr = max(sp_grants, key=sp_grants.get)
    log(f"  Grant peak: {g_peak_yr} = {sp_grants[g_peak_yr]} (claim: 2024 = 1,069)")

# South Korea green growth: "174 in 2005 to 2,989 by 2024"
log("\n--- South Korea Green Patent Growth ---")
green_country = load("green/green_by_country.json")
sk_2005 = sum(d['count'] for d in green_country if d['country'] == 'South Korea' and d['year'] == 2005)
sk_2024 = sum(d['count'] for d in green_country if d['country'] == 'South Korea' and d['year'] == 2024)
jp_2024 = sum(d['count'] for d in green_country if d['country'] == 'Japan' and d['year'] == 2024)
log(f"  South Korea 2005: {sk_2005} (claim 174)")
log(f"  South Korea 2024: {sk_2024} (claim 2,989)")
log(f"  Japan 2024: {jp_2024} (claim 4,455)")
if jp_2024 > 0:
    pct = round(sk_2024 / jp_2024 * 100, 0)
    log(f"  SK as % of Japan: {pct}% (claim 67%)")

# Green: Hyundai count
log("\n--- Green Hyundai Check ---")
hyundai = [d for d in green_companies if 'hyundai' in d['organization'].lower()]
if hyundai:
    log(f"  Hyundai total_green: {hyundai[0]['total_green']} (claim 4,888)")

# Green: Honda count
honda = [d for d in green_companies if 'honda' in d['organization'].lower()]
if honda:
    log(f"  Honda total_green: {honda[0]['total_green']} (claim 5,807)")

# Green: Ford count
ford = [d for d in green_companies if d['organization'].lower().startswith('ford')]
if ford:
    log(f"  Ford total_green: {ford[0]['total_green']} (claim 7,383)")


# ============================================================
# SUMMARY
# ============================================================
log("\n" + "=" * 80)
log("SUMMARY OF FINDINGS")
log("=" * 80)

# Write output
output_path = Path("/home/saerom/projects/patentworld/audit/results/batch7_deepdive_b.md")
with open(output_path, 'w') as f:
    f.write("\n".join(results))

print(f"\nResults written to {output_path}")
