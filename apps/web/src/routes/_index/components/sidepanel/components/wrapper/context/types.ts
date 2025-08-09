import type { ImperativePanelHandle } from "react-resizable-panels";

export type WrapperState = {
	isCollapsed: boolean;
	onToggleIsCollapse: (isCollapsed: boolean) => void;
	ref: React.RefObject<ImperativePanelHandle | null>;
	order: number;
	id: string;
};
