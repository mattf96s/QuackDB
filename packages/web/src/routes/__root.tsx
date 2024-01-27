import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import Sidebar from "@/components/sidebar";
import { SidebarProvider, useSidebar } from "@/components/sidebar/context";
import { memo, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import NotFound from "@/components/NotFound";

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function Layout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <LayoutContainer>
        <Sidebar />
        <main className="h-full w-full">
          <div className="flex h-full flex-col">
            <ContentShell>{children}</ContentShell>
          </div>
        </main>

        {/* Start rendering router matches */}
        <TanStackRouterDevtools position="bottom-right" />
      </LayoutContainer>
    </SidebarProvider>
  );
}

function RootComponent() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

function NotFoundComponent() {
  return (
    <Layout>
      <NotFound />
    </Layout>
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
