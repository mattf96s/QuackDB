import { Suspense } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { releaseProxy, type Remote, wrap } from "comlink";
import {
  CodeViewer,
  PresetSave,
  PresetSelector,
  PresetShare,
} from "@/components/playground";
import PresetActions from "@/components/playground/preset-action";
import { type Preset } from "@/components/playground/types";
import { Separator } from "@/components/ui/separator";
import { DbProvider } from "@/context/db/provider";
import { useDB } from "@/context/db/useDB";
import { SessionProvider } from "@/context/session/provider";
import type { DuckDBInstance } from "@/modules/duckdb-singleton";
import type { GetSessionWorker } from "@/workers/get-session-worker";
import FilePanels from "./-components/panels";
import SessionCombobox from "./-components/session-selector";

const presets: Preset[] = [];

export const Route = createFileRoute("/")({
  component: PlaygroundContainer,
  loader: async ({ abortController }) => {
    let worker: Worker | undefined;
    let getFilesFn: Remote<GetSessionWorker> | undefined;

    try {
      worker = new Worker(
        new URL("@/workers/get-session-worker.ts", import.meta.url),
        {
          type: "module",
          name: "GetSessionWorker",
        },
      );

      getFilesFn = wrap<GetSessionWorker>(worker);

      const resPromise = getFilesFn("default");

      // abort worker if route is aborted
      abortController.signal.addEventListener("abort", () => {
        worker?.terminate();
      });

      const res = await resPromise;

      return res;
    } finally {
      getFilesFn?.[releaseProxy]();
      worker?.terminate();
    }
  },
});

function PlaygroundContainer() {
  return (
    <SessionProvider>
      <DbProvider>
        <DBInitializer>
          <Playground />
        </DBInitializer>
      </DbProvider>
    </SessionProvider>
  );
}

const initializeDB = (db: DuckDBInstance) => async (session: string) => {
  let worker: Worker | undefined;

  try {
    worker = new Worker(
      new URL("@/workers/get-session-worker.ts", import.meta.url),
      {
        type: "module",
        name: "GetSessionWorker",
      },
    );
    const getFilesFn = wrap<GetSessionWorker>(worker);

    const { storage } = await getFilesFn(session);

    const instance = await db._getDB();

    await instance.registerFileHandle;
  } finally {
    worker?.terminate();
  }
};

function DBInitializer(props: { children: React.ReactNode }) {
  const { db } = useDB();

  return <>{props.children}</>;
}

function Playground() {
  const data = Route.useLoaderData();
  const { session, storage } = data;
  return (
    <div className="h-full flex-col md:flex">
      <div className="container flex max-w-none flex-col items-start justify-between space-y-2 py-4 sm:flex-row sm:items-center sm:space-y-0 md:h-16">
        <div>
          {/* <h2 className="text-lg font-semibold">QuackDB</h2> */}
          <SessionCombobox />
        </div>
        <div className="ml-auto flex w-full space-x-2 sm:justify-end">
          <PresetSelector presets={presets} />
          <PresetSave />
          <div className="hidden space-x-2 md:flex">
            <CodeViewer />
            <PresetShare />
          </div>
          <PresetActions />
        </div>
      </div>
      <Separator />

      <Suspense fallback={<p>Loading...</p>}>
        <FilePanels files={storage?.tree ?? []} />
      </Suspense>
    </div>
  );
}
