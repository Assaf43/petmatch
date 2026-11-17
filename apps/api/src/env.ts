import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  WEB_ORIGIN: z.string().min(1).default('http://localhost:5173'),
  DATABASE_URL: z.string().min(1).default('file:./data/petmatch.db'),
});

export type Env = z.infer<typeof envSchema>;

/** Validates environment variables. Throws an Error naming the bad variable. */
export function parseEnv(source: Record<string, string | undefined>): Env {
  const parsed = envSchema.safeParse(source);
  if (!parsed.success) {
    const problems = parsed.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
    throw new Error(`Invalid environment: ${problems}`);
  }
  return parsed.data;
}
