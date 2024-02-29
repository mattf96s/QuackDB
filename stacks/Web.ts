import {
  AllowedMethods,
  CachePolicy,
  CachedMethods,
  HttpVersion,
  ResponseHeadersPolicy,
  ViewerProtocolPolicy,
} from "aws-cdk-lib/aws-cloudfront";
import { StackContext, StaticSite } from "sst/constructs";

export function Web({ stack, app }: StackContext) {
  const web = new StaticSite(stack, "web", {
    path: "packages/web/",
    buildOutput: "dist",
    buildCommand: "npm run build",
    assets: {
      fileOptions: [
        {
          files:
            "**/*.{js,css,woff2,woff,ttf,otf,eot,svg,png,jpg,jpeg,gif,webp,ico,json}",
          cacheControl: "max-age=31536000,public,immutable",
        },
      ],
    },

    ...(app.stage === "production"
      ? {
          customDomain: {
            domainName: "app.quackdb.com",
            hostedZone: "app.quackdb.com",
          },
        }
      : {}),
    cdk: {
      // allow strong cache policy for all files
      distribution: {
        httpVersion: HttpVersion.HTTP2_AND_3,
        defaultBehavior: {
          cachePolicy: CachePolicy.CACHING_OPTIMIZED,
          responseHeadersPolicy: ResponseHeadersPolicy.SECURITY_HEADERS,
          compress: true,
          viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          allowedMethods: AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
          cachedMethods: CachedMethods.CACHE_GET_HEAD_OPTIONS,
        },
      },
    },
    environment: {
      VITE_STAGE: stack.stage,
      VITE_REGION: stack.region,
      VITE_NODE_ENV: app.mode === "dev" ? "development" : "production",
    },
  });

  stack.addOutputs({
    URL: web.customDomainUrl ?? web.url,
  });
}
