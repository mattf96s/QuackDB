import type { HighlighterCore } from "shiki/core";
import { createHighlighterCore } from "shiki/core";
import { createOnigurumaEngine } from "shiki/engine/oniguruma";

let shiki: HighlighterCore | undefined;

export const createHighlighter = async () => {
  if (shiki) return shiki;

  shiki = await createHighlighterCore({
    langs: [import("shiki/langs/sql.mjs"), import("shiki/langs/json.mjs")],
    engine: createOnigurumaEngine(() => import("shiki/wasm")),
    themes: [
      import("shiki/themes/github-light.mjs"),
      import("shiki/themes/aurora-x.mjs"),
      import("shiki/themes/vitesse-dark.mjs"),
      import("shiki/themes/vitesse-light.mjs"),
    ],
  });

  return shiki;
};
