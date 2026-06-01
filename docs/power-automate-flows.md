# Power Automate Flows — LevelFITness

## Overview

Power Automate handles transactional email delivery for LevelFITness, replacing direct Graph API calls from the backend. Flows are created manually in the [Power Automate portal](https://make.powerautomate.com) and triggered via HTTPS webhooks from the backend.

Each flow uses an **"When an HTTP request is received"** trigger (manually created trigger type) followed by the **"Send an email (V2)"** Office 365 Outlook connector action.

## Prerequisites

- Microsoft 365 Business Premium tenant (already active: `onlinefcu.onmicrosoft.com`)
- Power Automate license (included in M365 BP)
- The `Noreply@Onlinefcu.com` mailbox (already provisioned, sends as `Noreply@levelfitcoach.com`)

## Flow 1: Welcome Email

**Trigger URL env var:** `PA_FLOW_WELCOME_URL`

**HTTP POST payload:**

```json
{
  "email": "client@example.com",
  "firstName": "Jane",
  "appName": "LevelFit"
}
```

**Flow actions:**

1. Trigger: "When an HTTP request is received" — accept `email`, `firstName`, `appName`
2. Parse JSON schema (auto-generated from sample payload)
3. Compose subject: `"Welcome to LevelFit, {firstName}!"`
4. Office 365 Outlook — "Send an email (V2)"
   - To: `@{triggerBody()?['email']}`
   - Subject: `@{outputs('Compose_subject')}`
   - Body: (see HTML template below)

**HTML body template:**

```html
<!DOCTYPE html>
<html>
<body style="font-family:Inter,sans-serif;background:#0b1020;color:#f0ede5;padding:40px">
  <div style="max-width:560px;margin:auto;background:#1a1f2e;border-radius:16px;padding:32px">
    <h1 style="color:#f97316;font-size:24px;margin:0 0 16px">Welcome to {{appName}}, {{firstName}}!</h1>
    <p style="color:#a0a0a0;line-height:1.6">You're all set. Log in to start your fitness journey.</p>
    <a href="{{loginUrl}}" style="display:inline-block;background:#f97316;color:white;padding:12px 24px;border-radius:12px;text-decoration:none;font-weight:bold;margin:24px 0">Log in now</a>
    <p style="color:#6b7280;font-size:12px;margin-top:32px">LevelFITness — Coach &amp; client fitness platform</p>
  </div>
</body>
</html>
```

## Flow 2: Invite Email

**Trigger URL env var:** `PA_FLOW_INVITE_URL`

**HTTP POST payload:**

```json
{
  "email": "client@example.com",
  "firstName": "Jane",
  "inviterName": "Coach Mike",
  "acceptUrl": "https://levelfitcoach.com/accept-invite?token=abc123",
  "expiresInDays": 7,
  "appName": "LevelFit"
}
```

**Flow actions:**

1. Trigger — accept all fields
2. Office 365 Outlook — "Send an email (V2)" with HTML template (see existing `invite.html`)

## Flow 3: Password Reset Email

**Trigger URL env var:** `PA_FLOW_PASSWORD_RESET_URL`

**HTTP POST payload:**

```json
{
  "email": "client@example.com",
  "firstName": "Jane",
  "resetUrl": "https://levelfitcoach.com/reset-password?token=abc123",
  "expiresInMinutes": 60,
  "appName": "LevelFit"
}
```

**Flow actions:**

1. Trigger — accept all fields
2. Office 365 Outlook — "Send an email (V2)" with reset link template

## Flow 4: Payment Receipt Email

**Trigger URL env var:** `PA_FLOW_PAYMENT_RECEIPT_URL`

**HTTP POST payload:**

```json
{
  "email": "client@example.com",
  "firstName": "Jane",
  "packageName": "Pro Monthly",
  "coachName": "Coach Mike",
  "amount": "$49.99",
  "date": "June 1, 2026",
  "appName": "LevelFit"
}
```

## Flow 5: Workout Reminder (Scheduled)

**Type:** Schedule-based (recurring), not HTTP-triggered.

**Schedule:** Daily at configurable time (e.g., 7:00 AM)

**Flow actions:**

1. Trigger: "Recurrence" — interval 1 day
2. Get all client assignments for today from the database (via HTTP call to backend API `/api/assignments/calendar?from=today&to=today`)
3. For each client with a workout today:
   - Compose subject: "Today's workout is ready"
   - Send email with workout summary

**Note:** This requires the flow to authenticate to the backend API. Use an API token stored in a PA variable.

## Flow 6: Re-engagement Nudge (Scheduled)

**Type:** Schedule-based, weekly.

**Schedule:** Weekly (e.g., Monday 10:00 AM)

**Flow actions:**

1. Trigger: "Recurrence" — interval 7 days
2. Query backend for clients with no workouts in 7+ days (via HTTP to `/api/clients/inactive`)
3. Send a re-engagement email to each inactive client

## Setup Instructions

### Creating a flow in Power Automate:

1. Go to https://make.powerautomate.com
2. Sign in with the tenant admin account (OnlinefCU.onmicrosoft.com)
3. Click **Create** → **Instant cloud flow**
4. Select trigger: **"When an HTTP request is received"**
5. Click **Create**
6. In the trigger, click **"Use sample payload to generate schema"** and paste the JSON payload from the spec above
7. Click **+ New step** → Search for **"Office 365 Outlook"** → Select **"Send an email (V2)"**
8. Fill in the email fields using dynamic content from the trigger
9. Save the flow
10. Copy the **HTTP POST URL** from the trigger (appears after first save)
11. Set the URL as an environment variable in Railway (e.g., `PA_FLOW_WELCOME_URL`)

### Testing:

1. After saving, the trigger shows an HTTP POST URL
2. Use `curl` or the Railway backend health check to verify:
   ```
   curl -X POST <flow-url> -H "Content-Type: application/json" -d '{"email":"...","firstName":"Test"}'
   ```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PA_FLOW_WELCOME_URL` | No | Webhook URL for welcome email flow |
| `PA_FLOW_INVITE_URL` | No | Webhook URL for invite email flow |
| `PA_FLOW_PASSWORD_RESET_URL` | No | Webhook URL for password reset flow |
| `PA_FLOW_PAYMENT_RECEIPT_URL` | No | Webhook URL for payment receipt flow |

All PA env vars are optional. If not set, the backend falls back to direct Graph API email sending.
