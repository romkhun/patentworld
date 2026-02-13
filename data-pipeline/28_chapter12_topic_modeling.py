#!/usr/bin/env python3
"""
Chapter 12 – The Language of Innovation
Topic Modeling & Semantic Analysis of 8.4M Patent Abstracts

Generates:
  topic_definitions.json   — 25 topics with id, name, top_words, patent_count
  topic_prevalence.json    — year × topic share (1976–2025)
  topic_cpc_matrix.json    — cpc_section × topic count/share
  topic_umap.json          — 15K patents with UMAP coordinates
  topic_novelty_trend.json — median/avg entropy by year
  topic_novelty_top.json   — top 50 most novel patents

Method: TF-IDF → NMF (25 topics) → UMAP on 15K stratified sample
"""
import os
import sys
import time
import numpy as np
import duckdb
from config import (
    PATENT_TSV, CPC_CURRENT_TSV, OUTPUT_DIR,
    CPC_SECTION_NAMES, save_json, timed_msg, tsv_table,
)

def log(msg):
    print(msg, flush=True)

OUT = f"{OUTPUT_DIR}/chapter12"
os.makedirs(OUT, exist_ok=True)

con = duckdb.connect()

# ── Step 1: Load patent abstracts with metadata ─────────────────────────────
timed_msg("Loading patent abstracts + metadata")

t0 = time.time()

ABSTRACT_TSV = tsv_table("g_patent_abstract")

df = con.execute(f"""
    SELECT
        p.patent_id,
        a.patent_abstract,
        YEAR(CAST(p.patent_date AS DATE)) AS year,
        c.cpc_section
    FROM {PATENT_TSV()} p
    JOIN {ABSTRACT_TSV} a ON p.patent_id = a.patent_id
    LEFT JOIN {CPC_CURRENT_TSV()} c ON p.patent_id = c.patent_id AND c.cpc_sequence = 0
    WHERE p.patent_type = 'utility'
      AND p.patent_date IS NOT NULL
      AND a.patent_abstract IS NOT NULL
      AND LENGTH(TRIM(a.patent_abstract)) > 50
      AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 1976 AND 2025
""").fetchdf()

# Close DuckDB connection to free memory
con.close()

elapsed = time.time() - t0
log(f"  Loaded {len(df):,} patents with abstracts in {elapsed:.1f}s")

df = df.drop_duplicates(subset='patent_id', keep='first')
log(f"  After dedup: {len(df):,} patents")

df['cpc_section'] = df['cpc_section'].fillna('Unknown')

# ── Step 2: TF-IDF ──────────────────────────────────────────────────────────
timed_msg("Building TF-IDF matrix (max_features=10000)")

from sklearn.feature_extraction.text import TfidfVectorizer

t0 = time.time()
vectorizer = TfidfVectorizer(
    max_features=10_000,
    min_df=50,
    max_df=0.5,
    stop_words='english',
    ngram_range=(1, 2),
    dtype=np.float64,  # float64 for NMF stability
    sublinear_tf=True,  # log(1 + tf) for better topic separation
)
tfidf_matrix = vectorizer.fit_transform(df['patent_abstract'].values)
elapsed = time.time() - t0
log(f"  TF-IDF matrix shape: {tfidf_matrix.shape} in {elapsed:.1f}s")
log(f"  Memory: ~{tfidf_matrix.data.nbytes / (1024**3):.2f} GB")
log(f"  Non-zero entries: {tfidf_matrix.nnz:,} ({100*tfidf_matrix.nnz/(tfidf_matrix.shape[0]*tfidf_matrix.shape[1]):.2f}% density)")

feature_names = vectorizer.get_feature_names_out()

# ── Step 3: NMF Topic Modeling ───────────────────────────────────────────────
timed_msg("Fitting NMF with 25 topics (this takes ~5-10 min at scale)")

from sklearn.decomposition import NMF

t0 = time.time()
nmf = NMF(
    n_components=25,
    random_state=42,
    max_iter=200,
    init='nndsvd',       # stable SVD-based init without zero-fill averaging
    solver='mu',          # multiplicative update — robust for large sparse matrices
    beta_loss='frobenius',
)
W = nmf.fit_transform(tfidf_matrix)  # (n_patents, 25) topic weights
H = nmf.components_                   # (25, 10000) topic-word weights
elapsed = time.time() - t0
log(f"  NMF fitted in {elapsed:.1f}s")
log(f"  Reconstruction error: {nmf.reconstruction_err_:.2f}")
log(f"  NMF iterations: {nmf.n_iter_}")

