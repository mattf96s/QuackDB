import Icon from "@/components/icon";
import Editor from "@/components/monaco";
import { formatSQL } from "@/components/monaco/helpers/prettier";
import { useEditorSettings } from "@/context/editor-settings/useEditor";
import { useEditor } from "@/context/editor/useEditor";
import { useSession } from "@/context/session/useSession";
import { cn } from "@/lib/utils";
import type { OnChange } from "@monaco-editor/react";
import { DragHandleDots2Icon } from "@radix-ui/react-icons";
import { Range, type editor } from "monaco-editor";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { useSpinDelay } from "spin-delay";
import OpenFileTabs from "./components/open-files";
import ResultsView from "./components/results-viewer";

function EditorPanel() {
  return (
    <PanelGroup
      className="flex w-full flex-col"
      direction="vertical"
    >
      <Panel
        minSize={10}
        className="flex flex-col"
      >
        <OpenFileTabs />
        <CurrentEditor />
      </Panel>

      <PanelResizeHandle
        className={cn(
          "relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 [&[data-panel-group-direction=vertical]>div]:rotate-90",
        )}
      >
        <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border">
          <DragHandleDots2Icon className="size-2.5" />
        </div>
      </PanelResizeHandle>
      <Panel minSize={10}>
        <ResultsView />
      </Panel>
    </PanelGroup>
  );
}

export default EditorPanel;

function CurrentEditor() {
  const { editors, onSaveEditor, dispatch } = useSession();
  const { editorRef } = useEditor();
  const [sql, setSql] = useState("");
  const [isReady, setIsReady] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { shouldFormat } = useEditorSettings();

  const currentEditor = useMemo(
    () => editors.find((editor) => editor.isFocused),
    [editors],
  );

  const path = currentEditor?.path;

  const onChangeHandler: OnChange = useCallback(
    (value, _ev) => {
      setSql(value ?? "");

      if (!dispatch || !path) return;

      dispatch({
        type: "UPDATE_EDITOR",
        payload: {
          path,
          content: value ?? "",
        },
      });
    },
    [dispatch, path],
  );

  // get content of current editor
  useEffect(() => {
    if (currentEditor) {
      setSql(currentEditor.content);
      setIsReady(true);
    }
  }, [currentEditor]);

  const onSave = useCallback(
    async (editor: editor.ICodeEditor) => {
      if (!currentEditor?.path) return;

      // check if the content has changed

      let content = editor.getValue();

      const model = editor.getModel();

      if (model == null) return;

      setIsSaving(true);

      // try format

      if (shouldFormat) {
        try {
          // check whether user has disabled formatting

          // Format the SQL query using the formatting provider
          const formatted = await formatSQL(content);
          model.applyEdits([
            {
              range: new Range(
                0,
                0,
                model.getLineCount(),
                model.getLineMaxColumn(model.getLineCount()),
              ),
              text: formatted,
            },
          ]);

          // Push the formatted content to the undo stack (so that the user can undo the formatting if they want to)
          model.pushStackElement();

          content = formatted;
        } catch (e) {
          console.error(`Error formatting file: ${currentEditor.path}: `, e);
        }
      }

      try {
        await onSaveEditor({
          content,
          path: currentEditor.path,
        });
      } catch (e) {
        console.error(`Error saving file: ${currentEditor.path}: `, e);
      } finally {
        setIsSaving(false);
      }
    },
    [currentEditor, onSaveEditor, shouldFormat],
  );

  const showLoader = useSpinDelay(isSaving, {
    delay: 0,
    minDuration: 120,
  });

  if (!currentEditor) {
    return (
      <div className="flex h-full items-center justify-center text-gray-400">
        No file selected
      </div>
    );
  }

  if (!isReady) {
    return (
      <div className="flex h-full items-center justify-center text-gray-400">
        Loading...
      </div>
    );
  }

  return (
    <>
      <Editor
        onSave={onSave}
        value={sql}
        ref={editorRef}
        onChange={onChangeHandler}
        className="h-full border-t-0"
        options={{
          padding: {
            top: 16,
            bottom: 16,
          },
        }}
      />
      {showLoader && (
        <div className="absolute right-4 top-2 z-10">
          <Icon
            name="Loader2"
            className="size-4 animate-spin text-primary"
          />
        </div>
      )}
    </>
  );
}
