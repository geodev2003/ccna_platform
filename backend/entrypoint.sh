#!/bin/sh
set -e

echo "[entrypoint] Setting up database..."

# If init migration is stuck in 'failed' state (e.g., due to pre-existing tables),
# roll it back so prisma migrate deploy can re-run it (migration is idempotent).
# The '|| true' makes this a safe no-op when migration is not in a failed state.
npx prisma migrate resolve --rolled-back "20240101000000_init" 2>/dev/null || true

echo "[entrypoint] Running pending migrations..."
npx prisma migrate deploy

echo "[entrypoint] Starting API server..."
exec node dist/index.js
