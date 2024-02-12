import { useEffect, useState } from "react";
import { ChevronDown, Database, History } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { CACHE_KEYS } from "@/constants";
import { useQuery } from "@/context/query/useQuery";
import { cn } from "@/lib/utils";
import { useWrapper } from "./wrapper/context/useWrapper";

const querySchema = z.array(z.string());

const onGetStoredQueries = () => {
  const stored = localStorage.getItem(CACHE_KEYS.QUERY_HISTORY);

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

export default function QueryHistory() {
  const [queries, setQueries] = useState<string[]>([]);

  const { sql } = useQuery();

  useEffect(() => {
    const refresh = () => {
      const stored = onGetStoredQueries();
      setQueries(stored);
    };

    refresh();
  }, []);

  useEffect(() => {
    if (sql) {
      const stored = onGetStoredQueries();
      stored.unshift(sql);
      const unique = Array.from(new Set(stored));
      localStorage.setItem(CACHE_KEYS.QUERY_HISTORY, JSON.stringify(unique));
      setQueries(unique);
    }
  }, [sql]);

  const { isCollapsed, onToggleIsCollapse } = useWrapper();

  const onCollapse = () => {
    onToggleIsCollapse(true);
  };

  const onExpand = () => {
    onToggleIsCollapse(false);
  };

  return (
    <div className="flex w-full flex-col pt-2">
      <div className="flex w-full items-center justify-between">
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
            onClick={() => {
              localStorage.removeItem(CACHE_KEYS.QUERY_HISTORY);
              setQueries([]);
            }}
            disabled={queries.length === 0}
          >
            <History size={16} />
          </Button>
        </div>
      </div>
      {queries.length === 0 && (
        <div
          className={cn(
            "py-2 pl-6 text-sm text-gray-400",
            isCollapsed && "hidden",
          )}
        >
          No queries yet
        </div>
      )}
      <div className={cn("flex w-full flex-col gap-1 py-1")}>
        {queries.map((query) => {
          return (
            <ContextMenu key={query}>
              <ContextMenuTrigger className="data-[state=open]:bg-gray-100">
                <Button
                  className="ml-5 flex h-6 w-48 items-center justify-start gap-2 p-2 pl-0"
                  variant="ghost"
                >
                  <Database className="size-4" />
                  <span className="truncate font-normal">{query}</span>
                </Button>
              </ContextMenuTrigger>
              <ContextMenuContent className="w-64">
                <ContextMenuItem inset>
                  Open
                  <ContextMenuShortcut>⌘O</ContextMenuShortcut>
                </ContextMenuItem>
                <ContextMenuItem inset>
                  Rename
                  <ContextMenuShortcut>⌘R</ContextMenuShortcut>
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem inset>
                  Delete
                  <ContextMenuShortcut>⌘⌫</ContextMenuShortcut>
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          );
        })}
      </div>
    </div>
  );
}
