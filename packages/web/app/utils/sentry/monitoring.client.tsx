import { useLocation, useMatches } from "@remix-run/react";
import * as Sentry from "@sentry/remix";
import { useEffect } from "react";

export function init() {
  Sentry.init({
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

    dsn: "https://02302d5793d3ca103701cb0b84cff6a0@o4506928409280512.ingest.us.sentry.io/4506928414982144",
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
