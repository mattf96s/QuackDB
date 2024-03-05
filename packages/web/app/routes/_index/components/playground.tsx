import { useRef, useState } from "react";
import {
  Panel,
  PanelGroup,
  type ImperativePanelHandle,
} from "react-resizable-panels";
import Icon from "~/components/icon";
import PanelHandle from "~/components/panel-handle";

import ModeToggle from "~/components/theme-toggle";
import { Button } from "~/components/ui/button";
import { useFileDrop } from "~/context/session/hooks/useAddFile.tsx";
import { cn } from "~/lib/utils";
import EditorPanel from "./editor-panel";
import Sidepanel from "./sidepanel";

export default function Playground() {
  const sidepanelRef = useRef<ImperativePanelHandle>(null);
  const {
    isDragActive,
    ref,
    onDragEnter,
    onDragLeave,
    onDragOver,
    onFileDrop,
  } = useFileDrop();
  const [explorerIsOpen, setExplorerIsOpen] = useState(false);

  return (
    <div
      onDrop={onFileDrop}
      onDragOver={onDragOver}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      ref={ref}
      className={cn(
        "flex size-full bg-inherit",
        isDragActive &&
          "bg-gray-100 transition-colors duration-200 ease-in-out dark:bg-gray-800",
      )}
    >
      <div className="flex h-full w-14 flex-col border-r bg-background">
        <Button
          variant="ghost"
          className="h-9 rounded-none border-b"
          onClick={() => {
            if (sidepanelRef.current?.isCollapsed()) {
              sidepanelRef.current?.expand();
              sidepanelRef.current?.resize(30);
            } else {
              sidepanelRef.current?.collapse();
            }
          }}
        >
          <Icon
            name={explorerIsOpen ? "FolderOpen" : "FolderClosed"}
            className="size-5"
          />
        </Button>

        <SidebarLinks />
      </div>

      <PanelGroup
        className="h-[calc(100vh-64px)] w-[calc(100vw-56px)] rounded-none"
        direction="horizontal"
        autoSaveId="_desktop-layout-panel-group"
      >
        <Panel
          collapsedSize={0}
          collapsible
          defaultSize={15}
          minSize={0}
          className="max-h-full"
          onCollapse={() => setExplorerIsOpen(false)}
          onExpand={() => setExplorerIsOpen(true)}
          ref={sidepanelRef}
        >
          <Sidepanel isCollapsed={!explorerIsOpen} />
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

/**
 * Links at the bottom of the sidebar.
 */
function SidebarLinks() {
  return (
    <div className="flex h-full flex-col items-center justify-end gap-2 pb-6">
      <ModeToggle />
      <Button
        asChild
        size="icon"
        variant="outline"
      >
        <a
          target="_blank"
          href="https://github.com/mattf96s/QuackDB"
          rel="noreferrer"
        >
          <Icon
            name="Github"
            className="size-5"
          />
        </a>
      </Button>
    </div>
  );
}
