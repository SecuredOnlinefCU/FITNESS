import nodemailer from "nodemailer";
import { env } from "../../config/env";

function getTransporter() {
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) return null;
  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  });
}

function welcomeHtml(firstName: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#0a0a0b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0b;padding:40px 20px">
<tr><td align="center">
<table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background:#141416;border-radius:16px;border:1px solid #222;overflow:hidden">
<tr><td style="padding:40px 32px 32px;text-align:center">
<img src="https://frontend-eosin-seven-71.vercel.app/logo.png" alt="LevelFit" width="48" height="48" style="border-radius:12px"/>
<h1 style="color:#f4f4f5;font-size:24px;font-weight:800;margin:20px 0 8px;letter-spacing:-0.5px">Welcome to LevelFit</h1>
<p style="color:#a1a1aa;font-size:15px;line-height:1.6;margin:0 0 24px">Hi ${firstName}, your account is ready. Start your fitness journey today.</p>
<a href="${env.APP_BASE_URL}/login" style="display:inline-block;background:#8bc34a;color:#0a0a0b;font-size:15px;font-weight:700;padding:14px 40px;border-radius:12px;text-decoration:none">Go to dashboard</a>
</td></tr>
<tr><td style="padding:24px 32px;background:#0d0d0f;border-top:1px solid #222">
<p style="color:#52525b;font-size:12px;margin:0;text-align:center">LevelFit &mdash; Intelligent coaching for serious athletes</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

function inviteHtml(inviterName: string, acceptUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#0a0a0b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0b;padding:40px 20px">
<tr><td align="center">
<table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background:#141416;border-radius:16px;border:1px solid #222;overflow:hidden">
<tr><td style="padding:40px 32px 32px;text-align:center">
<img src="https://frontend-eosin-seven-71.vercel.app/logo.png" alt="LevelFit" width="48" height="48" style="border-radius:12px"/>
<h1 style="color:#f4f4f5;font-size:24px;font-weight:800;margin:20px 0 8px;letter-spacing:-0.5px">You&rsquo;re invited</h1>
<p style="color:#a1a1aa;font-size:15px;line-height:1.6;margin:0 0 24px">${inviterName} has invited you to join LevelFit. Accept the invite to get started.</p>
<a href="${acceptUrl}" style="display:inline-block;background:#8bc34a;color:#0a0a0b;font-size:15px;font-weight:700;padding:14px 40px;border-radius:12px;text-decoration:none">Accept invite</a>
</td></tr>
<tr><td style="padding:24px 32px;background:#0d0d0f;border-top:1px solid #222">
<p style="color:#52525b;font-size:12px;margin:0;text-align:center">LevelFit &mdash; Intelligent coaching for serious athletes</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

export async function sendWelcomeEmail(email: string, firstName: string): Promise<void> {
  const t = getTransporter();
  if (!t) return;
  await t.sendMail({
    from: env.SMTP_FROM,
    to: email,
    subject: "Welcome to LevelFit",
    html: welcomeHtml(firstName),
  });
}

export async function sendInviteEmail(email: string, inviterName: string, acceptUrl: string): Promise<void> {
  const t = getTransporter();
  if (!t) return;
  await t.sendMail({
    from: env.SMTP_FROM,
    to: email,
    subject: `${inviterName} invited you to LevelFit`,
    html: inviteHtml(inviterName, acceptUrl),
  });
}
