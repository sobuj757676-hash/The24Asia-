#!/usr/bin/env bash
#
# Boots the production build, exercises the key routes, then shuts down.
# Always terminates. Usage: bash scripts/smoke.sh
#
# Note on URLs: `localePrefix` is "as-needed", so the default locale (en) is
# served WITHOUT a prefix and /en/* 307-redirects to the bare path. Assertions
# therefore use unprefixed paths and do NOT follow redirects, so a soft 404
# (status 200 on a missing record) cannot hide behind a redirect chain.
set -uo pipefail

PORT="${PORT:-3100}"
BASE="http://127.0.0.1:${PORT}"

pnpm start > /tmp/smoke-server.log 2>&1 &
SERVER_PID=$!
trap 'kill "$SERVER_PID" 2>/dev/null; wait "$SERVER_PID" 2>/dev/null' EXIT

for _ in $(seq 1 60); do
  curl -fsS -o /dev/null "${BASE}/" && break
  sleep 1
done

fail=0
pass_count=0

check() { # path expected_status [label]
  local path="$1" expected="$2" label="${3:-}" code
  code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 30 "${BASE}${path}")
  if [ "$code" = "$expected" ]; then
    printf 'PASS  %-3s  %-44s %s\n' "$code" "$path" "$label"
    pass_count=$((pass_count + 1))
  else
    printf 'FAIL  %-3s  %-44s %s (expected %s)\n' "$code" "$path" "$label" "$expected"
    fail=1
  fi
}

check_header() { # path header substring label
  local path="$1" header="$2" want="$3" label="$4" value
  value=$(curl -s -D - -o /dev/null --max-time 30 "${BASE}${path}" \
    | tr -d '\r' | awk -F': ' -v h="$header" 'tolower($1)==tolower(h){print $2; exit}')
  case "$value" in
    *"$want"*)
      printf 'PASS       %-44s %s\n' "$header" "$label"
      pass_count=$((pass_count + 1)) ;;
    *)
      printf 'FAIL       %-44s %s (got: %s)\n' "$header" "$label" "${value:-<missing>}"
      fail=1 ;;
  esac
}

echo "--- public pages (default locale, unprefixed) ---"
for p in / /learn /learn/schedule /learn/pathways /learn/how-it-works /events /volunteer \
         /support /support/urgent-help /donate /shop /stories /impact /careers /community \
         /policies /about /about/team /about/partners /about/contact /live-shows /verify \
         /search /sign-in /offline; do
  check "$p" 200
done

echo "--- other locales keep their prefix ---"
check /bn 200 "Bengali"
check /ta 200 "Tamil"
check /bn/learn 200 "Bengali learn"

echo "--- default-locale prefix normalises away ---"
check /en 307 "/en redirects to /"

echo "--- auth gate: portals bounce unauthenticated users ---"
for p in /admin /account /volunteer-portal /partner-portal /dashboard; do
  check "$p" 307 "redirect to sign-in"
done

echo "--- api ---"
check /api/account/export 401 "refuses anonymous callers"
check /manifest.webmanifest 200 "PWA manifest"
check /sw.js 200 "service worker"

echo "--- unknown records must be hard 404s, not soft 200s ---"
check /this-page-does-not-exist 404
check /learn/no-such-course 404 "unknown course"
check /events/no-such-event 404 "unknown event"
check /stories/no-such-story 404 "unknown story"
check /shop/no-such-product 404 "unknown product"
check /policies/no-such-policy 404 "unknown policy"
check /learn/pathways/no-such-path 404 "unknown pathway"

echo "--- security headers ---"
check_header / content-security-policy "frame-ancestors 'none'" "CSP present"
check_header / x-content-type-options nosniff "nosniff"
check_header / strict-transport-security max-age "HSTS"
check_header / x-frame-options DENY "no framing"
check_header /admin x-robots-tag noindex "admin noindex header"
check_header /account x-robots-tag noindex "account noindex header"
check_header /bn/admin x-robots-tag noindex "prefixed admin noindex header"
check_header /api/account/export cache-control no-store "personal export not cacheable"

echo "--- private pages also carry a noindex meta tag ---"
check_body() { # path substring label
  local path="$1" want="$2" label="$3"
  if curl -s --max-time 30 "${BASE}${path}" | grep -qi -- "$want"; then
    printf 'PASS       %-44s %s\n' "$want" "$label"
    pass_count=$((pass_count + 1))
  else
    printf 'FAIL       %-44s %s\n' "$want" "$label"
    fail=1
  fi
}
check_body /sign-in 'name="robots" content="noindex' "sign-in meta robots"

echo
if [ "$fail" -eq 0 ]; then
  echo "SMOKE TEST PASSED (${pass_count} checks)"
else
  echo "SMOKE TEST FAILED"
fi
exit "$fail"
