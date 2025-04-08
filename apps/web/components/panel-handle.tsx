import { cn } from "@/lib/utils";
import { DragHandleDots2Icon } from "@radix-ui/react-icons";
import { PanelResizeHandle } from "react-resizable-panels";

/**
 * Panel resize handle component.
 *
 * @component
 * 
 * @example
    <PanelGroup>
        <Panel>
            <Content />
        </Panel>
        <PanelResizeHandle />
        <Panel>
            <Content2 />
        </Panel>
    </PanelGroup>
 */
export default function PanelHandle() {
  return (
    <PanelResizeHandle
      className={cn(
        "relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 [&[data-panel-group-direction=vertical]>div]:rotate-90"
      )}
    >
      <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border">
        <DragHandleDots2Icon className="size-2.5" />
      </div>
    </PanelResizeHandle>
  );
}
