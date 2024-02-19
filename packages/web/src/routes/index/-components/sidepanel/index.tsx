import { PanelGroup } from "react-resizable-panels";
import PanelHandle from "@/components/panel-handle";
import { useSession } from "@/context/session/useSession";
import DataSources from "./components/data-sources";
import EditorSources from "./components/editor-files";
import QueryHistory from "./components/query-history";
import ComponentWrapper from "./components/wrapper";

export default function Sidepanel() {
  const { sessionId } = useSession();
  return (
    <PanelGroup
      // className="h-[calc(100vh-64px)] max-h-full"
      direction="vertical"
      autoSaveId={`_${sessionId}_sidebar_panel`} // will persist the panel sizes in local storage
    >
      <ComponentWrapper key="_wrapper-editor-sources">
        <EditorSources />
      </ComponentWrapper>
      <PanelHandle />
      <ComponentWrapper key="_wrapper-data-sources">
        <DataSources />
      </ComponentWrapper>
      <PanelHandle />
      <ComponentWrapper key="_wrapper-query-sources">
        <QueryHistory />
      </ComponentWrapper>
    </PanelGroup>
  );
}
