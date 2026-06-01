# Deploy Guide — Power Automate, DNS, Power BI

## 1. Power Automate — Create Email Flows

### Prerequisites
- Login at https://make.powerautomate.com with your `admin@onlinefcu.onmicrosoft.com` account
- Each flow takes ~2 minutes to create

### Step-by-step for ALL 4 flows (repeat for each)

1. Click **Create** → **Instant cloud flow**
2. Name it (e.g. "LevelFit Welcome Email")
3. Select trigger: **When an HTTP request is received**
4. Click **Create**
5. In the trigger box, click **Use sample payload to generate schema**
6. Paste the JSON payload from the table below
7. Click **+ New step** → search "Send an email (V2)" → select **Office 365 Outlook**
8. Fill in:
   - **To**: `@{triggerBody()?['email']}`
   - **Subject**: from table below
   - **Body**: paste the HTML template (switch to HTML mode)
9. Click **Save**
10. Copy the **HTTP POST URL** from the trigger box
11. Set it as Railway env var (from the table)

### Flow 1: Welcome

| Field | Value |
|-------|-------|
| Env var | `PA_FLOW_WELCOME_URL` |
| Sample payload | `{ "email": "client@example.com", "firstName": "Jane", "appName": "LevelFit" }` |
| Subject | `"Welcome to LevelFit, @{triggerBody()?['firstName']}!"` |

```html
<!-- Copy-paste as HTML body -->
<!DOCTYPE html>
<html>
<body style="font-family:Inter,sans-serif;background:#0b1020;color:#f0ede5;padding:40px">
  <div style="max-width:560px;margin:auto;background:#1a1f2e;border-radius:16px;padding:32px">
    <h1 style="color:#f97316;font-size:24px;margin:0 0 16px">Welcome to LevelFit, @{triggerBody()?['firstName']}!</h1>
    <p style="color:#a0a0a0;line-height:1.6">You're all set. Log in to start your fitness journey.</p>
    <a href="https://levelfitcoach.com/login" style="display:inline-block;background:#f97316;color:white;padding:12px 24px;border-radius:12px;text-decoration:none;font-weight:bold;margin:24px 0">Log in now</a>
    <p style="color:#6b7280;font-size:12px;margin-top:32px">LevelFITness</p>
  </div>
</body>
</html>
```

### Flow 2: Invite

| Field | Value |
|-------|-------|
| Env var | `PA_FLOW_INVITE_URL` |
| Sample payload | `{ "email": "client@example.com", "firstName": "Jane", "inviterName": "Coach Mike", "acceptUrl": "https://levelfitcoach.com/accept-invite?token=abc", "expiresInDays": 7, "appName": "LevelFit" }` |
| Subject | `"You've been invited to LevelFit by @{triggerBody()?['inviterName']}!"` |

```html
<body style="font-family:Inter,sans-serif;background:#0b1020;color:#f0ede5;padding:40px">
  <div style="max-width:560px;margin:auto;background:#1a1f2e;border-radius:16px;padding:32px">
    <h1 style="color:#38bdf8;font-size:24px;margin:0 0 16px">You're invited!</h1>
    <p style="color:#a0a0a0;line-height:1.6">@{triggerBody()?['inviterName']} has invited you to LevelFit.</p>
    <a href="@{triggerBody()?['acceptUrl']}" style="display:inline-block;background:#38bdf8;color:#0b1020;padding:12px 24px;border-radius:12px;text-decoration:none;font-weight:bold;margin:24px 0">Accept invite</a>
    <p style="color:#6b7280;font-size:12px;margin-top:32px">Expires in @{triggerBody()?['expiresInDays']} days</p>
  </div>
</body>
```

### Flow 3: Password Reset

| Field | Value |
|-------|-------|
| Env var | `PA_FLOW_PASSWORD_RESET_URL` |
| Sample payload | `{ "email": "client@example.com", "firstName": "Jane", "resetUrl": "https://levelfitcoach.com/reset-password?token=abc", "expiresInMinutes": 60, "appName": "LevelFit" }` |
| Subject | `"Reset your LevelFit password"` |

