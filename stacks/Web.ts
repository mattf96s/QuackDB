import { Config, RemixSite, StackContext } from "sst/constructs";

export function Web({ stack, app }: StackContext) {
  const sessionSecret = new Config.Secret(stack, "SESSION_SECRET");

  const site = new RemixSite(stack, "Site", {
    waitForInvalidation: app.stage === "production",
    path: "packages/web/",
    runtime: "nodejs20.x",
    timeout: 30,
    nodejs: {
      loader: {
        ".ttf": "file",
      },
      splitting: true,
      esbuild: {
        target: "esnext",
        format: "esm",
        ignoreAnnotations: true,
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
      VITE_STAGE: stack.stage,
      VITE_REGION: stack.region,
      VITE_NODE_ENV: app.mode === "dev" ? "development" : "production",
      VITE_DOMAIN:
        app.stage === "production" ? "app.quackdb.com" : "localhost:3000",
    },
    bind: [sessionSecret],
  });

  stack.addOutputs({
    URL: site.customDomainUrl ?? site.url,
  });
}
