import { Route as rootRoute } from './routes/__root'
import { Route as IndexIndexImport } from './routes/index/index'

const IndexIndexRoute = IndexIndexImport.update({
  path: '/index/',
  getParentRoute: () => rootRoute,
} as any)
declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/index/': {
      preLoaderRoute: typeof IndexIndexImport
      parentRoute: typeof rootRoute
    }
  }
}
export const routeTree = rootRoute.addChildren([IndexIndexRoute])
