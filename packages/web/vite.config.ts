import { vitePlugin as remix } from "@remix-run/dev";
import { installGlobals } from "@remix-run/node";
import { defineConfig, splitVendorChunkPlugin } from "vite";
import envOnly from "vite-env-only";
import tsconfigPaths from "vite-tsconfig-paths";

// Remix run uses vite-plugin-arraybuffer which might be useful for the tff file issues when deploying monaco editor.

installGlobals();

export default defineConfig({
  plugins: [
    envOnly(),
    tsconfigPaths(),
    splitVendorChunkPlugin(),
    remix({
      serverModuleFormat: "esm",
      ignoredRouteFiles: ["**/*.css"],
      future: {
        v3_throwAbortReason: true,
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
      },
    }),
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
    cssMinify: process.env.NODE_ENV === "production",
  },
});
