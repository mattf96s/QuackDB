/* eslint-disable react/no-unknown-property */
import { type LinksFunction, type LoaderFunctionArgs } from "@remix-run/node";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
  type MetaFunction,
} from "@remix-run/react";
import {
  PreventFlashOnWrongTheme,
  ThemeProvider,
  useTheme,
} from "remix-themes";
import styles from "~/styles/globals.css?url";
import Analytics from "./components/fathom";
import GlobalLoader from "./components/global-loader";
import { Toaster } from "./components/ui/sonner";

import clsx from "clsx";
import { Suspense } from "react";
import { TailwindIndicator } from "./components/tailwind-indicator";
import { themeSessionResolver } from "./sessions.server";
import { useNonce } from "./utils/nonce-provider";

export const links: LinksFunction = () => [
  {
    rel: "apple-touch-icon",
    sizes: "180x180",
    href: "/apple-touch-icon.png",
  },
  {
    rel: "icon",
    type: "image/png",
    sizes: "32x32",
    href: "/favicon-32x32.png",
  },
  {
    rel: "icon",
    type: "image/png",
    sizes: "16x16",
    href: "/favicon-16x16.png",
  },
  {
    rel: "mask-icon",
    href: "/safari-pinned-tab.svg",
    color: "#fb7f44",
  },
  {
    rel: "manifest",
    href: "/site.webmanifest",
    crossOrigin: "use-credentials",
  },
  { rel: "stylesheet", href: styles },
];

export const meta: MetaFunction = () => [
  {
    title: "QuackDB | Open-source in-browser DuckDB SQL editor",
  },
  { name: "theme-color", content: "#0a0a0a" },
  {
    name: "description",
    content:
      "QuackDB is an open-source in-browser DuckDB SQL editor. Designed for efficient prototyping, data tasks, and data visualization, it respects your privacy with a no-tracking policy.",
  },
  {
    name: "og:title",
    content: "QuackDB | Open-source in-browser DuckDB SQL editor",
  },
  {
    name: "og:description",
    content:
      "QuackDB is an open-source in-browser DuckDB SQL editor. Designed for efficient prototyping, data tasks, and data visualization, it respects your privacy with a no-tracking policy.",
  },
  {
    name: "msapplication-TileColor",
    content: "#00aba9",
  },
  {
    name: "theme-color",
    content: "#000000",
  },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const { getTheme } = await themeSessionResolver(request);
  const url = new URL(request.url);
  return {
    theme: getTheme(),
    host: url.host,
    isProduction: url.host === "app.quackdb.com",
  };
}

export function Layout(props: { children: React.ReactNode }) {
  const data = useLoaderData<typeof loader>();
  return (
    <ThemeProvider
      specifiedTheme={data.theme}
      themeAction="/action/set-theme"
    >
      <LayoutInner>{props.children}</LayoutInner>
    </ThemeProvider>
  );
}

export function LayoutInner(props: { children: React.ReactNode }) {
  const data = useLoaderData<typeof loader>();
  const [theme] = useTheme();
  const nonce = useNonce();
  return (
    <html
      lang="en"
      className={clsx(theme)}
    >
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
        <Meta />
        <PreventFlashOnWrongTheme ssrTheme={Boolean(data.theme)} />
        <Links />
      </head>
      <body
        className="min-h-screen bg-background font-sans antialiased"
        suppressHydrationWarning // only goes one level deep
      >
        <GlobalLoader />

        <div vaul-drawer-wrapper="">
          <div className="relative flex h-svh w-svw flex-col bg-background">
            <main className="flex-1">{props.children}</main>
          </div>
        </div>
        <TailwindIndicator />
        {data.isProduction && (
          <Suspense>
            <Analytics />
          </Suspense>
        )}
        <Toaster />
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary() {
  return (
    <Layout>
      <ErrorComp />
    </Layout>
  );
}

function ErrorComp() {
  const error = useRouteError();
  let status = 500;
  let message = "An unexpected error occurred.";
  if (isRouteErrorResponse(error)) {
    status = error.status;
    switch (error.status) {
      case 404:
        message = "Page Not Found";
        break;
    }
  } else {
    console.error(error);
  }

  return (
    <div className="container prose py-8">
      <h1>{status}</h1>
      <p>{message}</p>
    </div>
  );
}
