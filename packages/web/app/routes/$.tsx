import { Loader2 } from "lucide-react";

export async function loader() {
  throw new Response("Not found", { status: 404 });
}

// Trigger error boundary from loader
export function ErrorBoundary() {
  return (
    <div className="flex size-full items-center justify-center bg-background">
      <span>
        <Loader2 className="mr-3 h-5 w-5 animate-spin" />
      </span>
    </div>
  );
}
