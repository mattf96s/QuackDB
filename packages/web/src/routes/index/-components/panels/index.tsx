import {
  Suspense,
  useDeferredValue,
  useMemo,
  useReducer,
  useState,
} from "react";
import { useCallback, useEffect, useRef } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import type { AsyncPreparedStatement } from "@duckdb/duckdb-wasm";
import { DragHandleDots2Icon } from "@radix-ui/react-icons";
import { useRouter } from "@tanstack/react-router";
import { useDebounce } from "@uidotdev/usehooks";
import { releaseProxy, type Remote, wrap } from "comlink";
import {
  ChevronDown,
  Code2,
  Database,
  Loader2,
  Plus,
  PlusIcon,
  RefreshCw,
  X,
} from "lucide-react";
import type { editor } from "monaco-editor";
import { toast } from "sonner";
import type { TreeNode, TreeNodeData } from "@/components/files/context/types";
import Editor, { type EditorForwardedRef } from "@/components/monaco";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDB } from "@/context/db/useDB";
import { useSession } from "@/context/session/useSession";
import { cn } from "@/lib/utils";
import type { AddFilesHandlesWorker } from "@/workers/add-files-worker";
import { getRoute } from "../../route";
import type { PanelFile } from "../-types";
import TableView from "../table";
import CodeActionMenu from "./-components/code-action-menu";

type CloseAction = { type: "close"; file: PanelFile };
type OpenAction = { type: "open"; file: PanelFile };
type ToggleCollapsedAction = { type: "toggleCollapsed"; collapsed: boolean };

export type FilesAction = CloseAction | OpenAction | ToggleCollapsedAction;

type FilesState = {
  currentFileIndex: number;
  fileListCollapsed: boolean;
  openFiles: PanelFile[];
};

const initialState: FilesState = {
  currentFileIndex: 0,
  fileListCollapsed: false,
  openFiles: [],
};

function reducer(state: FilesState, action: FilesAction): FilesState {
  switch (action.type) {
    case "close": {
      const { file } = action;
      const { currentFileIndex, openFiles } = state;

      const fileIndex = openFiles.findIndex(
        ({ fileName }) => fileName === file.fileName,
      );
      if (fileIndex === -1) {
        // File not open; this shouldn't happen.
        return state;
      }

      const newOpenFiles = openFiles.concat();
      newOpenFiles.splice(fileIndex, 1);

      let newCurrentFileIndex = currentFileIndex;
      if (newCurrentFileIndex >= newOpenFiles.length) {
        newCurrentFileIndex = newOpenFiles.length - 1;
      }

      return {
        ...state,
        currentFileIndex: newCurrentFileIndex,
        openFiles: newOpenFiles,
      };
    }
    case "open": {
      const { file } = action;
      const { openFiles } = state;
      const fileIndex = openFiles.findIndex(
        ({ fileName }) => fileName === file.fileName,
      );
      if (fileIndex >= 0) {
        return {
          ...state,
          currentFileIndex: fileIndex,
        };
      } else {
        const newOpenFiles = [...openFiles, file];

        return {
          ...state,
          currentFileIndex: openFiles.length,
          openFiles: newOpenFiles,
        };
      }
    }
    case "toggleCollapsed": {
      return { ...state, fileListCollapsed: action.collapsed };
    }

    default: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      throw `Unknown action type: ${(action as any).type}`;
    }
  }
}

type FilePanelsProps = {
  files: TreeNode<TreeNodeData>[];
};

export const useDispatch = () => {};

