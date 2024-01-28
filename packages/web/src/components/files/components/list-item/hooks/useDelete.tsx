import { useCallback } from "react";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";

const useDelete = () => {
  const router = useRouter();

  // check if we are currently at the file.$fileId location. If so, we need to navigate away,

  const onDelete = useCallback(
    async (name: string) => {
      try {
        const root = await navigator.storage.getDirectory();
        await root.removeEntry(name, { recursive: true });
        toast.success("Success!", {
          description: `Deleted ${name}`,
        });
        router.invalidate();
      } catch (error) {
        console.error(error);
        toast.error("Error", {
          description: error instanceof Error ? error.message : undefined,
        });
      }
    },
    [router],
  );

  return {
    onDelete,
  };
};

export default useDelete;
