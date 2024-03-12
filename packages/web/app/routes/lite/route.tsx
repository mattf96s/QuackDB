import { type LinksFunction } from "@remix-run/node";
import { Loader2Icon } from "lucide-react";
import { Suspense } from "react";
import { ClientOnly } from "remix-utils/client-only";
import styles from "~/styles/dockview.css?url";
import NavBar from "./components/navbar";
import Playground from "./components/playground";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

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
            <>
              <NavBar />
              <Suspense fallback={<PlaygroundSkeleton />}>
                <Playground />
              </Suspense>
            </>
          )}
        </ClientOnly>
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
