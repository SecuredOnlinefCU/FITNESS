
import dotenv from "dotenv"; import { z } from "zod"; dotenv.config();
const schema=z.object({PORT:z.coerce.number().default(4000),NODE_ENV:z.string().default('development'),APP_BASE_URL:z.string().default('http://localhost:3000'),DATABASE_URL:z.string().min(1),JWT_SECRET:z.string().min(16),JWT_REFRESH_SECRET:z.string().min(16),ACCESS_TOKEN_EXPIRES_IN:z.string().default('15m'),REFRESH_TOKEN_EXPIRES_IN:z.string().default('30d'),BCRYPT_ROUNDS:z.coerce.number().min(8).max(14).default(10),STRIPE_SECRET_KEY:z.string().optional(),STRIPE_WEBHOOK_SECRET:z.string().optional()});
export const env=schema.parse(process.env);
