"use client";

import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useEffect, useRef, useState } from "react";

/**
 * WebKit has a bug with transferring file system file handles to workers.
 * This checks if the browser can transfer file system file handles.
 */
export function NotSupportedModal() {
	const [open, setOpen] = useState(true);
	const [workerState, setWorkerState] = useState({
		status: "loading",
		canClone: false,
	});

	const workerRef = useRef<Worker | null>(null);

	useEffect(() => {
		if (!workerRef.current) {
			const worker = new window.Worker("/worker-dist/is-supported.worker.js", {
				type: "module",
			});

			worker.onmessage = (e) => {
				const { type } = e.data;

				switch (type) {
					case "SET_CAN_CLONE": {
						setWorkerState({ canClone: e.data.canClone, status: "success" });
						break;
					}
					default:
						break;
				}
			};

			worker.postMessage({
				type: "INIT",
			});

			return () => {
				worker.terminate();
				workerRef.current = null;
			};
		}
	}, []);

	if (workerState.status === "loading") return null;
	if (workerState.canClone) return null;

	return (
		<>
			{!open && (
				<div className="bg-destructive p-2 text-center text-white">
					<p>
						Your browser does not support transferring file system file handles.
						<br />
					</p>
				</div>
			)}
			<AlertDialog open={open} onOpenChange={setOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Browser Not Supported</AlertDialogTitle>
						<AlertDialogDescription>
							Your browser does not support{" "}
							<a
								target="_blank"
								href="https://bugs.webkit.org/show_bug.cgi?id=256712#c0"
								rel="noreferrer"
								className="underline"
							>
								transferring file system file handles
							</a>
							.
							<br />
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
