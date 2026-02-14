#!/usr/bin/env python3
"""
Company Name Mapping
Generates: company/company_name_mapping.json

Builds a lookup from raw PatentsView disambig_assignee_organization names
(often ALL CAPS with legal suffixes) to clean display names suitable for
charts and tables.  Covers the top 200 assignees by total utility-patent
count (1976-2025).
"""
import sys
import time
import re
import duckdb
from config import (
    PATENT_TSV, ASSIGNEE_TSV, OUTPUT_DIR,
    save_json, timed_msg, tsv_table,
)


def log(msg):
    print(msg, flush=True)


# ── Well-known explicit overrides ─────────────────────────────────────────────
# Keys are the EXACT raw strings from PatentsView g_assignee_disambiguated.
# Values are the clean display names we want in charts.
EXPLICIT_MAP = {
    # ── US Technology ──
    "International Business Machines Corporation": "IBM",
    "Intel Corporation": "Intel",
    "Apple Inc.": "Apple",
    "Google LLC": "Google",
    "Microsoft Corporation": "Microsoft",
    "MICROSOFT TECHNOLOGY LICENSING, LLC": "Microsoft (Licensing)",
    "QUALCOMM Incorporated": "Qualcomm",
    "TEXAS INSTRUMENTS INCORPORATED": "Texas Instruments",
    "Micron Technology, Inc.": "Micron Technology",
    "AMAZON TECHNOLOGIES, INC.": "Amazon",
    "Cisco Technology, Inc.": "Cisco",
    "Xerox Corporation": "Xerox",
    "HEWLETT-PACKARD DEVELOPMENT COMPANY, L.P.": "HP (Development)",
    "Motorola, Inc.": "Motorola",
    "EASTMAN KODAK COMPANY": "Eastman Kodak",
    "AT&T Intellectual Property I, L.P.": "AT&T",
    "HONEYWELL INTERNATIONAL INC.": "Honeywell",
    "Oracle International Corporation": "Oracle",
    "BROADCOM INTERNATIONAL PTE. LTD.": "Broadcom",
    "Advanced Micro Devices, Inc.": "AMD",
    "NVIDIA Corporation": "Nvidia",
    "Adobe Inc.": "Adobe",
    "Raytheon Company": "Raytheon",
    "EMC Corporation": "EMC",
    "Applied Materials, Inc.": "Applied Materials",
    "GLOBALFOUNDRIES U.S. INC.": "GlobalFoundries",
    "Meta Platforms, Inc.": "Meta",
    "Meta Platforms Technologies, LLC": "Meta (Reality Labs)",
    "Tesla, Inc.": "Tesla",
    "CAPITAL ONE SERVICES, LLC": "Capital One",
    "Salesforce, Inc.": "Salesforce",
    "International Business Machines Corp.": "IBM",
    "PayPal, Inc.": "PayPal",

    # ── US Industrial / Conglomerate ──
    "General Electric Company": "General Electric",
    "The Boeing Company": "Boeing",
    "Ford Global Technologies, LLC": "Ford",
    "GM GLOBAL TECHNOLOGY OPERATIONS LLC": "General Motors",
    "UNITED TECHNOLOGIES CORPORATION": "United Technologies",
    "3M Innovative Properties Company": "3M",
    "E.I. DU PONT DE NEMOURS AND COMPANY": "DuPont",
    "The Dow Chemical Company": "Dow Chemical",
    "BASF SE": "BASF",
    "Caterpillar Inc.": "Caterpillar",
    "Emerson Electric Co.": "Emerson Electric",
    "LOCKHEED MARTIN CORPORATION": "Lockheed Martin",
    "Northrop Grumman Systems Corporation": "Northrop Grumman",
    "BAE Systems Information and Electronic Systems Integration Inc.": "BAE Systems",

    # ── US Government ──
    "United States of America as represented by the Secretary of the Air Force": "US Air Force",
    "The United States of America as represented by the Secretary of the Navy": "US Navy",
    "United States of America as represented by the Secretary of the Army": "US Army",
    "The United States of America, as represented by the Secretary, Department of Health and Human Services": "US HHS",
    "United States of America as represented by the Administrator of the National Aeronautics and Space Administration": "NASA",

    # ── US Pharma / Biotech / Medical ──
    "Johnson & Johnson": "Johnson & Johnson",
    "Pfizer Inc.": "Pfizer",
    "Eli Lilly and Company": "Eli Lilly",
    "ELI LILLY AND COMPANY": "Eli Lilly",
    "Abbott Laboratories": "Abbott Labs",
    "Medtronic, Inc.": "Medtronic",
    "Boston Scientific Corporation": "Boston Scientific",
    "Merck Sharp & Dohme LLC": "Merck",
    "MERCK & CO., INC.": "Merck",
    "Bristol-Myers Squibb Company": "Bristol-Myers Squibb",
    "BECTON, DICKINSON AND COMPANY": "Becton Dickinson",
    "Becton, Dickinson and Company": "Becton Dickinson",
    "Procter & Gamble Company": "Procter & Gamble",
    "THE PROCTER & GAMBLE COMPANY": "Procter & Gamble",

    # ── Additional US companies with tricky suffixes ──
    "DEERE & COMPANY": "John Deere",
    "AT&T CORP.": "AT&T",
    "SHELL OIL COMPNY": "Shell",

    # ── Japan ──
    "Canon Kabushiki Kaisha": "Canon",
    "SONY GROUP CORPORATION": "Sony",
    "FUJITSU LIMITED": "Fujitsu",
    "Kabushiki Kaisha Toshiba": "Toshiba",
    "HITACHI, LTD.": "Hitachi",
    "Mitsubishi Electric Corporation": "Mitsubishi Electric",
    "NEC CORPORATION": "NEC",
    "TOYOTA JIDOSHA KABUSHIKI KAISHA": "Toyota",
    "SEIKO EPSON CORPORATION": "Seiko Epson",
    "RICOH COMPANY, LTD.": "Ricoh",
    "HONDA MOTOR CO., LTD.": "Honda",
    "SHARP KABUSHIKI KAISHA": "Sharp",
    "DENSO CORPORATION": "Denso",
    "BROTHER KOGYO KABUSHIKI KAISHA": "Brother Industries",
    "PANASONIC HOLDINGS CORPORATION": "Panasonic",
    "Sumitomo Electric Industries, Ltd.": "Sumitomo Electric",
    "Semiconductor Energy Laboratory Co., Ltd.": "Semiconductor Energy Lab",
    "FUJIFILM Corporation": "Fujifilm",
    "Nikon Corporation": "Nikon",
    "KONICA MINOLTA, INC.": "Konica Minolta",
    "Olympus Corporation": "Olympus",
    "MURATA MANUFACTURING CO., LTD.": "Murata Manufacturing",
    "Mitsubishi Heavy Industries, Ltd.": "Mitsubishi Heavy Industries",
    "Nissan Motor Co., Ltd.": "Nissan",
    "TDK CORPORATION": "TDK",
    "Kyocera Corporation": "Kyocera",
    "FUJI ELECTRIC CO., LTD.": "Fuji Electric",
    "Renesas Electronics Corporation": "Renesas",
    "FANUC CORPORATION": "Fanuc",
    "AISIN CORPORATION": "Aisin",
    "Rohm Co., Ltd.": "Rohm",
    "Mazda Motor Corporation": "Mazda",
    "Daikin Industries, Ltd.": "Daikin",
    "NIPPON STEEL CORPORATION": "Nippon Steel",
    "Shin-Etsu Chemical Co., Ltd.": "Shin-Etsu Chemical",
    "KEYENCE CORPORATION": "Keyence",

    # ── South Korea ──
    "SAMSUNG ELECTRONICS CO., LTD.": "Samsung",
    "LG ELECTRONICS INC.": "LG Electronics",
    "SK hynix Inc.": "SK Hynix",
    "HYUNDAI MOTOR COMPANY": "Hyundai",
    "LG DISPLAY CO., LTD.": "LG Display",
    "SAMSUNG DISPLAY CO., LTD.": "Samsung Display",
    "SAMSUNG SDI CO., LTD.": "Samsung SDI",
    "LG CHEM, LTD.": "LG Chem",
    "KIA CORPORATION": "Kia",
    "Samsung Electro-Mechanics Co., Ltd.": "Samsung Electro-Mechanics",
    "LG ENERGY SOLUTION, LTD.": "LG Energy Solution",

    # ── Taiwan ──
    "TAIWAN SEMICONDUCTOR MANUFACTURING COMPANY LTD.": "TSMC",
    "AU Optronics Corporation": "AU Optronics",
    "HON HAI PRECISION INDUSTRY CO., LTD.": "Hon Hai (Foxconn)",
    "MEDIATEK INC.": "MediaTek",
    "ASUSTeK Computer Inc.": "Asus",

    # ── China ──
    "Huawei Technologies Co., Ltd.": "Huawei",
    "BOE TECHNOLOGY GROUP CO., LTD.": "BOE Technology",
    "LENOVO (SINGAPORE) PTE. LTD.": "Lenovo",
    "ZTE CORPORATION": "ZTE",
    "BAIDU ONLINE NETWORK TECHNOLOGY (BEIJING) CO., LTD.": "Baidu",

    # ── Europe ──
    "Robert Bosch GmbH": "Bosch",
    "Siemens Aktiengesellschaft": "Siemens",
    "Telefonaktiebolaget LM Ericsson (Publ)": "Ericsson",
    "Nokia Technologies Oy": "Nokia",
    "Nokia Corporation": "Nokia (Corp)",
    "Koninklijke Philips Electronics N.V.": "Philips",
    "Koninklijke Philips N.V.": "Philips",
    "STMicroelectronics, Inc.": "STMicroelectronics",
    "ASML Netherlands B.V.": "ASML",
    "SAP SE": "SAP",
    "Bayer Aktiengesellschaft": "Bayer",
    "Infineon Technologies AG": "Infineon",
    "NXP B.V.": "NXP",
    "ABB Schweiz AG": "ABB",
    "Airbus Operations SAS": "Airbus",

    # ── Universities & Research ──
    "The Regents of the University of California": "UC System",
    "Massachusetts Institute of Technology": "MIT",
    "The Board of Trustees of the Leland Stanford Junior University": "Stanford",
    "Wisconsin Alumni Research Foundation": "WARF (Wisconsin)",
    "California Institute of Technology": "Caltech",
    "The Johns Hopkins University": "Johns Hopkins",
    "Georgia Tech Research Corporation": "Georgia Tech",
    "University of Michigan": "U of Michigan",
    "The Trustees of Columbia University in the City of New York": "Columbia University",
    "Cornell University": "Cornell",
    "The University of Texas System": "UT System",
    "Duke University": "Duke",
    "President and Fellows of Harvard College": "Harvard",
    "Yale University": "Yale",
    "Northwestern University": "Northwestern",
    "The Trustees of the University of Pennsylvania": "UPenn",
}


