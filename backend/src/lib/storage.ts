import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "../config/env";

function createS3Client(): S3Client | null {
  if (!env.RAILWAY_BUCKET_NAME || !env.RAILWAY_BUCKET_ACCESS_KEY_ID || !env.RAILWAY_BUCKET_SECRET_ACCESS_KEY) {
    return null;
  }
  return new S3Client({
    region: env.RAILWAY_BUCKET_REGION || "us-east-1",
    endpoint: env.RAILWAY_BUCKET_URL || undefined,
    credentials: {
      accessKeyId: env.RAILWAY_BUCKET_ACCESS_KEY_ID,
      secretAccessKey: env.RAILWAY_BUCKET_SECRET_ACCESS_KEY,
    },
    forcePathStyle: true,
  });
}

export const s3 = createS3Client();
export const bucketName = env.RAILWAY_BUCKET_NAME || "";

export async function getPresignedUploadUrl(key: string, mimeType: string, expiresInSeconds = 900): Promise<string> {
  if (!s3) throw new Error("Storage not configured — add RAILWAY_BUCKET_* env vars");
  return getSignedUrl(s3, new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: mimeType,
  }), { expiresIn: expiresInSeconds });
}

export async function getPublicUrl(key: string): Promise<string> {
  const baseUrl = env.RAILWAY_BUCKET_URL ? `${env.RAILWAY_BUCKET_URL}/${bucketName}` : `https://${bucketName}.s3.${env.RAILWAY_BUCKET_REGION}.amazonaws.com`;
  return `${baseUrl}/${key}`;
}

export async function deleteFile(key: string): Promise<void> {
  if (!s3) return;
  await s3.send(new DeleteObjectCommand({ Bucket: bucketName, Key: key }));
}
