import {
  type ClientLoaderFunctionArgs,
  isRouteErrorResponse,
  Link,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import type { MetaFunction } from "@vercel/remix";
import { wrap } from "comlink";
import { Loader2 } from "lucide-react";
import { lazy, Suspense, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { metaDetails } from "~/constants";
import { DbProvider } from "~/context/db/provider";
import { EditorSettingsProvider } from "~/context/editor-settings/provider";
import { EditorProvider } from "~/context/editor/provider";
import { PanelProvider } from "~/context/panel/provider";
import { QueryProvider } from "~/context/query/provider";
import { SessionProvider } from "~/context/session/provider";
import NavBar from "./components/navbar";
import type { IsSupportedWorker } from "./workers/is-supported.worker";

/**
 * WebKit has a bug with transferring file system file handles to workers.
 * This loader checks if the browser can transfer file system file handles.
 */
export async function clientLoader(_props: ClientLoaderFunctionArgs) {
  // check if filesystemfilehandle can be sent in postMessage. There is a Safari bug.
  let canCloneHandle = false;
  let worker: Worker | undefined;
  try {
    worker = new Worker(
      new URL("./workers/is-supported.worker.ts", import.meta.url),
      {
        type: "module",
        name: "is-supported-worker",
      },
    );
    const fn = wrap<IsSupportedWorker>(worker);
    canCloneHandle = await fn();
  } catch (e) {
    canCloneHandle = false;
  } finally {
    worker?.terminate();
  }

  return {
    canCloneHandle,
  };
}

export function HydrateFallback() {
  return <PlaygroundSkeleton />;
}

export const meta: MetaFunction = () => {
  return [
    {
      title: "Playground | QuackDB",
    },
    {
      name: "description",
      content: metaDetails.description,
    },
    {
      name: "og:description",
      content: metaDetails.description,
    },
    {
      name: "og:title",
      content: "Playground | QuackDB",
    },
    {
      name: "og:url",
      content: "https://www.quackdb.com/",
    },
  ];
};

const LazyPlayground = lazy(() =>
  import("./components/playground").then((module) => ({
    default: module.default,
  })),
);

export default function Component() {
  const data = useLoaderData<typeof clientLoader>();

  return (
    <div className="flex size-full flex-col">
      {!data.canCloneHandle && <NotSupportedModal />}
      <Suspense fallback={<PlaygroundSkeleton />}>
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
                  </EditorProvider>
                </EditorSettingsProvider>
              </QueryProvider>
            </PanelProvider>
          </DbProvider>
        </SessionProvider>
      </Suspense>
    </div>
  );
}

function PlaygroundSkeleton() {
  return (
    <div className="flex size-full items-center justify-center bg-background">
      <Loader2
        name="loader-circle"
        className="size-6 animate-spin"
      />
    </div>
  );
}

function NotSupportedModal() {
  const [open, setOpen] = useState(true);
  return (
    <>
      {!open && (
        <div className="bg-destructive p-2 text-center text-white">
          <p>
            Your browser does not support transferring file system file handles.
            <br />
            <Link
              to="/lite"
              className="underline"
            >
              Try the Lite Version
            </Link>
          </p>
        </div>
      )}
      <AlertDialog
        open={open}
        onOpenChange={setOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Browser Not Supported</AlertDialogTitle>
            <AlertDialogDescription>
              Your browser does not support{" "}
              <a
                target="_blank"
                href="https://bugs.webkit.org/show_bug.cgi?id=256712#c0"
                rel="noreferrer"
                className="underline"
              >
                transferring file system file handles
              </a>
              .
              <br />
              Would you like to try the Lite Version?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Link
                to="/lite"
                className="btn btn-primary"
              >
                Lite Version
              </Link>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div>
        <h1>
          {error.status} {error.statusText}
        </h1>
        <p>{error.data}</p>
      </div>
    );
  } else if (error instanceof Error) {
    return (
      <div>
        <h1>Error</h1>
        <p>{error.message}</p>
        <p>The stack trace is:</p>
        <pre>{error.stack}</pre>
      </div>
    );
  } else {
    return <h1>Unknown Error</h1>;
  }
}
