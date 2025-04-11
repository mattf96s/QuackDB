"use client";
import { defaultConfig } from "@/app/(app)/test/_components/dock/default-layout";
import { GridActions } from "@/app/(app)/test/_components/dock/grid-actions";
import { GroupActions } from "@/app/(app)/test/_components/dock/group-actions";
import {
	type LogLine,
	LogLines,
} from "@/app/(app)/test/_components/dock/log-lines";
import { Panel } from "@/app/(app)/test/_components/dock/panel";
import { PanelActions } from "@/app/(app)/test/_components/dock/panel-actions";
import { MyCustomTab } from "@/app/(app)/test/_components/dock/tab";
import { HomeIcon } from "@/components/navbar";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import {
	type DockviewApi,
	DockviewReact,
	type DockviewReadyEvent,
	type IDockviewPanelProps,
	themeAbyss,
} from "dockview-react";
import { nanoid } from "nanoid";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { LeftControls, PrefixHeaderControls, RightControls } from "./controls";

const components = {
	default: Panel,
	iframe: (props: IDockviewPanelProps) => {
		return (
			// biome-ignore lint/a11y/useIframeTitle: <explanation>
			<iframe
				onMouseDown={() => {
					if (!props.api.isActive) {
						props.api.setActive();
					}
				}}
				style={{
					width: "100%",
					height: "100%",
				}}
				src="https://dockview.dev"
			/>
		);
	},
};

const headerComponents = {
	default: MyCustomTab,
};

const colors = [
	"rgba(255,0,0,0.2)",
	"rgba(0,255,0,0.2)",
	"rgba(0,0,255,0.2)",
	"rgba(255,255,0,0.2)",
	"rgba(0,255,255,0.2)",
	"rgba(255,0,255,0.2)",
];

export function Dock() {
	const [count, setCount] = useState(0);
	const [logLines, setLogLines] = useState<LogLine[]>([]);
	const [emittedLogsOnCurrentStackFrame, setEmittedLogsOnCurrentStackFrame] =
		useState<LogLine[]>([]);
	const [panels, setPanels] = useState<string[]>([]);
	const [groups, setGroups] = useState<string[]>([]);
	const [api, setApi] = useState<DockviewApi>();

	const addLogLine = useCallback((message: string) => {
		setEmittedLogsOnCurrentStackFrame((line) => [
			{ id: nanoid(), text: message, timestamp: new Date() },
			...line,
		]);
	}, []);

	useLayoutEffect(() => {
		if (emittedLogsOnCurrentStackFrame.length === 0) {
			return;
		}
		const newCount = count + 1;
		setCount(newCount);
		const color = colors[newCount % colors.length];
		setLogLines((lines) => [
			...emittedLogsOnCurrentStackFrame.map((_) => ({
				..._,
				backgroundColor: color,
			})),
			...lines,
		]);
		setEmittedLogsOnCurrentStackFrame([]);
	}, [emittedLogsOnCurrentStackFrame, count]);

	const [activePanel, setActivePanel] = useState<string>();
	const [activeGroup, setActiveGroup] = useState<string>();

	const onReady = useCallback(
		(event: DockviewReadyEvent) => {
			setApi(event.api);
			setPanels([]);
			setGroups([]);
			setActivePanel(undefined);
			setActiveGroup(undefined);
			addLogLine("Dockview Is Ready");
		},
		[addLogLine],
	);

	useEffect(() => {
		if (!api) {
			return;
		}

		const disposables = [
			api.onDidAddPanel((event) => {
				setPanels((_) => [..._, event.id]);
				addLogLine(`Panel Added ${event.id}`);
			}),
			api.onDidActivePanelChange((event) => {
				setActivePanel(event?.id);
				addLogLine(`Panel Activated ${event?.id}`);
			}),
			api.onDidRemovePanel((event) => {
				setPanels((_) => {
					const next = [..._];
					next.splice(
						next.findIndex((x) => x === event.id),
						1,
					);

					return next;
				});
				addLogLine(`Panel Removed ${event.id}`);
			}),

			api.onDidAddGroup((event) => {
				setGroups((_) => [..._, event.id]);
				addLogLine(`Group Added ${event.id}`);
			}),

			api.onDidRemoveGroup((event) => {
				setGroups((_) => {
					const next = [..._];
					next.splice(
						next.findIndex((x) => x === event.id),
						1,
					);

					return next;
				});
				addLogLine(`Group Removed ${event.id}`);
			}),
			api.onDidActiveGroupChange((event) => {
				setActiveGroup(event?.id);
				addLogLine(`Group Activated ${event?.id}`);
			}),

			api.onDidLayoutChange(() => {
				const state = api.toJSON();
				localStorage.setItem("dv-demo-state", JSON.stringify(state));
				addLogLine("Layout Changed");
			}),
		];

		let success = false;

		const state = localStorage.getItem("dv-demo-state");
		if (state) {
			try {
				api.fromJSON(JSON.parse(state));
				success = true;
			} catch {
				localStorage.removeItem("dv-demo-state");
			}
		}

		if (!success) {
			defaultConfig(api);
		}

		return () => {
			disposables.forEach((disposable) => disposable.dispose());
		};
	}, [api, addLogLine]);

	return (
		<>
			<div>
				<div className="flex h-16 max-h-16 min-h-16 w-full shrink-0 items-center border-b bg-background px-4">
					<GridActions />
					<div className="ml-auto">
						<HomeIcon />
					</div>
				</div>
				{false && (
					<PanelActions api={api} panels={panels} activePanel={activePanel} />
				)}
				{false && (
					<GroupActions api={api} groups={groups} activeGroup={activeGroup} />
				)}
			</div>

			<div className="grow h-0 overflow-hidden flex">
				<DockviewReact
					components={components}
					defaultTabComponent={headerComponents.default}
					rightHeaderActionsComponent={RightControls}
					leftHeaderActionsComponent={LeftControls}
					prefixHeaderActionsComponent={PrefixHeaderControls}
					onReady={onReady}
					theme={themeAbyss}
					scrollbars="custom"
					debug={false}
					noPanelsOverlay="emptyGroup"
					hideBorders
				/>

				<ScrollArea className="h-screen w-[300px] bg-black/95 text-white">
					<LogLines lines={logLines} />
				</ScrollArea>
			</div>
		</>
	);
}
