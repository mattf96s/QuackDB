import "./theme.css";

import { Dock } from "@/app/(app)/test/_components/dock/dock";
import { Header } from "@/app/(app)/test/_components/dock/header";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";

export default function Test() {
	return (
		<Suspense fallback={<FallbackEditor />}>
			<div className="flex h-screen w-full flex-col flex-1">
				<Header />
				<Dock />
			</div>
		</Suspense>
	);
}

function FallbackEditor() {
	return (
		<div className="h-[90vh] w-full">
			<Skeleton className="h-full w-full" />
		</div>
	);
}
