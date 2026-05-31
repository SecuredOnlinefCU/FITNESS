#!/usr/bin/env bash
set -e

npx prisma db push

exec node dist/main.js
