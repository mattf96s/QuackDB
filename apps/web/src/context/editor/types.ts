import type { EditorForwardedRef } from "@/components/monaco/editor";

export type EditorState = {
	editorRef: React.MutableRefObject<EditorForwardedRef | null>;
};
