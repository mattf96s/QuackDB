import { useEffect, useState } from "react";
import { get, set } from "idb-keyval";
import { ChevronDown, CopyCheck, History } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { CACHE_KEYS } from "@/constants";
import { useQuery } from "@/context/query/useQuery";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { cn } from "@/lib/utils";
import { useWrapper } from "./wrapper/context/useWrapper";

const querySchema = z.array(z.string());

const onGetStoredQueries = async () => {
  const stored = await get(CACHE_KEYS.QUERY_HISTORY);

  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      const validated = querySchema.safeParse(parsed);
      if (validated.success) {
        const unique = Array.from(new Set(validated.data));
        return unique;
      }
    } catch (e) {
      console.error("Failed to parse query history", e);
    }
  }
  return [];
};

const onAddQuery = async (query: string) => {
  const stored = await onGetStoredQueries();
  stored.unshift(query);
  const unique = Array.from(new Set(stored));
  await set(CACHE_KEYS.QUERY_HISTORY, JSON.stringify(unique));
  return unique;
};

export default function QueryHistory() {
  const [queries, setQueries] = useState<string[]>([]);

  const { isCollapsed, onToggleIsCollapse } = useWrapper();

  const onCollapse = () => {
    onToggleIsCollapse(true);
  };

  const onExpand = () => {
    onToggleIsCollapse(false);
  };

  const { sql, status } = useQuery();

  useEffect(() => {
    const refresh = async () => {
      const stored = await onGetStoredQueries();
      setQueries(stored);
    };

    refresh();
  }, []);

  const isRunning = status === "loading";

  useEffect(() => {
    if (isRunning && sql) {
      onAddQuery(sql).then((unique) => {
        setQueries(unique);
      });
    }
  }, [sql, isRunning]);

  const onClearHistory = async () => {
    await set(CACHE_KEYS.QUERY_HISTORY, JSON.stringify([]));
    setQueries([]);
  };

  return (
    <div className="flex flex-col pt-2">
      <div className="flex max-h-full w-full items-center justify-between">
        <div className="flex grow">
          <Button
            onClick={isCollapsed ? onExpand : onCollapse}
            variant="ghost"
            className="flex w-full items-center justify-start gap-1 hover:bg-transparent"
          >
            <ChevronDown
              className={cn(
                "size-5",
                isCollapsed && "rotate-180 transition-transform",
              )}
            />
            <span className="text-sm font-semibold">History</span>
          </Button>
        </div>
        <div className="flex items-center gap-1 pr-1">
          <Button
            size="xs"
            variant="ghost"
            onClick={onClearHistory}
            disabled={queries.length === 0}
          >
            <History size={16} />
          </Button>
        </div>
      </div>
      {queries.length === 0 && (
        <div className={cn("py-2 pl-6 text-sm text-gray-400")}>
          No queries yet
        </div>
      )}
      <div
        className={cn(
          "flex w-full flex-col gap-1 overflow-y-auto px-6 py-1 transition-all",
          isCollapsed && "hidden",
        )}
      >
        {queries.map((query) => {
          return (
            <HistoryItem
              key={query}
              query={query}
            />
          );
        })}
      </div>
    </div>
  );
}

function HistoryItem(props: { query: string }) {
  const { isCopied, copyToClipboard } = useCopyToClipboard({
    timeout: 1500,
  });
  const { query } = props;
  return (
    <div
      onClick={async () => {
        // copy to clipboard
        await copyToClipboard(query);
      }}
      key={query}
      className="relative flex w-full flex-row justify-between gap-4 rounded-sm p-1 hover:bg-gray-100 dark:hover:bg-gray-900"
    >
      <div>
        <button>
          <span className="line-clamp-3 truncate text-wrap break-all text-left font-mono text-xs text-gray-700 dark:text-gray-100">
            {query}
          </span>
        </button>
      </div>
      {isCopied && (
        <div className="absolute inset-y-1 right-1">
          <CopyCheck
            className="bg-white text-green-700 dark:bg-green-700 dark:text-white"
            size={18}
          />
        </div>
      )}
    </div>
  );
}
