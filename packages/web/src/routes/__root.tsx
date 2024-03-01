import NotFound from "@/components/NotFound";
import Icon from "@/components/icon";
import { SidebarProvider } from "@/components/sidebar/context";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { ConfigProvider } from "@/context/config/provider";
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
  wrapInSuspense: true,
  pendingComponent: PendingComponent,
});

function PendingComponent() {
  return (
    <div className="flex size-full items-center justify-center bg-background">
      <Icon
        name="Loader2"
        className="size-6 animate-spin"
      />
    </div>
  );
}

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
  return (
    <ConfigProvider>
      <SidebarProvider>
        <LayoutContainer>
          <div className="w-full">
            <main className="fixed inset-x-0 bottom-0 top-16 w-full">
              <div className="flex size-full flex-col">
                <ContentShell>
                  <Suspense fallback={<p>loading...</p>}>
                    {props.children}
                  </Suspense>
                </ContentShell>
              </div>
            </main>
          </div>

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
