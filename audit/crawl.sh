#!/usr/bin/env bash
# Crawl PatentWorld live site and collect SEO/metadata for each page.
set -euo pipefail

BASE="${1:-https://patentworld.vercel.app}"

# Get sitemap and extract URLs
URLS=$(curl -sL "${BASE}/sitemap.xml" | grep -o '<loc>[^<]*</loc>' | sed 's|<loc>||g;s|</loc>||g' | sort)

RESULTS="["
FIRST=true
for URL in $URLS; do
  case "$URL" in
    */robots.txt*|*/sitemap.xml*) continue ;;
  esac

  HTML=$(curl -sL --max-time 15 "$URL" 2>/dev/null || echo "FETCH_FAILED")
  STATUS=$(curl -sI --max-time 10 -o /dev/null -w "%{http_code}" "$URL" 2>/dev/null || echo "000")

  TITLE=$(echo "$HTML" | grep -o '<title>[^<]*</title>' | sed 's/<title>//;s/<\/title>//' | head -1)
  META_DESC=$(echo "$HTML" | grep -o 'name="description" content="[^"]*"' | sed 's/name="description" content="//;s/"$//' | head -1)
  H1=$(echo "$HTML" | grep -o '<h1[^>]*>[^<]*</h1>' | sed 's/<h1[^>]*>//;s/<\/h1>//' | head -1)
  CANONICAL=$(echo "$HTML" | grep -o 'rel="canonical" href="[^"]*"' | sed 's/rel="canonical" href="//;s/"$//' | head -1)
  HAS_JSONLD="false"; echo "$HTML" | grep -q 'application/ld+json' && HAS_JSONLD="true"
  HAS_OG_TITLE="false"; echo "$HTML" | grep -q 'property="og:title"' && HAS_OG_TITLE="true"
  HAS_OG_DESC="false"; echo "$HTML" | grep -q 'property="og:description"' && HAS_OG_DESC="true"
  HAS_OG_IMAGE="false"; echo "$HTML" | grep -q 'property="og:image"' && HAS_OG_IMAGE="true"
  HAS_TWITTER="false"; echo "$HTML" | grep -q 'name="twitter:' && HAS_TWITTER="true"

  # Escape quotes for JSON
  TITLE=$(echo "$TITLE" | sed 's/"/\\"/g')
  META_DESC=$(echo "$META_DESC" | sed 's/"/\\"/g')
  H1=$(echo "$H1" | sed 's/"/\\"/g')

  if [ "$FIRST" = true ]; then FIRST=false; else RESULTS+=","; fi
  RESULTS+="
  {
    \"url\": \"$URL\",
    \"status\": \"$STATUS\",
    \"title\": \"$TITLE\",
    \"metaDescription\": \"${META_DESC:0:200}\",
    \"h1\": \"$H1\",
    \"canonical\": \"$CANONICAL\",
    \"hasJsonLd\": $HAS_JSONLD,
    \"hasOgTitle\": $HAS_OG_TITLE,
    \"hasOgDescription\": $HAS_OG_DESC,
    \"hasOgImage\": $HAS_OG_IMAGE,
    \"hasTwitterCard\": $HAS_TWITTER
  }"
done
RESULTS+="
]"
echo "$RESULTS"
