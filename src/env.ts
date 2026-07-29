import { z } from "zod";

/**
 * Validated environment. Import this instead of touching `process.env`
 * directly so a misconfigured deployment fails loudly at boot.
 */
const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  BETTER_AUTH_SECRET: z.string().min(16, "BETTER_AUTH_SECRET must be >= 16 chars"),
  BETTER_AUTH_URL: z.string().url().default("http://localhost:3000"),

  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_SITE_NAME: z.string().default("24asia"),

  // Web push (PWA notifications). Optional in dev.
  VAPID_PUBLIC_KEY: z.string().optional(),
  VAPID_PRIVATE_KEY: z.string().optional(),
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: z.string().optional(),
  VAPID_SUBJECT: z.string().default("mailto:hello@24asia.org"),

  // Transactional email. Optional in dev - falls back to console transport.
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default("24asia <no-reply@24asia.org>"),

  // Payments (Stripe). When unset, the platform runs in TEST payment mode so
  // the full donation/checkout flow works without a live processor.
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),

  // Object storage for media uploads (S3 compatible: R2, Supabase, MinIO).
  S3_ENDPOINT: z.string().optional(),
  S3_REGION: z.string().default("auto"),
  S3_BUCKET: z.string().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  S3_PUBLIC_BASE_URL: z.string().optional(),
});

type Env = z.infer<typeof schema>;

function load(): Env {
  // During `next build` the DB is not always reachable, but the vars must exist.
  const parsed = schema.safeParse(process.env);

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("\n");
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }

  return parsed.data;
}

export const env = load();

export const isProd = env.NODE_ENV === "production";
export const isDev = env.NODE_ENV === "development";
