#!/usr/bin/env bash
# Run Lighthouse on all 38 PatentWorld pages, 6 at a time
# Output: JSON reports in audit/lighthouse-reports/ + summary CSV

set -euo pipefail

BASE="https://patentworld.vercel.app"
OUTDIR="/home/saerom/projects/patentworld/audit/lighthouse-reports"
SUMMARY="/home/saerom/projects/patentworld/audit/lighthouse-summary.csv"
MAXJOBS=6

PAGES=(
  "/"
  "/about/"
  "/methodology/"
  "/explore/"
  "/chapters/system-patent-count/"
  "/chapters/system-patent-quality/"
  "/chapters/system-patent-fields/"
  "/chapters/system-convergence/"
  "/chapters/system-language/"
  "/chapters/system-patent-law/"
  "/chapters/system-public-investment/"
  "/chapters/org-composition/"
  "/chapters/org-patent-count/"
  "/chapters/org-patent-quality/"
  "/chapters/org-patent-portfolio/"
  "/chapters/org-company-profiles/"
  "/chapters/inv-top-inventors/"
  "/chapters/inv-generalist-specialist/"
  "/chapters/inv-serial-new/"
  "/chapters/inv-gender/"
  "/chapters/inv-team-size/"
  "/chapters/geo-domestic/"
  "/chapters/geo-international/"
  "/chapters/mech-organizations/"
  "/chapters/mech-inventors/"
  "/chapters/mech-geography/"
  "/chapters/3d-printing/"
  "/chapters/agricultural-technology/"
  "/chapters/ai-patents/"
  "/chapters/autonomous-vehicles/"
  "/chapters/biotechnology/"
  "/chapters/blockchain/"
  "/chapters/cybersecurity/"
  "/chapters/digital-health/"
  "/chapters/green-innovation/"
  "/chapters/quantum-computing/"
  "/chapters/semiconductors/"
  "/chapters/space-technology/"
)

echo "Page,Performance,Accessibility,Best Practices,SEO" > "$SUMMARY"

run_lighthouse() {
  local path="$1"
  local url="${BASE}${path}"
  # Create safe filename from path
  local name
  name=$(echo "$path" | sed 's|^/||;s|/$||;s|/|_|g')
  [ -z "$name" ] && name="home"
  local outfile="${OUTDIR}/${name}.json"

  echo "[SCAN] $url"
  lighthouse "$url" \
    --output=json \
    --output-path="$outfile" \
    --chrome-flags="--headless --no-sandbox --disable-gpu" \
    --only-categories=performance,accessibility,best-practices,seo \
    --quiet 2>/dev/null

  if [ -f "$outfile" ]; then
    local perf acc bp seo
    perf=$(python3 -c "import json; d=json.load(open('$outfile')); print(round(d['categories']['performance']['score']*100))" 2>/dev/null || echo "ERR")
    acc=$(python3 -c "import json; d=json.load(open('$outfile')); print(round(d['categories']['accessibility']['score']*100))" 2>/dev/null || echo "ERR")
    bp=$(python3 -c "import json; d=json.load(open('$outfile')); print(round(d['categories']['best-practices']['score']*100))" 2>/dev/null || echo "ERR")
    seo=$(python3 -c "import json; d=json.load(open('$outfile')); print(round(d['categories']['seo']['score']*100))" 2>/dev/null || echo "ERR")
    echo "[DONE] $path -> Perf=$perf A11y=$acc BP=$bp SEO=$seo"
    echo "$path,$perf,$acc,$bp,$seo" >> "$SUMMARY"
  else
    echo "[FAIL] $path"
    echo "$path,ERR,ERR,ERR,ERR" >> "$SUMMARY"
  fi
}

# Run in parallel batches
active=0
for page in "${PAGES[@]}"; do
  run_lighthouse "$page" &
  active=$((active + 1))
  if [ "$active" -ge "$MAXJOBS" ]; then
    wait -n 2>/dev/null || wait
    active=$((active - 1))
  fi
done
wait

echo ""
echo "=== ALL SCANS COMPLETE ==="
echo "Summary: $SUMMARY"
echo "Reports: $OUTDIR/"
