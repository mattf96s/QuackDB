import { createFileRoute } from "@tanstack/react-router";
import FilePreview from "@/components/file-preview";
import { StyledLink } from "@/components/ui/link";

export const Route = createFileRoute("/files/$fileId")({
  component: FileExplorer,
  wrapInSuspense: true, // avoid layout shift
  loader: async ({ params, navigate }) => {
    const { fileId: encodedFileId } = params;

    try {
      const fileId = decodeURIComponent(encodedFileId);

      const root = await navigator.storage.getDirectory();
      const fileHandle = await root.getFileHandle(fileId, { create: false });

      if (!fileHandle) {
        await navigate({ to: "/files" });
      }
      return { fileHandle };
    } catch (e) {
      return {
        fileHandle: null,
      };
    }
  },
});

function FileExplorer() {
  const { fileHandle } = Route.useLoaderData();
  const params = Route.useParams();

  const fileId = params.fileId;

  if (!fileHandle) {
    return <NoFileFound fileId={fileId} />;
  }
  return <FilePreview fileHandle={fileHandle} />;
}

function NoFileFound(props: { fileId: string }) {
  return (
    <div className="flex h-full flex-col items-center px-6 py-12">
      <div className="flex h-[450px] w-full flex-col items-center justify-center text-center">
        <p className="text-base font-semibold text-foreground">404</p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          File not found
        </h1>
        <p className="mt-6 text-base leading-7 text-gray-600">{`Sorry, we couldn't find a file with id: ${props.fileId}.`}</p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <StyledLink
            to="/files"
            params={{}}
          >
            Go back home
          </StyledLink>
          <a
            href="#"
            className="text-sm font-semibold text-gray-900"
          >
            Contact support <span aria-hidden="true">&rarr;</span>
          </a>
        </div>
      </div>
    </div>
  );
}
