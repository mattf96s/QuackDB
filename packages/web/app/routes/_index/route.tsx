import { Loader2 } from "lucide-react";
import { Suspense, lazy } from "react";
import { ClientOnly } from "remix-utils/client-only";
import { DbProvider } from "~/context/db/provider";
import { EditorSettingsProvider } from "~/context/editor-settings/provider";
import { EditorProvider } from "~/context/editor/provider";
import { PanelProvider } from "~/context/panel/provider";
import { QueryProvider } from "~/context/query/provider";
import { SessionProvider } from "~/context/session/provider";
import NavBar from "./components/navbar";

const LazyPlayground = lazy(() =>
  import("./components/playground").then((module) => ({
    default: module.default,
  })),
);

export default function Component() {
  return (
    <div className="flex size-full flex-col">
      <Suspense fallback={<PlaygroundSkeleton />}>
        {/* Could just be an SPA if we wanted. */}
        <ClientOnly fallback={<PlaygroundSkeleton />}>
          {() => (
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
          )}
        </ClientOnly>
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
