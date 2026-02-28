import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const EnvSchema = z.object({
  NODE_ENV: z.string().optional().default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  CORS_ORIGIN: z.string().optional().default("http://localhost:3000"),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  const errors = parsed.error.flatten().fieldErrors;
  // eslint-disable-next-line no-console
  console.error("[backend] Invalid or missing environment variables. Set these in your host (e.g. Render Dashboard → Environment):");
  // eslint-disable-next-line no-console
  console.error(JSON.stringify(errors, null, 2));
  if (errors.MONGODB_URI) {
    // eslint-disable-next-line no-console
    console.error("[backend] MONGODB_URI is required. Add it in Render: Environment → MONGODB_URI (e.g. your MongoDB Atlas connection string).");
  }
  process.exit(1);
}

export const env = parsed.data;

