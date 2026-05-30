
# Unified Fitness Backend v1

This is the merged backend for the Coach ↔ Client Fitness Platform, combining Modules 1–9 into **one backend codebase**.

## Honest status
This is a **merged backend v1** with one Express API, one shared middleware stack, one package, one `.env.example`, and one consolidated Prisma schema covering the full app domain.

It is **not yet final production-certified** until you run migrations, install dependencies, configure providers, add tests, wire object storage, and deploy with CI/CD/monitoring.

## Included domains
- Auth + Roles + Programs + Primary Program
- Program Community Feed + Moderation
- Messaging + Voice Notes
- Training + Workouts
- Tasks + Video Review
- Progress Photos + Metrics + Check-ins
- Nutrition + Meal Plans + Food Journal + Macros
- Payments + Subscriptions + Packages
- Notifications + Integrations + Admin Hardening

## Quick start
```bash
pnpm install
cp .env.example .env
pnpm prisma:generate
pnpm prisma:dbpush
pnpm seed
pnpm dev
```

## Health check
```txt
GET /health
```
