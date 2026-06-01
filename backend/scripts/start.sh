#!/usr/bin/env bash
set -e

npx prisma db push --accept-data-loss --skip-generate 2>/dev/null || true

exec node dist/main.js
