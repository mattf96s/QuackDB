import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { releaseProxy, type Remote, wrap } from "comlink";
import { languages } from "monaco-editor";
import type { AutocompleteWorker } from "@/workers/autocomplete-worker";

type TypeLabel = "kw" | "fn" | "set" | "type";

type RawSuggestion = {
  context: null;
  label: "desc";
  priority: number;
  type_label: TypeLabel;
};

const toMonacoType = (type: TypeLabel) => {
  switch (type) {
    case "kw":
      return languages.CompletionItemKind.Keyword;
    case "fn":
      return languages.CompletionItemKind.Function;
    case "set":
      return languages.CompletionItemKind.Value;
    case "type":
      return languages.CompletionItemKind.TypeParameter;
  }
};

type MonacoSuggestion = RawSuggestion & {
  label: string;
  kind: languages.CompletionItemKind;
  insertText: string;
};

export const useAutocompleteWorker = () => {
  const workerRef = useRef<Worker | null>(null);
  const wrapperRef = useRef<Remote<AutocompleteWorker> | null>(null);
  const [suggestions, setSuggestions] = useState<MonacoSuggestion[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const w = new Worker(
      new URL("@/workers/autocomplete-worker.ts", import.meta.url),
      {
        name: "autocomplete-worker",
        type: "module",
      },
    );
    workerRef.current = w;

    const fn = wrap<AutocompleteWorker>(w);

    wrapperRef.current = fn;

    signal.addEventListener("abort", () => {
      fn[releaseProxy]();
      w.terminate();

      workerRef.current = null;
      wrapperRef.current = null;

      setIsInitialized(false);
    });

    setIsInitialized(true);

    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    if (!isInitialized) return;

    const fn = wrapperRef.current;

    const cacheSuggestions = async () => {
      if (!fn) return;

      if (signal.aborted) return;

      try {
        const RawSuggestions = (await fn("cache")) as RawSuggestion[] | null;

        if (signal.aborted) return;

        const formattedSuggestions = RawSuggestions?.map((suggestion) => {
          return {
            ...suggestion,
            label: suggestion.label,
            kind: toMonacoType(suggestion.type_label),
            insertText: suggestion.label,
          };
        });

        setSuggestions(formattedSuggestions ?? []);
      } catch (e) {
        console.error("Error caching suggestions", e);
      }
    };

    cacheSuggestions();

    return () => {
      controller.abort();
    };
  }, [isInitialized]);

  const onGetSuggestions = useCallback(async (value: string) => {
    if (!wrapperRef.current) return;

    const suggestions = await wrapperRef.current(value);

    return suggestions;
  }, []);

  return useMemo(
    () => ({
      onGetSuggestions,
      suggestions,
    }),
    [onGetSuggestions, suggestions],
  );
};
