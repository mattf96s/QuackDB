# Bookmarks of ideas / inspiration

## Code Patterns

- [VsCode Async](https://github.com/microsoft/vscode/blob/main/src/vs/base/common/async.ts#L24)
  - phenomenal async patterns
- [React useSyncExternalStore](https://github.com/jacob-ebey/remix-electron-llamafile/blob/main/app/stores/latest-messages.ts)
  - first proper usage of i've seen. Might be useful for syncing with web workers.

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
- [PRQL](https://github.com/PRQL/prql/blob/main/web/playground/src/workbench/Workbench.jsx)

## Other DuckDB Projects

- [Harlequin](https://github.com/tconbeer/harlequin)
- [DuckDB Wasm Kit](https://github.com/holdenmatt/duckdb-wasm-kit/blob/main/src/files/exportFile.ts)
  - useful utilities
- [Falcon vis](https://github.com/cmudig/falcon-vis/blob/main/falcon-vis/src/db/arrow.ts)

## Other bookmarks I made a long time ago

- [Harlequin](https://github.com/tconbeer/harlequin/blob/main/src/harlequin/autocomplete/completion.py)
- <https://explain.dalibo.com/>
- [Windmill](https://github.com/windmill-labs/windmill/blob/main/frontend/src/lib/components/Editor.svelte)
- [Supbase Monaco Editor](https://github.com/supabase/supabase/blob/master/apps/studio/components/interfaces/SQLEditor/SQLEditor.tsx)
- [Pyodid](https://github.com/cudbg/sqltutor/blob/main/src/pyodide.ts)
  - run python typechecker in webworker
  - [e.g.](https://github.com/xhluca/react-pyodide-template/blob/main/src/App.js)
  - [Vite](https://github.com/vitejs/vite/discussions/12052)

## Utilities

- [SQLFluff](https://github.com/sqlfluff/sqlfluff/blob/main/src/sqlfluff/dialects/dialect_duckdb.py)
- [SQLParser-rs](https://github.com/search?q=duckdb+grammar&type=code&p=1#:~:text=1%20more%20match-,sqlparser%2Drs/sqlparser%2Drs,-%C2%B7%C2%A0src/dialect)
- [Delta sharing browser](https://github.com/stikkireddy/delta-sharing-browser/blob/main/src/components/store/SqlStore.tsx)
  - haven't looked too closely but interesting
  - [completion](https://github.com/stikkireddy/delta-sharing-browser/blob/main/src/components/sql-editor/CodeEditor.tsx)

## LLM

- [Langium](https://langium.org/tutorials/langium_and_monaco/)

## Unexplored Projects (need to look at)

- [Huey](https://github.com/rpbouman/huey)
- [ducklab](https://github.com/HassaanAkbar/ducklab/blob/main/src/core/data/duckdb_wasm/DuckdbDataSource.ts)
- [duckling](https://github.com/l1xnan/duckling/blob/main/src/languages/duckdb/duckdb.ts)
  - has seemingly custom syntax highlighting
- [CasualBI](https://github.com/copypastedeveloper/CasualBI/blob/main/casual.BI.ui/src/duckDb/useDuckDb.tsx)
- [react-duckdb-table](https://github.com/shaunstoltz/duckdb-wasm/tree/master/packages/react-duckdb-table/src)
- [pyodide](https://github.com/letterfowl/Platyrhynchos/blob/main/app/src/index.js)
- [SimpleDB](https://github.com/nshiab/simple-data-analysis/blob/main/src/class/SimpleDB.ts)

## Useful snippets

Get a row from an arrow table

```ts
const row = arrow.get(rowIndex);
```

[Streaming implementation](https://github.com/runoshun/kysely-duckdb/blob/main/src/driver-wasm.ts)

- I don't fully understand the implementation--> something to look into.

```ts
class DuckDBConnection implements DatabaseConnection {
  readonly #conn: duckdb.AsyncDuckDBConnection;

  constructor(conn: duckdb.AsyncDuckDBConnection) {
    this.#conn = conn;
  }

  async executeQuery<O>(compiledQuery: CompiledQuery): Promise<QueryResult<O>> {
    const { sql, parameters } = compiledQuery;
    const stmt = await this.#conn.prepare(sql);

    const result = await stmt.query(...parameters);
    return this.formatToResult(result, sql);
  }

  async *streamQuery<R>(
    compiledQuery: CompiledQuery
  ): AsyncIterableIterator<QueryResult<R>> {
    const { sql, parameters } = compiledQuery;
    const stmt = await this.#conn.prepare(sql);

    const iter = await stmt.send(...parameters);
    const self = this;

    const gen = async function* () {
      for await (const result of iter) {
        yield self.formatToResult(result, sql);
      }
    };
    return gen();
  }

  private formatToResult<O>(
    result: arrow.Table | arrow.RecordBatch,
    sql: string
  ): QueryResult<O> {
    const isSelect =
      result.schema.fields.length == 1 &&
      result.schema.fields[0].name == "Count" &&
      result.numRows == 1 &&
      sql.toLowerCase().includes("select");

    if (isSelect) {
      return { rows: result.toArray() as O[] };
    } else {
      const row = result.get(0);
      const numAffectedRows = row == null ? undefined : BigInt(row["Count"]);

      return {
        numUpdatedOrDeletedRows: numAffectedRows,
        numAffectedRows,
        insertId: undefined,
        rows: [],
      };
    }
  }

  async disconnect(): Promise<void> {
    return this.#conn.close();
  }
}
```
