import { Router } from "express";
import { z } from "zod";
import { requireAuth, AuthenticatedRequest } from "../../common/middleware/auth";
import { asyncHandler } from "../../common/utils/async-handler";
import { getPresignedUploadUrl, getPublicUrl } from "../../lib/storage";
import { uploadToSharepoint } from "../../lib/sharepoint";
import { env } from "../../config/env";

export const mediaRouter = Router();
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
  res.json({ uploadUrl, publicUrl, key };
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

// New endpoint to proxy SharePoint files (for video playback, etc.)
const sharepointFileSchema = z.object({
  siteId: z.string(),
  driveItemId: z.string(),
});

mediaRouter.get("/sharepoint-file/:siteId/:driveItemId", asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { siteId, driveItemId } = sharepointFileSchema.parse(req.params);
  
  // Get Microsoft Graph token using app credentials
  const tokenResp = await fetch(`https://login.microsoftonline.com/${env.MS_GRAPH_TENANT_ID}/oauth2/v2.0/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.MS_GRAPH_CLIENT_ID,
      client_secret: env.MS_GRAPH_CLIENT_SECRET,
      scope: "https://graph.microsoft.com/.default",
      grant_type: "client_credentials",
    }),
  });

  if (!tokenResp.ok) {
    throw new Error("Failed to acquire Microsoft Graph token");
  }

  const tokenData = await tokenResp.json() as { access_token: string };
  const accessToken = tokenData.access_token;

  // Fetch the file from SharePoint
  const fileResp = await fetch(
    `https://graph.microsoft.com/v1.0/sites/${siteId}/drive/items/${driveItemId}/content`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!fileResp.ok) {
    const errorText = await fileResp.text();
    throw new Error(`Failed to fetch file from SharePoint: ${fileResp.status} - ${errorText}`);
  }

  // Get file properties to determine content type
  const propsResp = await fetch(
    `https://graph.microsoft.com/v1.0/sites/${siteId}/drive/items/${driveItemId}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  let contentType = "application/octet-stream";
  if (propsResp.ok) {
    const propsData = await propsResp.json() as { file?: { mimeType: string } };
    if (propsData.file?.mimeType) {
      contentType = propsData.file.mimeType;
    }
  }

  // Set appropriate headers for video streaming
  res.setHeader("Content-Type", contentType);
  res.setHeader("Accept-Ranges", "bytes");
  res.setHeader("Cache-Control", "public, max-age=3600"); // Cache for 1 hour

  // Stream the file content
  fileResp.body.pipe(res);
}));