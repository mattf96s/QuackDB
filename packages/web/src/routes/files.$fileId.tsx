import { createFileRoute } from "@tanstack/react-router";
import FilePreview from "@/components/file-preview";

export const Route = createFileRoute("/files/$fileId")({
  component: FileExplorer,
  loader: async ({ params }) => {
    const { fileId: encodedFileId } = params;

    const fileId = decodeURIComponent(encodedFileId);

    const root = await navigator.storage.getDirectory();
    const fileHandle = await root.getFileHandle(fileId, { create: false });

    if (!fileHandle) {
      throw { redirect: { to: "/404" } };
    }
    return { fileHandle };
  },
});

function FileExplorer() {
  const { fileHandle } = Route.useLoaderData();
  return <FilePreview fileHandle={fileHandle} />;
}
