// ---------- Code Ext files ----------- //

/**
 * Only support sql for now (python, js, ts, rs are possible future additions).
 */
export const codeFileExts = ["sql"] as const;

type CodeFileExt = (typeof codeFileExts)[number];

export function isCodeFileExt(x: unknown): x is CodeFileExt {
  return codeFileExts.includes(x as CodeFileExt);
}

// ------ Code Mime Types ------ //
export const codeMimeTypes = ["text/sql"] as const;

type CodeMimeType = (typeof codeMimeTypes)[number];

export function isCodeMimeType(mimeType: unknown): mimeType is CodeMimeType {
  return codeMimeTypes.includes(mimeType as CodeMimeType);
}

export const codeExtMap: Record<CodeFileExt, CodeMimeType> = {
  sql: "text/sql",
};

export type CodeSource = {
  kind: "CODE";
  mimeType: CodeMimeType;
  ext: CodeFileExt;
  handle: FileSystemFileHandle;
  path: string;
};
