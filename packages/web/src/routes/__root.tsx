import { memo, type ReactNode, useEffect } from "react";
import {
  createRootRoute,
  Outlet,
  useRouter,
  useRouterState,
} from "@tanstack/react-router";
import * as Fathom from "fathom-client";
import { TerminalIcon } from "lucide-react";
import NProgress from "nprogress";
import NotFound from "@/components/NotFound";
import Sidebar from "@/components/sidebar";
import { SidebarProvider } from "@/components/sidebar/context";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggler } from "@/components/theme-toggle";
import { Toaster } from "@/components/ui/sonner";
import useBreakpoint from "@/hooks/use-breakpoints";
import { cn } from "@/lib/utils";

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  headers: () => {
    // add headers to allow shared array buffer and cors
    return {
      "Access-Control-Allow-Origin": "*",
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Cross-Origin-Resource-Policy": "same-site",
    };
  },
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
  const isSmallerScreen = useBreakpoint("md");
  return (
    <SidebarProvider>
      <LayoutContainer>
        <Sidebar />
        <div className="w-full pl-0 lg:pl-16">
          {/* navbar */}
          <div className="fixed left-16 right-0 top-0 z-40 hidden h-16 shrink-0 items-center gap-x-4 border bg-background px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:flex lg:px-8">
            <div className="flex items-center justify-evenly gap-2">
              <h1 className="text-lg font-semibold">QuackDB</h1>
              <TerminalIcon className="size-5" />
            </div>
            <div className="ml-auto flex w-full items-center space-x-2 sm:justify-end">
              {/* toolbar portal */}
              <div id="toolbar-portal" />
              <ThemeToggler />
            </div>
          </div>

          <main
            className={cn(
              "fixed inset-x-0 bottom-0 top-16 w-full lg:left-16",
              isSmallerScreen && "left-0 top-0",
            )}
          >
            <div className="flex h-full flex-col">
              <ContentShell>{props.children}</ContentShell>
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
        />
      </LayoutContainer>
    </SidebarProvider>
  );
}

function Shell(props: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <Layout>{props.children}</Layout>
      <ProgressBar />
      <Analytics />
    </ThemeProvider>
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
  return <div className="flex h-full min-h-0 flex-col">{props.children}</div>;
});
