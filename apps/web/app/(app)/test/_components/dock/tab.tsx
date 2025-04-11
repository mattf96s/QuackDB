"use client";

import { Button } from "@/components/ui/button";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuTrigger,
} from "@/components/ui/context-menu";
import type { IDockviewPanelHeaderProps } from "dockview-react";
import { Trash2, XIcon } from "lucide-react";
import { startTransition, useState } from "react";

export function MyCustomTab(props: IDockviewPanelHeaderProps) {
	const [name, setName] = useState(props.api.title ?? "");
	const [isRenaming, setIsRenaming] = useState(false);

	return (
		<ContextMenu>
			<div className="flex h-full items-center justify-between min-w-[170px] w-fit">
				{isRenaming ? (
					<form
						onSubmit={(e) => {
							startTransition(() => {
								e.preventDefault();
								const clean = name.trim().replaceAll(/[^a-zA-Z0-9 ]/g, "");
								props.api.setTitle(clean);
								setName(clean);
								setIsRenaming(false);
							});
						}}
						className="bg-red-500"
					>
						<input
							className="p-0 h-full w-min min-w-[50px] text-sm outline-none bg-transparent px-0 mx-0 focus:border-0 focus:ring-0 rounded-none focus:shadow-none"
							value={name}
							onChange={(e) => {
								startTransition(() => {
									setName(e.target.value);
								});
							}}
							onFocus={(e) => {
								e.target.select();
							}}
							onBlur={() => startTransition(() => setIsRenaming(false))}
							// biome-ignore lint/a11y/noAutofocus: <explanation>
							autoFocus
						/>
					</form>
				) : (
					<>
						<ContextMenuTrigger asChild>
							<div className="inline-flex items-center justify-between w-full">
								<button
									key="button"
									type="button"
									onDoubleClick={() => setIsRenaming(true)}
									className="h-full grow flex items-center justify-start text-sm w-inherit truncate hover:cursor-pointer"
								>
									<span>{name}</span>
								</button>
								<Button
									type="button"
									variant="ghost"
									size="xs"
									className="hover:cursor-pointer"
									onClick={(e) => {
										startTransition(() => {
											e.preventDefault();
											e.stopPropagation();
											props.api.close();
										});
									}}
								>
									<XIcon className="size-4" />
								</Button>
							</div>
						</ContextMenuTrigger>
						<ContextMenuContent>
							<ContextMenuItem className="w-full" asChild>
								<form
									onSubmit={(e) => {
										startTransition(() => {
											e.preventDefault();
											props.api.close();
										});
									}}
								>
									<button
										type="submit"
										className="inline-flex items-center justify-between w-full"
									>
										Delete
										<Trash2 className="size-4" />
									</button>
								</form>
							</ContextMenuItem>
						</ContextMenuContent>
					</>
				)}
			</div>
		</ContextMenu>
	);
}
