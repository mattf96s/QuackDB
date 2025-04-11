"use client";

import { useDock } from "@/app/(app)/test/_components/dock/provider";
import {
	Menubar,
	MenubarContent,
	MenubarGroup,
	MenubarItem,
	MenubarLabel,
	MenubarMenu,
	MenubarSeparator,
	MenubarTrigger,
} from "@/components/ui/menubar";
import { defaultConfig, nextId } from "./default-layout";

export const GridActions = () => {
	const {
		state: { api },
	} = useDock();
	const onClear = () => {
		api?.clear();
	};

	const onLoad = () => {
		const state = localStorage.getItem("dv-demo-state");
		if (state) {
			try {
				api?.fromJSON(JSON.parse(state));
			} catch {
				localStorage.removeItem("dv-demo-state");
			}
		}
	};

	const onSave = () => {
		if (api) {
			localStorage.setItem("dv-demo-state", JSON.stringify(api.toJSON()));
		}
	};

	const onReset = () => {
		if (api) {
			api.clear();
			defaultConfig(api);
		}
	};

	const onAddPanel = () => {
		api?.addPanel({
			id: `id_${nextId()}`,
			component: "default",
			title: `Tab ${nextId()}`,
			renderer: "onlyWhenVisible",
			...(api.activeGroup
				? {
						position: {
							referenceGroup: api.activeGroup,
						},
					}
				: {}),
		});
	};

	const onAddGroup = () => {
		api?.addGroup();
	};

	return (
		<Menubar>
			<MenubarMenu>
				<MenubarTrigger>File</MenubarTrigger>
				<MenubarContent collisionPadding={12} className="w-56">
					<MenubarLabel>File</MenubarLabel>
					<MenubarSeparator />
					<MenubarGroup>
						<MenubarItem onClick={onAddPanel}>Add Panel</MenubarItem>
						<MenubarSeparator />
					</MenubarGroup>
					<MenubarGroup>
						<MenubarItem onClick={onClear}>Clear</MenubarItem>
						<MenubarItem onClick={onLoad}>Load</MenubarItem>
						<MenubarItem onClick={onSave}>Save</MenubarItem>
						<MenubarItem onClick={onReset}>Reset</MenubarItem>
					</MenubarGroup>
				</MenubarContent>
			</MenubarMenu>

			<MenubarMenu>
				<MenubarTrigger>
					<span>Edit</span>
				</MenubarTrigger>
				<MenubarContent collisionPadding={12} className="w-56">
					<MenubarLabel>Edit</MenubarLabel>
					<MenubarSeparator />
					<MenubarGroup>
						<MenubarItem onClick={onAddPanel}>Add Panel</MenubarItem>
						<MenubarItem onClick={onAddGroup}>Add Group</MenubarItem>
					</MenubarGroup>
				</MenubarContent>
			</MenubarMenu>

			<MenubarMenu>
				<MenubarTrigger>Data</MenubarTrigger>

				<MenubarContent collisionPadding={12} className="w-56">
					<MenubarLabel>Data</MenubarLabel>
					<MenubarSeparator />
					<MenubarGroup>
						<MenubarItem onClick={onAddPanel}>Add Panel</MenubarItem>
						<MenubarItem onClick={onAddGroup}>Add Group</MenubarItem>
					</MenubarGroup>
				</MenubarContent>
			</MenubarMenu>

			<MenubarMenu>
				<MenubarTrigger>Settings</MenubarTrigger>
				<MenubarContent collisionPadding={12} className="w-56">
					<MenubarLabel>Edit</MenubarLabel>
					<MenubarSeparator />
					<MenubarGroup>
						<MenubarItem onClick={onAddPanel}>Add Panel</MenubarItem>
						<MenubarItem onClick={onAddGroup}>Add Group</MenubarItem>
					</MenubarGroup>
				</MenubarContent>
			</MenubarMenu>
		</Menubar>
	);
};
