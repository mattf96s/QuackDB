import type { AppLoadContext, EntryContext } from "@remix-run/node";
import { createReadableStreamFromReadable } from "@remix-run/node";
import { RemixServer } from "@remix-run/react";
import { wrapRemixHandleError } from "@sentry/remix";
import { isbot } from "isbot";
import { PassThrough } from "node:stream";
import { renderToPipeableStream } from "react-dom/server";
import { NonceProvider } from "./utils/nonce-provider";

// Only add server side monitoring to protect client side privacy
if (process.env.NODE === "production" && process.env.SENTRY_DSN) {
  import("./utils/sentry/monitoring.server").then(({ init }) => init());
}

export const handleError = wrapRemixHandleError;

const ABORT_DELAY = 5_000;

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
  loadContext: AppLoadContext,
) {
  const isBot = isbot(request.headers.get("user-agent"));

  let status = responseStatusCode;
  const headers = new Headers(responseHeaders);
  headers.set("Content-Type", "text/html; charset=utf-8");

  const nonce = String(loadContext.cspNonce) ?? undefined;

  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream(
      <NonceProvider value={nonce}>
        <RemixServer
          context={remixContext}
          url={request.url}
          abortDelay={ABORT_DELAY}
        />
      </NonceProvider>,
      {
        onAllReady() {
          if (!isBot) return;

          resolve(
            new Response(
              createReadableStreamFromReadable(pipe(new PassThrough())),
              {
                headers,
                status,
              },
            ),
          );
        },
        onShellReady() {
          shellRendered = true;

          if (isBot) return;

          resolve(
            new Response(
              createReadableStreamFromReadable(pipe(new PassThrough())),
              {
                headers,
                status,
              },
            ),
          );
        },
        onShellError(error: unknown) {
          reject(error);
        },
        onError(error: unknown) {
          status = 500;
          // Log streaming rendering errors from inside the shell.  Don't log
          // errors encountered during initial shell rendering since they'll
          // reject and get logged in handleDocumentRequest.
          if (shellRendered) {
            console.error(error);
          }
        },
      },
    );

    setTimeout(abort, ABORT_DELAY);
  });
}
