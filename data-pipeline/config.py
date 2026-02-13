"""
PatentWorld Data Pipeline - Configuration

DuckDB cannot read these zip files directly (sniffing fails).
Strategy: unzip each needed file to /tmp/patentview/ on first use, then read the raw TSV.
"""
import os
import subprocess
import time
import orjson

# ── Paths ──────────────────────────────────────────────────────────────────────
DATA_DIR = "/media/saerom/saerom-ssd/Dropbox (Penn)/Research/PatentsView"
OUTPUT_DIR = "/home/saerom/projects/patentworld/public/data"
TEMP_DIR = "/tmp/patentview"

os.makedirs(TEMP_DIR, exist_ok=True)


def _tsv_path(name: str) -> str:
    """Return path to unzipped TSV, extracting from zip if needed."""
    tsv_path = os.path.join(TEMP_DIR, f"{name}.tsv")
    zip_path = os.path.join(DATA_DIR, f"{name}.tsv.zip")
    if not os.path.exists(tsv_path):
        print(f"  Extracting {name}.tsv.zip -> {tsv_path} ...")
        t0 = time.time()
        subprocess.run(
            ["unzip", "-o", "-d", TEMP_DIR, zip_path],
            check=True, capture_output=True,
        )
        elapsed = time.time() - t0
        size_mb = os.path.getsize(tsv_path) / (1024 * 1024)
        print(f"  Extracted in {elapsed:.1f}s ({size_mb:,.0f} MB)")
    return tsv_path


def tsv_table(name: str) -> str:
    """Return a DuckDB read_csv expression for the given table name."""
    path = _tsv_path(name)
    # Force patent_id to VARCHAR to avoid INT64 detection issues (e.g., RE32443)
    return f"read_csv_auto('{path}', delim='\\t', quote='\"', header=true, ignore_errors=true, max_line_size=10000000, types={{'patent_id': 'VARCHAR'}})"


# ── Shorthand table references (call these to get the read_csv expression) ──
def PATENT_TSV(): return tsv_table("g_patent")
def APPLICATION_TSV(): return tsv_table("g_application")
def CPC_CURRENT_TSV(): return tsv_table("g_cpc_current")
def CPC_TITLE_TSV(): return tsv_table("g_cpc_title")
def WIPO_TSV(): return tsv_table("g_wipo_technology")
def ASSIGNEE_TSV(): return tsv_table("g_assignee_disambiguated")
def INVENTOR_TSV(): return tsv_table("g_inventor_disambiguated")
def LOCATION_TSV(): return tsv_table("g_location_disambiguated")
def CITATION_TSV(): return tsv_table("g_us_patent_citation")
def FOREIGN_CITATION_TSV(): return tsv_table("g_foreign_citation")
def GOV_INTEREST_TSV(): return tsv_table("g_gov_interest")
def GOV_INTEREST_ORG_TSV(): return tsv_table("g_gov_interest_org")

# ── CPC Section Names ─────────────────────────────────────────────────────────
CPC_SECTION_NAMES = {
    "A": "Human Necessities",
    "B": "Operations & Transport",
    "C": "Chemistry & Metallurgy",
    "D": "Textiles & Paper",
    "E": "Fixed Constructions",
    "F": "Mechanical Engineering",
    "G": "Physics",
    "H": "Electricity",
    "Y": "Emerging Cross-Sectional",
}

# ── Assignee Type Map ──────────────────────────────────────────────────────────
ASSIGNEE_TYPE_MAP = {
    2: "US Corporate",
    3: "Foreign Corporate",
    4: "US Individual",
    5: "Foreign Individual",
    6: "US Government",
    7: "Foreign Government",
}


def ensure_dir(path: str) -> None:
    """Create directory (and parents) if it does not exist."""
    os.makedirs(os.path.dirname(path) if "." in os.path.basename(path) else path, exist_ok=True)


def save_json(data, filepath: str) -> None:
    """Serialize *data* to compact JSON via orjson and write to *filepath*."""
    ensure_dir(filepath)
    with open(filepath, "wb") as f:
        f.write(orjson.dumps(data, option=orjson.OPT_SERIALIZE_NUMPY))
    size_kb = os.path.getsize(filepath) / 1024
    print(f"  -> Saved {filepath} ({size_kb:,.1f} KB)")


def _clean_value(v):
    """Convert pandas/numpy types to JSON-safe Python types."""
    import pandas as pd
    import numpy as np
    if v is None or (isinstance(v, float) and np.isnan(v)):
        return None
    if isinstance(v, (np.integer,)):
        return int(v)
    if isinstance(v, (np.floating,)):
        return float(v)
    if isinstance(v, (pd.Timestamp, np.datetime64)):
        return str(v)
    if isinstance(v, (np.timedelta64, pd.Timedelta)):
        return int(v / np.timedelta64(1, 'D'))  # convert to days
    return v


def query_to_json(con, sql: str, filepath: str):
    """Execute *sql* on DuckDB connection, convert to list[dict], save as JSON."""
    t0 = time.time()
    result = con.execute(sql).fetchdf()
    elapsed = time.time() - t0
    print(f"  Query completed in {elapsed:.1f}s  ({len(result):,} rows)")
    records = [
        {k: _clean_value(v) for k, v in row.items()}
        for row in result.to_dict(orient="records")
    ]
    save_json(records, filepath)
    return records


def timed_msg(label: str):
    """Print a section header."""
    print(f"\n{'─'*60}")
    print(f"  {label}")
    print(f"{'─'*60}")
