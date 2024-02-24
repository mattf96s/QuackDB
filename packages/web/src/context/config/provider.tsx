// Breakup everything into smaller files because of React Fast Refresh limitations.

import { getBrowser } from "@/utils/platform";
import { useCallback, useMemo, useState } from "react";
import { ConfigContext } from "./context";
import type { ConfigContextValue } from "./types";

type ConfigProviderProps = { children: React.ReactNode };

/**
 * Context for the query results;
 *
 */
function ConfigProvider(props: ConfigProviderProps) {
  // #TODO: use the new sync external store hook
  const [isOnline, setIsOnline] = useState(true);

  const toggleIsOnline = useCallback((isOnline: boolean) => {
    setIsOnline(isOnline);
  }, []);

  const browser = getBrowser();

  const value: ConfigContextValue = useMemo(() => {
    return {
      browser,
      isOnline,
      getBrowser,
      toggleIsOnline,
    };
  }, [isOnline, toggleIsOnline, browser]);
  return (
    <ConfigContext.Provider value={value}>
      {props.children}
    </ConfigContext.Provider>
  );
}

export { ConfigProvider };
