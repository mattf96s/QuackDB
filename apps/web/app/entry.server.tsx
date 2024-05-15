import { RemixServer } from "@remix-run/react";
import {
  AppLoadContext,
  handleRequest as vercelHandleRequest,
  type EntryContext,
} from "@vercel/remix";
import { getEnv, init } from "./utils/env.server";

init();
global.ENV = getEnv();

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
  let remixServer = (
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
