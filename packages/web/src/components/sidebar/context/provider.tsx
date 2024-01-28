import * as React from "react";
import { useSessionStorage } from "@uidotdev/usehooks";
import { SidebarStateContext } from "./context";

type SidebarProviderProps = { children: React.ReactNode };

function SidebarProvider({ children }: SidebarProviderProps) {
  const [isOpenCookie, setIsOpenCookie] = useSessionStorage(
    "desktop-sidebar",
    false,
  );

  const onToggleSidebar = React.useCallback(
    (isOpen: boolean) => {
      setIsOpenCookie(isOpen);
    },
    [setIsOpenCookie],
  );

  const value = React.useMemo(() => {
    return {
      isOpen: isOpenCookie,
      onToggleSidebar,
    };
  }, [isOpenCookie, onToggleSidebar]);

  return (
    <SidebarStateContext.Provider value={value}>
      {children}
    </SidebarStateContext.Provider>
  );
}

export { SidebarProvider };
