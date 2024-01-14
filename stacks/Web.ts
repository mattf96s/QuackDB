import { StackContext, StaticSite, use } from "sst/constructs";
import { DNS } from "./DNS";

// ns-272.awsdns-34.com.
// ns-1531.awsdns-63.org.
// ns-797.awsdns-35.net.
// ns-1537.awsdns-00.co.uk.

export function Web({ stack, app }: StackContext) {
  const dns = use(DNS);

  const web = new StaticSite(stack, "web", {
    path: "packages/web",
    buildOutput: "dist",
    buildCommand: "npm run build",
    ...(app.stage === "production" ?
      {
        customDomain: {
          domainName: dns.domain,
          domainAlias: `www.${dns.domain}`,
          hostedZone: dns.zone.zoneName,
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
