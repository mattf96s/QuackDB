import { Outlet, RootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import Sidebar from "@/components/sidebar";
import { SidebarProvider, useSidebar } from "@/components/sidebar/context";
import { memo, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export const Route = new RootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <SidebarProvider>
      <LayoutContainer>
        <Sidebar />
        <main className="h-full w-full">
          <div className="flex h-full flex-col">
            <ContentShell>
              <Outlet />
            </ContentShell>
          </div>
        </main>

        {/* Start rendering router matches */}
        <TanStackRouterDevtools position="bottom-right" />
      </LayoutContainer>
    </SidebarProvider>
  );
}

const LayoutContainer = memo(function LayoutContainer(props: {
  children: ReactNode;
}) {
  return (
    <div className="flex h-screen flex-col lg:flex-row">{props.children}</div>
  );
});

const ContentShell = memo(function ContentShell(props: {
  children: ReactNode;
}) {
  const { isOpen } = useSidebar();
  return (
    <div
      className={cn(
        "flex h-full min-h-0 flex-col transition-all lg:pl-20",
        isOpen && "lg:pl-72",
      )}
    >
      {props.children}
    </div>
  );
});
