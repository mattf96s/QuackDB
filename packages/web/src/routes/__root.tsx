import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { memo, type ReactNode } from "react";
import NotFound from "@/components/NotFound";
import Sidebar from "@/components/sidebar";
import { SidebarProvider, useSidebar } from "@/components/sidebar/context";
import { cn } from "@/lib/utils";

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  loader: async () => {
    console.log("\n", "META: ", import.meta);
    console.log("ENV: ", import.meta.env);
    return {};
  },
});

function Layout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <LayoutContainer>
        <Sidebar />
        <main className="size-full">
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
