import { StackContext, StaticSite } from "sst/constructs";

const domainName = 'app.quackdb.com'

export function Web({ stack, app }: StackContext) {

  const web = new StaticSite(stack, "web", {
    path: "packages/web",
    buildOutput: "dist",
    buildCommand: "npm run build",
    ...(app.stage === "production" ?
      {
        customDomain: {
          domainName,
          hostedZone: domainName
        },
      }
      : {}),
    environment: {
      STAGE: stack.stage,
      REGION: stack.region,
      NODE_ENV: app.mode === "dev" ? "development" : "production"
    },
  });

  stack.addOutputs({
    URL: web.url || "localhost"
  });
}
