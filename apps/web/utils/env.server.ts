// Source: https://github.com/epicweb-dev/epic-stack/blob/main/app/utils/env.server.ts
import { z } from "zod";

const envSchema = z.object({
  SESSION_SECRET: z.string().default(""),

  // vercel specific (optional because it's not available in local development)
  VERCEL: z.string().optional(), // An indicator to show that System Environment Variables have been exposed to your project's Deployments. Example: 1.
  VERCEL_ENV: z.string().optional(), // The Environment that the app is deployed and running on. The value can be either production, preview, or development.
  VERCEL_PROJECT_PRODUCTION_URL: z.string().optional(), // A production domain name of the project. We select the shortest production custom domain, or vercel.app domain if no custom domain is available. Note, that this is always set, even in preview deployments. This is useful to reliably generate links that point to production such as OG-image URLs. The value does not include the protocol scheme https://.

  VERCEL_GIT_COMMIT_SHA: z.string().optional(), // The Git commit SHA of the deployment.
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
    const errors = parsed.error.flatten().fieldErrors;
    console.error("❌ Invalid environment variables:", errors);

    throw new Error(
      `Invalid environment variables\n${JSON.stringify(errors, null, 2)}`,
    );
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
    VERCEL_ENV: process.env.VERCEL_ENV,
    VERCEL_PROJECT_PRODUCTION_URL: process.env.VERCEL_PROJECT_PRODUCTION_URL,
    VERCEL_GIT_COMMIT_SHA: process.env.VERCEL_GIT_COMMIT_SHA,
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
