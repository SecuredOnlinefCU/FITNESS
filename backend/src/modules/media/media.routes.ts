import { Router } from "express";
import { z } from "zod";
import jwt from "jsonwebtoken";
import { requireAuth, AuthenticatedRequest } from "../../common/middleware/auth";
import { asyncHandler } from "../../common/utils/async-handler";
import { getPresignedUploadUrl, getPublicUrl } from "../../lib/storage";
import { uploadToSharepoint } from "../../lib/sharepoint";
import { env } from "../../config/env";

const GRAPH_BASE = "https://graph.microsoft.com/v1.0";

export const mediaRouter = Router();

// Proxy endpoint for SharePoint video files — handles auth via query-param JWT token.
// Registered BEFORE requireAuth so the browser video element can load the URL without custom headers.
mediaRouter.get("/sharepoint-proxy", asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { url, token } = req.query as { url?: string; token?: string };

  if (!url || !token) {
    res.status(401).json({ error: "Missing url or token" });
    return;
  }

  // Validate JWT from query param
  let payload: { sub: string; role: string };
  try {
    payload = jwt.verify(token, env.JWT_SECRET) as { sub: string; role: string };
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }

  // Get Microsoft Graph token using app credentials
  const tokenResp = await fetch(
    `https://login.microsoftonline.com/${env.MS_GRAPH_TENANT_ID}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: env.MS_GRAPH_CLIENT_ID!,
        client_secret: env.MS_GRAPH_CLIENT_SECRET!,
        scope: "https://graph.microsoft.com/.default",
        grant_type: "client_credentials",
      }),
    }
  );

  if (!tokenResp.ok) {
    res.status(502).json({ error: "Failed to acquire Microsoft Graph token" });
    return;
  }

  const tokenData = (await tokenResp.json()) as { access_token: string };
  const accessToken = tokenData.access_token;

  // Parse SharePoint URL to extract site and file path
  // Format: https://{tenant}.sharepoint.com/sites/{site-name}/ExerciseVideos/{filename}
  const urlObj = new URL(url);
  const siteHost = urlObj.host;

  const pathSegments = urlObj.pathname.split("/");
  // pathSegments example: ['', 'sites', 'LevelFITness', 'ExerciseVideos', 'file.mp4']
  const sitePath = "/" + pathSegments.slice(1, 3).join("/"); // e.g. /sites/LevelFITness
  const filePath = decodeURIComponent(pathSegments.slice(3).join("/")); // e.g. ExerciseVideos/file.mp4

  // Resolve SharePoint site ID
  const siteResp = await fetch(`${GRAPH_BASE}/sites/${siteHost}:${sitePath}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!siteResp.ok) {
    res.status(502).json({ error: "Failed to resolve SharePoint site" });
    return;
  }

  const siteData = (await siteResp.json()) as { id: string };
  const siteId = siteData.id;

  // Fetch the file from SharePoint via Graph API content endpoint
  const fileResp = await fetch(
    `${GRAPH_BASE}/sites/${siteId}/drive/root:/${filePath}:/content`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!fileResp.ok) {
    res.status(502).json({ error: "Failed to fetch file from SharePoint" });
    return;
  }

  // Infer content type from file extension
  const ext = urlObj.pathname.split(".").pop()?.toLowerCase();
  const mimeMap: Record<string, string> = {
    mp4: "video/mp4",
    webm: "video/webm",
    mov: "video/quicktime",
    avi: "video/x-msvideo",
    mkv: "video/x-matroska",
    ogg: "video/ogg",
  };
  const contentType = mimeMap[ext || ""] || "application/octet-stream";

  res.setHeader("Content-Type", contentType);
  res.setHeader("Accept-Ranges", "bytes");
  res.setHeader("Cache-Control", "public, max-age=3600");
  res.setHeader("Access-Control-Allow-Origin", "*");

  // Stream the file using ReadableStream reader
  const reader = fileResp.body!.getReader();
  const pump = async () => {
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) { res.end(); break; }
        res.write(value);
      }
    } catch {
      if (!res.headersSent) res.end();
    }
  };
  pump();
}));

mediaRouter.use(requireAuth);

const uploadUrlSchema = z.object({
  fileName: z.string().min(1),
  mimeType: z.string().min(1),
});

mediaRouter.get("/upload-url", asyncHandler(async (req: AuthenticatedRequest, res) => {
  const b = uploadUrlSchema.parse(req.query);
  const key = `uploads/${req.user!.sub}/${Date.now()}-${b.fileName}`;
  const uploadUrl = await getPresignedUploadUrl(key, b.mimeType);
  const publicUrl = await getPublicUrl(key);
  res.json({ uploadUrl, publicUrl, key });
}));

const sharepointUploadSchema = z.object({
  fileName: z.string().min(1),
  mimeType: z.string().min(1),
  data: z.string().min(1),
});

mediaRouter.post("/upload-sharepoint", asyncHandler(async (req: AuthenticatedRequest, res) => {
  const b = sharepointUploadSchema.parse(req.body);
  const buf = Buffer.from(b.data, "base64");
  const result = await uploadToSharepoint(b.fileName, b.mimeType, buf);
  res.json(result);
}));

const chatMediaUploadSchema = z.object({
  fileName: z.string().min(1),
  mimeType: z.string().min(1),
  data: z.string().min(1),
  messageType: z.enum(["VOICE", "VIDEO"]),
});

mediaRouter.post("/upload-chat-media", asyncHandler(async (req: AuthenticatedRequest, res) => {
  const b = chatMediaUploadSchema.parse(req.body);
  const buf = Buffer.from(b.data, "base64");
  const folder = `ChatMedia/${req.user!.sub}`;
  const result = await uploadToSharepoint(b.fileName, b.mimeType, buf, folder);
  res.json({ webUrl: result.webUrl, mediaAssetId: result.webUrl });
}));
