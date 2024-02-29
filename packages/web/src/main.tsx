import "@/styles/globals.css";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import "nprogress/nprogress.css";
import { StrictMode } from "react";
import * as ReactDOM from "react-dom/client";
import NotFound from "./components/NotFound";
import { routeTree } from "./routeTree.gen";

// Set up a Router instance
const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  globalNotFound: NotFound,
});

// Register things for typesafety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// Render our app!
// biome-ignore lint/style/noNonNullAssertion: <explanation>
const rootElement = document.getElementById("app")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  );
}
