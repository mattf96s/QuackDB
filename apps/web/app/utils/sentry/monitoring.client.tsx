import { useLocation, useMatches } from "@remix-run/react";
import * as Sentry from "@sentry/remix";
import { browserTracingIntegration, replayIntegration } from "@sentry/remix";
import { useEffect } from "react";

export function init() {
  Sentry.init({
    dsn: ENV.SENTRY_DSN,
    environment: ENV.STAGE,
    integrations: [
      browserTracingIntegration({
        useEffect,
        useLocation,
        useMatches,
      }),
      // Replay is only available in the client
      replayIntegration(),
    ],

    tracesSampleRate: 1,
    replaysOnErrorSampleRate: 0,
    replaysSessionSampleRate: 0, // no session replays for privacy
  });
}