# Validate NMF output
log(f"  W shape: {W.shape}, range: [{W.min():.6f}, {W.max():.6f}]")
log(f"  H shape: {H.shape}, range: [{H.min():.6f}, {H.max():.6f}]")

# Check topic assignments
topic_assignments = W.argmax(axis=1)
unique_topics, topic_counts = np.unique(topic_assignments, return_counts=True)
log(f"  Topics with assigned patents: {len(unique_topics)}/25")
for t, c in zip(unique_topics, topic_counts):
    log(f"    Topic {t}: {c:,} patents")

if len(unique_topics) < 5:
    log("  WARNING: NMF produced degenerate topics! Check data.")
    sys.exit(1)

# Human-curated topic names (update after inspecting top words)
# If a topic's top words don't match, the auto-name will be used
CURATED_TOPIC_NAMES = {
    0: 'Mechanical Structures',
    1: 'Computing & Networks',
    2: 'General Patent Disclosure',
    3: 'Semiconductor Fabrication',
    4: 'Signal Processing',
    5: 'Fluid Systems & Thermal',
    6: 'Imaging & Vision',
    7: 'Organic Chemistry',
    8: 'Mobile & Smart Devices',
    9: 'Optics & Photonics',
    10: 'Pharmaceuticals & Biotech',
    11: 'Wireless Communications',
    12: 'Data Storage & Memory',
    13: 'Chemical Compositions',
    14: 'Structural Elements',
    15: 'Control Systems',
    16: 'Power & Energy',
    17: 'Semiconductor Memory',
    18: 'Display Technology',
    19: 'Mechanical Components',
    20: 'Sensing & Detection',
    21: 'Mechanical Assemblies',
    22: 'Circuit Boards & Connectors',
    23: 'Vehicles & Drivetrain',
    24: 'Structural Support',
}

def auto_name(top_words, topic_idx=None):
    """Use curated name if available, else generate from top 3 words."""
    if topic_idx is not None and topic_idx in CURATED_TOPIC_NAMES:
        return CURATED_TOPIC_NAMES[topic_idx]
    core = top_words[:3]
    return ' / '.join(w.replace('_', ' ') for w in core).title()

topic_definitions = []
for topic_idx in range(25):
    top_word_indices = H[topic_idx].argsort()[::-1][:15]
    top_words = [str(feature_names[i]) for i in top_word_indices]
    name = auto_name(top_words, topic_idx)
    patent_count = int((topic_assignments == topic_idx).sum())
    topic_definitions.append({
        'id': topic_idx,
        'name': name,
        'top_words': top_words,
        'patent_count': patent_count,
    })
    log(f"  Topic {topic_idx}: {name} ({patent_count:,} patents)")

save_json(topic_definitions, f"{OUT}/topic_definitions.json")

# Assign dominant topic
df['topic'] = topic_assignments

# ── Step 4: Topic prevalence by year ─────────────────────────────────────────
timed_msg("Computing topic prevalence by year")

prevalence_records = []
for year in sorted(df['year'].unique()):
    year_mask = df['year'] == year
    year_topics = df.loc[year_mask, 'topic']
    total = len(year_topics)
    if total == 0:
        continue
    for topic_idx in range(25):
        count = int((year_topics == topic_idx).sum())
        prevalence_records.append({
            'year': int(year),
            'topic': topic_idx,
            'topic_name': topic_definitions[topic_idx]['name'],
            'count': count,
            'share': round(count / total * 100, 2),
        })

save_json(prevalence_records, f"{OUT}/topic_prevalence.json")

# ── Step 5: Topic × CPC cross-tab ───────────────────────────────────────────
timed_msg("Computing topic × CPC section cross-tab")

cpc_matrix_records = []
for section in sorted(df['cpc_section'].unique()):
    if section == 'Unknown':
        continue
    sec_mask = df['cpc_section'] == section
    sec_topics = df.loc[sec_mask, 'topic']
    total = len(sec_topics)
    if total == 0:
        continue
    for topic_idx in range(25):
        count = int((sec_topics == topic_idx).sum())
        cpc_matrix_records.append({
            'section': section,
            'section_name': CPC_SECTION_NAMES.get(section, section),
            'topic': topic_idx,
            'topic_name': topic_definitions[topic_idx]['name'],
            'count': count,
            'share': round(count / total * 100, 2),
        })

save_json(cpc_matrix_records, f"{OUT}/topic_cpc_matrix.json")

