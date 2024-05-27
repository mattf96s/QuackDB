import { createCookieSessionStorage } from "@vercel/remix";
import { createThemeSessionResolver } from "remix-themes";

// You can default to 'development' if process.env.NODE_ENV is not set
const isProduction = process.env.VERCEL === "1";

const domain = isProduction
  ? process.env.VERCEL_PROJECT_PRODUCTION_URL
  : "localhost:3000";

/**
 * Theme session storage
 */
const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "theme",
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET],
    ...(isProduction ? { domain, secure: true } : {}),
  },
});

export const themeSessionResolver = createThemeSessionResolver(sessionStorage);
