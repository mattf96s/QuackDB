import { isRouteErrorResponse, useRouteError } from "@remix-run/react";
import { Loader2Icon } from "lucide-react";
import { Suspense } from "react";
import NavBar from "./components/navbar";
import Playground from "./components/playground";

/**
 * There is a bug in Safari which means FileSystemHandles are not structure cloned correctly.
 * This is route is a limited playground as a fallback.
 */
export default function Component() {
  return (
    <div className="flex size-full flex-col">
      <Suspense fallback={<PlaygroundSkeleton />}>
        <NavBar />
        <Playground />
      </Suspense>
    </div>
  );
}

function PlaygroundSkeleton() {
  return (
    <div className="flex size-full items-center justify-center bg-background">
      <Loader2Icon className="size-6 animate-spin" />
    </div>
  );
}

export function ErrorBoundary() {
  return (
    <div className="flex size-full items-center justify-center bg-background">
      <div className="container prose py-8">
        <ErrorDetails />
      </div>
    </div>
  );
}

export function ErrorDetails() {
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
