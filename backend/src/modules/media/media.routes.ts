import { Router } from "express";
import { z } from "zod";
import { requireAuth, AuthenticatedRequest } from "../../common/middleware/auth";
import { asyncHandler } from "../../common/utils/async-handler";
import { uploadFile } from "../../lib/storage";

export const mediaRouter = Router();
mediaRouter.use(requireAuth);

const uploadSchema = z.object({
  fileName: z.string().min(1),
  mimeType: z.string().min(1),
  data: z.string().min(1),
});

mediaRouter.post("/upload", asyncHandler(async (req: AuthenticatedRequest, res) => {
  const b = uploadSchema.parse(req.body);
  const buf = Buffer.from(b.data, "base64");
  const key = `uploads/${req.user!.sub}/${Date.now()}-${b.fileName}`;
  const url = await uploadFile(key, buf, b.mimeType);
  res.status(201).json({ url, key });
}));
