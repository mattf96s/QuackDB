import * as React from "react";
import { toast } from "sonner";

type State = {
	contents: string;
	error: string | null;
	loading: boolean;
};

type Action =
	| {
			type: "SET_CONTENTS";
			contents: string;
	  }
	| {
			type: "SET_ERROR";
			error: string;
	  }
	| {
			type: "SET_LOADING";
			loading: boolean;
	  }
	| {
			type: "RESET";
	  };

function fileReducer(state: State, action: Action) {
	switch (action.type) {
		case "SET_CONTENTS": {
			console.log("reducer set_contents contents", action.contents);
			return {
				...state,
				contents: action.contents,
				loading: false,
			};
		}
		case "SET_ERROR": {
			return {
				...state,
				error: action.error,
				loading: false,
			};
		}
		case "SET_LOADING": {
			return {
				...state,
				loading: action.loading,
			};
		}
		case "RESET": {
			return {
				contents: "",
				error: null,
				loading: false,
			};
		}
		default:
			return state;
	}
}

type Dispatch = (action: Action) => void;
type PanelProviderProps = { children: React.ReactNode; panelId: string };

const PanelStateContext = React.createContext<
	| { state: State; dispatch: Dispatch; onSaveFile: (contents: string) => void }
	| undefined
>(undefined);

function PanelProvider({ children, panelId }: PanelProviderProps) {
	const [state, dispatch] = React.useReducer(fileReducer, {
		contents: "",
		error: null,
		loading: false,
	});

	const workerRef = React.useRef<Worker | null>(null);
	const saveWorkerRef = React.useRef<Worker | null>(null);

	React.useEffect(() => {
		if (!saveWorkerRef.current) {
			saveWorkerRef.current = new window.Worker(
				"/worker-dist/save-file-contents.worker.js",
				{
					type: "module",
				},
			);

			saveWorkerRef.current.onmessage = (e: MessageEvent) => {
				const { data } = e;
				switch (data.type) {
					case "SET_SAVED": {
						toast.success("File saved successfully");
						break;
					}
					case "SET_ERROR": {
						toast.error("Failed to save file", {
							description: data.error,
						});
						break;
					}
					case "SAVED_FILE_COMPLETE": {
						toast.success("File saved successfully");
						break;
					}
				}
			};

			saveWorkerRef.current.onerror = (e: ErrorEvent) => {
				toast.error("Failed to save file", {
					description: e.message,
				});
			};
			saveWorkerRef.current.onmessageerror = (e: MessageEvent) => {
				toast.error("Failed to save file", {
					description: e.data,
				});
			};
			return () => {
				if (saveWorkerRef.current) {
					saveWorkerRef.current.terminate();
					saveWorkerRef.current = null;
				}
			};
		}
	}, []);

	React.useEffect(() => {
		if (!workerRef.current) {
			// needs to be window.Worker not just Worker
			workerRef.current = new window.Worker(
				"/worker-dist/get-file-contents.worker.js",
				{
					type: "module",
				},
			);

			workerRef.current.onmessage = (e: MessageEvent) => {
				const { data } = e;
				switch (data.type) {
					case "SET_CONTENTS": {
						dispatch({
							type: "SET_CONTENTS",
							contents: data.contents,
						});
						break;
					}
					case "SET_ERROR": {
						dispatch({
							type: "SET_ERROR",
							error: data.error,
						});
						break;
					}
					case "SET_LOADING": {
						dispatch({
							type: "SET_LOADING",
							loading: data.loading,
						});
						break;
					}
				}
			};

			workerRef.current.onerror = (e: ErrorEvent) => {
				dispatch({
					type: "SET_ERROR",
					error: e.message,
				});
			};

			workerRef.current.onmessageerror = (e: MessageEvent) => {
				dispatch({
					type: "SET_ERROR",
					error: e.data,
				});
			};

			workerRef.current.postMessage({
				type: "get-file-contents",
				id: panelId,
			});

			return () => {
				if (workerRef.current) {
					workerRef.current.terminate();
					workerRef.current = null;
				}
			};
		}
	}, [panelId]);

	const onSaveFile = React.useCallback(
		(contents: string) => {
			if (!saveWorkerRef.current) {
				console.error("Cannot save contents; Worker not initialized yet");
				toast.error("Failed to save contents", {
					description: "Worker not initialized yet",
				});
				return;
			}

			saveWorkerRef.current.postMessage({
				type: "save-file-contents",
				id: panelId,
				contents,
			});
		},
		[panelId],
	);

	const value = React.useMemo(
		() => ({ state, dispatch, onSaveFile }),
		[state, onSaveFile],
	);
	return (
		<PanelStateContext.Provider value={value}>
			{children}
		</PanelStateContext.Provider>
	);
}

function usePanel() {
	const context = React.useContext(PanelStateContext);
	if (context === undefined) {
		throw new Error("usePanel must be used within a PanelProvider");
	}
	return context;
}

export { PanelProvider, usePanel };
