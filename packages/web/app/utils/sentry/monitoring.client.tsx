import { useLocation, useMatches } from "@remix-run/react";
import * as Sentry from "@sentry/remix";
import { useEffect } from "react";

export function init() {
  Sentry.init({
    dsn: ENV.SENTRY_DSN,
    environment: ENV.STAGE,
    enabled: false,
    beforeSend(event) {
      if (event.request?.url) {
        const url = new URL(event.request.url);
        if (
          url.protocol === "chrome-extension:" ||
          url.protocol === "moz-extension:"
        ) {
          // This error is from a browser extension, ignore it
          return null;
        }
      }
      return event;
    },
    autoSessionTracking: false,
    sendClientReports: false,
    tracesSampleRate: 1,
    replaysOnErrorSampleRate: 1,
    integrations: [
      Sentry.browserTracingIntegration({
        useEffect,
        useLocation,
        useMatches,
      }),
    ],
  });
}
