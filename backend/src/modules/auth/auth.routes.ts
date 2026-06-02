import { Router } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { env } from "../../config/env";
import { asyncHandler } from "../../common/utils/async-handler";
import { requireAuth, AuthenticatedRequest, requireRole } from "../../common/middleware/auth";
import { HttpError } from "../../common/errors/http-error";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "./auth.tokens";
import { sendWelcomeEmail, sendInviteEmail, sendPasswordResetEmail } from "../email/email.service";
import { triggerWelcomeFlow, triggerInviteFlow, triggerPasswordResetFlow } from "../../lib/power-automate";
import { validateMicrosoftToken } from "../../lib/entra-id";

export const authRouter = Router();
const sha = (v: string) => crypto.createHash("sha256").update(v).digest("hex");

async function roleId(name: string) {
  const r = await prisma.role.findUnique({ where: { name: name as any } });
  if (!r) throw new HttpError(500, "roles not seeded");
  return r.id;
}

function tokenPayload(user: { id: string; email: string; roles: { role: { name: string } }[] }) {
  return { sub: user.id, email: user.email, role: user.roles[0]?.role?.name || "client" };
}

authRouter.post(
  "/signup",
  asyncHandler(async (req, res) => {
    const body = z
      .object({
        email: z.string().email(),
        password: z.string().min(8),
        confirmPassword: z.string().min(8),
        role: z.enum(["client", "coach", "assistant_coach"]),
        firstName: z.string().min(1).max(100),
        lastName: z.string().min(1).max(100),
      })
      .refine((d) => d.password === d.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
      })
      .parse(req.body);

    const email = body.email.toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new HttpError(409, "An account with this email already exists");

    const displayName = `${body.firstName} ${body.lastName}`;
    const hash = await bcrypt.hash(body.password, env.BCRYPT_ROUNDS);
    const rid = await roleId(body.role);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hash,
        firstName: body.firstName,
        lastName: body.lastName,
        roles: { create: [{ roleId: rid }] },
        clientProfile: body.role === "client" ? { create: { displayName } } : undefined,
        coachProfile: body.role !== "client" ? { create: { displayName } } : undefined,
      },
      include: { roles: { include: { role: true } } },
    });

    const payload = tokenPayload(user);
    const refresh = signRefreshToken(payload);
    await prisma.refreshSession.create({ data: { userId: user.id, tokenHash: sha(refresh) } });

    triggerWelcomeFlow(user.email, user.firstName || "")
      .then((sent) => { if (!sent) sendWelcomeEmail(user.email, user.firstName || ""); })
      .catch((err) => console.error("[email] welcome send failed:", err));
    res.status(201).json({
      user: { id: user.id, email: user.email, role: payload.role, firstName: user.firstName, lastName: user.lastName },
      accessToken: signAccessToken(payload),
      refreshToken: refresh,
    });
  }),
);

authRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    const body = z.object({ email: z.string().email(), password: z.string() }).parse(req.body);
    const user = await prisma.user.findUnique({
      where: { email: body.email.toLowerCase() },
      include: { roles: { include: { role: true } } },
    });
    if (!user || !(await bcrypt.compare(body.password, user.passwordHash))) {
      throw new HttpError(401, "Invalid credentials");
    }

    const payload = tokenPayload(user);
    const refresh = signRefreshToken(payload);
    await prisma.refreshSession.create({ data: { userId: user.id, tokenHash: sha(refresh) } });

    res.json({
      user: { id: user.id, email: user.email, role: payload.role, firstName: user.firstName, lastName: user.lastName },
      accessToken: signAccessToken(payload),
      refreshToken: refresh,
    });
  }),
);

authRouter.post(
  "/refresh",
  asyncHandler(async (req, res) => {
    const body = z.object({ refreshToken: z.string() }).parse(req.body);
    const payload = verifyRefreshToken(body.refreshToken);
    const old = await prisma.refreshSession.findFirst({
      where: { userId: payload.sub, tokenHash: sha(body.refreshToken), revokedAt: null },
    });
    if (!old) throw new HttpError(401, "Refresh session not found");

    const next = signRefreshToken(payload);
    await prisma.$transaction([
      prisma.refreshSession.update({ where: { id: old.id }, data: { revokedAt: new Date() } }),
      prisma.refreshSession.create({ data: { userId: payload.sub, tokenHash: sha(next) } }),
    ]);

    res.json({ accessToken: signAccessToken(payload), refreshToken: next });
  }),
);

