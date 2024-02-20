import { createContext } from "react";

// Breakup so HMR is happy. Very upsetting.
export const SidebarStateContext = createContext<
  { isOpen: boolean; onToggleSidebar: (isOpen: boolean) => void } | undefined
>(undefined);
