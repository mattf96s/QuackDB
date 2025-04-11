"use client";

import { Button } from "@/components/ui/button";
import type { IDockviewHeaderActionsProps } from "dockview";
import { Folders, PlusIcon } from "lucide-react";
import { nanoid } from "nanoid";
import React, { useEffect } from "react";

const Icon = (props: {
	icon: string;
	title?: string;
	onClick?: (event: React.MouseEvent) => void;
}) => {
	return (
		// biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
		<div title={props.title} className="action" onClick={props.onClick}>
			<span
				style={{ fontSize: "inherit" }}
				className="material-symbols-outlined"
			>
				{props.icon}
			</span>
		</div>
	);
};

const groupControlsComponents: Record<string, React.FC> = {
	panel_1: () => {
		return <Icon icon="file_download" />;
	},
};

export const RightControls = (props: IDockviewHeaderActionsProps) => {
	const Component = React.useMemo(() => {
		if (!props.isGroupActive || !props.activePanel) {
			return null;
		}

		return groupControlsComponents[props.activePanel.id];
	}, [props.isGroupActive, props.activePanel]);

	const [isMaximized, setIsMaximized] = React.useState<boolean>(
		props.containerApi.hasMaximizedGroup(),
	);

	const [isPopout, setIsPopout] = React.useState<boolean>(
		props.api.location.type === "popout",
	);

	useEffect(() => {
		const disposable = props.containerApi.onDidMaximizedGroupChange(() => {
			setIsMaximized(props.containerApi.hasMaximizedGroup());
		});

		const disposable2 = props.api.onDidLocationChange(() => {
			setIsPopout(props.api.location.type === "popout");
		});

		return () => {
			disposable.dispose();
			disposable2.dispose();
		};
	}, [
		props.containerApi,
		props.api.location.type,
		props.api.onDidLocationChange,
	]);

	const onClick = () => {
		if (props.containerApi.hasMaximizedGroup()) {
			props.containerApi.exitMaximizedGroup();
		} else {
			props.activePanel?.api.maximize();
		}
	};

	const onClick2 = () => {
		if (props.api.location.type !== "popout") {
			props.containerApi.addPopoutGroup(props.group);
		} else {
			props.api.moveTo({ position: "right" });
		}
	};

	return (
		<div
			className="group-control"
			style={{
				display: "flex",
				alignItems: "center",
				padding: "0px 8px",
				height: "100%",
				color: "var(--dv-activegroup-visiblepanel-tab-color)",
			}}
		>
			{props.isGroupActive && <Icon icon="star" />}
			{Component && <Component />}
			<Icon
				title={isPopout ? "Close Window" : "Open In New Window"}
				icon={isPopout ? "close_fullscreen" : "open_in_new"}
				onClick={onClick2}
			/>
			{!isPopout && (
				<Icon
					title={isMaximized ? "Minimize View" : "Maximize View"}
					icon={isMaximized ? "collapse_content" : "expand_content"}
					onClick={onClick}
				/>
			)}
		</div>
	);
};

export const LeftControls = (props: IDockviewHeaderActionsProps) => {
	const onClick = () => {
		const currentUntitledPanels = props.containerApi.panels.filter((panel) => {
			return panel.title?.startsWith("Untitled");
		});
		let count = 1;
		while (
			currentUntitledPanels.some(
				(panel) => panel.title === `Untitled (${count})`,
			)
		) {
			count++;
		}

		props.containerApi.addPanel({
			id: nanoid(),
			component: "default",
			title: `Untitled (${count})`,
			position: {
				referenceGroup: props.group,
			},
		});
	};

	return (
		<div
			className="flex justify-center items-center"
			// style={{
			// 	display: "flex",
			// 	alignItems: "center",
			// 	padding: "0px 8px",
			// 	height: "100%",
			// 	color: "var(--dv-activegroup-visiblepanel-tab-color)",
			// }}
		>
			<Button
				className="rounded-none px-5"
				size="icon"
				variant="outline"
				type="button"
				onClick={onClick}
			>
				<PlusIcon className="size-4" />
			</Button>
		</div>
	);
};

export const PrefixHeaderControls = (props: IDockviewHeaderActionsProps) => {
	const onFiles = () => {
		// if showing files, hide it
		// if not showing files, show it

		props.api.close();
	};
	return (
		<div
		// className="group-control"
		// style={{
		// 	display: "flex",
		// 	alignItems: "center",
		// 	padding: "0px 8px",
		// 	height: "100%",
		// 	color: "var(--dv-activegroup-visiblepanel-tab-color)",
		// }}
		>
			<Button size="icon" variant="ghost" type="button">
				<Folders className="size-4" />
			</Button>
		</div>
	);
};
