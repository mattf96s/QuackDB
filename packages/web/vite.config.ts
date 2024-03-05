import { vitePlugin as remix } from "@remix-run/dev";
import { installGlobals } from "@remix-run/node";
import { defineConfig } from "vite";
import envOnly from "vite-env-only";
import tsconfigPaths from "vite-tsconfig-paths";

installGlobals();

export default defineConfig({
  plugins: [
    envOnly(),
    tsconfigPaths(),
    remix({
      serverModuleFormat: "esm",

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
  },
});
