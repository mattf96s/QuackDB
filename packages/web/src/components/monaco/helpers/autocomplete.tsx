import { matchSorter } from "match-sorter";
import { languages } from "monaco-editor";
import { snippets } from "@/utils/duckdb/snippets";
import { language } from "./pgsql";

type PartialMonacoCompletionItem = Pick<
  languages.CompletionItem,
  "label" | "kind" | "insertText" | "detail"
>;

const getDefaultSuggestions = (): PartialMonacoCompletionItem[] => {
  const keywords: PartialMonacoCompletionItem[] = (
    language.keywords as string[]
  ).map((keyword) => ({
    label: keyword,
    kind: languages.CompletionItemKind.Keyword,
    insertText: keyword,
  }));

  const fns: PartialMonacoCompletionItem[] = (
    language.builtinFunctions as string[]
  ).map((fn) => ({
    label: fn,
    kind: languages.CompletionItemKind.Function,
    insertText: fn,
  }));

  const operators: PartialMonacoCompletionItem[] = (
    language.operators as string[]
  ).map((op) => ({
    label: op,
    kind: languages.CompletionItemKind.Operator,
    insertText: op,
  }));

  const duckdbSnippets: PartialMonacoCompletionItem[] = snippets.map(
    (snippet) => ({
      label: snippet.name,
      kind: languages.CompletionItemKind.Snippet,
      insertText: snippet.code,
      detail: snippet.description,
    }),
  );

  return [...duckdbSnippets, ...keywords, ...fns, ...operators];
};

const cache = new Map<string, PartialMonacoCompletionItem[]>();

const getSuggestions = () => {
  const cached = cache.get(language.id);
  if (cached) return cached;
  const suggestions = getDefaultSuggestions();
  cache.set(language.id, suggestions);
  return suggestions;
};

export const autocompleter = (term: string) => {
  const allCandidates = getSuggestions();

  const suggestions = matchSorter(allCandidates, `${term}`, {
    keys: ["label"],
  });

  return {
    suggestions,
    incomplete: true,
  };
};
