import { nodeProfilingIntegration } from "@sentry/profiling-node";
import * as Sentry from "@sentry/remix";

const SENTRY_DSN = process.env.SENTRY_DSN;
const MODE = process.env.NODE_ENV;

export function init() {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: MODE,
    tracesSampleRate: MODE === "production" ? 1 : 0,
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      nodeProfilingIntegration(),
    ],
    _experiments: {
      metricsAggregator: true,
    },
  });
}
