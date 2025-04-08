import { cn } from "@/lib/utils";
import { Loader2, MoreVertical, Settings2 } from "lucide-react";
import { useState } from "react";
import NavBar from "~/components/navbar";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Separator } from "~/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import { useQuery } from "~/context/query/useQuery";
import useBreakpoint from "~/hooks/use-breakpoints";
import Toolbar from "./query-toolbar";
import Settings from "./settings";

export default function Nav() {
  const isMobile = useBreakpoint("sm", "down");

  return <NavBar>{isMobile ? <MobileNav /> : <DesktopNav />}</NavBar>;
}

function DesktopNav() {
  return (
    <>
      <QueryMeta />
      <Toolbar />
      <DesktopSettings />
    </>
  );
}

function DesktopSettings() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings2 className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 rounded-xl border bg-card text-card-foreground shadow"
        collisionPadding={20}
      >
        <Settings isOpen={isOpen} />
      </PopoverContent>
    </Popover>
  );
}

function MobileNav() {
  return (
    <>
      <Toolbar />
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline">
            <MoreVertical className="size-5" />
          </Button>
        </SheetTrigger>
        <SheetContent className="h-full max-h-full space-y-4 overflow-y-auto">
          <div className="flex h-full flex-col gap-4">
            <SheetHeader>
              <SheetTitle>Playground</SheetTitle>
              <SheetDescription>
                View your query details and session settings.
              </SheetDescription>
            </SheetHeader>
            <Separator />

            <div className="space-y-4">
              <div className="col-span-full flex flex-col space-y-1.5 py-2">
                <p className="font-semibold leading-none tracking-tight">
                  Query
                </p>
                <p className="text-sm text-muted-foreground">
                  View details about your query.
                </p>
              </div>
              <div className="inline-flex w-full items-center justify-between">
                <p className="text-sm font-medium">Last run</p>
                <div>
                  <QueryMeta />
                </div>
              </div>

              <Separator />
              <Settings isOpen={true} />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
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
          meta?.cacheHit && "border-orange-300 bg-orange-100"
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
