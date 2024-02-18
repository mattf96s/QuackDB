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
    <div className="h-full max-h-full overflow-y-auto">
      <PanelGroup
        direction="vertical"
        autoSaveId={sessionId} // will persist the panel sizes in local storage
      >
        <ComponentWrapper id="wrapper-editor-sources">
          <EditorSources />
        </ComponentWrapper>
        <PanelHandle />
        <ComponentWrapper id="wrapper-data-sources">
          <DataSources />
        </ComponentWrapper>
        <PanelHandle />
        <ComponentWrapper id="wrapper-query-sources">
          <QueryHistory />
        </ComponentWrapper>
      </PanelGroup>
    </div>
  );
}
