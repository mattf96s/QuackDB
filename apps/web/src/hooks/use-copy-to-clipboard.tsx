import { useCallback, useEffect, useState } from "react";

type UseCopyToClipboardProps = {
  timeout?: number;
};

export function useCopyToClipboard(props?: UseCopyToClipboardProps) {
  const timeout = props?.timeout ?? 1500;
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | undefined;
    if (isCopied) {
      timeoutId = setTimeout(() => setIsCopied(false), timeout);
    }
    return () => clearTimeout(timeoutId);
  }, [isCopied, timeout]);

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
