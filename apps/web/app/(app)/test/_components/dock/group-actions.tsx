import type { DockviewApi } from "dockview";
import { XIcon } from "lucide-react";

export const GroupActions = (props: {
	groups: string[];
	api?: DockviewApi;
	activeGroup?: string;
}) => {
	return (
		<div className="action-container">
			{props.groups.map((x) => {
				const onClick = () => {
					props.api?.getGroup(x)?.focus();
				};
				return (
					<div key={x} className="button-action">
						<div style={{ display: "flex" }}>
							<button
								type="button"
								onClick={onClick}
								className={
									props.activeGroup === x
										? "demo-button selected"
										: "demo-button"
								}
							>
								{x}
							</button>
						</div>
						<div style={{ display: "flex" }}>
							<button
								type="button"
								className="demo-icon-button"
								onClick={() => {
									const panel = props.api?.getGroup(x);
									if (panel) {
										props.api?.addFloatingGroup(panel, {
											position: {
												// width: 400,
												// height: 300,
												bottom: 50,
												right: 50,
											},
										});
									}
								}}
							>
								<span className="material-symbols-outlined">ad_group</span>
							</button>
							<button
								type="button"
								className="demo-icon-button"
								onClick={() => {
									const panel = props.api?.getGroup(x);
									if (panel) {
										props.api?.addPopoutGroup(panel);
									}
								}}
							>
								<span className="material-symbols-outlined">open_in_new</span>
							</button>
							<button
								type="button"
								className="demo-icon-button"
								onClick={() => {
									const panel = props.api?.getGroup(x);
									if (panel?.api.isMaximized()) {
										panel.api.exitMaximized();
									} else {
										panel?.api.maximize();
									}
								}}
							>
								<span className="material-symbols-outlined">fullscreen</span>
							</button>
							<button
								type="button"
								onClick={() => {
									const panel = props.api?.getGroup(x);
									panel?.api.close();
								}}
							>
								<XIcon className="size-4" />
							</button>
						</div>
					</div>
				);
			})}
		</div>
	);
};
