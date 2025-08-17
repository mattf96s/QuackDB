import { lazy, Suspense } from "react";
import type { EditorProps } from "./editor.tsx";

const MonacoClient = lazy(() =>
	import("./editor.tsx").then((module) => ({ default: module.Editor })),
);

export function MonacoShell(props: EditorProps) {
	if (typeof window === "undefined") return null; // guard SSR
	return (
		<Suspense fallback={<div>Loading editor…</div>}>
			<MonacoClient {...props} />
		</Suspense>
	);
}
