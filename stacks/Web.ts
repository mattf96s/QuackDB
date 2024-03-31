import { Config, RemixSite, type StackContext } from "sst/constructs";

export function Web({ stack, app }: StackContext) {
  const sessionSecret = new Config.Secret(stack, "SESSION_SECRET");
  const sentryAuthToken = new Config.Secret(stack, "SENTRY_AUTH_TOKEN");

  const site = new RemixSite(stack, "Site", {
    memorySize: app.stage === "production" ? 1024 : 256,
    waitForInvalidation: app.stage === "production",
    path: "packages/web/",
    runtime: "nodejs20.x",
    timeout: 30,
    nodejs: {
      loader: {
        ".ttf": "file",
        ".wasm": "file",
        ".node": "file",
      },
      splitting: true,
      esbuild: {
        target: "esnext",
        format: "esm",
      },
    },
    ...(app.stage === "production"
      ? {
          customDomain: {
            domainName: "app.quackdb.com",
            hostedZone: "app.quackdb.com",
          },
        }
      : {}),
    environment: {
      STAGE: stack.stage,
      REGION: stack.region,
      NODE_ENV: app.mode === "dev" ? "development" : "production",
      DOMAIN: app.stage === "production" ? "app.quackdb.com" : "localhost:3000",
      SENTRY_DSN:
        "https://02302d5793d3ca103701cb0b84cff6a0@o4506928409280512.ingest.us.sentry.io/4506928414982144",
    },
    bind: [sessionSecret, sentryAuthToken],
  });

  stack.addOutputs({
    URL: site.customDomainUrl ?? site.url,
  });
}
