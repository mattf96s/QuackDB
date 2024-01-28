import { useContext } from "react";
import { SidebarStateContext } from "../context/context";

export function useSidebar() {
  const context = useContext(SidebarStateContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}
