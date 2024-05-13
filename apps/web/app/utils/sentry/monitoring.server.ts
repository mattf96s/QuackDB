import { nodeProfilingIntegration } from "@sentry/profiling-node";
import * as Sentry from "@sentry/remix";

const isProduction = process.env.STAGE === "production";

export function init() {
  Sentry.init({
    dsn: ENV.SENTRY_DSN,
    environment: ENV.STAGE,
    tracesSampleRate: isProduction ? 1 : 0,
    denyUrls: [
      /\/build\//,
      /\/favicons\//,
      /\/fonts\//,
      /\/favicon.ico/,
      /\/site\.webmanifest/,
    ],
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      nodeProfilingIntegration(),
    ],
    _experiments: {
      metricsAggregator: true,
    },
  });
}
