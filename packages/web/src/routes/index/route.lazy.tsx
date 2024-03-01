import ErrorNotification from "@/components/error";
import Icon from "@/components/icon";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StyledLink } from "@/components/ui/link";
import { useConfig } from "@/context/config/useConfig";
import { DbProvider } from "@/context/db/provider";
import { EditorSettingsProvider } from "@/context/editor-settings/provider";
import { EditorProvider } from "@/context/editor/provider";
import { QueryProvider } from "@/context/query/provider";
import { useQuery } from "@/context/query/useQuery";
import { SessionProvider } from "@/context/session/provider";
import { cn } from "@/lib/utils";
import {
  Link,
  createLazyFileRoute,
  useRouter,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { Suspense, lazy, useState } from "react";
import PendingComponent from "./-components/pending";
import Toolbar from "./-components/query-toolbar";
import Settings from "./-components/settings";
import { PanelProvider } from "./-context/panel/provider";
import logo from "/logo.webp";

const LazyPlayground = lazy(() =>
  import("./-components/playground").then((module) => ({
    default: module.default,
  })),
);

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
            target="_blank"
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
    <div className="fixed inset-x-0 top-0 hidden h-16 shrink-0 items-center gap-x-4 border-b bg-background px-2 md:flex">
      <div className="flex min-w-fit items-center justify-evenly gap-3">
        <Link
          to="/"
          className="size-10 overflow-hidden rounded-md border-none bg-background object-cover dark:bg-white/95"
        >
          <img
            width={40}
            height={40}
            src={logo}
            className="size-10"
            alt="QuackDB logo"
          />
        </Link>
        <h1 className="ml-1 text-xl font-semibold">QuackDB</h1>
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
                <Suspense fallback={<PlaygroundSkeleton />}>
                  <LazyPlayground />
                </Suspense>
                <BrowserAlertBar />
              </EditorProvider>
            </EditorSettingsProvider>
          </QueryProvider>
        </PanelProvider>
      </DbProvider>
    </SessionProvider>
  );
}

function PlaygroundSkeleton() {
  return (
    <div className="flex size-full items-center justify-center bg-background">
      <Icon
        name="Loader2"
        className="size-6 animate-spin"
      />
    </div>
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
          className="size-5 animate-spin"
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
