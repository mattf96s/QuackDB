import { useRef, type RefObject, useCallback } from "react";

/**
 *
 * @source https://github.com/vercel/ai-chatbot/blob/main/lib/hooks/use-enter-submit.tsx
 */
export function useEnterSubmit(): {
  formRef: RefObject<HTMLFormElement>;
  onKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
} {
  const formRef = useRef<HTMLFormElement>(null);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>): void => {
      if (
        event.key === "Enter" &&
        !event.shiftKey &&
        !event.nativeEvent.isComposing
      ) {
        formRef.current?.requestSubmit();
        event.preventDefault();
      }
    },
    [],
  );

  return { formRef, onKeyDown: handleKeyDown };
}
