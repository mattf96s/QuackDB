import type { DockviewApi } from "dockview";
import React from "react";

export const PanelActions = (props: {
	panels: string[];
	api?: DockviewApi;
	activePanel?: string;
}) => {
	return (
		<div className="action-container">
			{props.panels.map((x) => {
				const onClick = () => {
					props.api?.getPanel(x)?.focus();
				};
				return (
					<div key={x} className="button-action">
						<div style={{ display: "flex" }}>
							<button
								type="button"
								className={
									props.activePanel === x
										? "demo-button selected"
										: "demo-button"
								}
								onClick={onClick}
							>
								{x}
							</button>
						</div>
						<div style={{ display: "flex" }}>
							<button
								type="button"
								className="demo-icon-button"
								onClick={() => {
									const panel = props.api?.getPanel(x);
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
									const panel = props.api?.getPanel(x);
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
									const panel = props.api?.getPanel(x);
									panel?.api.close();
								}}
							>
								<span className="material-symbols-outlined">close</span>
							</button>
						</div>
					</div>
				);
			})}
		</div>
	);
};
