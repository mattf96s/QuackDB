import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="flex h-screen items-center justify-center bg-black text-white">
			<h1 className="font-bold text-4xl">
				Welcome to the TanStack Start Starter!
			</h1>
			<p className="mt-4">
				This is a basic setup to get you started with TanStack Start and React.
			</p>
			<p className="mt-2">Explore the code to see how everything works.</p>
		</div>
	);
}
