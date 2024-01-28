import { createFileRoute } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";
import { useSpinDelay } from "spin-delay";
import { Button } from "@/components/ui/button";
import useAddFiles from "@/hooks/use-add-files";

export const Route = createFileRoute("/files/")({
  component: FileIndexRoute,
});

function FileIndexRoute() {
  const { isLoading, onAddFilesHandler } = useAddFiles({ withRedirect: true });

  const showDisabledState = useSpinDelay(isLoading, {
    delay: 500,
  });
  return (
    <div className="flex h-full flex-col">
      <div className="flex w-full items-center justify-center p-6">
        <div className="mt-20 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              vectorEffect="non-scaling-stroke"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-semibold text-gray-900">
            No files selected
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by choosing a file.
          </p>
          <div className="mt-6">
            <Button
              type="button"
              disabled={showDisabledState}
              onClick={onAddFilesHandler}
            >
              <PlusIcon
                className="-ml-0.5 mr-1.5 h-5 w-5"
                aria-hidden="true"
              />
              Add New File
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
