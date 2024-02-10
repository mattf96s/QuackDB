import { memo, type ReactNode, useEffect } from "react";
import {
  createRootRoute,
  Outlet,
  useRouter,
  useRouterState,
} from "@tanstack/react-router";
import * as Fathom from "fathom-client";
import NProgress from "nprogress";
import NotFound from "@/components/NotFound";
import Sidebar from "@/components/sidebar";
import { SidebarProvider } from "@/components/sidebar/context";
import { useSidebar } from "@/components/sidebar/hooks/useSidebar";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function ProgressBar() {
  const isLoading = useRouterState({ select: (s) => s.status === "pending" });
  useEffect(() => {
    if (isLoading) NProgress.start();
    else NProgress.done();
  }, [isLoading]);

  return null;
}

const Analytics = memo(function Analytics() {
  const router = useRouter();
  router.subscribe("onLoad", () => {
    const url = window.location.href;
    Fathom.trackPageview({
      url,
      referrer: document.referrer,
    });
  });

  useEffect(() => {
    const url = window.location.href;
    const { hostname } = new URL(url);

    const isProduction = hostname === "app.quackdb.com";

    if (!isProduction) return;

    Fathom.load("OSRZURZO", {
      includedDomains: ["app.quackdb.com"],
      excludedDomains: ["localhost"],
      honorDNT: true,
    });
  }, []);

  return null;
});

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
        {/* <TanStackRouterDevtools position="bottom-right" /> */}

        {/* should be inside LayoutContainer incase we change tailwind things */}
        <Toaster
          closeButton
          pauseWhenPageIsHidden
          visibleToasts={3}
          expand
        />
      </LayoutContainer>
    </SidebarProvider>
  );
}

function Shell(props: { children: ReactNode }) {
  return (
    <>
      <Layout>{props.children}</Layout>
      <ProgressBar />
      <Analytics />
    </>
  );
}

function NotFoundComponent() {
  return (
    <Shell>
      <NotFound />
    </Shell>
  );
}

function RootComponent() {
  return (
    <Shell>
      <Outlet />
    </Shell>
  );
}

const LayoutContainer = memo(function LayoutContainer(props: {
  children: ReactNode;
}) {
  return (
    <div
      className="relative flex h-screen min-h-screen flex-col bg-background font-sans antialiased lg:flex-row"
      // eslint-disable-next-line react/no-unknown-property
      vaul-drawer-wrapper=""
    >
      {props.children}
    </div>
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
