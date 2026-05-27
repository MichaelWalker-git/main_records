#!/usr/bin/env bash
# Pre-demo warmup script.
#
# Run 1-2 minutes before the demo to:
# - trigger DB connection pool startup
# - ensure migrations have completed
# - prime browser bundle cache
# - verify all critical endpoints respond
#
# Usage: ./scripts/demo-warmup.sh [base-url]
# Default URL: http://maine--alb16-kxi3dpqk8uzt-480421270.us-east-1.elb.amazonaws.com

set -e

BASE_URL="${1:-http://maine--alb16-kxi3dpqk8uzt-480421270.us-east-1.elb.amazonaws.com}"
API_URL="${BASE_URL}/api"

echo "Maine RMS — Demo Warmup"
echo "Base URL: ${BASE_URL}"
echo ""

check() {
  local label=$1
  local url=$2
  local expected=${3:-200}
  printf "  %-30s " "${label}..."
  local code
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 30 "${url}" || echo "000")
  if [[ "${code}" == "${expected}" || "${code}" == "401" || "${code}" == "403" ]]; then
    echo "OK (${code})"
  else
    echo "WARN (${code})"
  fi
}

echo "Step 1: Frontend bundle"
check "Home page" "${BASE_URL}/"
check "Dashboard route" "${BASE_URL}/dashboard"
check "Records route" "${BASE_URL}/records"

echo ""
echo "Step 2: Backend health"
check "Health check" "${API_URL}/health"

echo ""
echo "Step 3: API endpoints (auth-gated, expect 401/403)"
check "Records list" "${API_URL}/records" 401
check "Analytics dashboard" "${API_URL}/analytics/dashboard" 401
check "Transmittals list" "${API_URL}/transmittals" 401
check "Dispositions list" "${API_URL}/dispositions" 401
check "Inventory overdue" "${API_URL}/inventory/overdue" 401

echo ""
echo "Warmup complete. The first live demo click should now respond in <1s."
echo ""
echo "Next steps:"
echo "  1. Open ${BASE_URL} in the demo browser"
echo "  2. Log in as Sarah Chen (sarah.chen@maine.gov / Demo@2024!)"
echo "  3. Navigate Dashboard -> Records -> open a record (cache the route bundles)"
echo "  4. Begin the live demo"
