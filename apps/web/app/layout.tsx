import "./globals.css";

import { TailwindIndicator } from "@/components/tailwind-indicator";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, JetBrains_Mono } from "next/font/google";

const geistSans = Geist({
	variable: "--font-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-mono",
	subsets: ["latin"],
});

const jetBrainsMono = JetBrains_Mono({
	variable: "--font-jetbrains-mono",
	subsets: ["latin"],
	display: "swap",
	weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
	title: "QuackDB",
	description: "QuackDB Playground",
};

const META_THEME_COLORS = {
	light: "#ffffff",
	dark: "#09090b",
};

export const viewport: Viewport = {
	themeColor: META_THEME_COLORS.light,
};

interface RootLayoutProps {
	children: React.ReactNode;
}

const preloadedFonts = [
	"GeistVariableVF.woff2",
	"JetBrainsMono[wght].woff2",
	"JetBrainsMono-Italic[wght].woff2",
];

export default function RootLayout({ children }: RootLayoutProps) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<link
					rel="apple-touch-icon"
					sizes="180x180"
					href="/apple-touch-icon.png"
				/>
				<link rel="mask-icon" href="/safari-pinned-tab.svg" color="#fb7f44" />
				<link
					rel="manifest"
					href="/site.webmanifest"
					crossOrigin="use-credentials"
				/>
				{preloadedFonts.map((font) => (
					<link
						key={font}
						rel="preload"
						as="font"
						href={`/fonts/${font}`}
						crossOrigin="anonymous"
					/>
				))}
			</head>
			<body
				className={cn(
					"min-h-svh bg-background font-sans antialiased overscroll-none",
					geistSans.variable,
					geistMono.variable,
					jetBrainsMono.variable,
				)}
			>
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
					enableColorScheme
				>
					<div vaul-drawer-wrapper="">
						<div className="relative flex min-h-svh flex-col bg-background">
							{children}
						</div>
					</div>
					<Toaster />
					<TailwindIndicator />
				</ThemeProvider>
			</body>
		</html>
	);
}
