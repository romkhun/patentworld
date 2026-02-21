#!/usr/bin/env python3
"""
Cross-Domain Comparison Script (§1.6.18)
Computes key metrics for ALL 12 Deep Dive domains from computed JSON data.
Verifies: top-4 concentration, entry velocity, subfield diversity, patent velocity,
cohort boundaries, and superlative claims.

Required by: audit.md §1.6.18
"""

import json
import math
from pathlib import Path

DATA = Path("/home/saerom/projects/patentworld/public/data")

# (display_name, data_dir, file_prefix)
DOMAINS = [
    ("3D Printing", "3dprint", "3dprint"),
    ("Agricultural Technology", "agtech", "agtech"),
    ("AI Patents", "chapter11", "ai"),  # per_year is ai_patents_per_year.json
    ("Autonomous Vehicles", "av", "av"),
    ("Biotechnology", "biotech", "biotech"),
    ("Blockchain", "blockchain", "blockchain"),
    ("Cybersecurity", "cyber", "cyber"),
    ("Digital Health", "digihealth", "digihealth"),
    ("Green Innovation", "green", "green"),
    ("Quantum Computing", "quantum", "quantum"),
    ("Semiconductors", "semiconductors", "semi"),
    ("Space Technology", "space", "space"),
]

results = []


def log(msg):
    results.append(msg)
    print(msg)


def load(path):
    with open(DATA / path) as f:
        return json.load(f)


# ============================================================
#  1. Top-4 Concentration (CR4) — Latest Year for All Domains
# ============================================================
log("=" * 70)
log("1. TOP-4 CONCENTRATION (CR4) — LATEST YEAR")
log("=" * 70)

cr4_latest = []
for name, data_dir, prefix in DOMAINS:
    try:
        org_data = load(f"{data_dir}/{prefix}_org_over_time.json")
        # AI has a different per_year filename
        try:
            per_year = load(f"{data_dir}/{prefix}_per_year.json")
        except FileNotFoundError:
            per_year = load(f"{data_dir}/{prefix}_patents_per_year.json")

        # Build year -> total map
        py_map = {}
        for d in per_year:
            yr = d.get("year") or d.get("grant_year")
            total = d.get("domain_patents") or d.get(f"{prefix}_patents") or d.get("count") or d.get("total")
            if yr and total:
                py_map[yr] = total

        # Find latest year with data
        years = sorted(set(d.get("year") or d.get("grant_year") for d in org_data if d.get("year") or d.get("grant_year")))
        if not years:
            log(f"  {name}: NO YEAR DATA")
            continue

        latest = years[-1]
        year_orgs = sorted(
            [d for d in org_data if (d.get("year") or d.get("grant_year")) == latest],
            key=lambda x: x.get("count", 0), reverse=True,
        )
        top4 = sum(d.get("count", 0) for d in year_orgs[:4])
        total = py_map.get(latest, 1)
        cr4_pct = round(top4 / total * 100, 1) if total > 0 else 0.0
        cr4_latest.append((name, latest, cr4_pct))
    except FileNotFoundError:
        log(f"  {name}: DATA FILE NOT FOUND")

cr4_latest.sort(key=lambda x: x[2], reverse=True)
log(f"\n{'Domain':<30} {'Year':<6} {'CR4 (%)':<8}")
log("-" * 50)
for name, yr, cr4 in cr4_latest:
    log(f"{name:<30} {yr:<6} {cr4:<8.1f}")

# ============================================================
#  2. Subfield Diversity (Normalized Entropy) — Latest Period
# ============================================================
log("\n" + "=" * 70)
log("2. SUBFIELD DIVERSITY (NORMALIZED ENTROPY) — LATEST PERIOD")
log("=" * 70)

diversity_latest = []
for name, data_dir, prefix in DOMAINS:
    try:
        div_data = load(f"{data_dir}/{prefix}_by_subfield.json")
        if div_data:
            latest = max(div_data, key=lambda d: d.get("year") or d.get("period_end") or 0)
            val = latest.get("entropy") or latest.get("normalized_entropy") or latest.get("diversity")
            yr = latest.get("year") or latest.get("period_end")
            if val is not None:
                diversity_latest.append((name, yr, val))
    except FileNotFoundError:
        pass

diversity_latest.sort(key=lambda x: x[2], reverse=True)
log(f"\n{'Domain':<30} {'Year':<6} {'Diversity':<10}")
log("-" * 50)
for name, yr, div in diversity_latest:
    log(f"{name:<30} {yr:<6} {div:<10.3f}")

# ============================================================
#  3. Entry Velocity by Cohort — All Domains
# ============================================================
log("\n" + "=" * 70)
log("3. ENTRY VELOCITY BY COHORT")
log("=" * 70)

