import { useEffect, useRef } from "react";

type UseWorkerProps = {
	path: string;
	onMessageCB: (e: MessageEvent) => void;
	onErrorCB: (e: ErrorEvent) => void;
};

export const useWorker = ({ path, onErrorCB, onMessageCB }: UseWorkerProps) => {
	const workerRef = useRef<Worker | null>(null);

	useEffect(() => {
		if (!workerRef.current) {
			// NB to use `window.Worker` over just `Worker` otherwise it errors out
			workerRef.current = new window.Worker(path, {
				type: "module",
			});

			workerRef.current.onmessage = onMessageCB;
			workerRef.current.onerror = onErrorCB;

			return () => {
				workerRef.current?.terminate();
				workerRef.current = null;
			};
		}
	}, [path, onErrorCB, onMessageCB]);

	return workerRef.current;
};