# ── Suffix patterns to strip during auto-cleaning ────────────────────────────
_SUFFIX_PATTERNS = [
    r",?\s+Inc\.?$",
    r",?\s+Corp\.?$",
    r",?\s+Corporation$",
    r",?\s+LLC$",
    r",?\s+L\.?L\.?C\.?$",
    r",?\s+Ltd\.?$",
    r",?\s+LTD\.?$",
    r",?\s+L\.?P\.?$",
    r",?\s+Co\.?$",
    r",?\s+Company$",
    r",?\s+Incorporated$",
    r",?\s+GmbH$",
    r",?\s+AG$",
    r",?\s+S\.?A\.?$",
    r",?\s+S\.?A\.?S\.?$",
    r",?\s+B\.?V\.?$",
    r",?\s+N\.?V\.?$",
    r",?\s+PLC$",
    r",?\s+Pty\.?$",
    r",?\s+Pte\.?$",
    r",?\s+Oy$",
    r",?\s+AB$",
    r",?\s+SE$",
    r",?\s+& Co\.\s*KG$",
]

_SUFFIX_RE = re.compile("|".join(f"({p})" for p in _SUFFIX_PATTERNS), re.IGNORECASE)


def _auto_clean(raw: str) -> str:
    """
    Fallback cleaner for names not in the explicit map.
    Converts ALL CAPS to title case, strips common legal suffixes,
    and tidies up punctuation.
    """
    name = raw.strip()

    # Detect ALL CAPS (or nearly so) and convert to title case
    alpha_chars = [c for c in name if c.isalpha()]
    if alpha_chars and sum(1 for c in alpha_chars if c.isupper()) / len(alpha_chars) > 0.7:
        name = name.title()

    # Strip legal suffixes (may need multiple passes for e.g. "Co., Ltd.")
    for _ in range(3):
        cleaned = _SUFFIX_RE.sub("", name).strip().rstrip(",").strip()
        if cleaned == name:
            break
        name = cleaned

    # Strip trailing " &" or " and" left over after suffix removal
    name = re.sub(r"\s+&\s*$", "", name)
    name = re.sub(r"\s+and\s*$", "", name, flags=re.IGNORECASE)

    # Fix common title-case artifacts
    name = re.sub(r"\bOf\b", "of", name)
    name = re.sub(r"\bThe\b", "the", name)
    name = re.sub(r"\bAnd\b", "and", name)
    name = re.sub(r"\bFor\b", "for", name)
    name = re.sub(r"\bIn\b(?!\w)", "in", name)   # "in" but not "Inc"
    name = re.sub(r"\bDe\b", "de", name)
    name = re.sub(r"\bVon\b", "von", name)

    # Re-capitalize first character
    if name:
        name = name[0].upper() + name[1:]

    # Collapse multiple spaces
    name = re.sub(r"\s+", " ", name).strip()

    return name


