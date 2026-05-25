#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKEND_DIR="$PROJECT_ROOT/packages/backend"

echo "=== Maine RMS - Database Seed ==="

if [ -z "${DB_HOST:-}" ]; then
  echo "DB_HOST not set. Using localhost defaults for local development."
  export DB_HOST="${DB_HOST:-localhost}"
  export DB_PORT="${DB_PORT:-5432}"
  export DB_NAME="${DB_NAME:-maine_rms}"
  export DB_USER="${DB_USER:-postgres}"
  export DB_PASSWORD="${DB_PASSWORD:-postgres}"
fi

echo "Host: ${DB_HOST}:${DB_PORT}"
echo "Database: ${DB_NAME}"
echo ""

echo "--- Running migrations ---"
cd "$BACKEND_DIR"
npx knex migrate:latest --knexfile knexfile.ts
echo "Migrations complete."

echo ""
echo "--- Running seeds ---"
npx knex seed:run --knexfile knexfile.ts
echo "Seeds complete."

echo ""
echo "=== Database seeded successfully ==="
