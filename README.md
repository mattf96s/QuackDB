# QuackDB - Online DuckDB SQL Playground

[![Release](https://github.com/mattf96s/QuackDB/actions/workflows/release.yml/badge.svg)](https://github.com/mattf96s/QuackDB/actions/workflows/release.yml)
![License](https://img.shields.io/github/license/mattf96s/QuackDB)

QuackDB is a privacy-preserving in-browser DuckDB SQL playground and editor.

Demo available at [quackdb.com](https://www.quackdb.com).

- **In-Browser**: The DuckDB Wasm library is used to run SQL queries in the browser.
- **File Types**: Supports `.csv`, `.json`, `.parquet`, `.sqlite`, `.duckdb` and `.arrow` files.
- **Privacy**: no screen recordings or client-side error monitoring (only Vercel Analytics).
- **Filesystem Access**: OPFS is used to store files in the browser's filesystem for persistence.
- **Monaco Editor**: Provides a rich SQL editor experience with syntax highlighting and autocompletion.

![QuackDB Screenshot](https://www.quackdb.com/screenshot.jpg)

## Motivation

I wanted a quick and simple tool for iterating on DuckDB queries and visualizing the results. I also wanted to experiment with the new Filesystem Access API (OPFS) and explore the capabilities of DuckDB in the browser.

## Tech Stack

| Category      | Tool                                                                                                                                                 |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Database      | [DuckDB Wasm](https://duckdb.org/)                                                                                                                   |
| Frontend      | [TanStack Start](https://tanstack.com/start) &middot; [Tailwind CSS](https://tailwindcss.com/docs/table-layout), [shadcn/ui](https://ui.shadcn.com/) |
| Backend       | [Vercel](https://vercel.com/docs/frameworks/tanstack-start)                                                                                          |
| Visualization | [Observable Plot](https://observablehq.com/plot/), [Tanstack Table](https://tanstack.com/table/latest)                                               |
| Web APIs      | [Comlink](https://github.com/GoogleChromeLabs/comlink), [OPFS](https://web.dev/file-system-access/)                                                  |

> This project was migrated from Remix to TanStack Start for improved performance and developer experience, and is hosted on Vercel for seamless deployment.



## Inspiration

- [CMU Data Interaction Group](https://github.com/cmudig)
- [SQL Workbench](https://sql-workbench.com/)
- [Evidence](https://github.com/evidence-dev/evidence)
- [Malloy](https://github.com/malloydata/malloy)
- [wa-sqlite](https://github.com/rhashimoto/wa-sqlite/blob/master/demo/demo-worker.js)
- [Rill](https://github.com/rilldata/rill)
- [Observable](https://github.com/observablehq)

## License

MIT



## Tips

- Built in chrome OPFS viewer can be accessed from <https://www.quackdb.com/temporary>. To navigate, manually change the URL to the desired path as Chrome does not allow navigation by clicking on the links.

## Known Issues

- Safari will not be fully supported until this [bug](https://bugs.webkit.org/show_bug.cgi?id=256712#c0) is fixed (serializing file handles is not supported in Safari).

## Architecture Choices

### Why TanStack Start?

I want an SPA and I am using Tanstack Start / Router in my next job—I also don't like how often the React-Router api changes.

### Why a turborepo monorepo?

No reason. I think I originally wanted to learn turborepo tbh.

### Why no AI integration?

I have thought about it but I think I prefer a simple, privacy-preserving tool for quick prototyping and learning.

## Disclaimer

This project is not in any way affiliated with DuckDB or any of the other projects mentioned above.