import Icon from "@/components/icon";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { useTheme } from "./theme-provider";

export default function ErrorNotification(props: { error: string }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  return (
    <Alert
      variant={isDark ? "default" : "destructive"}
      className={cn(
        "group flex flex-col gap-3 hover:shadow hover:dark:border-card-foreground/30",
        "min-w-24 space-y-1 font-mono dark:bg-accent dark:text-accent-foreground",
      )}
    >
      <AlertTitle>
        <span className="inline-flex items-center gap-2">
          <Icon
            name="AlertOctagon"
            className="size-4"
          />
          <p className="text-base">Error</p>
        </span>
      </AlertTitle>
      <AlertDescription className="whitespace-pre-line font-mono text-sm">
        {props.error}
      </AlertDescription>
    </Alert>
  );
}
