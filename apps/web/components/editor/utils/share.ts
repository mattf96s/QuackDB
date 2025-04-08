// // https://github.com/magic-akari/swc-ast-viewer/blob/main/src/share.ts
// import lz from "lz-string";

// export const localStore = {
//   get code(): string {
//     return localStorage.getItem("code") || "";
//   },
//   set code(code: string) {
//     localStorage.setItem("code", code);
//   },
// };

// export function shareURL(code: string): string {
//   const url = new URL(location.href);
//   if (code) {
//     url.hash = "code/" + lz.compressToEncodedURIComponent(code);
//   }

//   return url.toString();
// }

// export function shareMarkdown(code: string): string {
//   const url = shareURL(code);
//   return `[SWC AST Viewer](${url})`;
// }

// export function reportIssue(code: string): string {
//   const reportUrl = new URL(
//     `https://github.com/mattf96s/QuackDB/issues/new?labels=C-bug&template=bug_report.yml`,
//   );

//   const link = shareMarkdown(code);

//   reportUrl.searchParams.set("code", code);
//   reportUrl.searchParams.set("repro-link", link);

//   return reportUrl.toString();
// }
