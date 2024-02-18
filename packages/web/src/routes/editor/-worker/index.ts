/// <reference lib="webworker" />
import type { AsyncDuckDB, AsyncDuckDBConnection } from "@duckdb/duckdb-wasm";
import * as duckdb from "@duckdb/duckdb-wasm";
import eh_worker from "@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url";
import mvp_worker from "@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url";
import duckdb_wasm_eh from "@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url";
import duckdb_wasm from "@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url";
import { expose } from "comlink";

// import { type Range } from "monaco-editor";

const MANUAL_BUNDLES: duckdb.DuckDBBundles = {
  mvp: {
    mainModule: duckdb_wasm,
    mainWorker: mvp_worker,
  },
  eh: {
    mainModule: duckdb_wasm_eh,
    mainWorker: eh_worker,
  },
  coi: {
    mainModule: duckdb_wasm,
    mainWorker: mvp_worker,
    pthreadWorker: eh_worker,
  },
};

async function makeDB() {
  const bundle = await duckdb.selectBundle(MANUAL_BUNDLES);
  // Instantiate the asynchronus version of DuckDB-wasm
  const worker = new Worker(bundle.mainWorker!);
  const logger = new duckdb.ConsoleLogger();
  const db = new duckdb.AsyncDuckDB(logger, worker);
  await db.instantiate(bundle.mainModule, bundle.pthreadWorker);

  await db.open({
    query: { castBigIntToDouble: true },
  });

  return db;
}

type Suggestion = {
  label: string;
  kind: 18; //languages.CompletionItemKind;
  insertText: string;
  range: Range;
};

// type SuggestionResponse = {
//   suggestions: Suggestion[];
//   query: string;
// };

// class DuckDBWorker {
//   private static instance: DuckDBWorker;

//   #db: AsyncDuckDB | null = null;
//   #conn: AsyncDuckDBConnection | null = null; // only need one connection.
//   #stmt: duckdb.AsyncPreparedStatement | null = null; // cancel the current query if a new one is started.
//   #cache: Map<string, SuggestionResponse> = new Map(); // cache the results (we expect a small result response; so it's okay to cache in memory rather than caches API).
//   #cancelToken: AbortSignal;

//   // singleton
//   static getInstance(): DuckDBWorker {
//     if (!DuckDBWorker.instance) {
//       DuckDBWorker.instance = new DuckDBWorker();
//     }

//     return DuckDBWorker.instance;
//   }

//   constructor(private cancelToken: AbortSignal = new AbortController().signal) {
//     this.#cancelToken = cancelToken;
//   }

//   async #getDB(): Promise<AsyncDuckDB> {
//     if (this.#db) return this.#db;

//     // I think it'll assign the value to this.#db immediately ensuring another call to this method will not create a new instance.
//     // Alternatively, we could use a promise to ensure that the instance is only created once.
//     this.#db = await makeDB();

//     return this.#db;
//   }

//   async #connect() {
//     if (this.#conn) return this.#conn;

//     const db = await this.#getDB();
//     this.#conn = await db.connect();
//     await this.#conn.query("LOAD autocomplete;");

//     return this.#conn;
//   }

//   /**
//    * Only one prepared statement is needed for the lifetime of the worker.
//    * We then use the statement to execute the query.
//    */
//   async #getStatement() {
//     if (this.#stmt) return this.#stmt;

//     const conn = await this.#connect();
//     this.#stmt = await conn.prepare("SELECT * FROM sql_auto_complete('$1')");

//     return this.#stmt;
//   }

//   async dispose() {
//     await this.#conn?.close(); // will also close the statement
//     await this.#db?.terminate();
//   }

//   // abortable from client
//   async *generateSuggestion(value: string, range: Range) {
//     const sql = this.#cleanQuery(value);
//     const stmt = await this.#getStatement();

//     for await (const suggestion of await stmt.send(sql)) {
//       yield {
//         label: suggestion[0],
//         kind: languages.CompletionItemKind.Text,
//         insertText: suggestion[0],
//         range: range,
//       };
//     }
//   }

//   async getSuggestions(query: string, range: Range) {
//     const hash = await this.#hashQuery(query);
//     const cached = this.#cache.get(hash);
//     if (cached) return cached;

//     const stmt = await this.#getStatement();
//     const suggestions: Suggestion[] = [];

//     // allow for cancelation

//     const iterator = await stmt.send(query);

//     while (!this.#cancelToken.aborted) {
//       const { value, done } = await iterator.next();
//       if (done) break;
//       suggestions.push({
//         label: value[0],
//         kind: languages.CompletionItemKind.Text,
//         insertText: value[0],
//         range: range,
//       });
//     }

//     const response = { suggestions, query };
//     this.#cache.set(hash, response);

//     return response;
//   }

//   // utilities

//   #cleanQuery(string: string) {
//     const cleanQuery = string.split(";")[0];
//     if (!cleanQuery) return null;
//     // escape single quotes
//     return cleanQuery.replaceAll(/'/g, "''");
//   }

//   async #hashQuery(query: string) {
//     const utf8 = new TextEncoder().encode(query);
//     const hashBuffer = await crypto.subtle.digest("SHA-256", utf8);
//     const hashArray = Array.from(new Uint8Array(hashBuffer));
//     const hashHex = hashArray
//       .map((bytes) => bytes.toString(16).padStart(2, "0"))
//       .join("");
//     return hashHex;
//   }
// }

async function completer(query: string, range: Range) {
  console.log("syncComplete", { query, range });

  let db: AsyncDuckDB | undefined;
  let conn: AsyncDuckDBConnection | undefined;
  try {
    db = await makeDB();

    conn = await db.connect();
    const parts = query.split(";")[0];
    if (!parts || parts?.length === 0) return [];

    const cleanSql = parts.replaceAll(/'/g, "''");

    const results = await conn.query(
      `SELECT * FROM sql_auto_complete('${cleanSql}') limit 100;`,
    );

    // @ts-expect-error: types are not correct
    const toArray = results.toArray().map((row) => row.toJSON());

    console.log("toArray", toArray);

    const suggestions: Suggestion[] = [];

    for await (const { suggestion, suggestion_start } of toArray) {
      suggestions.push({
        label: suggestion,
        kind: 18,
        insertText: suggestion,
        range: range,
      });
    }

    return suggestions;
  } catch (e) {
    console.error("DuckDB worker failed: ", e);
    await conn?.close();
    await db?.terminate();
    return [];
  }
}

export type AutocompleterWorker = typeof completer;
expose(completer);