export default function FilePanels(props: FilePanelsProps) {
  const [state, dispatch] = useReducer(reducer, { ...initialState });

  const { currentFileIndex, fileListCollapsed, openFiles } = state;

  const currentFile = useMemo(() => {
    return openFiles[currentFileIndex] ?? null;
  }, [currentFileIndex, openFiles]);

  const closeFile = (file: PanelFile) => {
    dispatch({ type: "close", file });
  };

  const openFile = (file: PanelFile) => {
    dispatch({ type: "open", file });
  };

  const onCollapse = () => {
    dispatch({ type: "toggleCollapsed", collapsed: true });
  };

  const onExpand = () => {
    dispatch({ type: "toggleCollapsed", collapsed: false });
  };

  const route = getRoute();

  const { session, storage } = route.useLoaderData();

  return (
    <div className="h-full">
      <PanelGroup
        className="rounded-md"
        direction="horizontal"
      >
        <Panel
          className="flex flex-col"
          collapsedSize={5}
          collapsible={true}
          defaultSize={15}
          maxSize={20}
          minSize={15}
          onCollapse={onCollapse}
          onExpand={onExpand}
        >
          {/* <div className="flex w-full items-center justify-between">
            <div className="flex grow">
              <Button
                onClick={fileListCollapsed ? onExpand : onCollapse}
                variant="ghost"
                className="flex w-full items-center justify-start gap-1 hover:bg-transparent"
              >
                <ChevronDown
                  className={cn(
                    "size-5",
                    fileListCollapsed && "rotate-180 transition-transform",
                  )}
                />
                <span className="text-sm font-semibold">Files</span>
              </Button>
            </div>
            <div className="flex items-center gap-1">
              <SourcesToolbar />
            </div>
          </div> */}
          <div className="flex w-full flex-col pt-2">
            <div className="flex w-full items-center justify-between">
              <div className="flex grow">
                <Button
                  onClick={fileListCollapsed ? onExpand : onCollapse}
                  variant="ghost"
                  className="flex w-full items-center justify-start gap-1 hover:bg-transparent"
                >
                  <ChevronDown
                    className={cn(
                      "size-5",
                      fileListCollapsed && "rotate-180 transition-transform",
                    )}
                  />
                  <span className="text-sm font-semibold">Session</span>
                </Button>
              </div>
              <div className="flex items-center gap-1">
                <SourcesToolbar />
              </div>
            </div>
            <div
              className={cn(
                "flex w-full flex-col gap-1 py-1",
                fileListCollapsed && "hidden",
              )}
            >
              <ContextMenu>
                <ContextMenuTrigger className="data-[state=open]:bg-gray-100">
                  <Button
                    className="ml-5 flex h-6 w-48 items-center justify-start gap-2 p-2 pl-0"
                    variant="ghost"
                    data-current={
                      currentFile?.fileName === session.name || undefined
                    }
                    key={session.name}
                    title={file.name}
                  >
                    <Database className="size-4" />
                    <span className="truncate font-normal">{file.name}</span>
                  </Button>
                </ContextMenuTrigger>
                <ContextMenuContent className="w-64">
                  <ContextMenuItem inset>
                    Open
                    <ContextMenuShortcut>⌘O</ContextMenuShortcut>
                  </ContextMenuItem>
                  <ContextMenuItem inset>
                    Rename
                    <ContextMenuShortcut>⌘R</ContextMenuShortcut>
                  </ContextMenuItem>
                  <ContextMenuSeparator />
                  <ContextMenuItem inset>
                    Delete
                    <ContextMenuShortcut>⌘⌫</ContextMenuShortcut>
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            </div>
          </div>
          <div className="flex w-full flex-col pt-2">
            <div className="flex w-full items-center justify-between">
              <div className="flex grow">
                <Button
                  onClick={fileListCollapsed ? onExpand : onCollapse}
                  variant="ghost"
                  className="flex w-full items-center justify-start gap-1 hover:bg-transparent"
                >
                  <ChevronDown
                    className={cn(
                      "size-5",
                      fileListCollapsed && "rotate-180 transition-transform",
                    )}
                  />
                  <span className="text-sm font-semibold">Source</span>
                </Button>
              </div>
              <div className="flex items-center gap-1">
                <SourcesToolbar />
              </div>
            </div>
            <div
              className={cn(
                "flex w-full flex-col gap-1 py-1",
                fileListCollapsed && "hidden",
              )}
            >
              {props.files.map((file) => {
                const fileData: PanelFile = {
                  code: "SELECT * FROM READ_PARQUET('tbl');",
                  language: "sql",
                  fileName: file.name,
                  path: [`/${file.name}`],
                };

                return (
                  <ContextMenu key={file.id}>
                    <ContextMenuTrigger className="data-[state=open]:bg-gray-100">
                      <Button
                        className="ml-5 flex h-6 w-48 items-center justify-start gap-2 p-2 pl-0"
                        variant="ghost"
                        data-current={
                          currentFile?.fileName === file.name || undefined
                        }
                        key={file.id}
                        onClick={() => openFile(fileData)}
                        title={file.name}
                      >
                        <Database className="size-4" />
                        <span className="truncate font-normal">
                          {file.name}
                        </span>
                      </Button>
                    </ContextMenuTrigger>
                    <ContextMenuContent className="w-64">
                      <ContextMenuItem inset>
                        Open
                        <ContextMenuShortcut>⌘O</ContextMenuShortcut>
                      </ContextMenuItem>
                      <ContextMenuItem inset>
                        Rename
                        <ContextMenuShortcut>⌘R</ContextMenuShortcut>
                      </ContextMenuItem>
                      <ContextMenuSeparator />
                      <ContextMenuItem inset>
                        Delete
                        <ContextMenuShortcut>⌘⌫</ContextMenuShortcut>
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                );
              })}
            </div>
          </div>
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

        <Panel
          className="flex flex-col"
          minSize={50}
        >
          <div className="flex h-8 flex-[0_0_auto] flex-row justify-between overflow-auto bg-muted">
            <div className="flex h-full w-full items-center">
              {Array.from(openFiles).map((file) => {
                const isCurrent = currentFile === file;
                return (
                  <div
                    className={cn(
                      "flex flex-[0_0_auto] cursor-pointer flex-row flex-nowrap items-center gap-[1ch] border bg-gray-100 p-[0.5rem_1ch] transition-colors hover:bg-gray-200",
                      currentFile === file &&
                        "bg-primary text-primary-foreground hover:bg-primary/90",
                    )}
                    data-current={currentFile === file || undefined}
                    key={file.fileName}
                    onClick={() => openFile(file)}
                  >
                    <Code2 className="size-5" />
                    <span className="text-sm">{file.fileName}</span>

                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        closeFile(file);
                      }}
                      className={cn(
                        "bg-inherit px-0.5 py-0 hover:bg-gray-300",
                        isCurrent && "hover:bg-gray-100/50",
                      )}
                    >
                      <X
                        className="size-4"
                        type="close"
                      />
                    </button>
                  </div>
                );
              })}
            </div>
            <Separator orientation="vertical" />
            <div className="inline-flex items-center gap-2 pr-4">
              <Button
                onClick={() => {
                  // check if the file already exists
                  let counter = 0;
                  let newFilename = "new_query.sql";
                  while (true) {
                    const exists = openFiles.some(
                      (f) => f.fileName === newFilename,
                    );
                    if (!exists) break;
                    counter++;
                    newFilename = `new_query_${counter}.sql`;
                  }

                  openFile({
                    code: "SELECT * FROM READ_PARQUET('tbl');",
                    fileName: newFilename,
                    language: "sql",
                    path: [`/${newFilename}`],
                  });
                }}
                size="sm"
                className="bg-indigo-500 text-white hover:bg-indigo-600"
              >
                <PlusIcon className="mr-1 size-4" />
                New Query
              </Button>
            </div>
          </div>
          <Separator />
          {currentFile && (
            <EditorPanel
              key={currentFile.fileName}
              currentFile={currentFile}
            />
          )}
        </Panel>
      </PanelGroup>
    </div>
  );
}

