import { RouterProvider, createRouter } from "@tanstack/react-router";
import { StrictMode } from "react";
import * as ReactDOM from "react-dom/client";
import { routeTree } from "./routeTree.gen";

import "@/styles/globals.css";
import "@fontsource-variable/inter";

// Set up a Router instance
const router = createRouter({
  routeTree,
  defaultPreload: "intent",
});

// Register things for typesafety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// Render our app!
const rootElement = document.getElementById("app")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  );
}
