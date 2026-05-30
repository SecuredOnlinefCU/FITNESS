# Real Data + Loading States UI Layer Status

## Built
- `useAsyncData`
- `usePollingData`
- `useThreadListPolling`
- skeleton components
- empty state component
- error state component
- data section helper
- live client home
- live coach home
- live client billing
- live inbox shell
- live notification bell
- page upgrade examples

## What this improves
- Screens no longer feel like static wireframes.
- Sections have loading states.
- Empty states explain what happens next.
- Error states offer retries.
- Inbox can refresh on an interval.
- Billing and dashboard cards can use real API responses.

## Still needed
- Backend thread-detail endpoint for full message history
- Optimistic message sending
- WebSocket/SSE if true real-time is required
- More detailed data mappers per route
- Dark mode loading/skeleton polish
