# QuackDB - _Online DuckDB SQL Playground (WIP)_

QuackDB is a privacy-preserving in-browser DuckDB SQL playground and editor. Demo available at [www.quackdb.com](https://www.quackdb.com).

- **In-Browser**: The DuckDB Wasm library is used to run SQL queries in the browser.
- **File Types**: Supports `.csv`, `.json`, `.parquet`, `.sqlite`, `.duckdb` and `.arrow` files.
- **Privacy**: no screen recordings or client-side error monitoring. Fathom Analytics is used for basic page view tracking and Sentry runs server-side only (without session tracking).
- **Filesystem Access**: OPFS is used to store files in the browser's filesystem for persistence.

There is no screen recordings or client-side error monitoring—so let me know about any errors 😜. The only tracking is basic page views using Fathom Analytics.

Note: This project is a work in progress.

## Motivation

I wanted a quick and simple tool for iterating on DuckDB queries and visualizing the results. I also wanted to experiment with the new Filesystem Access API (OPFS) and explore the capabilities of DuckDB in the browser.

## Tech Stack

| Category      | Tool                                                                                                                                |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Database      | [DuckDB Wasm](https://duckdb.org/)                                                                                                  |
| Frontend      | [Remix](https://remix.run/) &middot; [Tailwind CSS](https://tailwindcss.com/docs/table-layout), [shadcn/ui](https://ui.shadcn.com/) |
| Backend       | [SST (IAC)](https://docs.sst.dev/start/remix), [AWS Lambda](https://aws.amazon.com/lambda/)                                         |
| Visualization | [Observable Plot](https://observablehq.com/plot/), [Tanstack Table](https://tanstack.com/table/latest)                              |
| Web APIs      | [Comlink](https://github.com/GoogleChromeLabs/comlink), [OPFS](https://web.dev/file-system-access/)                                 |

## TODO

- [ ] Safari support 😁
- [ ] Improved UI / charts / tables / etc.
- [ ] Data import/export
- [ ] Responsive design improvements
- [ ] Performance improvements with Arrow
- [ ] Snippets / examples
- [ ] CI/CD pipeline

## Maybe

- [ ] [NSQL](https://motherduck.com/blog/duckdb-text2sql-llm/) integration for natural language queries.
- [ ] Co-pilot (or similar) integration for code suggestions.

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

## Disclaimer

This project is not in any way affiliated with DuckDB or any of the other projects mentioned above.

## Tips

- Built in chrome OPFS viewer can be accessed from <https://www.quackdb.com/temporary>. To navigate, manually change the URL to the desired path as Chrome does not allow navigation by clicking on the links.

## Known Issues

- Safari will not be fully supported until this [bug](https://bugs.webkit.org/show_bug.cgi?id=256712#c0) is fixed (serializing file handles is not supported in Safari).
