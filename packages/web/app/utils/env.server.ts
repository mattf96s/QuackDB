// Source: https://github.com/epicweb-dev/epic-stack/blob/main/app/utils/env.server.ts
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production"] as const)
    .default("development"),
  STAGE: z.string(),
  REGION: z.literal("eu-west-1"),
  DOMAIN: z.string().default("localhost:3000"),
  SENTRY_DSN: z.string().default(""),
});

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envSchema> {}
  }
}

export function init() {
  const parsed = envSchema.safeParse(process.env);

  if (parsed.success === false) {
    console.error(
      "❌ Invalid environment variables:",
      parsed.error.flatten().fieldErrors,
    );

    throw new Error("Invalid environment variables");
  }
}

/**
 * This is used in both `entry.server.ts` and `root.tsx` to ensure that
 * the environment variables are set and globally available before the app is
 * started.
 *
 * NOTE: Do *not* add any environment variables in here that you do not wish to
 * be included in the client.
 * @returns all public ENV variables
 */
export function getEnv() {
  return {
    NODE_ENV: process.env.NODE_ENV,
    STAGE: process.env.STAGE,
    REGION: process.env.REGION,
    DOMAIN: process.env.DOMAIN,
    SENTRY_DSN: process.env.SENTRY_DSN,
  };
}

type ENV = ReturnType<typeof getEnv>;

declare global {
  // eslint-disable-next-line no-var
  var ENV: ENV;
  interface Window {
    ENV: ENV;
  }
}
