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
        <h1>500</h1>
        <p>An unexpected error occurred.</p>
      </div>
    </div>
  );
}