# ═══════════════════════════════════════════════════════════════════════════════
# Main
# ═══════════════════════════════════════════════════════════════════════════════

con = duckdb.connect()

# ── 1. Query top 200 assignees by total utility-patent count ──────────────────
timed_msg("Top 200 assignees by utility-patent count (1976-2025)")

t0 = time.time()
rows = con.execute(f"""
    SELECT
        a.disambig_assignee_organization AS organization,
        COUNT(*) AS total_patents
    FROM {PATENT_TSV()} p
    JOIN {ASSIGNEE_TSV()} a
        ON p.patent_id = a.patent_id AND a.assignee_sequence = 0
    WHERE p.patent_date IS NOT NULL
      AND p.patent_type = 'utility'
      AND a.disambig_assignee_organization IS NOT NULL
      AND TRIM(a.disambig_assignee_organization) != ''
      AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 1976 AND 2025
    GROUP BY organization
    ORDER BY total_patents DESC
    LIMIT 200
""").fetchall()
log(f"  Query returned {len(rows)} rows in {time.time()-t0:.1f}s")

# ── 2. Build mapping ─────────────────────────────────────────────────────────
timed_msg("Building company name mapping")

mapping = {}
explicit_hits = 0
auto_cleaned = 0

for raw_name, total_patents in rows:
    if raw_name in EXPLICIT_MAP:
        display = EXPLICIT_MAP[raw_name]
        explicit_hits += 1
    else:
        display = _auto_clean(raw_name)
        auto_cleaned += 1
        log(f"  [auto] {raw_name!r:60s} -> {display!r}")

    mapping[raw_name] = display

log(f"\n  Explicit overrides used: {explicit_hits}")
log(f"  Auto-cleaned names:     {auto_cleaned}")
log(f"  Total mapping entries:   {len(mapping)}")

# ── 3. Save ───────────────────────────────────────────────────────────────────
timed_msg("Saving company_name_mapping.json")

out_path = f"{OUTPUT_DIR}/company/company_name_mapping.json"
save_json(mapping, out_path)

con.close()
log("\n=== 31_company_name_mapping complete ===\n")