```html
<body style="font-family:Inter,sans-serif;background:#0b1020;color:#f0ede5;padding:40px">
  <div style="max-width:560px;margin:auto;background:#1a1f2e;border-radius:16px;padding:32px">
    <h1 style="color:#f97316;font-size:24px;margin:0 0 16px">Reset your password</h1>
    <p style="color:#a0a0a0;line-height:1.6">Click below to reset your LevelFit password.</p>
    <a href="@{triggerBody()?['resetUrl']}" style="display:inline-block;background:#f97316;color:white;padding:12px 24px;border-radius:12px;text-decoration:none;font-weight:bold;margin:24px 0">Reset password</a>
    <p style="color:#6b7280;font-size:12px">Link expires in 60 minutes</p>
  </div>
</body>
```

### Flow 4: Payment Receipt

| Field | Value |
|-------|-------|
| Env var | `PA_FLOW_PAYMENT_RECEIPT_URL` |
| Sample payload | `{ "email": "client@example.com", "firstName": "Jane", "packageName": "Monthly Coaching", "coachName": "Coach Mike", "amount": "$99.00", "date": "June 1, 2026", "appName": "LevelFit" }` |
| Subject | `"Your LevelFit receipt — @{triggerBody()?['packageName']}"` |

```html
<body style="font-family:Inter,sans-serif;background:#0b1020;color:#f0ede5;padding:40px">
  <div style="max-width:560px;margin:auto;background:#1a1f2e;border-radius:16px;padding:32px">
    <h1 style="color:#38bdf8;font-size:24px;margin:0 0 16px">Payment receipt</h1>
    <p style="color:#a0a0a0;line-height:1.6">Thanks for your payment, @{triggerBody()?['firstName']}!</p>
    <div style="background:#0b1020;border-radius:12px;padding:16px;margin:16px 0">
      <p style="margin:4px 0"><strong>Package:</strong> @{triggerBody()?['packageName']}</p>
      <p style="margin:4px 0"><strong>Coach:</strong> @{triggerBody()?['coachName']}</p>
      <p style="margin:4px 0"><strong>Amount:</strong> @{triggerBody()?['amount']}</p>
      <p style="margin:4px 0"><strong>Date:</strong> @{triggerBody()?['date']}</p>
    </div>
  </div>
</body>
```

---

## 2. DNS — Fix Email Deliverability

### Current State
onlinefcu.com has **no DNS records** (only HINFO). Email from `@onlinefcu.com` goes to spam because no SPF/DKIM/DMARC.

### What you need to do
Log into your domain registrar account (DomainPeople — where you bought `onlinefcu.com`) and add these DNS records:

### MX Record (email routing)
| Type | Name | Value | Priority |
|------|------|-------|----------|
| MX | @ | `onlinefcu-com.mail.protection.outlook.com` | 0 |

### SPF Record (sender authorization)
| Type | Name | Value |
|------|------|-------|
| TXT | @ | `v=spf1 include:spf.protection.outlook.com -all` |

### DKIM (email signing)
DKIM is generated by Microsoft 365. After adding MX and SPF:
1. Go to https://admin.microsoft.com → **Settings** → **Domains** → select `onlinefcu.com`
2. Click **DNS management** → **Add your own DNS records**
3. Microsoft will show 2 CNAME records to add

### DMARC (policy & reporting)
| Type | Name | Value |
|------|------|-------|
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:admin@onlinefcu.com` |

### Required CNAME Records
| Type | Name | Value |
|------|------|-------|
| CNAME | `autodiscover` | `autodiscover.outlook.com` |
| CNAME | `enterpriseregistration` | `enterpriseregistration.windows.net` |
| CNAME | `enterpriseenrollment` | `enterpriseenrollment.manage.microsoft.com` |
| CNAME | `selector1._domainkey` | `selector1-onlinefcu-com._domainkey.onlinefcu.onmicrosoft.com` |
| CNAME | `selector2._domainkey` | `selector2-onlinefcu-com._domainkey.onlinefcu.onmicrosoft.com` |

---

## 3. Power BI — Analytics Dashboards

### Architecture

```
PostgreSQL → Power BI Gateway (on-premises data gateway)
         → or → Power BI REST API (push dataset from analytics endpoint)
         → or → CSV export from /api/analytics/summary
