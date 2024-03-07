import { Suspense } from "react";
import { ClientOnly } from "remix-utils/client-only";
import Icon from "~/components/icon";
import Playground from "./components/playground";
/**
 * There is a bug in Safari which means FileSystemHandles are not structure cloned correctly.
 * This is route is a limited playground as a fallback.
 */
export default function Component() {
  return (
    <div className="flex size-full flex-col">
      <Suspense fallback={<PlaygroundSkeleton />}>
        {/* Could just be an SPA if we wanted. */}
        <ClientOnly fallback={<PlaygroundSkeleton />}>
          {() => (
            <Suspense fallback={<PlaygroundSkeleton />}>
              <Playground />
            </Suspense>
          )}
        </ClientOnly>
      </Suspense>
    </div>
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
