import { NotSupportedModal } from "@/app/(app)/_components/transfer-not-supported";
import { SessionProvider } from "@/context/session/provider";
import { Loader2 } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
	title: "Playground | QuackDB",
	description: "QuackDB Playground",
};

// const LazyPlayground = lazy(() =>
//   import("./_components/playground").then((module) => ({
//     default: module.default,
//   }))
// );

export default function Page() {
	return (
		<div className="flex size-full flex-col">
			<Suspense fallback={<p>loading ...</p>}>
				<NotSupportedModal />
			</Suspense>
			<Suspense fallback={<PlaygroundSkeleton />}>
				<SessionProvider>
					<h1>Playground</h1>
					{/* <DbProvider>
						<PanelProvider>
							<QueryProvider>
								<EditorSettingsProvider>
									<EditorProvider>
										<NavBar />
										<Suspense fallback={<PlaygroundSkeleton />}>
											
											<LazyPlayground />
										</Suspense>
									</EditorProvider>
								</EditorSettingsProvider>
							</QueryProvider>
						</PanelProvider>
					</DbProvider> */}
				</SessionProvider>
			</Suspense>
		</div>
	);
}

function PlaygroundSkeleton() {
	return (
		<div className="flex size-full items-center justify-center bg-background">
			<Loader2 name="loader-circle" className="size-6 animate-spin" />
		</div>
	);
}