authRouter.post(
  "/logout",
  asyncHandler(async (req, res) => {
    const body = z.object({ refreshToken: z.string() }).parse(req.body);
    await prisma.refreshSession.updateMany({
      where: { tokenHash: sha(body.refreshToken), revokedAt: null },
      data: { revokedAt: new Date() },
    });
    res.json({ success: true });
  }),
);

authRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.sub },
      include: {
        roles: { include: { role: true } },
        clientProfile: true,
        coachProfile: true,
        primaryProgram: { include: { program: true } },
      },
    });
    res.json(user);
  }),
);

authRouter.post(
  "/forgot-password",
  asyncHandler(async (req, res) => {
    const { email } = z.object({ email: z.string().email() }).parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      res.json({ success: true, message: "If that email exists, a reset link was sent." });
      return;
    }
    const token = crypto.randomBytes(32).toString("hex");
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: sha(token),
        expiresAt: new Date(Date.now() + 3600000),
      },
    });
    const resetUrl = `${env.APP_BASE_URL}/reset-password?token=${token}`;
    triggerPasswordResetFlow(user.email, user.firstName || "there", resetUrl)
      .then((sent) => { if (!sent) sendPasswordResetEmail(user.email, user.firstName || "there", resetUrl); })
      .catch((err) => console.error("[email] reset send failed:", err));
    res.json({ success: true, message: "If that email exists, a reset link was sent." });
  }),
);

authRouter.post(
  "/reset-password",
  asyncHandler(async (req, res) => {
    const { token, password } = z
      .object({ token: z.string().min(1), password: z.string().min(8) })
      .parse(req.body);
    const record = await prisma.passwordResetToken.findFirst({
      where: { tokenHash: sha(token), usedAt: null, expiresAt: { gte: new Date() } },
    });
    if (!record) throw new HttpError(400, "Invalid or expired reset token");
    const hash = await bcrypt.hash(password, env.BCRYPT_ROUNDS);
    await prisma.$transaction([
      prisma.user.update({ where: { id: record.userId }, data: { passwordHash: hash } }),
      prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
    ]);
    res.json({ success: true, message: "Password updated. You can now sign in." });
  }),
);

authRouter.post(
  "/invites",
  requireAuth,
  requireRole(["coach", "assistant_coach"]),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const body = z
      .object({
        email: z.string().email(),
        firstName: z.string().min(1).max(100),
        lastName: z.string().min(1).max(100),
        programId: z.string().uuid().optional(),
        expiresInDays: z.number().default(7),
      })
      .parse(req.body);

    const displayName = `${body.firstName} ${body.lastName}`;
    const token = crypto.randomBytes(24).toString("hex");
    const invite = await prisma.coachInvite.create({
      data: {
        coachUserId: req.user!.sub,
        email: body.email.toLowerCase(),
        displayName,
        programId: body.programId,
        tokenHash: sha(token),
        expiresAt: new Date(Date.now() + body.expiresInDays * 86400000),
      },
    });
    const coach = await prisma.user.findUnique({ where: { id: req.user!.sub } });
    const acceptUrl = `${env.APP_BASE_URL}/accept-invite?token=${token}`;
    if (coach) {
      triggerInviteFlow(body.email, body.firstName, coach.firstName || "Your coach", acceptUrl, body.expiresInDays)
        .then((sent) => { if (!sent) sendInviteEmail(body.email, coach.firstName || "Your coach", acceptUrl, body.expiresInDays); })
        .catch((err) => console.error("[email] invite send failed:", err));
    }
    res.status(201).json({
      inviteId: invite.id,
      inviteToken: token,
      acceptUrl,
    });
  }),
);

