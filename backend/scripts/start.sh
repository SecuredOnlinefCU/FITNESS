#!/usr/bin/env bash
set -e

# Apply pending migrations if they exist, otherwise push schema
if [ -d "prisma/migrations" ] && [ "$(ls -A prisma/migrations 2>/dev/null)" ]; then
  echo "Found existing migrations — running prisma migrate deploy"
  npx prisma migrate deploy
else
  echo "No migrations found — running prisma db push"
  npx prisma db push
fi

exec node dist/main.js
