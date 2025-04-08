import { useNavigation } from "@remix-run/react";

import { cn } from "@/lib/utils";

/**
 * GitHub like global pending indicator.
 * @source https://github.com/jacob-ebey/remix-shadcn/blob/main/app/components/global-pending-indicator.tsx
 */
export default function GlobalPendingIndicator() {
  const navigation = useNavigation();
  const pending = navigation.state !== "idle";

  return (
    <div className={cn("fixed left-0 right-0 top-0", { hidden: !pending })}>
      <div className="h-0.5 w-full overflow-hidden bg-muted">
        <div className="animate-progress origin-left-right h-full w-full bg-muted-foreground" />
      </div>
    </div>
  );
}
