import { useLocation } from "@remix-run/react";
import { load, trackPageview } from "fathom-client";
import { useEffect, useRef } from "react";

export default function Analytics() {
  const isLoadedRef = useRef(false);
  const location = useLocation();

  useEffect(
    function setupFathom() {
      if (!isLoadedRef.current) {
        load("OSRZURZO", {
          excludedDomains: ["localhost"],
        });
        isLoadedRef.current = true;
      } else {
        trackPageview();
      }
    },
    [location],
  );

  return null;
}
