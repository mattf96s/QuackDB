import { useContext } from "react";
import { DBStateContext } from "./context";

export function useDB() {
  const context = useContext(DBStateContext);

  if (context === undefined) {
    throw new Error("useDB must be used within a DBProvider");
  }
  return context;
}
