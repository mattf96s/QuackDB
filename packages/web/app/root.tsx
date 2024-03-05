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
import "~/styles/globals.css";
import Analytics from "./components/fathom";
import GlobalLoader from "./components/global-loader";
import { Toaster } from "./components/ui/sonner";

import clsx from "clsx";
import Icon from "./components/icon";
import { themeSessionResolver } from "./sessions.server";

const preloadedFonts = [
  "Geist/GeistVariableVF.woff2",
  "JetBrainsMono/JetBrainsMono-Italic[wght].woff2",
  "JetBrainsMono/JetBrainsMono[wght].woff2",
];

export const links: LinksFunction = () => [
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
  ...preloadedFonts.map((font) => ({
    rel: "preload",
    as: "font",
    href: `/fonts/${font}`,
    crossOrigin: "anonymous" as const,
  })),
  { rel: "manifest", href: "/site.webmanifest" },
];

export const meta: MetaFunction = () => [
  {
    name: "title",
    content: "QuackDB |  Online DuckDB SQL playground and editor",
  },
  { name: "theme-color", content: "#0a0a0a" },
  {
    name: "description",
    content:
      "QuackDB is a user-friendly, open-source online DuckDB SQL playground and editor. Designed for efficient prototyping, data tasks, and data visualization, it respects your privacy with a no-tracking policy.",
  },
  {
    name: "keywords",
    content:
      "QuackDB, DuckDB, SQL, SQL playground, SQL editor, SQL online, SQL online editor, SQL online playground, SQL online editor, SQL online playground, SQL online playground and editor, SQL playground and editor, SQL playground editor, SQL editor playground, SQL editor online, SQL playground",
  },
  {
    "script:ld+json": {
      type: "application/ld+json",
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebApplication",
        applicationCategory: "BrowserApplication",
        name: "QuackDB",
        url: "https://quackdb.com",
        screenshot: "https://quackdb.com/screenshot.jpg",
        image: "https://quackdb.com/screenshot.jpg",
        description:
          "QuackDB is a user-friendly, open-source online DuckDB SQL playground and editor. Designed for efficient prototyping, data tasks, and data visualization, it respects your privacy with a no-tracking policy.",
        author: {
          "@type": "Person",
          name: "Matthew Fainman",
        },
      }),
    },
  },
  {
    "script:ld+json": {
      type: "application/ld+json",
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "QuackDB",
        url: "https://quackdb.com",
        description:
          "QuackDB is a user-friendly, open-source online DuckDB SQL playground and editor. Designed for efficient prototyping, data tasks, and data visualization, it respects your privacy with a no-tracking policy.",
      }),
    },
  },
  {
    "script:ld+json": {
      type: "application/ld+json",
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "SoftwareSourceCode",
        name: "QuackDB",
        codeRepository: "https://github.com/mattf96s/QuackDB",
        programmingLanguage: "TypeScript",
        applicationCategory: "BrowserApplication",
      }),
    },
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
        suppressHydrationWarning // only goes one layer deep. Probably grammarly.
      >
        <GlobalLoader />

        <div vaul-drawer-wrapper="">
          <div className="relative flex h-svh w-svw flex-col bg-background">
            <main className="flex-1">{props.children}</main>
          </div>
        </div>

        {data.isProduction && <Analytics />}
        <ScrollRestoration />
        <Scripts />
        <Toaster />
      </body>
    </html>
  );
}

function FallBack() {
  return (
    <div className="flex size-full items-center justify-center bg-background">
      <span>
        <Icon
          name="Loader2"
          className="mr-3 h-5 w-5 animate-spin"
        />
      </span>
    </div>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary() {
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
