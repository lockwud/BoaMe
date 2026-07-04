import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(5000),
  WEB_URL: z.string().url().default("http://localhost:3000"),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(12).default("development-only-secret"),
  JWT_REFRESH_SECRET: z.string().min(12).default("development-only-refresh-secret")
});

export const env = schema.parse(process.env);
