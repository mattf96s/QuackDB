# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

QuackDB is a privacy-preserving in-browser DuckDB SQL playground and editor built with TanStack Start (React), DuckDB WASM, and Tailwind CSS. The app allows users to run SQL queries entirely in the browser using DuckDB's WebAssembly implementation, with support for various file formats (.csv, .json, .parquet, .sqlite, .duckdb, .arrow).

## Development Commands

### Core Commands
- `pnpm dev` - Start development server (runs on port 3000)
- `pnpm build` - Build the application for production
- `pnpm lint` - Lint code using Biome
- `pnpm format` - Format code using Biome
- `pnpm typecheck` - Run TypeScript type checking
- `pnpm test` - Run tests using Vitest (in web app)
- `pnpm clean` - Clean build artifacts and node_modules

### Individual Package Commands
Navigate to `apps/web/` to run package-specific commands:
- `cd apps/web && pnpm dev` - Run web app in development
- `cd apps/web && pnpm test` - Run web app tests
- `cd apps/web && pnpm check` - Run Biome lint and format together

## Architecture

### Monorepo Structure
- **Root**: Turborepo configuration with shared tooling (Biome, TypeScript, Turbo)
- **apps/web/**: Main React application using TanStack Start
- **packages/**: Shared packages (currently empty but structured for future use)

### Key Technologies
- **Frontend**: TanStack Start (file-based routing), React 19, Tailwind CSS v4
- **Database**: DuckDB WASM with singleton pattern for connection management
- **Build**: Vite with custom plugins for TanStack Start and Tailwind
- **UI**: Custom component library based on Radix UI and shadcn/ui patterns
- **State Management**: React Context providers for various app states
- **Code Quality**: Biome for linting/formatting, Lefthook for git hooks

### Core App Structure

#### Routing (TanStack Start)
- File-based routing in `apps/web/src/routes/`
- Main route: `_index/route.tsx` (playground interface)
- Root layout: `__root.tsx` with theme provider and global components

#### DuckDB Integration
- **Singleton**: `apps/web/src/modules/duckdb-singleton.ts` - Main DuckDB instance manager
- **Context**: `apps/web/src/context/db/` - React context for database state
- **Features**: Connection pooling, query caching, file registration, export functionality

#### Context Providers
Located in `apps/web/src/context/`:
- `db/` - Database connection and query state
- `editor/` - SQL editor state and settings
- `session/` - File management and session persistence
- `query/` - Query execution and results
- `pagination/` - Table pagination state
- `panel/` - UI panel state management

#### UI Components
- **Custom Components**: `apps/web/src/components/ui/` - Reusable UI components
- **Feature Components**: `apps/web/src/routes/_index/components/` - Page-specific components
- **Monaco Editor**: Custom SQL editor with syntax highlighting and autocomplete

### File Management
- Uses OPFS (Origin Private File System) for browser-based file persistence
- Supports drag-and-drop file uploads
- File registration with DuckDB for query access

## Code Style & Guidelines

### Formatting (Biome Configuration)
- **Indentation**: Tabs (not spaces)
- **Quotes**: Double quotes for JavaScript/TypeScript
- **Import Organization**: Auto-organized imports on save
- **Line Length**: Not strictly enforced, follow Biome defaults

### Comments
Per `.cursor/rules/use-valuable-comments.mdc`:
- Only add comments when they provide contextual information not obvious from code
- Avoid comments that simply restate what the code does

### Component Patterns
- Use React Context for state that needs to be shared across components
- Break complex components into smaller files for React Fast Refresh
- Follow existing patterns in the codebase for naming and structure

## Testing

- **Framework**: Vitest
- **Config**: `apps/web/vitest.config.ts`
- **Location**: Tests should be co-located with components or in `__tests__` directories

## Build & Deployment

### Development
- Uses Vite dev server with HMR
- TanStack Start provides SPA mode with file-based routing
- Development runs on port 3000

### Production
- Vite build outputs to `.output` directory
- TanStack Start builds for SPA deployment
- Vercel is the preferred deployment platform

## Key Dependencies to Understand

### Core Framework
- `@tanstack/react-start` - Full-stack React framework with file-based routing
- `@tanstack/react-router` - Client-side routing
- `react` v19 - Latest React with new features

### DuckDB & Data
- `@duckdb/duckdb-wasm` - WebAssembly DuckDB for in-browser queries
- `apache-arrow` - Arrow data format support
- `@observablehq/plot` - Data visualization
- `@tanstack/react-table` - Table component for query results

### UI & Styling
- `tailwindcss` v4 - CSS framework
- `@radix-ui/*` - Primitive UI components
- `lucide-react` - Icon library
- `framer-motion` - Animation library

### Editor & Code
- `monaco-editor` & `@monaco-editor/react` - SQL code editor
- `@wasm-fmt/sql_fmt` - SQL formatting
- `shiki` - Syntax highlighting

## Common Workflows

### Adding New UI Components
1. Create component in `apps/web/src/components/ui/`
2. Follow existing patterns (variants, index exports)
3. Use Radix UI primitives where possible
4. Include TypeScript types and proper exports

### Database Query Development
1. Use the DuckDB singleton: `DuckDBInstance.getInstance()`
2. Register files before querying: `registerFileHandle()` or `registerFileUrl()`
3. Use `fetchResults()` for cached queries or `query()` for direct execution
4. Handle errors appropriately and cleanup connections

### Adding New Routes
1. Create file in `apps/web/src/routes/` following TanStack Start conventions
2. Use `createFileRoute()` for route definition
3. Add necessary imports and component exports
4. Route tree is auto-generated

## Environment & Node Version

- **Node**: >= 20 < 21 (strict requirement)
- **Package Manager**: pnpm (specified in `packageManager` field)
- **Environment**: Browser-focused with WASM support required

## Migration Notes

The project is currently migrating to TanStack Start (see branch: `feat/tanstack-start-migration`). Be aware that:
- Previous version used Remix
- File-based routing patterns may still be evolving
- Some components may have legacy patterns during transition