function SessionSource() {
  const [sessionState, setSessionState] =
    useState<editor.ICodeEditorViewState | null>(null);
  const route = getRoute();
  const { session, storage } = route.useLoaderData();

  useEffect(() => {
    const getSessionState = async () => {
      const file = await session.handle.getFile();

      const content = await file.text();
      setSessionState(JSON.parse(content));
    };
    getSessionState();
  }, []);

  return (
    <div className="flex w-full flex-col pt-2">
      <div className="flex w-full items-center justify-between">
        <p className="text-sm font-semibold">Session</p>
      </div>
      <div className={cn("flex w-full flex-col gap-1 py-1")}>
        <ContextMenu>
          <ContextMenuTrigger className="data-[state=open]:bg-gray-100">
            <Button
              className="ml-5 flex h-6 w-48 items-center justify-start gap-2 p-2 pl-0"
              variant="ghost"
              data-current={true}
              key={session.name}
              onClick={() =>
                openFile({
                  code: sessionState,
                })
              }
              title={file.name}
            >
              <Database className="size-4" />
              <span className="truncate font-normal">{file.name}</span>
            </Button>
          </ContextMenuTrigger>
          <ContextMenuContent className="w-64">
            <ContextMenuItem inset>
              Open
              <ContextMenuShortcut>⌘O</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem inset>
              Rename
              <ContextMenuShortcut>⌘R</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem inset>
              Delete
              <ContextMenuShortcut>⌘⌫</ContextMenuShortcut>
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </div>
    </div>
  );
}

type EditorPanelProps = {
  currentFile: PanelFile;
};

