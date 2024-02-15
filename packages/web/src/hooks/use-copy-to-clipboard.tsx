"use client";

import { useCallback, useEffect, useState } from "react";

type UseCopyToClipboardProps = {
  timeout?: number;
};

export function useCopyToClipboard({
  timeout = 1500,
}: UseCopyToClipboardProps) {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (isCopied) {
      const timeoutId = setTimeout(() => setIsCopied(false), timeout);
      return () => clearTimeout(timeoutId);
    }
  }, []);

  const copyToClipboard = useCallback(async (value: string) => {
    if (typeof window === "undefined" || !navigator.clipboard?.writeText) {
      return;
    }

    if (!value) return;

    await navigator.clipboard.writeText(value);

    setIsCopied(true);
  }, []);

  return { isCopied, copyToClipboard };
}
