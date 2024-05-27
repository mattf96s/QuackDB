import { RemixServer } from "@remix-run/react";
import {
  handleRequest as vercelHandleRequest,
  type ActionFunctionArgs,
  type AppLoadContext,
  type EntryContext,
  type LoaderFunctionArgs,
} from "@vercel/remix";
import { getEnv, init } from "./utils/env.server";

init();
global.ENV = getEnv();

export function handleError(
  error: unknown,
  { request }: LoaderFunctionArgs | ActionFunctionArgs,
) {
  if (!request.signal.aborted) {
    // If you want to log errors to an external service like Sentry, you can
    // Sentry.captureRemixServerException(error, "remix.server", request);
    console.error(error);
  }
}

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
  // This is ignored so we can keep it in the template for visibility.  Feel
  // free to delete this parameter in your app if you're not using it!
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  loadContext: AppLoadContext,
) {
  const remixServer = (
    <RemixServer
      context={remixContext}
      url={request.url}
      abortDelay={5_000}
    />
  );
  return vercelHandleRequest(
    request,
    responseStatusCode,
    responseHeaders,
    remixServer,
  );
}
