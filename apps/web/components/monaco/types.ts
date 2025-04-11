import type { OnMount } from "@monaco-editor/react";

export type Monaco = Parameters<OnMount>[1];
export type Editor = Parameters<OnMount>[0];
