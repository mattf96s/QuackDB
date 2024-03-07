import { motion } from "framer-motion";
import { del, get } from "idb-keyval";
import { useEffect, useState } from "react";
import { z } from "zod";
import Icon from "~/components/icon";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { IDB_KEYS, queryMetaSchema, type QueryMeta } from "~/constants.client";
import { useQuery } from "~/context/query/useQuery";
import { useCopyToClipboard } from "~/hooks/use-copy-to-clipboard";
import { cn } from "~/lib/utils";
import { useWrapper } from "./wrapper/context/useWrapper";
/**
 * Note: idb-keyval is probably the wrong tool for anything more advanced than this.
 * Would be better to avoid keyval and use a proper indexeddb schema.
 */

const onGetStoredQueries = async (): Promise<QueryMeta[]> => {
  // get stored queries from indexeddb
  const stored = await get(IDB_KEYS.QUERY_HISTORY);

  if (!stored) return [];

  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      const validated = z.array(queryMetaSchema).safeParse(parsed);
      if (validated.success) {
        return validated.data;
      }
    } catch (e) {
      console.error("Failed to parse query history", e);
    }
  }
  return [];
};

export default function QueryHistory() {
  const [runs, setRuns] = useState<QueryMeta[]>([]);

  const { isCollapsed, ref } = useWrapper();
  const { meta } = useQuery();

  const onToggle = () => {
    if (!ref.current) {
      console.warn("No panel ref found");
      return;
    }
    const isExpanded = ref.current.isExpanded();
    if (isExpanded) {
      ref.current.collapse();
    } else {
      ref.current.expand();
    }
  };
  const uniqueId = `${meta?.hash}_${meta?.created}`;

  useEffect(() => {
    let ignore = false;

    const refresh = async () => {
      const stored = await onGetStoredQueries();
      if (ignore) return;
      setRuns(stored);
    };

    refresh();

    return () => {
      ignore = true;
    };
  }, [uniqueId]);

  const onClearHistory = async () => {
    await del(IDB_KEYS.QUERY_HISTORY);
    setRuns([]);
  };

  return (
    <div className="flex flex-col pt-2">
      <div className="flex max-h-full w-full items-center justify-between">
        <div className="flex grow">
          <Button
            onClick={onToggle}
            variant="ghost"
            className="flex w-full items-center justify-start gap-1 hover:bg-transparent"
          >
            <Icon
              name="ChevronDown"
              className={cn(
                "size-5",
                isCollapsed && "-rotate-90 transition-transform",
              )}
            />
            <span className="text-sm font-semibold">History</span>
          </Button>
        </div>
        <div className="flex items-center gap-1 px-2">
          <Button
            size="xs"
            variant="ghost"
            onClick={onClearHistory}
            disabled={runs.length === 0}
          >
            <Icon
              name="History"
              size={16}
            />
          </Button>
        </div>
      </div>
      {runs.length === 0 && (
        <div className={cn("py-2 pl-6 text-sm text-gray-400")}>No runs yet</div>
      )}

      <motion.div
        className={cn(
          "flex w-full flex-col gap-1 divide-y divide-white/5 overflow-y-auto px-4 py-1 transition-all dark:divide-white/5",
          isCollapsed && "hidden",
        )}
        role="list"
      >
        {runs.map((run) => {
          const key = `${run.hash}_${run.created}`;
          return (
            <RunHoverCard
              key={key}
              {...run}
            />
          );
        })}
      </motion.div>
    </div>
  );
}

function RunHoverCard(props: QueryMeta) {
  const { isCopied, copyToClipboard } = useCopyToClipboard({
    timeout: 1500,
  });
  const { hash, sql, cacheHit, executionTime, error, status } = props;

  const formatter = new Intl.NumberFormat("en-UK", {
    maximumFractionDigits: 2,
    compactDisplay: "short",
  });

  const duration = formatter.format(executionTime / 1000);
  return (
    <motion.li
      layout
      key={hash}
      className={cn(
        "relative flex items-center space-x-4 rounded-md px-2 py-4 transition-colors hover:cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800",
        error &&
          "bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-800 dark:hover:bg-yellow-700",
      )}
      onClick={async () => {
        // copy to clipboard
        await copyToClipboard(sql);
      }}
    >
      <div className="min-w-0 flex-auto">
        <div className="flex items-center gap-x-3">
          <div
            className={cn(
              "flex-none rounded-full p-1",
              status === "SUCCESS" && "bg-green-500",
              status === "ERROR" && "bg-yellow-500",
            )}
          >
            <div className="size-2 rounded-full bg-current" />
          </div>
          <h2 className="min-w-0 text-sm font-semibold leading-6 dark:text-white">
            <span className="truncate">{error ? "Error" : "Success"}</span>
            <span className="px-1 text-gray-400">/</span>
            <span className="whitespace-nowrap">{duration}s</span>
            <span className="absolute inset-0" />
          </h2>
          <Badge
            variant="outline"
            color={cacheHit ? "green" : "blue"}
          >
            {cacheHit ? "CACHE" : "LIVE"}
          </Badge>
        </div>
        {error && (
          <div className="mt-3 flex items-center gap-x-2.5 text-xs leading-5 text-gray-400">
            <span className="line-clamp-3 truncate text-wrap break-words text-left font-mono text-xs text-gray-700 dark:text-gray-100">
              {error}
            </span>
          </div>
        )}
        <div className="mt-3 flex items-center gap-x-2.5 text-xs leading-5 text-gray-400">
          <span className="line-clamp-3 truncate text-wrap break-words text-left font-mono text-xs text-gray-700 dark:text-gray-100">
            {sql}
          </span>
          {isCopied && (
            <div className="absolute inset-y-1 right-1">
              <Icon
                name="CopyCheck"
                className="bg-transparent text-green-700"
                size={18}
              />
            </div>
          )}
        </div>
      </div>

      <Icon
        name="ChevronRight"
        className="size-5 flex-none text-gray-400"
        aria-hidden="true"
      />
    </motion.li>
  );
}
