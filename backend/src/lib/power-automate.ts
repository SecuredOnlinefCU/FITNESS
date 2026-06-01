import { env } from "../config/env";

type FlowPayload = Record<string, string | number | boolean>;

const FLOW_URLS: Record<string, string | undefined> = {
  welcome: env.PA_FLOW_WELCOME_URL,
  invite: env.PA_FLOW_INVITE_URL,
  passwordReset: env.PA_FLOW_PASSWORD_RESET_URL,
  paymentReceipt: env.PA_FLOW_PAYMENT_RECEIPT_URL,
};

export async function triggerFlow(flowName: string, payload: FlowPayload): Promise<boolean> {
  const url = FLOW_URLS[flowName];
  if (!url) return false;
  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!resp.ok) {
      console.error(`[power-automate] ${flowName} failed:`, resp.status, await resp.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error(`[power-automate] ${flowName} error:`, err);
    return false;
  }
}

export function triggerWelcomeFlow(email: string, firstName: string): Promise<boolean> {
  return triggerFlow("welcome", { email, firstName, appName: "LevelFit" });
}

export function triggerInviteFlow(email: string, firstName: string, inviterName: string, acceptUrl: string, expiresInDays: number): Promise<boolean> {
  return triggerFlow("invite", { email, firstName, inviterName, acceptUrl, expiresInDays, appName: "LevelFit" });
}

export function triggerPasswordResetFlow(email: string, firstName: string, resetUrl: string): Promise<boolean> {
  return triggerFlow("passwordReset", { email, firstName, resetUrl, expiresInMinutes: 60, appName: "LevelFit" });
}

export function triggerPaymentReceiptFlow(email: string, firstName: string, packageName: string, coachName: string, amount: string, date: string): Promise<boolean> {
  return triggerFlow("paymentReceipt", { email, firstName, packageName, coachName, amount, date, appName: "LevelFit" });
}
