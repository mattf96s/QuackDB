import { useState } from "react";
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DbProvider } from "@/context/db/provider";
import { EditorProvider } from "@/context/editor/provider";
import { EditorSettingsProvider } from "@/context/editor-settings/provider";
import { PanelProvider } from "@/context/panel/provider";
import { QueryProvider } from "@/context/query/provider";
import { SessionProvider } from "@/context/session/provider";
import NavBar from "./components/navbar";
import Playground from "./components/playground";

/**
 * WebKit has a bug with transferring file system file handles to workers.
 * This loader checks if the browser can transfer file system file handles.
 */
// export async function clientLoader(_props: ClientLoaderFunctionArgs) {
//   // check if filesystemfilehandle can be sent in postMessage. There is a Safari bug.
//   let canCloneHandle = false;
//   let worker: Worker | undefined;
//   try {
//     worker = new Worker(
//       new URL("./workers/is-supported.worker.ts", import.meta.url),
//       {
//         type: "module",
//         name: "is-supported-worker",
//       },
//     );
//     const fn = wrap<IsSupportedWorker>(worker);
//     canCloneHandle = await fn();
//   } catch (e) {
//     canCloneHandle = false;
//   } finally {
//     worker?.terminate();
//   }

//   return {
//     canCloneHandle,
//   };
// }

export default function Page() {
	//const data = useLoaderData<typeof clientLoader>();
	const { canCloneHandle } = {
		canCloneHandle: true,
	};
	return (
		<div className="flex size-full flex-col">
			{!canCloneHandle && <NotSupportedModal />}

			<SessionProvider>
				<DbProvider>
					<PanelProvider>
						<QueryProvider>
							<EditorSettingsProvider>
								<EditorProvider>
									<NavBar />

									<Playground />
								</EditorProvider>
							</EditorSettingsProvider>
						</QueryProvider>
					</PanelProvider>
				</DbProvider>
			</SessionProvider>
		</div>
	);
}

function NotSupportedModal() {
	const [open, setOpen] = useState(true);
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
