import type { Table, TypeMap } from "@apache-arrow/esnext-esm";
import { type AsyncDuckDB, DuckDBDataProtocol } from "@duckdb/duckdb-wasm";
import * as duckdb from "@duckdb/duckdb-wasm";
import { getArrowTableSchema } from "@/utils/arrow/helpers";
import { getCompletions } from "@/utils/duckdb/autocomplete";
import { getColumnType } from "@/utils/duckdb/helpers/getColumnType";

export const makeDB = async () => {
  // Select a bundle based on browser checks
  const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();

  // Select a bundle based on browser checks
  const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES);

  const worker_url = URL.createObjectURL(
    new Blob([`importScripts("${bundle.mainWorker}");`], {
      type: "text/javascript",
    }),
  );

  // Instantiate the asynchronus version of DuckDB-wasm
  const worker = new Worker(worker_url);
  const logger = new duckdb.ConsoleLogger(duckdb.LogLevel.ERROR);
  const db = new duckdb.AsyncDuckDB(logger, worker);
  await db.instantiate(bundle.mainModule, bundle.pthreadWorker);

  URL.revokeObjectURL(worker_url);

  return db;
};

/**
 * DuckDB automatically loads the extensions it needs based on the query.
 * However, an extension such as 'icu' needs to be specified as it changes the behavior of the database.
 *
 * We automatically load the 'icu' extension when we create a connection.
 *
 * There is no need to manually load extensions (with `LOAD` statement);
 *
 * Documentation: https://duckdb.org/docs/api/wasm/extensions#list-of-officially-available-extensions
 */
type DuckDBExtension =
  | "autocomplete"
  | "excel"
  | "fts"
  | "icu"
  | "inet"
  | "json"
  | "parquet"
  | "sqlite"
  | "sqlsmith"
  | "substrait"
  | "tpcds"
  | "tpch";

type DuckDBInstanceOptions = {
  cache?: {
    noCache?: boolean; // if true, do not cache any connections
    cacheTimeout?: number; // how long to cache the results of a query
  };
  extensions?: DuckDBExtension[]; // list of extensions to load
};

const CACHE_KEYS = {
  queries: "queries",
  files: "files",
};

/**
 * Singleton class to manage a DuckDB instance and connections.
 *
 * We should have one DuckDB database with various files / tables / views registered; and then we can create many connections to that database.
 *
 * DuckDB performance guide recommends reusing connections rather than creating new ones for each query.
 * We will use a simple connection pool.
 *  - When a query is run, we will get a connection from the pool, remove the connection from the pool, run the query, and then return the connection to the pool.
 *  - If the pool is empty, we will create a new connection.
 */
export class DuckDBInstance {
  private static instance: DuckDBInstance;

  #db: AsyncDuckDB | null = null;

  /**
   * Map of connection IDs to connections.
   * We use this to cleanup connections after they are used.
   */

  #connPool: duckdb.AsyncDuckDBConnection[] = [];

  // config

  #extensions: DuckDBExtension[] = ["icu"]; // default is to load the icu extension

  // Cache settings
  #shouldCache: boolean = true; // default is to allow caching
  #cacheTimeout: number = 60 * 60 * 1000; // default is to cache for 1 hour
  #queryCache: string = CACHE_KEYS.queries; // results from duckdb queries
  #fileCache: string = CACHE_KEYS.files; // downloaded files from S3.

  // Promise lock

  #lock: Promise<void> = Promise.resolve();

  static getInstance(): DuckDBInstance {
    if (!DuckDBInstance.instance) {
      DuckDBInstance.instance = new DuckDBInstance();
    }

    return DuckDBInstance.instance;
  }

  constructor(props?: DuckDBInstanceOptions) {
    // cache settings
    if (props?.cache) {
      const { noCache, cacheTimeout } = props.cache;
      // note: it is reversed. Otherwise, we would have to check for undefined in the constructor.
      if (noCache) {
        this.#shouldCache = false;
      }

      // allow zero to be a valid value
      if (typeof cacheTimeout === "number" && cacheTimeout >= 0) {
        this.#cacheTimeout = cacheTimeout;
      }
    }

    if (props?.extensions) {
      this.#extensions = props.extensions;
    }
  }

  // ----------- Config methods ----------------

  toggleCache(shouldCache: boolean) {
    this.#shouldCache = shouldCache;
  }

