import NotFound from "@/components/NotFound";
import Sidebar from "@/components/sidebar";
import { SidebarProvider } from "@/components/sidebar/context";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { ConfigProvider } from "@/context/config/provider";
import useBreakpoint from "@/hooks/use-breakpoints";
import { cn } from "@/lib/utils";
import {
  Outlet,
  createRootRoute,
  useRouter,
  useRouterState,
} from "@tanstack/react-router";
import * as Fathom from "fathom-client";
import NProgress from "nprogress";
import { Suspense, memo, useEffect, type ReactNode } from "react";

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

function Analytics() {
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
}

function Layout(props: { children: ReactNode }) {
  const isSmallerScreen = useBreakpoint("md");
  return (
    <ConfigProvider>
      <SidebarProvider>
        <LayoutContainer>
          <Sidebar />
          <div className="w-full pl-0 lg:pl-16">
            <main
              className={cn(
                "fixed inset-x-0 bottom-0 top-16 lg:left-16 lg:w-[calc(100vw-64px)]",
                isSmallerScreen && "left-0 top-0 w-full",
              )}
            >
              <div className="flex size-full flex-col">
                <ContentShell>
                  <Suspense fallback={<p>loading...</p>}>
                    {props.children}
                  </Suspense>
                </ContentShell>
              </div>
            </main>
          </div>

          {/* Start rendering router matches */}
          {/* <TanStackRouterDevtools position="bottom-right" /> */}

          {/* should be inside LayoutContainer incase we change tailwind things */}
          <Toaster
            closeButton
            pauseWhenPageIsHidden
            visibleToasts={3}
            expand
            duration={0}
            position="bottom-right"
          />
        </LayoutContainer>
      </SidebarProvider>
    </ConfigProvider>
  );
}

function Shell(props: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <Layout>{props.children}</Layout>
      <ProgressBar />
      <Suspense>
        <Analytics />
      </Suspense>
    </ThemeProvider>
  );
}

function NotFoundComponent() {
  return (
    <Shell>
      <div className="relative size-full">
        <NotFound />
      </div>
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
      className="relative flex h-screen max-h-screen min-h-screen w-full max-w-full flex-col bg-background lg:flex-row"
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
  return (
    <div className="flex size-full min-h-0 flex-col">{props.children}</div>
  );
});
