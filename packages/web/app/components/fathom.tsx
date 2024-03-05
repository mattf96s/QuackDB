import { useLocation } from "@remix-run/react";
import { load, trackPageview } from "fathom-client";
import { useEffect } from "react";

const isProduction = () => {
  const { hostname } = window.location;
  return hostname === "quackdb.com";
};

export default function Analytics() {
  const location = useLocation();
  const { pathname, search } = location;

  useEffect(() => {
    if (!isProduction()) return;

    load("OSRZURZO", {
      includedDomains: ["quackdb.com"],
      excludedDomains: ["localhost"],
    });
  }, []);

  useEffect(() => {
    if (!isProduction()) return;
    trackPageview();
  }, [pathname, search]);

  return null;
}