authRouter.post(
  "/invites/accept",
  asyncHandler(async (req, res) => {
    const { token } = z.object({ token: z.string().min(1) }).parse(req.body);
    const tokenHash = sha(token);

    const invite = await prisma.coachInvite.findUnique({
      where: { tokenHash },
    });

    if (!invite) throw new HttpError(400, "Invalid invite token");
    if (invite.expiresAt < new Date()) throw new HttpError(400, "Invite has expired");

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email: invite.email.toLowerCase() },
      include: { roles: { include: { role: true } } },
    });

    const isResumingIncomplete = !!(user && invite.acceptedAt && !user.passwordHash);

    if (invite.acceptedAt && !isResumingIncomplete) {
      throw new HttpError(400, "Invite already accepted");
    }

    if (!user) {
      // Create new user account
      const displayName = invite.displayName;
      const clientRoleId = await roleId("client");
      user = await prisma.user.create({
        data: {
          email: invite.email.toLowerCase(),
          passwordHash: "",
          firstName: displayName.split(" ")[0] || null,
          lastName: displayName.split(" ").slice(1).join(" ") || null,
          roles: { create: [{ roleId: clientRoleId }] },
          clientProfile: { create: { displayName } },
        },
        include: { roles: { include: { role: true } } },
      });
    }

    if (!isResumingIncomplete) {
      await prisma.coachInvite.update({
        where: { id: invite.id },
        data: {
          acceptedAt: new Date(),
          status: "ACCEPTED",
        },
      });
    }

    const payload = { sub: user.id, email: user.email, role: user.roles[0]?.role?.name || "client" };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);
    await prisma.refreshSession.create({
      data: { userId: user.id, tokenHash: sha(refreshToken) },
    });

    const isNewUser = !user.passwordHash;

    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: payload.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      accessToken,
      refreshToken,
      inviteId: invite.id,
      coachUserId: invite.coachUserId,
      isNewUser,
    });
  }),
);

authRouter.post(
  "/set-password",
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { password } = z
      .object({ password: z.string().min(8).max(128) })
      .parse(req.body);

    const user = await prisma.user.findUnique({ where: { id: req.user!.sub } });
    if (!user) throw new HttpError(404, "User not found");
    if (user.passwordHash) {
      throw new HttpError(400, "Password already set. Use reset-password instead.");
    }

    const passwordHash = await bcrypt.hash(password, env.BCRYPT_ROUNDS);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    res.json({ success: true });
  }),
);

authRouter.get(
  "/google",
  asyncHandler(async (req, res) => {
    if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
      throw new HttpError(503, "Google OAuth not configured");
    }
    const state = crypto.randomBytes(32).toString("hex");
    const redirectUri = `${env.APP_BASE_URL.replace(/\/$/, "")}/api/auth/google/callback`;
    const params = new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid email profile",
      state,
      access_type: "offline",
      prompt: "consent",
    });
    res.json({ url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`, state });
  }),
);

authRouter.get(
  "/google/callback",
  asyncHandler(async (req, res) => {
    if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
      const feUrl = env.APP_BASE_URL;
      return res.redirect(`${feUrl}/auth/callback?error=google_not_configured`);
    }
    const { code, state } = z.object({ code: z.string(), state: z.string().optional() }).parse(req.query);
    const frontendUrl = env.APP_BASE_URL;

    try {
      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: env.GOOGLE_CLIENT_ID,
          client_secret: env.GOOGLE_CLIENT_SECRET,
          redirect_uri: `${frontendUrl}/api/auth/google/callback`,
          grant_type: "authorization_code",
        }).toString(),
      });

      if (!tokenResponse.ok) {
        return res.redirect(`${frontendUrl}/auth/callback?error=token_exchange_failed`);
      }

      const tokenData = (await tokenResponse.json()) as { access_token: string; expires_in?: number; refresh_token?: string };
      const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });

      if (!userInfoResponse.ok) {
        return res.redirect(`${frontendUrl}/auth/callback?error=userinfo_failed`);
      }

      const googleUser = (await userInfoResponse.json()) as {
        id: string; email: string; given_name?: string; family_name?: string; picture?: string;
      };

      const existingAccount = await prisma.account.findUnique({
        where: { provider_providerAccountId: { provider: "google", providerAccountId: googleUser.id } },
        include: { user: { include: { roles: { include: { role: true } } } } },
      });

      let userData: { id: string; email: string; roles: { role: { name: string } }[]; firstName: string | null; lastName: string | null; avatarUrl: string | null };
      let isNew = false;

      if (existingAccount) {
        userData = existingAccount.user as any;
      } else {
        const existingUser = await prisma.user.findUnique({
          where: { email: googleUser.email.toLowerCase() },
          include: { roles: { include: { role: true } } },
        });

        if (existingUser) {
          await prisma.account.create({
            data: { userId: existingUser.id, provider: "google", providerAccountId: googleUser.id, accessToken: tokenData.access_token, refreshToken: tokenData.refresh_token, expiresAt: tokenData.expires_in ? Math.floor(Date.now() / 1000) + tokenData.expires_in : null },
          });
          userData = existingUser as any;
        } else {
          isNew = true;
          const clientRoleId = await roleId("client");
          const displayName = `${googleUser.given_name || "User"} ${googleUser.family_name || ""}`.trim();
          const newUser = await prisma.user.create({
            data: {
              email: googleUser.email.toLowerCase(),
              passwordHash: "",
              firstName: googleUser.given_name || null,
              lastName: googleUser.family_name || null,
              avatarUrl: googleUser.picture || null,
              roles: { create: [{ roleId: clientRoleId }] },
              clientProfile: { create: { displayName } },
              accounts: { create: { provider: "google", providerAccountId: googleUser.id, accessToken: tokenData.access_token, refreshToken: tokenData.refresh_token, expiresAt: tokenData.expires_in ? Math.floor(Date.now() / 1000) + tokenData.expires_in : null } },
            },
            include: { roles: { include: { role: true } } },
          });
          userData = newUser as any;
        }
      }

      const payload = tokenPayload(userData as any);
      const refresh = signRefreshToken(payload);
      await prisma.refreshSession.create({ data: { userId: userData.id, tokenHash: sha(refresh) } });

      const accessToken = signAccessToken(payload);
      const params = new URLSearchParams({ accessToken, refreshToken: refresh, isNew: String(isNew) });
      res.redirect(`${frontendUrl}/auth/callback#${params.toString()}`);
    } catch {
      res.redirect(`${frontendUrl}/auth/callback?error=server_error`);
    }
  }),
);

