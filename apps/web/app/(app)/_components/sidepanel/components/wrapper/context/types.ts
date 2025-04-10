import type { RefObject } from "react";
import type { ImperativePanelHandle } from "react-resizable-panels";

export type WrapperState = {
  isCollapsed: boolean;
  onToggleIsCollapse: (isCollapsed: boolean) => void;
  ref: RefObject<ImperativePanelHandle | null>;
  order: number;
  id: string;
};
