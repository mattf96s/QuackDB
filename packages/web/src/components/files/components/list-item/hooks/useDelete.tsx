import { useCallback } from "react";
import { toast } from "sonner";
import { useFileTree } from "@/components/files/context";

const useDelete = () => {
  const { onRefreshFileTree } = useFileTree();

  const onDelete = useCallback(
    async (name: string) => {
      try {
        const root = await navigator.storage.getDirectory();
        await root.removeEntry(name, { recursive: true });
        await onRefreshFileTree();
        toast.success("Success!", {
          description: `Deleted ${name}`,
        });
      } catch (error) {
        console.error(error);
        toast.error("Error", {
          description: error instanceof Error ? error.message : undefined,
        });
      }
    },
    [onRefreshFileTree],
  );

  return {
    onDelete,
  };
};

export default useDelete;
