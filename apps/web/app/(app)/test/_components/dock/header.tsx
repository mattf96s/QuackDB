import { GridActions } from "@/app/(app)/test/_components/dock/grid-actions";

export function Header() {
	return (
		<div>
			<div className="flex h-16 max-h-16 min-h-16 w-full shrink-0 items-center border-b bg-background px-4">
				<GridActions />
			</div>
			{/* {false && <PanelActions />}
			{false && <GroupActions />} */}
		</div>
	);
}
