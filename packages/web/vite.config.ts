import { vitePlugin as remix } from "@remix-run/dev";
import { installGlobals } from "@remix-run/node";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import { defineConfig, splitVendorChunkPlugin } from "vite";
import envOnly from "vite-env-only";
import tsconfigPaths from "vite-tsconfig-paths";

const isProduction = process.env.STAGE === "production";
const SENTRY_AUTH_TOKEN = process.env.SENTRY_AUTH_TOKEN;

// Remix run uses vite-plugin-arraybuffer which might be useful for the tff file issues when deploying monaco editor.

installGlobals();

export default defineConfig({
  plugins: [
    envOnly(),
    tsconfigPaths(),
    splitVendorChunkPlugin(),
    remix({
      serverModuleFormat: "esm",
      ignoredRouteFiles: ["**/*.css", ".*"],
      future: {
        v3_throwAbortReason: true,
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
      },
    }),
    isProduction
      ? sentryVitePlugin({
          org: "f-jrq",
          project: "javascript-remix",
          telemetry: false,
          authToken: SENTRY_AUTH_TOKEN,
        })
      : null,
  ],
  optimizeDeps: {
    esbuildOptions: {
      target: "esnext",
    },
  }, // Needed for SST: https://github.com/remix-run/remix/issues/7969#issuecomment-1916042039
  server: {
    port: 3000,
    headers: {
      "Cross-Origin-Opener-Policy": " same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
  },
  build: {
    cssMinify: isProduction,
  },
});
