/* eslint-disable react/no-unknown-property */
import {
  Links,
  Meta,
  type MetaFunction,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import type { LinksFunction, LoaderFunctionArgs } from "@vercel/remix";
import {
  PreventFlashOnWrongTheme,
  ThemeProvider,
  useTheme,
} from "remix-themes";
import styles from "~/styles/globals.css?url";
import GlobalLoader from "./components/global-loader";
import { Toaster } from "./components/ui/sonner";

import { Analytics as VercelAnalytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/remix";
import clsx from "clsx";
import { TailwindIndicator } from "./components/tailwind-indicator";
import { metaDetails } from "./constants";
import { themeSessionResolver } from "./sessions.server";
import { getEnv } from "./utils/env.server";

export const links: LinksFunction = () => {
  const preloadedFonts = [
    "GeistVariableVF.woff2",
    "JetBrainsMono[wght].woff2",
    "JetBrainsMono-Italic[wght].woff2",
  ];
  return [
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
    ...preloadedFonts.map((font) => ({
      rel: "preload",
      as: "font",
      href: `/fonts/${font}`,
      crossOrigin: "anonymous" as const,
    })),
  ];
};

export const meta: MetaFunction = () => [
  {
    title: "QuackDB | Open-source in-browser DuckDB SQL editor",
  },
  { name: "theme-color", content: metaDetails.themeColor },
  {
    name: "description",
    content: metaDetails.description,
  },
  {
    name: "og:title",
    content: "QuackDB | Open-source in-browser DuckDB SQL editor",
  },
  {
    name: "og:description",
    content: metaDetails.description,
  },
  {
    name: "msapplication-TileColor",
    content: metaDetails.msapplicationTileColor,
  },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const { getTheme } = await themeSessionResolver(request);
  const url = new URL(request.url);
  return {
    theme: getTheme(),
    host: url.host,
    ENV: getEnv(),
  };
}

export default function App() {
  const data = useLoaderData<typeof loader>();
  return (
    <ThemeProvider
      specifiedTheme={data.theme}
      themeAction="/action/set-theme"
    >
      <LayoutInner>
        <Outlet />
      </LayoutInner>
    </ThemeProvider>
  );
}

export function LayoutInner(props: { children: React.ReactNode }) {
  const data = useLoaderData<typeof loader>();
  const [theme] = useTheme();

  const isProduction = data.ENV.VERCEL_ENV === "production";

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
        <div vaul-drawer-wrapper="">
          <div className="relative flex h-svh w-svw flex-col bg-background">
            <main className="flex-1">{props.children}</main>
          </div>
        </div>
        <TailwindIndicator />
        <Toaster />
        <GlobalLoader />
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(ENV)}`,
          }}
        />
        <ScrollRestoration />
        <Scripts />
        {isProduction && <VercelAnalytics />}
        {isProduction && <SpeedInsights />}
      </body>
    </html>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  return (
    <html lang="en">
      <head>
        <title>Oops!</title>
        <Meta />
        <Links />
      </head>
      <body>
        <h1>
          {isRouteErrorResponse(error)
            ? `${error.status} ${error.statusText}`
            : error instanceof Error
              ? error.message
              : "Unknown Error"}
        </h1>
        <Outlet />
        <Scripts />
      </body>
    </html>
  );
}
