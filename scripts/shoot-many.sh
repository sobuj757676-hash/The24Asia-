#!/usr/bin/env bash
# Captures one screenshot per path at a single width, then shuts down.
#   bash scripts/shoot-many.sh <width> <path>...
# Paths are labelled by slugifying the path.
set -uo pipefail

WIDTH="${1:-1440}"; shift
PORT="${PORT:-3200}"
BASE="http://127.0.0.1:${PORT}"
OUT=/projects/sandbox/.kiro/artifacts/screenshots
mkdir -p "$OUT"

pnpm start > /tmp/shoot-server.log 2>&1 &
SERVER_PID=$!
trap 'kill "$SERVER_PID" 2>/dev/null; wait "$SERVER_PID" 2>/dev/null' EXIT

for _ in $(seq 1 60); do curl -fsS -o /dev/null "${BASE}/" && break; sleep 1; done

agent-browser set viewport "$WIDTH" 1000 >/dev/null 2>&1
for p in "$@"; do
  label=$(echo "$p" | sed 's#^/##; s#/#-#g'); [ -z "$label" ] && label=home
  agent-browser open "${BASE}${p}" >/dev/null 2>&1
  sleep 2
  agent-browser screenshot --full "${OUT}/w${WIDTH}-${label}.png" >/dev/null 2>&1
  # Report anything obviously wrong without needing a human to look.
  agent-browser eval "(() => {
    const de = document.documentElement;
    const overflow = de.scrollWidth > de.clientWidth + 1;
    const c = document.querySelector('section > div');
    return {
      path: location.pathname,
      status: document.title.slice(0, 40),
      horizontalOverflow: overflow,
      containerWidth: c ? Math.round(c.getBoundingClientRect().width) : null,
      tofu: (document.body.innerText.match(/[\u2190\u2192]/g) || []).length,
      emptyHeadings: [...document.querySelectorAll('h1')].filter(h => !h.textContent.trim()).length,
      h1Count: document.querySelectorAll('h1').length
    };
  })()" 2>&1 | tr -d '\n ' | sed 's/,/, /g'
  echo
done