# ── Step 6: UMAP on stratified 15K sample ───────────────────────────────────
timed_msg("UMAP: stratified sample of 15K patents")

t0 = time.time()

# Stratified sample: 600 per topic
rng = np.random.RandomState(42)
sample_indices = []
for topic_idx in range(25):
    topic_mask = np.where(df['topic'].values == topic_idx)[0]
    n_available = len(topic_mask)
    n_sample = min(600, n_available)
    if n_sample > 0:
        chosen = rng.choice(topic_mask, size=n_sample, replace=False)
        sample_indices.extend(chosen)
    log(f"  Topic {topic_idx}: {n_available:,} available, sampled {n_sample}")

sample_indices = np.array(sample_indices)
log(f"  Total sample size: {len(sample_indices):,}")

# Extract TF-IDF rows for sample
tfidf_sample = tfidf_matrix[sample_indices]

import umap

reducer = umap.UMAP(
    n_components=2,
    n_neighbors=15,
    min_dist=0.1,
    metric='cosine',
    random_state=42,
)
embedding = reducer.fit_transform(tfidf_sample)
elapsed = time.time() - t0
log(f"  UMAP fitted in {elapsed:.1f}s")

# Build UMAP output
umap_records = []
sample_df = df.iloc[sample_indices].reset_index(drop=True)
for i in range(len(sample_indices)):
    umap_records.append({
        'patent_id': sample_df.iloc[i]['patent_id'],
        'x': round(float(embedding[i, 0]), 3),
        'y': round(float(embedding[i, 1]), 3),
        'topic': int(sample_df.iloc[i]['topic']),
        'topic_name': topic_definitions[int(sample_df.iloc[i]['topic'])]['name'],
        'year': int(sample_df.iloc[i]['year']),
        'section': sample_df.iloc[i]['cpc_section'],
    })

save_json(umap_records, f"{OUT}/topic_umap.json")

# ── Step 7: Novelty — Shannon entropy of topic distribution ─────────────────
timed_msg("Computing novelty scores (Shannon entropy)")

t0 = time.time()

# Normalize W to probability distributions per patent
W_sum = W.sum(axis=1, keepdims=True)
W_sum[W_sum == 0] = 1
W_prob = W / W_sum

# Shannon entropy: -sum(p * log2(p)) where p > 0
# Use masked computation to avoid log(0)
entropy = np.zeros(W_prob.shape[0])
for i in range(W_prob.shape[1]):
    mask = W_prob[:, i] > 1e-10
    entropy[mask] -= W_prob[mask, i] * np.log2(W_prob[mask, i])

df['entropy'] = entropy

elapsed = time.time() - t0
log(f"  Entropy computed in {elapsed:.1f}s")
log(f"  Entropy range: [{entropy.min():.4f}, {entropy.max():.4f}]")
log(f"  Median entropy: {np.median(entropy):.4f}")
log(f"  Mean entropy: {np.mean(entropy):.4f}")
log(f"  Patents with entropy > 0.5: {(entropy > 0.5).sum():,}")

# Novelty trend: median + avg entropy by year
novelty_trend = []
for year in sorted(df['year'].unique()):
    year_entropy = df.loc[df['year'] == year, 'entropy']
    novelty_trend.append({
        'year': int(year),
        'median_entropy': round(float(year_entropy.median()), 4),
        'avg_entropy': round(float(year_entropy.mean()), 4),
        'patent_count': int(len(year_entropy)),
    })

save_json(novelty_trend, f"{OUT}/topic_novelty_trend.json")

# Top 50 most novel patents
top_novel_idx = df['entropy'].nlargest(50).index
novelty_top = []
for idx in top_novel_idx:
    row = df.iloc[idx]
    novelty_top.append({
        'patent_id': row['patent_id'],
        'year': int(row['year']),
        'section': row['cpc_section'],
        'topic': int(row['topic']),
        'topic_name': topic_definitions[int(row['topic'])]['name'],
        'entropy': round(float(row['entropy']), 4),
    })

save_json(novelty_top, f"{OUT}/topic_novelty_top.json")

# ── Summary ──────────────────────────────────────────────────────────────────
timed_msg("Chapter 12 pipeline complete!")
log(f"  Patents processed: {len(df):,}")
log(f"  Active topics: {len(unique_topics)}")
log(f"  UMAP sample: {len(sample_indices):,}")
log(f"  Output: {OUT}/")
for fname in sorted(os.listdir(OUT)):
    fsize = os.path.getsize(os.path.join(OUT, fname))
    log(f"    {fname}: {fsize/1024:.1f} KB")
