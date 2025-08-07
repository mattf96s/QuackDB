// // https://github.com/magic-akari/swc-ast-viewer/blob/main/src/monaco/theme.ts
// import type { Monaco } from "@monaco-editor/react";
// import type { editor } from "monaco-editor";
// import github_dark from "../assets/github-dark.json" with { type: "json" };
// import github_light from "../assets/github-light.json" with { type: "json" };

// export function config_theme(monaco: Monaco) {
//   monaco.editor.defineTheme(
//     "github-light",
//     github_light as editor.IStandaloneThemeData,
//   );
//   monaco.editor.defineTheme(
//     "github-dark",
//     github_dark as editor.IStandaloneThemeData,
//   );

//   const darkMatch = window.matchMedia?.("(prefers-color-scheme: dark)");

//   set_theme(darkMatch?.matches, monaco);

//   darkMatch?.addEventListener("change", (ev) => {
//     set_theme(ev.matches, monaco);
//   });
// }

// function set_theme(is_dark: boolean, monaco: Monaco) {
//   if (is_dark) {
//     monaco.editor.setTheme("github-dark");
//   } else {
//     monaco.editor.setTheme("github-light");
//   }
// }
