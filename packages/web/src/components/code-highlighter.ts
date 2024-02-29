import { getHighlighterCore, type HighlighterCore } from "shiki/core";
import json from "shiki/langs/json.mjs";
import sql from "shiki/langs/sql.mjs";
import auroraX from "shiki/themes/aurora-x.mjs";
import githubLight from "shiki/themes/github-light.mjs";
import vitesseDark from "shiki/themes/vitesse-dark.mjs";
import vitesseLight from "shiki/themes/vitesse-light.mjs";
import getWasm from "shiki/wasm";

let shiki: HighlighterCore | undefined;

export const getHighlighter = async () => {
  if (shiki) return shiki;

  shiki = await getHighlighterCore({
    langs: [sql, json],
    loadWasm: getWasm,
    themes: [githubLight, auroraX, vitesseDark, vitesseLight],
  });

  return shiki;
};
