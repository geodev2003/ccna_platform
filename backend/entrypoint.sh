#!/bin/sh
set -e
echo "[entrypoint] Running DB migrations..."
npx prisma migrate deploy
echo "[entrypoint] Starting API server..."
exec node dist/index.js