  setCacheTimeout(timeout: number) {
    this.#cacheTimeout = timeout;
  }

  // ----------- DB instance methods ----------------

  /**
   * Get the DuckDB instance.
   * Discouraged to use this method directly.
   * @returns
   */
  async _getDB() {
    if (this.#db) {
      return this.#db;
    }

    this.#db = await makeDB();
    await this.#db.open({
      query: { castBigIntToDouble: true },
    });

    return this.#db;
  }

  /**
   * Dispose of the DuckDB instance and close any remaining connections.
   * Should run in onDestroy lifecycle hook.
   */
  async dispose() {
    try {
      // close all connections
      await Promise.all(this.#connPool.map((conn) => conn.close()));
      await this.#db?.terminate();
    } catch (e) {
      console.error("Failed to dispose DuckDBInstance: ", e);
    }
  }

  // ----------- Connection methods ----------------

  /**
   * Do not re-use the same connection for multiple queries.
   * Make a new connection for each query and then make sure to cleanup using the cleanupConnection method.
   * We save the connection ID in a map to cleanup later.
   */
  async #connect() {
    // check if we can reuse a connection
    if (this.#connPool.length > 0) {
      const conn = this.#connPool.pop();
      if (conn) {
        return conn;
      }
    }

    // create a new connection
    const db = await this._getDB();
    const conn = await db.connect();

    // load ICU
    if (this.#extensions) {
      for (const extension of this.#extensions) {
        await conn.query(`LOAD ${extension};`);
      }
    }

    // set errors as JSON (not in the release yet, but will be in the next release);
    //await conn.query("SET errors_as_json = true;");

    // Note: extensions are automatically handled by DuckDB wasm; https://duckdb.org/docs/api/wasm/extensions

    // Use the connection; once done, instead of closing it, we will return it to the pool.
    return conn;
  }

  /**
   * Close the connection and remove it from the map.
   * @param conn
   */
  async #cleanupConnection(conn: duckdb.AsyncDuckDBConnection) {
    // cleanup any prepared statements
    await conn.cancelSent();

    // return the connection to the pool
    this.#connPool.push(conn);
  }

  // ------- File methods ------- //

  async registerFileHandle(fileName: string, file: File) {
    const db = await this._getDB();
    await db.registerFileHandle(
      fileName,
      file,
      DuckDBDataProtocol.BROWSER_FILEREADER,
      true,
    );
  }

  // ------- Query methods ------- //

  // // prepare query so we can cancel it on changes
  // private async prepareQuery(query: string) {
  //   const conn = await this.connect();
  //   const stmt = await conn.prepare(query);
  //   return stmt;
  // }

  /**
   * Fetch the results of a query.
   *
   * Ensure that the query is deterministic and does not depend on any external state (i.e. everything is within the query itself).
   *
   * - If the query is already cached, it will return the cached results.
   * - If the query is not cached, it will fetch the results and cache them.
   * - If `shouldCache` is set to `false`, it will not cache the results.
   * - If `timeout` is set, it will timeout after the specified time.
   *
   * @example
   * const { rows, schema } = await DuckDBInstance.fetchResults({ query: "SELECT * FROM sales;" });
   */
  async fetchResults({ query, noCache }: { query: string; noCache?: boolean }) {
    const t1 = performance.now();

    const conn = await this.#connect();

    // Allow local override of caching
    const shouldCache = this.#shouldCache && !noCache;

    try {
      if (shouldCache) {
        console.debug("Caching is enabled.");
        // ensure all relevant query parameters are included in the cache key
        const cacheKey = await this.createHashKey(query);

        // check if the query results are already cached
        const queries = await caches.open(this.#queryCache);
        const cached = await queries.match(cacheKey);

        if (cached) {
          console.debug("Cache hit");
          const response = await cached.json();
          const t2 = performance.now();
          console.debug(`Cache recall took ${t2 - t1} milliseconds.`);
          return response;
        }
      }

      const t3 = performance.now();
      const queryResults = await conn.query(query);
      const t4 = performance.now();

      console.debug(`Query took ${t4 - t3} milliseconds.`);

      const schema = getArrowTableSchema(queryResults);

      // @ts-expect-error: depedency issue with arrowjs/esnext-esm
      const rows = queryResults.toArray().map((row) => row.toJSON());

      const results = { rows, schema };

      if (!shouldCache) return results;

      // cache the results

      const t5 = performance.now();

      const response = new Response(JSON.stringify(results), {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": `max-age=${this.#cacheTimeout}`,
        },
      });

      const cacheKey = await this.createHashKey(query);
      const queries = await caches.open(this.#queryCache);
      await queries.put(cacheKey, response);

      const t6 = performance.now();
      console.debug(`Cache took ${t6 - t5} milliseconds.`);

      return results;
    } catch (e) {
      const isError = e instanceof Error;
      if (isError) {
        console.log("%c", {
          name: e.name,
          message: e.message,
          stack: e.stack,
        });
      }
      throw e;
    } finally {
      await this.#cleanupConnection(conn);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async query<T extends TypeMap = any>(query: string, params?: T[]) {
    const t1 = performance.now();

    const conn = await this.#connect();
    try {
      let result: Table<T>;

      if (params) {
        const stmt = await conn.prepare(query);
        result = await stmt.query(...params);
      } else {
        result = await conn.query(query);
      }

      const t2 = performance.now();
      console.debug(`Query took ${t2 - t1} milliseconds.`);

      return result;
    } catch (e) {
      console.error("Error in query: ", e);
      throw e;
    } finally {
      await this.#cleanupConnection(conn);
    }
  }

  async prepareQuery(query: string) {
    const conn = await this.#connect();

    // The prepared statement will be cleaned up by running stmt.close() or when the connection closes.
    // We also handle the cleanup in the cleanupConnection method.
    const stmt = await conn.prepare(query);
    return stmt;
  }

  // ------- Utility methods ------- //

  /**
   * Create a hash key for a query.
   * This is used to cache the result of a query.
   *
   * Ensure that the query is deterministic and does not depend on any external state (i.e. everything is within the query itself).
   *
   * @example
   * const cacheKey = await DuckDBInstance.createHashKey("SELECT * FROM READ_PARQUET(sales.parquet);");
   */
  async createHashKey(query: string) {
    const encoder = new TextEncoder();
    const data = encoder.encode(query);
    const hash = await crypto.subtle.digest("SHA-256", data);
    const cacheKey = `query-${new Uint8Array(hash).join("-")}`;
    return cacheKey;
  }

  // ------- Useful Query methods ------- //

  /**
   * Describe the columns of a table.
   */
  async describeTableSchema({ table }: { table: string }) {
    const conn = await this.#connect();
    try {
      type TableSchema = {
        column_name: string;
        column_type: string;
        null: "YES" | "NO";
        key: "PRI" | "NULL";
        default: string | null;
        extra: string;
      };

      const results = await conn.query<TableSchema>(`DESCRIBE ${table}`);
      // Not sure why we need to cast to TableSchema
      const columns = results.toArray() as TableSchema[];

      return columns.map(({ column_name, column_type }) => {
        return {
          name: column_name,
          type: getColumnType(column_type),
          databaseType: column_type,
        };
      });
    } catch (e) {
      console.error("Error in describeColumns: ", e);
      throw e;
    } finally {
      await this.#cleanupConnection(conn);
    }
  }

  /**
   * Autocompletions
   *
   * Source: [Harlequin](https://github.com/tconbeer/harlequin/blob/main/src/harlequin_duckdb/completions.py)
   */

  async autoCompletion({ query }: { query?: string }) {
    try {
      const completions = await getCompletions(this);
      const flattened = completions.flatMap((completion) => completion.rows);

      console.log("flattened", flattened);

      if (!query) return flattened;

      const queryLower = query.toLowerCase();
      const queryWords = queryLower.split(" ");
      const lastWord = queryWords[queryWords.length - 1];

      const filteredCompletions = flattened.filter((completion) =>
        completion.label.toLowerCase().startsWith(lastWord),
      );

      return filteredCompletions;
    } catch (e) {
      console.error("Error in autoCompletion: ", e);
      return [];
    }
  }

  /**
   * Validate a query.
   */
  async validateQuery(query: string) {
    try {
      const escapedQuery = query.replace(/'/g, "''");

      await this.fetchResults({
        query: `SELECT json_serialize_auto('${escapedQuery}');`,
      });

      return true;
    } catch (e) {
      console.error("Error in validateQuery: ", e);
      return false;
    }
  }
}
