import { Panel, PanelGroup } from "react-resizable-panels";
import PanelHandle from "~/components/panel-handle";

import { cn } from "~/lib/utils";
import EditorPanel from "./editor-panel";

export default function Playground() {
  return (
    <div
      className={cn(
        "flex size-full bg-inherit",
        "bg-gray-100 transition-colors duration-200 ease-in-out dark:bg-gray-800",
      )}
    >
      <PanelGroup
        className="h-[calc(100vh-64px)] rounded-none"
        direction="horizontal"
        autoSaveId="_desktop-layout-panel-group"
      >
        <Panel
          collapsedSize={0}
          collapsible
          defaultSize={15}
          minSize={0}
          className="max-h-full"
        >
          {/* <Sidepanel isCollapsed={!explorerIsOpen} /> */}
        </Panel>
        <PanelHandle />
        <Panel
          minSize={15}
          className="h-full max-h-full max-w-full"
        >
          <EditorPanel />
        </Panel>
      </PanelGroup>
    </div>
  );
}
