"use client";
import type { DockviewApi, DockviewReadyEvent } from "dockview";
import { nanoid } from "nanoid";
import * as React from "react";

type Action =
	| {
			type: "INITIALIZE";
			api: DockviewApi;
	  }
	| {
			type: "SET_PANELS";

			panels: string[];
	  }
	| { type: "SET_GROUPS"; groups: string[] }
	| {
			type: "SET_API";
			api: DockviewApi;
	  }
	| {
			type: "SET_ACTIVE_PANEL";
			panelId: string;
	  }
	| {
			type: "SET_ACTIVE_GROUP";
			groupId: string;
	  };

type Dispatch = (action: Action) => void;

type State = {
	panels: string[];
	groups: string[];
	activePanel: string | undefined;
	activeGroup: string | undefined;
	api: DockviewApi | undefined;
};

type DockProviderProps = { children: React.ReactNode };

const DockStateContext = React.createContext<
	| {
			state: State;
			dispatch: Dispatch;
			onReady: (event: DockviewReadyEvent) => void;
	  }
	| undefined
>(undefined);

const initialState: State = {
	panels: [],
	groups: [],
	activePanel: undefined,
	activeGroup: undefined,
	api: undefined,
};

function dockReducer(state: State, action: Action) {
	switch (action.type) {
		case "INITIALIZE": {
			return {
				...initialState,
				api: action.api,
			};
		}
		case "SET_API": {
			return { ...state, api: action.api };
		}
		case "SET_GROUPS": {
			return { ...state, groups: action.groups };
		}
		case "SET_PANELS": {
			return { ...state, panels: action.panels };
		}
		case "SET_ACTIVE_PANEL": {
			return { ...state, activePanel: action.panelId };
		}
		case "SET_ACTIVE_GROUP": {
			return { ...state, activeGroup: action.groupId };
		}
		default:
			return { ...state };
	}
}

function DockProvider({ children }: DockProviderProps) {
	const [state, dispatch] = React.useReducer(dockReducer, initialState);

	const onReady = React.useCallback((event: DockviewReadyEvent) => {
		dispatch({ type: "INITIALIZE", api: event.api });
	}, []);

	React.useEffect(() => {
		const { api } = state;
		if (!api) return;

		const disposables = [
			api.onDidAddPanel((event) => {
				dispatch({
					type: "SET_PANELS",
					panels: [...state.panels, event.id],
				});
			}),
			api.onDidActivePanelChange((event) => {
				if (!event?.id) return;
				dispatch({ type: "SET_ACTIVE_PANEL", panelId: event.id });
			}),
			api.onDidRemovePanel((event) => {
				dispatch({
					type: "SET_PANELS",
					panels: state.panels.filter((panel) => panel !== event.id),
				});
			}),

			api.onDidAddGroup((event) => {
				dispatch({
					type: "SET_GROUPS",
					groups: [...state.groups, event.id],
				});
			}),

			api.onDidRemoveGroup((event) => {
				dispatch({
					type: "SET_GROUPS",
					groups: state.groups.filter((group) => group !== event.id),
				});
			}),
			api.onDidActiveGroupChange((event) => {
				if (!event?.id) return;
				dispatch({ type: "SET_ACTIVE_GROUP", groupId: event.id });
			}),

			api.onDidLayoutChange(() => {
				const state = api.toJSON();
				localStorage.setItem("dv-demo-state", JSON.stringify(state));
			}),
		];

		let success = false;

		const savedState = localStorage.getItem("dv-demo-state");
		if (savedState) {
			try {
				api.fromJSON(JSON.parse(savedState));
				success = true;
			} catch {
				localStorage.removeItem("dv-demo-state");
			}
		}

		if (!success) {
			const panel1 = api.addPanel({
				id: `id_${nanoid(5)}`,
				component: "default",
				renderer: "onlyWhenVisible",
				title: "Untitled (1)",
			});

			panel1.api.setActive();
		}

		return () => {
			disposables.forEach((disposable) => disposable.dispose());
		};
	}, [state]);

	const value = React.useMemo(
		() => ({ state, dispatch, onReady }),
		[state, onReady],
	);
	return (
		<DockStateContext.Provider value={value}>
			{children}
		</DockStateContext.Provider>
	);
}

function useDock() {
	const context = React.useContext(DockStateContext);
	if (context === undefined) {
		throw new Error("useDock must be used within a DockProvider");
	}
	return context;
}

export { DockProvider, useDock };
