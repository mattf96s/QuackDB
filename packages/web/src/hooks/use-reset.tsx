import { useCallback, useMemo, useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";

/**
 * Clear all files from the filesystem.
 */
export default function useReset() {
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const onResetFilesHandler = useCallback(async () => {
    try {
      setIsLoading(true);
      const opfsRoot = await navigator.storage.getDirectory();
      // @ts-expect-error: TS doesn't know about the recursive option
      await opfsRoot.remove({ recursive: true });

      router.invalidate();
      router.navigate({ to: "/files" });
    } catch (e) {
      console.error(e);
      toast.error("Error deleting files", {
        description: e instanceof Error ? e.message : undefined,
      });
    }
  }, [router]);

  return useMemo(
    () => ({
      isLoading,
      onResetFilesHandler,
    }),
    [isLoading, onResetFilesHandler],
  );
}
