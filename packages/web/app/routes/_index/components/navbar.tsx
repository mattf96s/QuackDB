import { Link } from "@remix-run/react";
import { Loader2, Loader2Icon, Terminal } from "lucide-react";
import { Suspense } from "react";
import { Badge } from "~/components/ui/badge";
import { useQuery } from "~/context/query/useQuery";
import { cn } from "~/lib/utils";
import Toolbar from "./query-toolbar";
import Settings from "./settings";

export default function NavBar() {
  return (
    <div className="hidden h-16 max-h-16 min-h-16 w-full shrink-0 items-center border-b bg-background px-2 md:flex">
      <div className="flex h-full items-center justify-evenly gap-3">
        <HomeIcon />
        <h1 className="ml-1 text-xl font-semibold">QuackDB</h1>
        <Terminal
          name="terminal"
          className="size-5"
        />
      </div>
      <div className="ml-auto flex w-full items-center space-x-2 sm:justify-end">
        <div className="ml-auto flex w-full items-center space-x-2 sm:justify-end">
          <QueryMeta />
          <Toolbar />
          <Settings />
        </div>
      </div>
    </div>
  );
}

function HomeIcon() {
  return (
    <Link
      to="/"
      className="relative size-9 overflow-hidden rounded-full border bg-foreground dark:bg-white"
    >
      <Suspense
        fallback={
          <span className="m-auto size-9 rounded-full">
            <Loader2Icon className="size-5 animate-spin" />
          </span>
        }
      >
        <img
          src="logo.webp"
          className="relative -top-[0.5px] size-9 rounded-full bg-white object-cover"
          alt="QuackDB logo"
        />
      </Suspense>
    </Link>
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
