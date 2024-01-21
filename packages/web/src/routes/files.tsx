import { FileRoute } from "@tanstack/react-router";

export const Route = new FileRoute("/files").createRoute({
  component: FileExplorer,
});

function FileExplorer() {
  return (
    <div>
      <h1>File explorer</h1>
    </div>
  );
}
