# QuackDB - _Online DuckDB SQL Playground (WIP)_

QuackDB is a privacy-preserving DuckDB SQL playground leveraging the Origin Private File System (OPFS) and Web Workers.

Online demo available at [app.quackdb.com](https://app.quackdb.com).

Note: This project is a work in progress.

## Features

- Privacy-preserving SQL playground with no screen recording, or error monitoring. Fathom Analytics is used for basic page view tracking (but honor Do Not Track).

## Tech Stack

- [@DuckDB/Wasm](https://duckdb.org/)
- [shadcn/ui](https://ui.shadcn.com/)
- [@tanstack/router](https://tanstack.com/router/latest)
- [Observable Plot](https://observablehq.com/plot/)
- [OPFS](https://web.dev/file-system-access/)
- [Comlink](https://github.com/GoogleChromeLabs/comlink)
- [Monaco Editor](https://microsoft.github.io/monaco-editor/)

## TODO

- [ ] Autocompletion and syntax highlighting
- [ ] PWA / Offline support
- [ ] Safari support 😁
- [ ] Chart builder
- [ ] Improved UI / charts / tables / etc.
- [ ] Data import/export
- [ ] Responsive design improvements
- [ ] Performance improvements with Arrow
- [ ] Different sessions / projects
- [ ] Snippets / examples

## Maybe

- [ ] [NSQL](https://motherduck.com/blog/duckdb-text2sql-llm/) integration for natural language queries.
- [ ] CoPilot integration for code suggestions.
- [ ] JS / TS / Python / etc. support

## Credits

- [CMU Data Interaction Group](https://github.com/cmudig)
- [SQL Workbench](https://sql-workbench.com/)
- [Evidence](https://github.com/evidence-dev/evidence)
- [Malloy](https://github.com/malloydata/malloy)
- [wa-sqlite](https://github.com/rhashimoto/wa-sqlite/blob/master/demo/demo-worker.js)
- [Rill](https://github.com/rilldata/rill)
- [Observable](https://github.com/observablehq)

See [bookmarks.md](./bookmarks.md) for more interesting projects and references.

## Feedback

If you have any feedback or questions about the DuckDB SQL Playground, feel free to reach out (especially since there are no error monitoring tools in place 😅).
