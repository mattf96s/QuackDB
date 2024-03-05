import { load } from "fathom-client";
import { useEffect, useRef } from "react";

export default function Analytics() {
  const isLoadedRef = useRef(false);

  useEffect(() => {
    if (isLoadedRef.current) return;

    load("OSRZURZO", {
      includedDomains: ["quackdb.com"],
      excludedDomains: ["localhost"],
      spa: "history",
    });
    isLoadedRef.current = true;
  }, []);

  return null;
}
