// https://dockview.dev/docs/other/paneview/overview
import {
  PaneviewReact,
  type IPaneviewPanelProps,
  type PaneviewReadyEvent,
} from "dockview";
import { useEffect, useState } from "react";

const components = {
  default: (props: IPaneviewPanelProps<{ title: string }>) => {
    return (
      <div
        style={{
          padding: "10px",
          height: "100%",
          backgroundColor: "rgb(60,60,60)",
        }}
      >
        {props.params.title}
      </div>
    );
  },
};

function MyHeaderComponent(props: IPaneviewPanelProps<{ title: string }>) {
  const [expanded, setExpanded] = useState<boolean>(props.api.isExpanded);

  useEffect(() => {
    const disposable = props.api.onDidExpansionChange((event) => {
      setExpanded(event.isExpanded);
    });

    return () => {
      disposable.dispose();
    };
  }, [props.api]);

  const onClick = () => {
    props.api.setExpanded(!expanded);
  };

  return (
    <div
      style={{
        padding: "10px",
        height: "100%",
        backgroundColor: "rgb(60,60,60)",
      }}
    >
      <button
        onClick={onClick}
        className={expanded ? "expanded" : "collapsed"}
      >
        {expanded ? "Collapse" : "Expand"}
      </button>
      <span>{props.params.title}</span>
    </div>
  );
}

const headerComponents = {
  myHeaderComponent: MyHeaderComponent,
};

export default function Pane(props: { theme?: string }) {
  const onReady = (event: PaneviewReadyEvent) => {
    event.api.addPanel({
      id: "panel_1",
      component: "default",
      params: {
        title: "Panel 1",
      },
      title: "Panel 1",
    });

    event.api.addPanel({
      id: "panel_2",
      component: "default",
      params: {
        title: "Panel 2",
      },
      title: "Panel 2",
    });

    event.api.addPanel({
      id: "panel_3",
      component: "default",
      params: {
        title: "Panel 3",
      },
      title: "Panel 3",
    });
  };

  return (
    <PaneviewReact
      components={components}
      headerComponents={headerComponents}
      onReady={onReady}
      className={props.theme || "dockview-theme-abyss"}
    />
  );
}
