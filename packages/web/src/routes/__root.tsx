import { memo, type ReactNode } from "react";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import NotFound from "@/components/NotFound";
import Sidebar from "@/components/sidebar";
import { SidebarProvider } from "@/components/sidebar/context";
import { useSidebar } from "@/components/sidebar/hooks/useSidebar";
import { cn } from "@/lib/utils";

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

// function RouterSpinner() {
//   const isLoading = useRouterState({ select: (s) => s.status === "pending" });
//   return <Loader2 show={isLoading} />;
// }

function Layout(props: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <LayoutContainer>
        <Sidebar />
        <main className="size-full">
          <div className="flex h-full flex-col">
            <ContentShell>{props.children}</ContentShell>
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
