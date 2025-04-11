import type { ReactNode } from "react";
import "dockview-react/dist/styles/dockview.css";
import { AppSidebar } from "@/app/(app)/test/_components/app-sidebar/app-sidebar";
import { DockProvider } from "@/app/(app)/test/_components/dock/provider";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";

export default function Layout({ children }: { children: ReactNode }) {
	return (
		<SidebarProvider
			style={
				{
					"--sidebar-width": "350px",
				} as React.CSSProperties
			}
		>
			<DockProvider>
				<AppSidebar />
				<SidebarInset>
					<main className="flex-1">
						<header className="sticky top-0 flex shrink-0 items-center gap-2 border-b bg-background p-4">
							<SidebarTrigger />
						</header>
						{children}
					</main>
				</SidebarInset>
			</DockProvider>
		</SidebarProvider>
	);
}
