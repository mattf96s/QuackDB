import ErrorNotification from "@/components/error";
import Icon from "@/components/icon";
import PanelHandle from "@/components/panel-handle";
import { ThemeToggler } from "@/components/theme-toggle";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StyledLink } from "@/components/ui/link";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useConfig } from "@/context/config/useConfig";
import { DbProvider } from "@/context/db/provider";
import { EditorSettingsProvider } from "@/context/editor-settings/provider";
import { EditorProvider } from "@/context/editor/provider";
import { useEditor } from "@/context/editor/useEditor";
import { QueryProvider } from "@/context/query/provider";
import { useQuery } from "@/context/query/useQuery";
import { useFileDrop } from "@/context/session/hooks/useAddFile.tsx";
import { SessionProvider } from "@/context/session/provider";
import useBreakpoint from "@/hooks/use-breakpoints";
import { cn } from "@/lib/utils";
import {
  createLazyFileRoute,
  useRouter,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { Panel, PanelGroup } from "react-resizable-panels";
import { toast } from "sonner";
import { useSpinDelay } from "spin-delay";
import EditorPanel from "./-components/editor-panel";
import PendingComponent from "./-components/pending";
import Settings from "./-components/settings";
import Sidepanel from "./-components/sidepanel";
import { PanelProvider } from "./-context/panel/provider";

export const Route = createLazyFileRoute("/")({
  component: PlaygroundContainer,
  errorComponent: ErrorComponent,
  pendingComponent: PendingComponent,
});

function ErrorComponent(props: ErrorComponentProps) {
  const router = useRouter();
  const error = props.error;

  const msg = error instanceof Error ? error.message : "Unknown error";
  return (
    <div className="mx-auto flex w-full max-w-full flex-col gap-10 py-10">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-10 md:max-w-2xl lg:max-w-5xl">
        <ErrorNotification error={msg} />
        <div className="flex w-full items-center justify-center gap-4">
          <StyledLink
            variant="outline"
            size="lg"
            href="https://github.com/mattf96s/quackdb/issues/new"
            // target="_blank"
            // rel="noopener noreferrer"
            className="flex items-center gap-1"
          >
            Create an issue{" "}
            <Icon
              name="ExternalLink"
              className="ml-1 size-4"
            />
          </StyledLink>

          <Button
            size="lg"
            onClick={() => {
              router.cleanCache();
              router.invalidate();
            }}
          >
            Reload
          </Button>
        </div>
      </div>
    </div>
  );
}

function NavBar() {
  return (
    <div className="fixed left-16 right-0 top-0 z-40 hidden h-16 shrink-0 items-center gap-x-4 border bg-background px-4 shadow-sm sm:gap-x-6 sm:px-6 md:flex lg:px-8">
      <div className="flex items-center justify-evenly gap-2">
        <h1 className="text-lg font-semibold">QuackDB</h1>
        <Icon
          name="Terminal"
          className="size-5"
        />
      </div>
      <div className="ml-auto flex w-full items-center space-x-2 sm:justify-end">
        <div className="ml-auto flex w-full items-center space-x-2 sm:justify-end">
          <QueryMeta />

          <Toolbar />
          <Settings />
        </div>
        <ThemeToggler />
      </div>
    </div>
  );
}

function PlaygroundContainer() {
  return (
    <SessionProvider>
      <DbProvider>
        <PanelProvider>
          <QueryProvider>
            <EditorSettingsProvider>
              <EditorProvider>
                <NavBar />
                <Playground />
                <BrowserAlertBar />
              </EditorProvider>
            </EditorSettingsProvider>
          </QueryProvider>
        </PanelProvider>
      </DbProvider>
    </SessionProvider>
  );
}

function BrowserAlertBar() {
  const { browser } = useConfig();
  const [isDismissed, setIsDismissed] = useState(browser !== "safari");

  if (isDismissed) return null;

  return (
    <Alert
      variant="destructive"
      className="absolute inset-x-0 top-4 z-50 mx-auto max-w-2xl bg-red-500  text-white shadow-md"
    >
      <div className="flex items-center justify-between">
        <AlertTitle>Warning</AlertTitle>
        <Button
          size="xs"
          variant="ghost"
          onClick={() => setIsDismissed(true)}
        >
          <Icon
            name="X"
            className="size-4"
          />
        </Button>
      </div>
      <AlertDescription>
        QuackDB cannot fullysupport Safari until this{" "}
        <a
          target="_blank"
          href="https://bugs.webkit.org/show_bug.cgi?id=256712#c0"
          rel="noreferrer"
        >
          bug
        </a>{" "}
        is fixed.
      </AlertDescription>
    </Alert>
  );
}

function Playground() {
  const {
    isDragActive,
    ref,
    onDragEnter,
    onDragLeave,
    onDragOver,
    onFileDrop,
  } = useFileDrop();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isSmallerScreen = useBreakpoint("md");

  if (isSmallerScreen) {
    return (
      <>
        <div className="inline-flex h-16 w-full items-center justify-between px-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMobileMenuOpen((s) => !s)}
          >
            <Icon
              name="Menu"
              className="size-5"
            />
          </Button>
          <div className="inline-flex items-center gap-2">
            <Toolbar />
            <Settings />
            <ThemeToggler />
          </div>
        </div>
        <PanelGroup
          className="rounded-none"
          direction="vertical"
          id="_mobile-layout-panel-group"
        >
          <EditorPanel />
        </PanelGroup>
        <MobileSidePanel
          isOpen={mobileMenuOpen}
          onOpenChange={(open) => setMobileMenuOpen(open)}
        >
          <Sidepanel />
        </MobileSidePanel>
      </>
    );
  }
  return (
    <div
      onDrop={onFileDrop}
      onDragOver={onDragOver}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      ref={ref}
      className={cn(
        "flex size-full bg-inherit",
        isDragActive &&
          "bg-gray-100 transition-colors duration-200 ease-in-out dark:bg-gray-800",
      )}
    >
      {/* Panel provider is custom context while PanelGroup is unrelated component; poor naming. */}

      <PanelGroup
        className="h-[calc(100vh-64px)] rounded-none"
        direction="horizontal"
        autoSaveId="_desktop-layout-panel-group"
      >
        <Panel
          collapsedSize={5}
          defaultSize={15}
          minSize={5}
          className="max-h-full"
        >
          <Sidepanel />
        </Panel>
        <PanelHandle />
        <Panel
          minSize={15}
          className="max-h-full max-w-full"
        >
          <EditorPanel />
        </Panel>
      </PanelGroup>
    </div>
  );
}

function QueryMeta() {
  const { meta, status } = useQuery();

  const seconds = Math.floor(meta?.executionTime ?? 0) / 1000;
  const formattedTime = seconds.toFixed(2);

  if (status === "RUNNING") {
    return (
      <Badge
        variant="secondary"
        className="text-xs tabular-nums text-muted-foreground"
      >
        <Icon
          name="Loader2"
          className="size-4 animate-spin"
        />
      </Badge>
    );
  }

  return (
    <>
      <Badge
        variant="outline"
        className={cn(
          "border-green-300 bg-green-100 text-xs tabular-nums text-muted-foreground dark:border-green-500 dark:bg-background dark:text-green-500",
          meta?.cacheHit && "border-orange-300 bg-orange-100",
        )}
      >
        {meta?.cacheHit ? "cached" : "live"}{" "}
      </Badge>

      <Badge
        variant="outline"
        className="text-xs tabular-nums text-muted-foreground"
      >
        {formattedTime}s
      </Badge>
    </>
  );
}

function MobileSidePanel(props: {
  children: React.ReactNode;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { isOpen, onOpenChange } = props;
  return (
    <Sheet
      open={isOpen}
      onOpenChange={onOpenChange}
    >
      <SheetContent
        forceMount
        side="right"
      >
        {props.children}
      </SheetContent>
    </Sheet>
  );
}

function Toolbar() {
  const { status, onCancelQuery, onRunQuery } = useQuery();
  const { editorRef } = useEditor();

  // run the whole file contents rather than the selected text;
  // Don't wait;

  const onRun = useCallback(async () => {
    const controller = new AbortController();
    const signal = controller.signal;

    const editor = editorRef.current?.getEditor();
    if (!editor) {
      toast.warning("Editor not ready yet", {
        description: "Please wait a moment and try again.",
      });
      return;
    }

    const query = editor?.getModel()?.getValue();

    if (!query) {
      toast.warning("No query to run", {
        description: "Please write a query and try again.",
      });
      return;
    }

    signal.addEventListener("abort", () => {
      onCancelQuery("cancelled");
      toast.info("Query cancelled", {
        description: "The query was cancelled.",
      });
    });

    // cleanup query to remove comments and empty lines
    const cleanedQuery = query
      .split("\n")
      .filter((line) => !line.trim().startsWith("--"))
      .join("\n");

    await onRunQuery(cleanedQuery);

    return () => {
      controller.abort();
    };
  }, [editorRef, onCancelQuery, onRunQuery]);

  useHotkeys(
    "mod+enter",
    () => {
      if (status === "RUNNING") {
        onCancelQuery("cancelled");
      } else {
        onRun();
      }
    },
    [status, onCancelQuery, onRun],
  );

  const isLoading = useSpinDelay(status === "RUNNING", {
    delay: 0,
    minDuration: 200,
  });

  if (isLoading) {
    return (
      <Button
        size="sm"
        onClick={() => onCancelQuery("cancelled")}
        className="h-7 w-20"
        variant="destructive"
      >
        Cancel
      </Button>
    );
  }

  return (
    <Button
      onClick={onRun}
      variant="success"
      size="sm"
      className="h-7 w-20"
    >
      Run
      <Icon
        name="Play"
        className="ml-2 size-4"
      />
    </Button>
  );
}