for name, data_dir, prefix in DOMAINS:
    try:
        top_data = load(f"{data_dir}/{prefix}_entrant_incumbent.json")
        cohorts = {}
        for d in top_data:
            fy = d.get("first_year")
            vel = d.get("velocity") or d.get("patents_per_year")
            if fy and vel:
                dec_start = (fy // 10) * 10
                label = f"{dec_start}s"
                if label not in cohorts:
                    cohorts[label] = []
                cohorts[label].append(vel)

        if cohorts:
            log(f"\n  {name}:")
            for decade in sorted(cohorts.keys()):
                vals = cohorts[decade]
                avg = sum(vals) / len(vals)
                log(f"    {decade}: avg velocity = {avg:.1f} ({len(vals)} orgs)")
    except FileNotFoundError:
        pass

# ============================================================
#  4. Cross-Domain Summary from act6_comparison.json
# ============================================================
log("\n" + "=" * 70)
log("4. CROSS-DOMAIN SUMMARY (act6_comparison.json)")
log("=" * 70)

try:
    act6 = load("act6/act6_comparison.json")
    log(f"\n{'Domain':<25} {'Total':<10} {'Recent 5yr':<12} {'CAGR':<8} {'Avg Cites':<10} {'Avg Claims':<10}")
    log("-" * 80)
    for d in sorted(act6, key=lambda x: x["total_patents"], reverse=True):
        log(
            f"{d['domain']:<25} {d['total_patents']:<10,} {d['recent_5yr']:<12,} "
            f"{d['cagr_5yr']:<8.1%} {d['mean_citations']:<10.1f} {d['mean_claims']:<10.1f}"
        )
except FileNotFoundError:
    log("  act6_comparison.json NOT FOUND")

# ============================================================
#  5. Superlative Verification
# ============================================================
log("\n" + "=" * 70)
log("5. SUPERLATIVE VERIFICATION")
log("=" * 70)

if cr4_latest:
    highest = cr4_latest[0]
    lowest = cr4_latest[-1]
    log(f"\n  Highest CR4: {highest[0]} at {highest[2]:.1f}% ({highest[1]})")
    log(f"  Lowest CR4:  {lowest[0]} at {lowest[2]:.1f}% ({lowest[1]})")

    # Check "Quantum computing among the most concentrated alongside agricultural technology"
    quantum_cr4 = next((x for x in cr4_latest if "Quantum" in x[0]), None)
    agtech_cr4 = next((x for x in cr4_latest if "Agricultural" in x[0]), None)
    semi_cr4 = next((x for x in cr4_latest if "Semiconductor" in x[0]), None)
    if quantum_cr4 and agtech_cr4:
        log(f"\n  Quantum CR4: {quantum_cr4[2]:.1f}%")
        log(f"  AgTech CR4:  {agtech_cr4[2]:.1f}%")
        if semi_cr4:
            log(f"  Semi CR4:    {semi_cr4[2]:.1f}%")

    # Check "Biotechnology achieved the lowest top-four concentration"
    biotech_cr4 = next((x for x in cr4_latest if "Biotech" in x[0]), None)
    if biotech_cr4:
        is_lowest = biotech_cr4 == cr4_latest[-1]
        log(f"\n  Biotech CR4: {biotech_cr4[2]:.1f}% — {'IS' if is_lowest else 'IS NOT'} the lowest")

# ============================================================
#  6. CR4 Trend (Concentration Trajectory)
# ============================================================
log("\n" + "=" * 70)
log("6. CR4 TREND — EARLY vs. LATEST (Level vs. Trend Distinction)")
log("=" * 70)

for name, data_dir, prefix in DOMAINS:
    try:
        org_data = load(f"{data_dir}/{prefix}_org_over_time.json")
        try:
            per_year = load(f"{data_dir}/{prefix}_per_year.json")
        except FileNotFoundError:
            per_year = load(f"{data_dir}/{prefix}_patents_per_year.json")

        py_map = {}
        for d in per_year:
            yr = d.get("year") or d.get("grant_year")
            total = d.get("domain_patents") or d.get(f"{prefix}_patents") or d.get("count") or d.get("total")
            if yr and total:
                py_map[yr] = total

        years = sorted(set(d.get("year") or d.get("grant_year") for d in org_data if d.get("year") or d.get("grant_year")))
        if len(years) < 2:
            continue

        def cr4_for_year(y):
            year_orgs = sorted(
                [d for d in org_data if (d.get("year") or d.get("grant_year")) == y],
                key=lambda x: x.get("count", 0), reverse=True,
            )
            top4 = sum(d.get("count", 0) for d in year_orgs[:4])
            total = py_map.get(y, 1)
            return round(top4 / total * 100, 1) if total > 0 else 0.0

        early = cr4_for_year(years[0])
        latest = cr4_for_year(years[-1])
        direction = "RISING" if latest > early else "FALLING" if latest < early else "STABLE"
        log(f"  {name:<30} {years[0]}: {early:5.1f}% → {years[-1]}: {latest:5.1f}% ({direction}, Δ={latest - early:+.1f}pp)")
    except FileNotFoundError:
        pass

# ============================================================
#  Write Results
# ============================================================
output_path = Path("/home/saerom/projects/patentworld/audit/cross-domain-results.md")
with open(output_path, "w") as f:
    f.write("# Cross-Domain Comparison Results\n\n")
    f.write(f"Generated by: audit/verification-scripts/cross-domain-comparison.py\n\n")
    f.write("```\n")
    f.write("\n".join(results))
    f.write("\n```\n")

log(f"\n\nResults written to {output_path}")
log("CROSS-DOMAIN COMPARISON COMPLETE.")