```

### Data Model (Tables to import)

| Table | Source | Key Fields |
|-------|--------|------------|
| `users` | Prisma | id, email, role, createdAt |
| `program_memberships` | Prisma | id, clientUserId, programId, status, joinedAt |
| `workout_sessions` | Prisma | id, clientUserId, status, startedAt, completedAt |
| `momentum_scores` | Prisma | id, clientUserId, coachUserId, score, snapshotDate |
| `risk_flag_timeline_events` | Prisma | id, clientUserId, severity, type, detectedAt |
| `subscriptions` | Prisma | id, coachUserId, status, amountCents |
| `payments` | Prisma | id, coachUserId, amountCents, status, createdAt |

### Key Measures (DAX)

```dax
Active Clients = DISTINCTCOUNT(workout_sessions[clientUserId])
MRR = SUM(subscriptions[amountCents]) / 100
Avg Momentum = AVERAGE(momentum_scores[score])
Adherence Rate = DIVIDE([Completed Sessions], [Total Sessions])
Churn Risk Count = COUNTROWS(FILTER(risk_flags, risk_flags[severity] = "CRITICAL"))
Client Growth = COUNTROWS(VALUES(program_memberships[clientUserId]))
Revenue Growth = [MRR] - CALCULATE([MRR], DATEADD('Date'[Date], -1, MONTH))
Completion Rate = DIVIDE(
    COUNTROWS(FILTER(workout_sessions, workout_sessions[status] = "completed")),
    COUNTROWS(workout_sessions)
)
```

### Dashboard Pages

1. **Executive Overview** — MRR gauge, Active Clients, Avg Momentum, Completion Rate
2. **Client Trends** — Client growth line chart, Adherence distribution pie, Momentum trend
3. **Risk & Flags** — Flags by severity bar, Risk trend over time, Top at-risk clients
4. **Revenue** — Revenue by month bar, MRR trend, Top packages by revenue
5. **Operations** — Top exercises bar, Session completion by day of week, Coach workload

### Power BI Push API (Alternative — No Gateway Needed)

The backend `/api/analytics/summary` endpoint can push data to Power BI via REST:

```
POST https://api.powerbi.com/v1.0/myorg/datasets/{datasetId}/rows
```

To set this up:
1. Login at https://app.powerbi.com
2. Create a workspace → Create a streaming dataset → REST API
3. Define schema matching `AnalyticsSummary` fields
4. Copy the Push URL → set as `POWER_BI_PUSH_URL` env var in Railway
5. Backend will push data every 5 minutes (matching cache TTL)

### Backend Integration (requires Power BI Push URL)

```typescript
// backend/src/modules/analytics/analytics.routes.ts (after getAnalyticsSummary)
if (env.POWER_BI_PUSH_URL) {
  fetch(env.POWER_BI_PUSH_URL, {
    method: "POST",
    body: JSON.stringify([{ /* summary fields */ }]),
  }).catch(() => {});
}
```

No code changes needed until the Power BI Push URL is configured. The analytics endpoint is already deployed and returning all required data at `GET /api/analytics/summary`.

---

## Summary

| # | Task | Who | Time | Status |
|---|------|-----|------|--------|
| 2 | Power Automate — create 4 flows in `make.powerautomate.com` | You | ~15 min | ⏳ Needs you |
| 3 | DNS — add records at DomainPeople | You | ~10 min | ⏳ Needs you |
| 4 | Power BI — create workspace + dataset | You | ~20 min | ⏳ Needs you |
| — | After PA flows created: set `PA_FLOW_*_URL` env vars in Railway | You | ~2 min | ⏳ After flows |
| — | After Power BI Push URL: set `POWER_BI_PUSH_URL` env var | Me | ~5 min | ⏳ After dataset |
