import { useCallback, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import {
  type TreeNode,
  type TreeNodeData,
} from "@/components/files/context/provider";

type UseDownloadFileProps = {
  node: TreeNode<TreeNodeData>;
};

/**
 * Download selected file.
 * Includes hotkey support (cmd+s).
 * @see https://web.dev/patterns/files/save-a-file
 */
export const useDownloadFile = (props: UseDownloadFileProps) => {
  // Remember: don't desctructure props as it breaks HMR.
  const [isLoading, setIsLoading] = useState(false);

  const onDownloadFileHandler = useCallback(async () => {
    setIsLoading(true);
    const handle = props.node.data?.handle;

    if (!handle) {
      setIsLoading(false);
      toast.error("File not found", {
        description: "try again 🤷",
      });
      return;
    }

    let blob: Blob;
    let file: File;

    try {
      const results = await handleToBlob(handle);
      blob = results.blob;
      file = results.file;
    } catch (e) {
      setIsLoading(false);
      console.error("Failed to download file: ", e);
      toast.error("Failed to download file", {
        description: e instanceof Error ? e.message : "Unknown error occured.",
      });
      return;
    }

    const supportsFileSystemAccess =
      "showSaveFilePicker" in window &&
      (() => {
        try {
          return window.self === window.top;
        } catch {
          return false;
        }
      })();

    if (!supportsFileSystemAccess) {
      // Fallback if the File System Access API is not supported…
      // Create the blob URL.
      const blobURL = URL.createObjectURL(blob);
      // Create the `<a download>` element and append it invisibly.
      const a = document.createElement("a");
      a.href = blobURL;
      a.download = `${file.name}`;
      a.style.display = "none";
      document.body.append(a);
      // Programmatically click the element.
      a.click();

      toast.success(`Successfully downloaded ${file.name}`);
      setIsLoading(false);

      // Revoke the blob URL and remove the element.
      const timerId = setTimeout(() => {
        URL.revokeObjectURL(blobURL);
        a.remove();
      }, 1000);

      return () => {
        clearTimeout(timerId);
        if (blobURL) {
          URL.revokeObjectURL(blobURL);
        }
      };
    } else {
      try {
        // Show the file save dialog.
        const saveHandle = await showSaveFilePicker({
          suggestedName: `${handle.name}`,
        });

        // Write the blob to the file.
        const writable = await saveHandle.createWritable();
        await writable.write(blob);
        await writable.close();

        setIsLoading(false);
        toast.success(`Successfully downloaded ${file.name}`);
        return;
      } catch (err) {
        setIsLoading(false);
        if (!(err instanceof Error)) {
          console.error("Failed to download file: ", err);
          toast.error("Failed to download file", {
            description: `Unknown error occured.`,
          });
          return;
        }
        // Fail silently if the user has simply canceled the dialog.
        if (err.name !== "AbortError") {
          console.error(err.name, err.message);
          toast.error("Failed to download file", {
            description: err.message,
          });
          return;
        }
      }
    }
  }, [props]);

  // scope hotkey to this component
  const ref = useHotkeys(
    "mod+s",
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      onDownloadFileHandler();
    },
    [onDownloadFileHandler],
  );

  return {
    ref,
    isLoading,
    onDownloadFileHandler,
  };
};

const handleToBlob = async (handle: FileSystemFileHandle) => {
  const file = await handle.getFile();
  const buffer = await file.arrayBuffer();
  const blob = new Blob([buffer], {
    type: file.type,
  });

  return {
    blob,
    file,
  };
};
