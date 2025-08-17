/// <reference types="vite/client" />

import {
	createRootRoute,
	HeadContent,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { GlobalPendingIndicator } from "@/components/global-loader";
import { TailwindIndicator } from "@/components/tailwind-indicator";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import appCss from "../styles/globals.css?url";

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "TanStack Start Starter",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),
	component: RootComponent,
});

function RootComponent() {
	return (
		<RootDocument>
			<ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
				<Outlet />
			</ThemeProvider>
		</RootDocument>
	);
}

function RootDocument({ children }: { children: React.ReactNode }) {
	const isProduction = false;
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<HeadContent />
			</head>

			<body>
				<ThemeProvider>
					<div className="relative flex h-svh w-svw flex-col bg-background">
						<main className="flex-1">{children}</main>
					</div>

					<TailwindIndicator />
					<Toaster />
					<GlobalPendingIndicator />
					{/* <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(ENV)}`,
          }}
        /> */}
					<TanStackRouterDevtools position="bottom-right" />
					<Scripts />
					{isProduction && <Analytics />}
					{isProduction && <SpeedInsights />}
				</ThemeProvider>
			</body>
		</html>
	);
}
