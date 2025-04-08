import PanelHandle from "@/components/panel-handle";
import { useSession } from "@/context/session/useSession";
import { PanelGroup } from "react-resizable-panels";
import DataSources from "./components/data-sources";
import EditorSources from "./components/editor-files";
import QueryHistory from "./components/query-history";
import ComponentWrapper from "./components/wrapper";

type SidepanelProps = {
  isCollapsed: boolean;
};

/**
 * Left hand side panel which holds the data sources, editor sources and query history.
 *
 * NB: This panel controls the vertical resizing *within* the sidepanel.
 * The horizontal resizing between the side panel and the editor panel is in the parent panel.
 */
export default function Sidepanel(props: SidepanelProps) {
  const { sessionId } = useSession();
  const { isCollapsed } = props;

  if (isCollapsed) return null;

  return (
    <PanelGroup
      direction="vertical"
      id={`_${sessionId}_sidebar_panel`}
      autoSaveId={`_${sessionId}_sidebar_panel`} // will persist the panel sizes in local storage
    >
      <ComponentWrapper
        key="_wrapper-editor-sources"
        wrapperState={{ id: "editor-sources", order: 1 }}
      >
        <EditorSources />
      </ComponentWrapper>
      <PanelHandle />
      <ComponentWrapper
        key="_wrapper-data-sources"
        wrapperState={{ id: "data-sources", order: 2 }}
      >
        <DataSources />
      </ComponentWrapper>
      <PanelHandle />
      <ComponentWrapper
        key="_wrapper-query-sources"
        wrapperState={{ id: "query-history", order: 3 }}
      >
        <QueryHistory />
      </ComponentWrapper>
    </PanelGroup>
  );
}
