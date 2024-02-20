import { Panel, type PanelProps } from "react-resizable-panels";
import { cn } from "@/lib/utils";
import { WrapperProvider } from "./context/provider";

type ComponentWrapperProps = PanelProps & {
  children: React.ReactNode;
};

export default function ComponentWrapper(props: ComponentWrapperProps) {
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
 * onToggle and onExpand don't work as I expected. But don't delete yet.
 *
 */
function Content(props: ComponentWrapperProps) {
  const { children, ...rest } = props;

  return (
    <Panel
      minSize={10}
      collapsedSize={10}
      collapsible
      // onCollapse={() => onToggleIsCollapse(true)}
      // onExpand={() => onToggleIsCollapse(false)}
      {...rest}
      className={cn("my-4 max-h-full", props.className)}
    >
      {/* From the docs: Panels clip their content by default, to avoid showing scrollbars while resizing. Content can still be configured to overflow within a panel though.*/}
      <div className="max-h-full overflow-y-auto">{children}</div>
    </Panel>
  );
}
