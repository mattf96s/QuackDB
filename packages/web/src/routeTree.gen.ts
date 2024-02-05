// This file is auto-generated by TanStack Router

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as FilesImport } from './routes/files'
import { Route as AboutImport } from './routes/about'
import { Route as IndexRouteImport } from './routes/index/route'
import { Route as FilesIndexImport } from './routes/files.index'
import { Route as FilesFileIdImport } from './routes/files.$fileId'

// Create/Update Routes

const FilesRoute = FilesImport.update({
  path: '/files',
  getParentRoute: () => rootRoute,
} as any)

const AboutRoute = AboutImport.update({
  path: '/about',
  getParentRoute: () => rootRoute,
} as any)

const IndexRouteRoute = IndexRouteImport.update({
  path: '/',
  getParentRoute: () => rootRoute,
} as any)

const FilesIndexRoute = FilesIndexImport.update({
  path: '/',
  getParentRoute: () => FilesRoute,
} as any)

const FilesFileIdRoute = FilesFileIdImport.update({
  path: '/$fileId',
  getParentRoute: () => FilesRoute,
} as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      preLoaderRoute: typeof IndexRouteImport
      parentRoute: typeof rootRoute
    }
    '/about': {
      preLoaderRoute: typeof AboutImport
      parentRoute: typeof rootRoute
    }
    '/files': {
      preLoaderRoute: typeof FilesImport
      parentRoute: typeof rootRoute
    }
    '/files/$fileId': {
      preLoaderRoute: typeof FilesFileIdImport
      parentRoute: typeof FilesImport
    }
    '/files/': {
      preLoaderRoute: typeof FilesIndexImport
      parentRoute: typeof FilesImport
    }
  }
}

// Create and export the route tree

export const routeTree = rootRoute.addChildren([
  IndexRouteRoute,
  AboutRoute,
  FilesRoute.addChildren([FilesFileIdRoute, FilesIndexRoute]),
])