authRouter.post(
  "/microsoft",
  asyncHandler(async (req, res) => {
    if (!env.MS_GRAPH_TENANT_ID || !env.MS_GRAPH_CLIENT_ID) {
      throw new HttpError(503, "Microsoft SSO not configured");
    }

    const { idToken } = z.object({ idToken: z.string().min(1) }).parse(req.body);

    let microsoftUser: { oid: string; email: string; name: string };
    try {
      microsoftUser = await validateMicrosoftToken(
        idToken,
        env.MS_GRAPH_TENANT_ID,
        env.MS_GRAPH_CLIENT_ID,
      );
    } catch {
      throw new HttpError(401, "Invalid Microsoft token");
    }

    if (!microsoftUser.email) {
      throw new HttpError(400, "Microsoft account has no email");
    }

    const email = microsoftUser.email.toLowerCase();

    const existingAccount = await prisma.account.findUnique({
      where: { provider_providerAccountId: { provider: "microsoft", providerAccountId: microsoftUser.oid } },
      include: { user: { include: { roles: { include: { role: true } } } } },
    });

    let userData: Awaited<ReturnType<typeof tokenPayload>> extends { sub: string } ? { id: string; email: string; roles: { role: { name: string } }[]; firstName: string | null; lastName: string | null; avatarUrl: string | null; passwordHash: string | null } : never;
    let isNew = false;

    if (existingAccount) {
      userData = existingAccount.user as any;
    } else {
      const existingUser = await prisma.user.findUnique({
        where: { email },
        include: { roles: { include: { role: true } } },
      });

      if (existingUser) {
        await prisma.account.create({
          data: {
            userId: existingUser.id,
            provider: "microsoft",
            providerAccountId: microsoftUser.oid,
          },
        });
        userData = existingUser as any;
      } else {
        isNew = true;
        const clientRoleId = await roleId("client");
        const names = microsoftUser.name.split(" ");
        const displayName = microsoftUser.name;
        const newUser = await prisma.user.create({
          data: {
            email,
            passwordHash: "",
            firstName: names[0] || null,
            lastName: names.slice(1).join(" ") || null,
            roles: { create: [{ roleId: clientRoleId }] },
            clientProfile: { create: { displayName } },
            accounts: {
              create: { provider: "microsoft", providerAccountId: microsoftUser.oid },
            },
          },
          include: { roles: { include: { role: true } } },
        });
        userData = newUser as any;
      }
    }

    const payload = tokenPayload(userData as any);
    const refresh = signRefreshToken(payload);
    await prisma.refreshSession.create({ data: { userId: userData.id, tokenHash: sha(refresh) } });

    res.json({
      user: {
        id: userData.id,
        email: userData.email,
        role: payload.role,
        firstName: userData.firstName,
        lastName: userData.lastName,
      },
      accessToken: signAccessToken(payload),
      refreshToken: refresh,
      isNewUser: !userData.passwordHash,
    });
  }),
);
