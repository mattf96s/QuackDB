import * as ReactDOM from "react-dom/client";
import '@/styles/globals.css';
import { RouterProvider, Router } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'


// Set up a Router instance
const router = new Router({
  routeTree,
  defaultPreload: 'intent',
})

// Register things for typesafety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}



// Render our app!
const rootElement = document.getElementById('app')!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(<RouterProvider router={router} />)
}
