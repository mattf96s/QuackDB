import {
  Suspense,
  useDeferredValue,
  useMemo,
  useReducer,
  useState,
} from "react";
import { useCallback, useEffect, useRef } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { DragHandleDots2Icon } from "@radix-ui/react-icons";
import { useRouter } from "@tanstack/react-router";
import { useDebounce } from "@uidotdev/usehooks";
import { wrap } from "comlink";
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
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getMimeType } from "@/lib/modules/duckdb";
import { cn } from "@/lib/utils";
import { columnMapper } from "@/utils/duckdb/helpers/columnMapper";
import type { AddFilesHandlesWorker } from "@/workers/add-files-worker";
import { useDB } from "../-db-context";
import type { PanelFile } from "../-types";
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
          <div className="flex flex-[0_0_auto] flex-row justify-between overflow-auto bg-french-porcelain">
            <div className="flex h-full w-full items-center">
              {Array.from(openFiles).map((file) => (
                <div
                  className={cn(
                    "flex flex-[0_0_auto] cursor-pointer flex-row flex-nowrap items-center gap-[1ch] bg-gray-200 p-[0.5rem_1ch] hover:bg-gray-300",
                    currentFile === file && "bg-slate-300",
                  )}
                  data-current={currentFile === file || undefined}
                  key={file.fileName}
                  onClick={() => openFile(file)}
                >
                  <Code2 className="size-5" />
                  <span>{file.fileName}</span>
                  <Button
                    size="xs"
                    onClick={(event) => {
                      event.stopPropagation();
                      closeFile(file);
                    }}
                    variant="ghost"
                    className="p-0"
                  >
                    <X
                      className="size-4"
                      type="close"
                    />
                  </Button>
                </div>
              ))}
            </div>
            <div className="inline-flex items-center gap-2 pr-4">
              <Button
                onClick={() => {
                  openFile({
                    code: "SELECT * FROM READ_PARQUET('tbl');",
                    fileName: "new_query.sql",
                    language: "sql",
                    path: ["/new_query.sql"],
                  });
                }}
                size="sm"
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

type EditorPanelProps = {
  currentFile: PanelFile;
};

