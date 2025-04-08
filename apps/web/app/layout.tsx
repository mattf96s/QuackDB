import { TailwindIndicator } from "@/components/tailwind-indicator";
import { cn } from "@/lib/utils";
import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "next-themes";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "CSV Lead Ingestor",
	description: "A simple CSV lead ingestor",
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
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#fb7f44" />
      <link rel="manifest" href="/site.webmanifest" crossOrigin="use-credentials" />
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
					"min-h-svh bg-background font-sans antialiased",
					geistSans.variable,
					geistMono.variable,
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