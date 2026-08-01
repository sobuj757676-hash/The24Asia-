#!/usr/bin/env bash
# Boots the production build and captures screenshots at several widths,
# then shuts the server down. Bounded so it always terminates.
#   bash scripts/shoot.sh <label> [path] [width...]
set -uo pipefail

LABEL="${1:-home}"
PATH_UNDER_TEST="${2:-/}"
shift 2 2>/dev/null || shift $# 
WIDTHS=("$@")
[ ${#WIDTHS[@]} -eq 0 ] && WIDTHS=(1280 1440 1920)

PORT="${PORT:-3200}"
BASE="http://127.0.0.1:${PORT}"
OUT=/projects/sandbox/.kiro/artifacts/screenshots
mkdir -p "$OUT"

pnpm start > /tmp/shoot-server.log 2>&1 &
SERVER_PID=$!
trap 'kill "$SERVER_PID" 2>/dev/null; wait "$SERVER_PID" 2>/dev/null' EXIT

for _ in $(seq 1 60); do
  curl -fsS -o /dev/null "${BASE}/" && break
  sleep 1
done

for w in "${WIDTHS[@]}"; do
  agent-browser set viewport "$w" 1000 >/dev/null 2>&1
  agent-browser open "${BASE}${PATH_UNDER_TEST}" >/dev/null 2>&1
  sleep 3
  agent-browser screenshot --full "${OUT}/${LABEL}-${w}.png" 2>&1 | tail -1
done

agent-browser eval "(() => {
  const secs = [...document.querySelectorAll('section')].map(s => Math.round(s.getBoundingClientRect().height));
  const c = document.querySelector('section > div');
  return {
    viewport: innerWidth,
    containerWidth: c ? Math.round(c.getBoundingClientRect().width) : null,
    sectionHeights: secs,
    images: document.images.length,
    tofuArrows: (document.body.innerText.match(/[\u2190\u2192]/g) || []).length,
    scrollHeight: document.body.scrollHeight
  };
})()" 2>&1 | tail -14
