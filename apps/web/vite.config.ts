import { vitePlugin as remix } from "@remix-run/dev";
import { installGlobals } from "@remix-run/node";
import { vercelPreset } from "@vercel/remix/vite";
import { defineConfig } from "vite";

import tsconfigPaths from "vite-tsconfig-paths";

// Remix run uses vite-plugin-arraybuffer which might be useful for the tff file issues when deploying monaco editor.

installGlobals();

export default defineConfig({
  plugins: [
    remix({
      future: {
        v3_throwAbortReason: true,
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
      },
      presets: [vercelPreset()],
    }),
    tsconfigPaths(),
  ],
  server: {
    port: 3000,
    headers: {
      "Cross-Origin-Opener-Policy": " same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
  },
});
