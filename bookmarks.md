# Bookmarks for ideas

## Code Patterns

- [VsCode Async](https://github.com/microsoft/vscode/blob/main/src/vs/base/common/async.ts#L24)
  - phenomenal async patterns

## Interesting Projects

- [web worker LSP](https://gitlab.com/aedge/codemirror-web-workers-lsp-demo/-/blob/master/src/lib/_transport.ts)
- [Malloy DuckDB Implementation](https://github.com/malloydata/malloy/blob/main/packages/malloy-db-duckdb/src/duckdb_common.ts)
- [Malloy VsCode Extension](https://github.com/malloydata/malloy-vscode-extension/tree/main)
  - codebase is phenomenal
  - webworker implementation is great
- [wa-sqlite](https://github.com/rhashimoto/wa-sqlite/blob/master/demo/demo-worker.js)
  - codebase is phenomenal
  - Comlink patterns
  - [WebLocks](https://github.com/rhashimoto/wa-sqlite/blob/master/src/examples/IDBBatchAtomicVFS.js) and [here](https://github.com/rhashimoto/preview/blob/master/src/examples/OriginPrivateVFS.js)
  - [OPFS](https://github.com/rhashimoto/wa-sqlite/blob/master/src/examples/OriginPrivateFileSystemVFS.js) and [here](https://github.com/rhashimoto/wa-sqlite/blob/master/src/examples/AccessHandlePoolVFS.js)
- [SQL-syncworker](https://github.com/orbitinghail/sqlsync/blob/main/lib/sqlsync-worker/src/worker.ts)
- [QueryBook (Pinterest)](https://github.com/pinterest/querybook)
  - [ai SQL generation](https://github.com/pinterest/querybook/blob/master/querybook/webapp/components/AIAssistant/QueryGenerationModal.tsx)
  - [Useful UI](https://github.com/pinterest/querybook/blob/master/querybook/webapp/components/DataDocQueryCell/DataDocQueryCell.tsx)
  - [SQL Lexer](https://github.com/pinterest/querybook/blob/master/querybook/webapp/lib/sql-helper/sql-lexer.ts)
- [SQL Mesh](https://github.com/TobikoData/sqlmesh)
  - v interesting
  - [Python formatting with SQLGlot](https://github.com/TobikoData/sqlmesh/blob/main/web/client/src/workers/sqlglot/sqlglot.ts)
  - [Code editor](https://github.com/TobikoData/sqlmesh/blob/main/web/client/src/library/components/editor/EditorCode.tsx)
- [SQLTutor](https://github.com/cudbg/sqltutor/blob/3f4ffb727a76332a13e8872bf017c8fd33d23344/src/App.svelte#L194)
- [WebAssemblyStudio](https://github.com/wasdk/WebAssemblyStudio/blob/master/src/components/editor/Editor.tsx)
  - Monaco implementation

## Monaco Editor References

- [vscode extension samples](https://github.com/microsoft/vscode-extension-samples)
  - [Drop on document](https://github.com/microsoft/vscode-extension-samples/blob/main/drop-on-document/src/extension.ts)
  - [Inline completions](https://github.com/microsoft/vscode-extension-samples/blob/main/inline-completions/src/extension.ts)
  - [Semantic tokens](https://github.com/microsoft/vscode-extension-samples/tree/main/semantic-tokens-sample)
    - can use serialize_auto_json in DuckDB to get semantic tokens.xw

## Autocompletion

- [SQL Autocompletion](https://github.com/L1atte/vanilla-monaco-with-lsp-dap/blob/sql/src/Worker/generateSuggestion.ts)
  - nice implementation
- [odc parser](https://github.com/oceanbase/odc-parser-js/blob/main/packages/monaco-plugin-ob/src/obmysql/monarch/obmysql.ts)
  - really good reference for SQL autocompletion
- [Hive Autocompletion](https://github.com/liuwenzhuang/monaco-hive-editor/blob/main/packages/hive-editor/src/CompletionItemAdapter.ts)
  - older but has some good ideas
- [AQL Monaco Syntax Highlighter](https://codesandbox.io/p/devbox/github/JohannesOehm/aql-monaco-editor/tree/master/)
  - Instead of using Monarch, it uses monaco.languages.setTokensProvider() and some mapping between the ANTLR token names and the monaco default token names to highlight the syntax.
- [GCode](https://github.com/appliedengdesign/vscode-gcode-syntax/blob/master/src/hovers/gcodeHoverControl.ts)
- [SQL Autocompletion](https://github.com/L1atte/vanilla-monaco-with-lsp-dap/blob/sql/src/AutoCompletion/AutoComplete.ts)
- [ThanoSQL](https://github.com/smartmind-team/thanosql-editor/blob/main/src/thanosql/config.ts)
  - has syntax
- [Grafana](https://github.com/grafana/grafana/blob/main/packages/grafana-ui/src/components/Monaco/suggestions.ts)
- [SQLPad](https://github.com/DiscoverForever/monaco-sqlpad/blob/master/src/core/snippets.js)

  - snippet ideas

- [Diagnostics](https://stackoverflow.com/questions/76792125/set-up-listeners-when-a-model-is-created-or-disposed-for-monaco-editor-react)

## Other DuckDB Projects

- [Harlequin](https://github.com/tconbeer/harlequin)
- [DuckDB Wasm Kit](https://github.com/holdenmatt/duckdb-wasm-kit/blob/main/src/files/exportFile.ts)
  - useful utilities

## Utilities

- [SQLFluff](https://github.com/sqlfluff/sqlfluff/blob/main/src/sqlfluff/dialects/dialect_duckdb.py)
- [SQLParser-rs](https://github.com/search?q=duckdb+grammar&type=code&p=1#:~:text=1%20more%20match-,sqlparser%2Drs/sqlparser%2Drs,-%C2%B7%C2%A0src/dialect)

## LLM

- [Langium](https://langium.org/tutorials/langium_and_monaco/)

## Unexplored Projects (need to look at)

- [ducklab](https://github.com/HassaanAkbar/ducklab/blob/main/src/core/data/duckdb_wasm/DuckdbDataSource.ts)
- [duckling](https://github.com/l1xnan/duckling/blob/main/src/languages/duckdb/duckdb.ts)
  - has seemingly custom syntax highlighting

const row = arrow.get(rowIndex);