const useSuggestions = (sql: string) => {
  const { db } = useDB();
  const [suggestions, setSuggestions] = useState([]);
  const lastSQL = useRef<string | null>(null);

  useEffect(() => {
    let isCancelled = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let stmt: AsyncPreparedStatement<any> | undefined;

    const getData = async (sql: string) => {
      if (stmt) await stmt.close();

      while (!isCancelled) {
        try {
          const cleanSQL = sql.replaceAll("'", "").replaceAll(";", "");
          stmt = await db?.prepareQuery(cleanSQL);

          const query = await stmt?.send();

          const results = await query
            .toArray()
            .map((row: { toJSON(): Record<string, unknown> }) => row.toJSON());
          setSuggestions(results);

          break;
        } catch (e) {
          console.error("Failed to generate suggestions: ", e);
          setSuggestions([]);
          break;
        } finally {
          await stmt?.close();
        }
      }
    };

    if (sql && lastSQL.current !== sql) {
      lastSQL.current = sql;
      getData(sql);
    }
    return () => {
      isCancelled = true;
    };
  }, [db, sql]);

  return suggestions;
};

function EditorPanel(props: EditorPanelProps) {
  const [sql, setSql] = useState(
    `SELECT * FROM READ_PARQUET('${props.currentFile.fileName}') LIMIT 100;`,
  );
  const deferredQuery = useDeferredValue(sql);
  const editorRef = useRef<null | EditorForwardedRef>(null);
  const [isFocused, setIsFocused] = useState(false);

  const { currentFile } = props;

  const onFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const onBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  return (
    <PanelGroup
      className="flex flex-col"
      direction="vertical"
    >
      <Panel className="relative">
        {currentFile && (
          <Editor
            onBlur={onBlur}
            onFocus={onFocus}
            ref={editorRef}
            value={sql}
            onChange={(value) => setSql(value ?? "")}
            className="h-full border-t-0 py-4"
            options={{
              renderLineHighlight: "none",
              minimap: {
                enabled: false,
              },
              fontSize: 15,
            }}
          />
        )}
        {/* code actions */}
        <div className="absolute bottom-3 right-7 flex items-center gap-2">
          <CodeActionMenu
            currentFile={currentFile}
            sql={deferredQuery}
            isEditorFocused={isFocused}
          />
          <Button className="h-7">Run</Button>
        </div>
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
      <Panel>
        <Suspense fallback={<p>Loading...</p>}>
          <ResultsView
            currentFile={currentFile}
            sql={deferredQuery}
            isEditorFocused={isFocused}
          />
        </Suspense>
      </Panel>
    </PanelGroup>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars, unused-imports/no-unused-vars
function Suggestions({ sql }: { sql: string }) {
  const suggestions = useSuggestions(sql);

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <Button
          className="h-7"
          variant="ghost"
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
      </ContextMenuTrigger>
      <ContextMenuContent>
        {suggestions?.map((suggestion, i) => (
          <ContextMenuItem key={i}>{suggestion}</ContextMenuItem>
        ))}
      </ContextMenuContent>
    </ContextMenu>
  );
}

type ResultsViewProps = {
  sql: string;
  currentFile: PanelFile;
  isEditorFocused: boolean;
};

function ResultsView(props: ResultsViewProps) {
  const [status, setStatus] = useState<"idle" | "initializing" | "ready">(
    "idle",
  );

  const { db } = useDB();

  const { sql, currentFile } = props;

  const debouncedSQL = useDebounce(sql, 500);

  const lastSQL = useRef<string | null>(null);
  const [raw, setRaw] = useState<string>("");
  const [results, setResults] = useState<Record<string, unknown>[]>([]);
  const [columns, setColumns] = useState(new Map<string, string>());
  const [_count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    const getData = async ({
      currentFile,
      sql,
    }: {
      currentFile: PanelFile;
      sql: string;
    }) => {
      try {
        const filename = currentFile.fileName;

        const countQuery = `SELECT COUNT(*) FROM '${filename}'`;

        const [queryResults, columns, countRes] = await Promise.all([
          db?.query(sql),
          db?.describeTableSchema({ table: `'${filename}'` }),
          db?.query(countQuery),
        ]);

        if (signal.aborted) return;

        const rawResultsAsText = queryResults?.toString();
        setRaw(rawResultsAsText ?? "");

        // results

        const results = queryResults
          ? queryResults
              .toArray()
              .map((row: { toJSON(): Record<string, unknown> }) => row.toJSON())
          : [];

        setResults(results);

        // columns
        const columnsItems = columns ?? [];
        const columnsMap = new Map<string, string>();
        columnsItems.forEach((column) => {
          columnsMap.set(column.name, column.type);
        });
        setColumns(columnsMap);

        //  count
        const countItems =
          countRes
            ?.toArray()
            .map((row: { toJSON(): Record<string, unknown> }) =>
              row.toJSON(),
            ) ?? [];
        let count = 0;
        if (countItems.length > 0) {
          const item = countItems[0];
          if (item) {
            count = item["count_star()"] as number;
          }
        }

        setCount(count);
      } catch (e) {
        console.error("Failed to execute query: ", e);
        toast.error("Failed to execute query", {
          description: e instanceof Error ? e.message : undefined,
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (debouncedSQL && lastSQL.current !== debouncedSQL) {
      setIsLoading(true);
      lastSQL.current = debouncedSQL;
      getData({ currentFile, sql: debouncedSQL });
    }
    return () => {
      controller.abort();
    };
  }, [currentFile, db, debouncedSQL, status]);

  return (
    <div className="h-full w-full px-4 py-6 lg:px-8">
      <Tabs
        defaultValue="table"
        className="h-full w-full space-y-6"
      >
        <div className="space-between flex items-center">
          <TabsList>
            <TabsTrigger
              value="table"
              className="relative"
            >
              Table
            </TabsTrigger>
            <TabsTrigger value="chart">Chart</TabsTrigger>
            <TabsTrigger value="json">JSON</TabsTrigger>
            <TabsTrigger value="text">TEXT</TabsTrigger>
          </TabsList>
          <div className="ml-auto mr-4">
            {isLoading && (
              <Badge>
                <Loader2 className="size-5 animate-spin" />
              </Badge>
            )}
          </div>
        </div>
        <TabsContent
          value="table"
          className="h-full max-w-full border-none p-0 pb-20 outline-none"
        >
          <div className="h-full max-h-full w-full max-w-full overflow-x-auto overflow-y-auto">
            {results && Array.isArray(results) && (
              <TableView
                results={results}
                columns={columns}
              />
            )}
          </div>
        </TabsContent>
        <TabsContent
          value="chart"
          className="h-full flex-col border-none p-0 data-[state=active]:flex"
        >
          <p>Coming soon</p>
        </TabsContent>
        <TabsContent
          value="json"
          className="h-full pb-10"
        >
          <div className="h-full max-h-full overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm text-gray-900">
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>
        </TabsContent>
        <TabsContent
          value="text"
          className="h-full pb-10"
        >
          <div className="h-full max-h-full overflow-y-auto">
            <div
              className="prose"
              dangerouslySetInnerHTML={{ __html: raw }}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SourcesToolbar() {
  const router = useRouter();
  const { session } = useSession();

  const onAddFiles = useCallback(async () => {
    let worker: Worker | undefined;
    let addFilesWorkerFn: Remote<AddFilesHandlesWorker> | undefined;

    try {
      const fileHandles = await window.showOpenFilePicker({
        types: [
          {
            description: "Datasets",
            accept: {
              "application/octet-stream": [".parquet"],
              "csv/*": [".csv"],
              "json/*": [".json"],
              "text/*": [".txt"],
              "application/vnd.ms-excel": [".xls"],
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                [".xlsx"],
              "text/plain": [".sql"],
            },
          },
        ],
        excludeAcceptAllOption: false,
        multiple: true,
      });

      if (!fileHandles || fileHandles.length === 0) return;

      worker = new Worker(
        new URL("@/workers/add-files-worker.ts", import.meta.url),
        {
          type: "module",
        },
      );

      addFilesWorkerFn = wrap<AddFilesHandlesWorker>(worker);

      const { success, total } = await addFilesWorkerFn({
        newHandles: fileHandles,
        sessionName: session,
      });

      if (success) {
        toast.success("Files added successfully", {
          description: `${total} files added`,
        });
        router.invalidate();
      } else {
        toast.error("Failed to add files", {
          description: "Failed to add files",
        });
      }
    } catch (e) {
      // ignore aborted request
      if (e instanceof Error && e.name === "AbortError") return;
      console.error("Failed to add filehandles: ", e);
      toast.error("Failed to add files", {
        description: e instanceof Error ? e.message : undefined,
      });
    } finally {
      addFilesWorkerFn?.[releaseProxy]();
      worker?.terminate();
    }
  }, [router, session]);

  const onRefresh = () => {
    router.invalidate();
  };

  return (
    <>
      <Button
        size="xs"
        variant="ghost"
        onClick={onAddFiles}
      >
        <Plus size={16} />
      </Button>
      <Button
        size="xs"
        variant="ghost"
        onClick={onRefresh}
      >
        <RefreshCw size={16} />
      </Button>
    </>
  );
}
