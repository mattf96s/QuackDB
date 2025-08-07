import type { HighlighterCore } from "shiki/core";
import { getHighlighterCore } from "shiki/core";
import getWasm from "shiki/wasm";

let shiki: HighlighterCore | undefined;

export const getHighlighter = async () => {
  if (shiki) return shiki;

  shiki = await getHighlighterCore({
    langs: [import("shiki/langs/sql.mjs"), import("shiki/langs/json.mjs")],
    loadWasm: getWasm,
    themes: [
      import("shiki/themes/github-light.mjs"),
      import("shiki/themes/aurora-x.mjs"),
      import("shiki/themes/vitesse-dark.mjs"),
      import("shiki/themes/vitesse-light.mjs"),
    ],
  });

  return shiki;
};
