import { useContext } from "react";
import { FileTreeStateContext } from "./context";

export function useFileTree() {
  const context = useContext(FileTreeStateContext);

  if (context === undefined) {
    throw new Error("useFileTree must be used within a FileTreeProvider");
  }
  return context;
}
