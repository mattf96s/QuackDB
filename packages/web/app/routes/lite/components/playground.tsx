import {
  DockviewDefaultTab,
  DockviewReact,
  GridviewReact,
  PaneviewReact,
  type DockviewReadyEvent,
  type GridviewApi,
  type GridviewReadyEvent,
  type IDockviewPanelHeaderProps,
  type IDockviewPanelProps,
  type IGridviewPanelProps,
  type IPaneviewPanelProps,
  type PaneviewReadyEvent,
} from "dockview";
import * as React from "react";
import { Theme, useTheme } from "remix-themes";
import { Textarea } from "~/components/ui/textarea";
import { cn } from "~/lib/utils";
import Container from "./panels/container";
import TableDemo from "./results-table";

const paneComponents = {
  default: (props: IPaneviewPanelProps) => {
    return (
      <div
        style={{
          height: "100%",
          padding: "20px",
          background: "var(--dv-group-view-background-color)",
        }}
      >
        {props.params.title}
      </div>
    );
  },
};

const components = {
  default: (props: IGridviewPanelProps<{ title: string }>) => {
    return (
      <div
        style={{
          height: "100%",
          padding: "20px",
          background: "var(--dv-group-view-background-color)",
        }}
      >
        s{props.params.title}
      </div>
    );
  },
  panes: (props: IGridviewPanelProps) => {
    const onReady = (event: PaneviewReadyEvent) => {
      event.api.addPanel({
        id: "pane_1",
        component: "default",
        title: "Editors",
        isExpanded: false,
      });

      event.api.addPanel({
        id: "pane_2",
        component: "default",
        title: "Datasets",
        isExpanded: true,
      });

      event.api.addPanel({
        id: "pane_3",
        component: "default",
        title: "History",
        isExpanded: true,
      });
    };

    return (
      <PaneviewReact
        onReady={onReady}
        components={paneComponents}
      />
    );
  },
  editor: MainPanel,
};

const mainLayoutComponents = {
  default: <T extends Record<string, unknown>>(
    props: IDockviewPanelProps<T>,
  ) => {
    return <div className="bg-red-100 p-5">{props.api.title}</div>;
  },
  editor: EditorPanel,
  results: ResultsPanel,
};

function EditorPanel() {
  return (
    <div className="flex flex-col gap-4 p-10">
      <h2>Editor</h2>
      <Textarea />
    </div>
  );
}

function ResultsPanel() {
  return (
    <div className="flex flex-col gap-4 p-10">
      <h2>Results</h2>
      <TableDemo />
    </div>
  );
}

function MainPanel() {
  const onReady = (event: DockviewReadyEvent) => {
    event.api.addPanel({
      id: "panel_1",
      component: "default",
      title: "Panel 1",
      params: {
        valueA: "test value",
      },
    });
    event.api.addPanel({
      id: "panel_2",
      component: "editor",
      title: "Panel 2",
      params: {
        valueA: "test value",
      },
    });
    event.api.addPanel({
      id: "panel_3",
      component: "results",
      title: "Panel 3",
      params: {
        valueA: "test value",
      },
    });
  };
  return (
    <DockviewReact
      components={mainLayoutComponents}
      onReady={onReady}
      defaultTabComponent={tabComponents.default}
    />
  );
}

function DefaultTab<T extends Record<string, unknown>>(
  props: IDockviewPanelHeaderProps<T>,
) {
  const [title, setTitle] = React.useState(props.api.title ?? "Panel");
  const onContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    alert(
      `This custom header was parsed the params ${JSON.stringify(
        props.params,
      )}`,
    );
  };
  return (
    <DockviewDefaultTab
      onContextMenu={onContextMenu}
      {...props}
    />
  );
}

const tabComponents = {
  default: DefaultTab,
};

function Playground(props: { theme?: string }) {
  const [api, setApi] = React.useState<GridviewApi>();
  const [globalTheme] = useTheme();

  const onReady = (event: GridviewReadyEvent) => {
    event.api.addPanel({
      id: "panes",
      component: "panes",
      minimumHeight: 100,
      minimumWidth: 100,
      size: 100,
    });

    event.api.addPanel({
      id: "panel_1",
      component: "editor",
      position: { referencePanel: "panes", direction: "right" },
      minimumHeight: 100,
      minimumWidth: 100,
    });
  };

  return (
    <GridviewReact
      onReady={onReady}
      components={components}
      className={cn(
        "",
        globalTheme === Theme.DARK
          ? "dockview-theme-abyss"
          : "dockview-theme-light",
      )}
    />
  );
}

export default function Component() {
  return <Container />;
}
