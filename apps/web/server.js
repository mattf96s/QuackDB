import { createRequestHandler as _createRequestHandler } from "@remix-run/express";
import { installGlobals } from "@remix-run/node";
import * as Sentry from "@sentry/remix";
import compression from "compression";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import crypto from "node:crypto";
import sourceMapSupport from "source-map-support";

sourceMapSupport.install();
installGlobals();

const MODE = process.env.NODE_ENV;
const STAGE = process.env.STAGE;

const isProduction = STAGE === "production";
const SENTRY_DSN = process.env.SENTRY_DSN;

const createRequestHandler = isProduction
  ? Sentry.wrapExpressCreateRequestHandler(_createRequestHandler)
  : _createRequestHandler;

const viteDevServer = isProduction
  ? undefined
  : await import("vite").then((vite) =>
      vite.createServer({
        server: { middlewareMode: true },
      }),
    );

async function getBuild() {
  return viteDevServer
    ? viteDevServer.ssrLoadModule("virtual:remix/server-build")
    : await import("./build/server/index.js");
}

const app = express();

// no ending slashes for SEO reasons
// https://github.com/epicweb-dev/epic-stack/discussions/108
app.get("*", (req, res, next) => {
  if (req.path.endsWith("/") && req.path.length > 1) {
    const query = req.url.slice(req.path.length);
    const safepath = req.path.slice(0, -1).replace(/\/+/g, "/");
    res.redirect(302, safepath + query);
  } else {
    next();
  }
});

app.use(compression());

// http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
app.disable("x-powered-by");

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

// handle asset requests
if (viteDevServer) {
  app.use(viteDevServer.middlewares);
} else {
  // Vite fingerprints its assets so we can cache forever.
  app.use(
    "/assets",
    express.static("build/client/assets", { immutable: true, maxAge: "1y" }),
  );

  // Everything else (like favicon.ico) is cached for an hour. You may want to be
  // more aggressive with this caching.
  app.use(express.static("build/client", { maxAge: "1h" }));
}

morgan.token("url", (req) => decodeURIComponent(req.url ?? ""));

app.use(morgan("tiny"));

app.use((_, res, next) => {
  res.locals.cspNonce = crypto.randomBytes(16).toString("hex");
  next();
});

app.use(
  helmet({
    xPoweredBy: false,
    referrerPolicy: { policy: "same-origin" },
    crossOriginEmbedderPolicy: "require-corp",
    crossOriginOpenerPolicy: "same-origin",
    contentSecurityPolicy: {
      // NOTE: Remove reportOnly when you're ready to enforce this CSP
      reportOnly: true,
      directives: {
        "connect-src": [
          MODE === "development" ? "ws:" : null,
          isProduction && SENTRY_DSN ? "*.ingest.sentry.io" : null,
          "cdn.jsdelivr.net",
          "*.duckdb.org",
          "'self'",
        ].filter(Boolean),
        "frame-src": ["'self'"],
        "img-src": ["'self'", "data:"],
        "report-uri": isProduction
          ? "https://o4506928409280512.ingest.us.sentry.io/api/4506928414982144/security/?sentry_key=02302d5793d3ca103701cb0b84cff6a0"
          : null,
        "script-src": [
          "'strict-dynamic'",
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",

          // @ts-expect-error
          (_, res) => `'nonce-${res.locals.cspNonce}'`,
        ],
        "script-src-attr": [
          // @ts-expect-error
          (_, res) => `'nonce-${res.locals.cspNonce}'`,
        ],
        "upgrade-insecure-requests": null,
      },
    },
  }),
);

// handle SSR requests
app.all(
  "*",
  createRequestHandler({
    getLoadContext: (_, res) => ({
      cspNonce: res.locals.cspNonce,
      serverBuild: getBuild(),
    }),
    mode: MODE,
    // @sentry/remix needs to be updated to handle the function signature
    build: MODE === "production" ? await getBuild() : getBuild,
  }),
);

const port = process.env.PORT || 3000;
app.listen(port, () =>
  console.log(`Express server listening at http://localhost:${port}`),
);
