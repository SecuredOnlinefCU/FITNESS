import { Router } from "express";
import { z } from "zod";
import { requireAuth, AuthenticatedRequest } from "../../common/middleware/auth";
import { asyncHandler } from "../../common/utils/async-handler";
import { getPresignedUploadUrl, getPublicUrl } from "../../lib/storage";
import { uploadToSharepoint } from "../../lib/sharepoint";

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
