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
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				name: "theme-color",
				content: "#fb7f44",
			},
			{
				title: "QuackDB | Open-source in-browser DuckDB SQL editor",
			},
			{
				property: "og:title",
				content: "QuackDB | Open-source in-browser DuckDB SQL editor",
			},
			{
				name: "description",
				content: "In-browser DuckDB SQL playground and editor",
			},
			{
				property: "og:url",
				content: "https://www.quackdb.com/",
			},
		],
		links: [
			{
				rel: "apple-touch-icon",
				sizes: "180x180",
				href: "/apple-touch-icon.png",
			},
			{
				rel: "icon",
				type: "image/png",
				sizes: "32x32",
				href: "/favicon-32x32.png",
			},
			{
				rel: "icon",
				type: "image/png",
				sizes: "16x16",
				href: "/favicon-16x16.png",
			},
			{
				rel: "mask-icon",
				href: "/safari-pinned-tab.svg",
				color: "#fb7f44",
			},
			{
				rel: "manifest",
				href: "/site.webmanifest",
				crossOrigin: "use-credentials",
			},
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
			<ThemeProvider
				defaultTheme="system"
				storageKey="vite-ui-theme"
				enableSystem
				disableTransitionOnChange
			>
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
					<TanStackRouterDevtools position="bottom-right" />
					<Scripts />
					{isProduction && <Analytics />}
					{isProduction && <SpeedInsights />}
				</ThemeProvider>
			</body>
		</html>
	);
}
