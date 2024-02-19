import { Panel, type PanelProps } from "react-resizable-panels";
import { WrapperProvider } from "./context/provider";
import { useWrapper } from "./context/useWrapper";

type ComponentWrapperProps = PanelProps & {
  children: React.ReactNode;
};

function ComponentWrapper(props: ComponentWrapperProps) {
  const { children, ...rest } = props;
  return (
    <WrapperProvider>
      <Content {...rest}>{children}</Content>
    </WrapperProvider>
  );
}

/**
 * A wrapper component for the sidepanel components.
 *
 * Memoized to avoid jank when resizing the panels.
 */
function Content(props: ComponentWrapperProps) {
  const { onToggleIsCollapse } = useWrapper();
  const { children, ...rest } = props;
  return (
    <Panel
      minSize={15}
      collapsedSize={15}
      collapsible={true}
      onCollapse={() => onToggleIsCollapse(true)}
      onExpand={() => onToggleIsCollapse(false)}
      {...rest}
    >
      {/* From the docs: Panels clip their content by default, to avoid showing scrollbars while resizing. Content can still be configured to overflow within a panel though.*/}
      <div className="overflow-y-auto">{children}</div>
    </Panel>
  );
}

export default ComponentWrapper;
