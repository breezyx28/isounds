#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-https://api.zoalcast.com/api}"
PORTAL_ID="${PORTAL_ID:-6}"

echo "Smoke test: ${BASE_URL} (portal ${PORTAL_ID})"

assert_200() {
  local url="$1"
  local code
  code="$(curl --retry 2 --retry-delay 1 --retry-all-errors -sS -o /tmp/isounds-smoke-body.txt -w "%{http_code}" "$url")"
  if [[ "$code" != "200" ]]; then
    echo "FAIL: ${url} -> HTTP ${code}"
    exit 1
  fi
  echo "OK: ${url}"
}

assert_200 "${BASE_URL}/portal/${PORTAL_ID}/categories"
assert_200 "${BASE_URL}/podcast/${PORTAL_ID}/top?criteria=latest&page=1&per_page=20"
assert_200 "${BASE_URL}/podcast/${PORTAL_ID}/search?q=music&page=1"

TOP_JSON="$(curl --retry 2 --retry-delay 1 --retry-all-errors -sS "${BASE_URL}/podcast/${PORTAL_ID}/top?criteria=latest&page=1&per_page=20")"
PODCAST_ID="$(echo "$TOP_JSON" | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{const j=JSON.parse(d);const id=j?.data?.[0]?.id; if(!id){process.exit(1)}; process.stdout.write(String(id));});")"
assert_200 "${BASE_URL}/podcast/${PODCAST_ID}"

echo "Smoke test completed successfully."
