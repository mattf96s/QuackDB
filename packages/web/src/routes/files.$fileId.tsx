import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/files/$fileId")({
  component: FileExplorer,
  loader: async ({ params }) => {
    const { fileId } = params;
    console.log("fileId: ", fileId);
    const root = await navigator.storage.getDirectory();
    const file = await root.getFileHandle(fileId, { create: false });

    if (!file) {
      return { redirect: { to: "/404" } };
    }
    return { file };
  },
});

function FileExplorer() {
  const { file } = Route.useLoaderData();
  return (
    <div>
      <h2>File</h2>
      <h3>{file?.name ?? "unknown"}</h3>
    </div>
  );
}
