import { cn } from "@/lib/utils";
import { Panel, type PanelProps } from "react-resizable-panels";
import { WrapperProvider } from "./context/provider";
import type { WrapperState } from "./context/types";
import { useWrapper } from "./context/useWrapper";

type WrapperStateProps = Pick<WrapperState, "id" | "order">;

type ComponentWrapperProps = PanelProps & {
  children: React.ReactNode;
};

export default function ComponentWrapper(
  props: ComponentWrapperProps & {
    wrapperState: WrapperStateProps;
  },
) {
  const { children, wrapperState, ...rest } = props;
  return (
    <WrapperProvider {...wrapperState}>
      <Content {...rest}>{children}</Content>
    </WrapperProvider>
  );
}

/**
 * A wrapper component for the sidepanel components.
 *
 * OnCollapase occurs when the panel is resized to below the collapsedSize.
 * We also want to be able to opena and close the panel using our own chevron button in the header.
 * This is achieved by using the imperative api of the Panel component.
 * It is a bit confusing (see [docs](https://github.com/bvaughn/react-resizable-panels/issues/284)).
 *
 */
function Content(props: ComponentWrapperProps) {
  const { ref, id, order, onToggleIsCollapse } = useWrapper();
  const { children, ...rest } = props;

  return (
    <Panel
      id={id}
      order={order}
      minSize={4.6} // so it aligns with the other UI elements. The panel handle create a line that looks like a border which confuses things.
      collapsedSize={4.6}
      maxSize={80} // NB: otherwise the middle panel gets into a weird state whereby it can't be imperatively expanded once collapsed if both the middle and bottom panels are collapsed.
      ref={ref} // imperative api: https://react-resizable-panels.vercel.app/examples/imperative-panel-api
      collapsible
      onCollapse={() => onToggleIsCollapse(true)}
      onExpand={() => onToggleIsCollapse(false)}
      className={cn("max-h-full", props.className)}
      {...rest}
    >
      {/* From the docs: Panels clip their content by default, to avoid showing scrollbars while resizing. Content can still be configured to overflow within a panel though.*/}
      <div className="max-h-full overflow-y-auto">{children}</div>
    </Panel>
  );
}
