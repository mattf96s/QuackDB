import { cn } from "@/lib/utils";
import { useRouterState } from "@tanstack/react-router";

/**
 * GitHub like global pending indicator.
 * @source https://github.com/jacob-ebey/remix-shadcn/blob/main/app/components/global-pending-indicator.tsx
 */
export function GlobalPendingIndicator() {
	const { isTransitioning } = useRouterState();

	return (
		<div
			className={cn("fixed top-0 right-0 left-0", { hidden: !isTransitioning })}
		>
			<div className="h-0.5 w-full overflow-hidden bg-muted">
				<div className="h-full w-full origin-left-right animate-progress bg-muted-foreground" />
			</div>
		</div>
	);
}
