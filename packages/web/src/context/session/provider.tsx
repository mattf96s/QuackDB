import { useCallback, useMemo, useState } from "react";
import { SessionContext } from "./context";

type SessionProviderProps = {
  children: React.ReactNode;
};

function SessionProvider({ children }: SessionProviderProps) {
  const [session, setSession] = useState("default");

  const onSessionChange = useCallback((session: string) => {
    setSession(session);
  }, []);

  const value = useMemo(
    () => ({
      session,
      onSessionChange,
    }),
    [onSessionChange, session],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export { SessionProvider };
