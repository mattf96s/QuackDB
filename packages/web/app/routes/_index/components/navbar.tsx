import { Loader2 } from "lucide-react";
import NavBar from "~/components/navbar";
import { Badge } from "~/components/ui/badge";
import { useQuery } from "~/context/query/useQuery";
import { cn } from "~/lib/utils";
import Toolbar from "./query-toolbar";
import Settings from "./settings";

export default function Nav() {
  return (
    <NavBar>
      <QueryMeta />
      <Toolbar />
      <Settings />
    </NavBar>
  );
}

function QueryMeta() {
  const { meta, status } = useQuery();

  const seconds = Math.floor(meta?.executionTime ?? 0) / 1000;
  const formattedTime = seconds.toFixed(2);

  if (status === "RUNNING") {
    return (
      <Badge
        variant="secondary"
        className="text-xs tabular-nums text-muted-foreground"
      >
        <Loader2 className="size-5 animate-spin" />
      </Badge>
    );
  }

  return (
    <>
      <Badge
        variant="outline"
        className={cn(
          "border-green-300 bg-green-100 text-xs tabular-nums text-muted-foreground dark:border-green-500 dark:bg-background dark:text-green-500",
          meta?.cacheHit && "border-orange-300 bg-orange-100",
        )}
      >
        {meta?.cacheHit ? "cached" : "live"}{" "}
      </Badge>

      <Badge
        variant="outline"
        className="text-xs tabular-nums text-muted-foreground"
      >
        {formattedTime}s
      </Badge>
    </>
  );
}
