import { readFileSync } from "node:fs";
import { join } from "node:path";
import { env } from "../../config/env";

const templates: Record<string, string> = {};

function loadTemplates(): void {
  const dir = join(__dirname, "templates");
  for (const name of ["welcome", "invite", "forgot-password", "payment-receipt"]) {
    templates[name] = readFileSync(join(dir, `${name}.html`), "utf-8");
  }
}

function fill(template: string, vars: Record<string, string>): string {
  let html = template;
  for (const [key, val] of Object.entries(vars)) {
    html = html.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), val);
  }
  return html;
}

async function getGraphToken(): Promise<string | null> {
  if (!env.MS_GRAPH_TENANT_ID || !env.MS_GRAPH_CLIENT_ID || !env.MS_GRAPH_CLIENT_SECRET) {
    console.warn("[email] MS Graph not configured");
    return null;
  }
  const body = new URLSearchParams({
    client_id: env.MS_GRAPH_CLIENT_ID,
    client_secret: env.MS_GRAPH_CLIENT_SECRET,
    scope: "https://graph.microsoft.com/.default",
    grant_type: "client_credentials",
  });
  const resp = await fetch(`https://login.microsoftonline.com/${env.MS_GRAPH_TENANT_ID}/oauth2/v2.0/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!resp.ok) {
    console.error("[email] token failed:", resp.status, await resp.text());
    return null;
  }
  const data = await resp.json() as { access_token: string };
  return data.access_token;
}

async function sendViaGraph(to: string, subject: string, htmlContent: string): Promise<void> {
  const token = await getGraphToken();
  if (!token) return;
  const sender = env.MS_GRAPH_SENDER || "Noreply@Onlinefcu.com";
  const payload = {
    message: {
      subject,
      body: { contentType: "HTML", content: htmlContent },
      toRecipients: [{ emailAddress: { address: to } }],
    },
    saveToSentItems: false,
  };
  const resp = await fetch(`https://graph.microsoft.com/v1.0/users/${encodeURIComponent(sender)}/sendMail`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!resp.ok) {
    console.error("[email] send failed:", resp.status, await resp.text());
    throw new Error("Graph send failed");
  }
}

async function send(template: string, to: string, vars: Record<string, string>, subject: string): Promise<void> {
  if (!templates.welcome) loadTemplates();
  const html = fill(templates[template], { ...vars, unsubscribeUrl: "#" });
  await sendViaGraph(to, subject, html);
}

export async function sendWelcomeEmail(email: string, firstName: string): Promise<void> {
  await send("welcome", email, { firstName, dashboardUrl: `${env.APP_BASE_URL}/login` }, "Welcome to LevelFit");
}

export async function sendInviteEmail(email: string, inviterName: string, acceptUrl: string, expiresInDays: number): Promise<void> {
  await send("invite", email, { inviterName, acceptUrl, expiresInDays: String(expiresInDays) }, `${inviterName} invited you to LevelFit`);
}

export async function sendPasswordResetEmail(email: string, firstName: string, resetUrl: string): Promise<void> {
  await send("forgot-password", email, { firstName, email, resetUrl, expiresInMinutes: "60" }, "Reset your LevelFit password");
}

export async function sendPaymentReceiptEmail(email: string, firstName: string, vars: { packageName: string; coachName: string; amount: string; date: string }): Promise<void> {
  await send("payment-receipt", email, { firstName, ...vars, dashboardUrl: `${env.APP_BASE_URL}/billing` }, "Payment confirmed — LevelFit");
}
