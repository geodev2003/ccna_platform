#!/bin/sh
set -e

echo "[entrypoint] Checking migration status..."

# If the database has no migration history (was set up with prisma db push),
# mark the init migration as already applied (baseline) so it won't try to
# re-create tables that already exist.
MIGRATE_STATUS=$(npx prisma migrate status 2>&1 || true)
if echo "$MIGRATE_STATUS" | grep -q "No migration history found"; then
    echo "[entrypoint] No migration history found. Marking init as baseline..."
    npx prisma migrate resolve --applied "20240101000000_init"
fi

echo "[entrypoint] Running pending migrations..."
npx prisma migrate deploy

echo "[entrypoint] Starting API server..."
exec node dist/index.js
