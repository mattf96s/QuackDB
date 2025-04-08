import type { EditorForwardedRef } from "@/components/monaco";

export type EditorState = {
  editorRef: React.MutableRefObject<EditorForwardedRef | null>;
};
