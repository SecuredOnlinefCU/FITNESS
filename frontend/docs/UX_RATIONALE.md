# UX Rationale

This layer moves LevelFITness from static shell to product-feeling UI.

## Why skeletons
Skeletons preserve layout and reduce perceived wait time compared with blank screens or generic spinners.

## Why empty states
Fitness apps need guidance. Empty states should tell a client or coach exactly what to do next.

## Why near-real-time polling first
Polling is simpler and production-safe for the first version. WebSockets or SSE can come later after the backend messaging model is stable.

## Why live cards
Clients and coaches should see useful numbers immediately: programs, tasks, unread updates, packages, subscriptions, and payments.
