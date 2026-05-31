import { readFileSync } from "node:fs";
import { join } from "node:path";
import nodemailer from "nodemailer";
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

function getTransporter() {
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) return null;
  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  });
}

async function send(template: string, to: string, vars: Record<string, string>, subject: string): Promise<void> {
  const t = getTransporter();
  if (!t) return;
  if (!templates.welcome) loadTemplates();
  await t.sendMail({
    from: env.SMTP_FROM,
    to,
    subject,
    html: fill(templates[template], { ...vars, unsubscribeUrl: "#" }),
  });
}

export async function sendWelcomeEmail(email: string, firstName: string): Promise<void> {
  await send("welcome", email, { firstName, dashboardUrl: `${env.APP_BASE_URL || "http://localhost:3000"}/login` }, "Welcome to LevelFit");
}

export async function sendInviteEmail(email: string, inviterName: string, acceptUrl: string, expiresInDays: number): Promise<void> {
  await send("invite", email, { inviterName, acceptUrl, expiresInDays: String(expiresInDays) }, `${inviterName} invited you to LevelFit`);
}

export async function sendPasswordResetEmail(email: string, firstName: string, resetUrl: string): Promise<void> {
  await send("forgot-password", email, { firstName, email, resetUrl, expiresInMinutes: "60" }, "Reset your LevelFit password");
}

export async function sendPaymentReceiptEmail(email: string, firstName: string, vars: { packageName: string; coachName: string; amount: string; date: string }): Promise<void> {
  await send("payment-receipt", email, { firstName, ...vars, dashboardUrl: `${env.APP_BASE_URL || "http://localhost:3000"}/billing` }, "Payment confirmed — LevelFit");
}
