import type { ImperativePanelHandle } from "react-resizable-panels";

export type WrapperState = {
  isCollapsed: boolean;
  onToggleIsCollapse: (isCollapsed: boolean) => void;
  ref: React.RefObject<ImperativePanelHandle>;
  order: number;
  id: string;
};