const useSuggestions = (sql: string) => {
  const { db } = useDB();
  const [suggestions, setSuggestions] = useState([]);
  const lastSQL = useRef<string | null>(null);

  useEffect(() => {
    if (!db) return;
    if (!sql) return;

    const getData = async (sql: string) => {
      const conn = await db.connect();

      try {
        const cleanSQL = sql.replaceAll("'", "").replaceAll(";", "");
        const query = await conn.query(
          `SELECT * FROM sql_auto_complete('${cleanSQL}');`,
        );

        const results = await query
          .toArray()
          .map((row: { toJSON(): Record<string, unknown> }) => row.toJSON());
        return results;
      } catch (e) {
        console.error("Failed to generate suggestions: ", e);
        return [];
      } finally {
        await conn.close();
      }
    };

    if (sql && lastSQL.current !== sql) {
      lastSQL.current = sql;
      getData(sql)
        .catch((e) => {
          console.error("Failed to generate suggestions: ", e);
        })
        .then((results) => {
          setSuggestions(results);
        });
    }
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
  const [results, setResults] = useState([]);
  const [_columns, setColumns] = useState(new Map<string, string>());
  const [_count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!db) return;
    if (status !== "idle") return;

    setStatus("initializing");

    const init = async () => {
      try {
        const root = await navigator.storage.getDirectory();
        const fileHandle = await root.getFileHandle(currentFile.fileName);

        const file = await fileHandle.getFile();

        await db.registerFileHandle(currentFile.fileName, file);

        const conn = await db.connect();

        // validate sql
        await conn.query("");

        const filename = currentFile.fileName;
        const kind = getMimeType(file);

        switch (kind) {
          case "application/parquet": {
            await conn.query(
              `CREATE OR REPLACE VIEW '${filename}' AS SELECT * FROM parquet_scan('${filename}')`,
            );
            break;
          }
          case "text/csv": {
            conn.query(
              `CREATE OR REPLACE VIEW '${filename}' AS SELECT * FROM read_csv_auto('${filename}')`,
            );
            break;
          }
          case "application/json": {
            conn.query(
              `CREATE OR REPLACE VIEW '${filename}' AS SELECT * FROM read_json_auto('${filename}')`,
            );
            break;
          }
          default: {
            throw new Error(`File type ${kind} not supported`);
          }
        }
      } catch (e) {
        console.error("Failed to initialize: ", e);
      } finally {
        setStatus("ready");
      }
    };

    init();
  }, [currentFile.fileName, db, status]);

  useEffect(() => {
    if (status !== "ready") return;

    const getData = async ({
      currentFile,
      sql,
    }: {
      currentFile: PanelFile;
      sql: string;
    }) => {
      const conn = await db.connect();
      try {
        const filename = currentFile.fileName;

        const countQuery = `SELECT COUNT(*) FROM '${filename}'`;

        const [queryResults, columns, countRes] = await Promise.all([
          conn.query(sql),
          columnMapper(conn, filename),
          conn.query(countQuery),
        ]);

        setRaw(queryResults);

        const results = await queryResults
          .toArray()
          .map((row: { toJSON(): Record<string, unknown> }) => row.toJSON());

        const count = countRes
          .toArray()
          .map((row: { toJSON(): Record<string, unknown> }) => row.toJSON())[0][
          "count_star()"
        ];

        setResults(results);
        setColumns(columns);
        setCount(count);
      } catch (e) {
        console.error("Failed to execute query: ", e);
        toast.error("Failed to execute query", {
          description: e instanceof Error ? e.message : undefined,
        });
      } finally {
        await conn.close();
        setIsLoading(false);
      }
    };

    if (debouncedSQL && lastSQL.current !== debouncedSQL) {
      setIsLoading(true);
      lastSQL.current = debouncedSQL;
      getData({ currentFile, sql: debouncedSQL });
    }
  }, [currentFile, db, debouncedSQL, status]);

  return (
    <div className="h-full px-4 py-6 lg:px-8">
      <Tabs
        defaultValue="table"
        className="h-full space-y-6"
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
          className="border-none p-0 outline-none"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold tracking-tight">
                Listen Now
              </h2>
              <p className="text-sm text-muted-foreground">
                Top picks for you. Updated daily.
              </p>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="relative">
            <ScrollArea>
              <div className="flex space-x-4 pb-4">
                {/* {listenNowAlbums.map((album) => (
                              <AlbumArtwork
                                key={album.name}
                                album={album}
                                className="w-[250px]"
                                aspectRatio="portrait"
                                width={250}
                                height={330}
                              />
                            ))} */}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
          <div className="mt-6 space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">
              Made for You
            </h2>
            <p className="text-sm text-muted-foreground">
              Your personal playlists. Updated daily.
            </p>
          </div>
          <Separator className="my-4" />
          <div className="relative">
            <ScrollArea>
              <div className="flex space-x-4 pb-4">
                {/* {madeForYouAlbums.map((album) => (
                              <AlbumArtwork
                                key={album.name}
                                album={album}
                                className="w-[150px]"
                                aspectRatio="square"
                                width={150}
                                height={150}
                              />
                            ))} */}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        </TabsContent>
        <TabsContent
          value="chart"
          className="h-full flex-col border-none p-0 data-[state=active]:flex"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold tracking-tight">
                New Episodes
              </h2>
              <p className="text-sm text-muted-foreground">
                Your favorite podcasts. Updated daily.
              </p>
            </div>
          </div>
          <Separator className="my-4" />
          <p>placeholder</p>
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
  const workerRef = useRef<null | Worker>(null);
  const router = useRouter();
  const onAddFiles = useCallback(async () => {
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

      const worker = new Worker(
        new URL("@/workers/add-files-worker.ts", import.meta.url),
        {
          type: "module",
        },
      );

      workerRef.current = worker;

      const addFilesWorkerFn = wrap<AddFilesHandlesWorker>(worker);
      const { success, total } = await addFilesWorkerFn(fileHandles);

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
    }
  }, [router]);

  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

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
