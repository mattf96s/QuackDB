import { createContext } from "react";

export const SidebarStateContext = createContext<
  { isOpen: boolean; onToggleSidebar: (isOpen: boolean) => void } | undefined
>(undefined);
