/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  AsyncRecordBatchStreamReader,
  RecordBatch,
  StructRow,
  TypeMap,
} from "@apache-arrow/esnext-esm";
import { type AsyncDuckDB, DuckDBDataProtocol } from "@duckdb/duckdb-wasm";
import * as duckdb from "@duckdb/duckdb-wasm";
import { getArrowTableSchema, type ResultColumn } from "@/utils/arrow/helpers";
import { getCompletions } from "@/utils/duckdb/autocomplete";
import { getColumnType } from "@/utils/duckdb/helpers/getColumnType";

type MakeDBProps = {
  logLevel?: duckdb.LogLevel;
};

export const makeDB = async ({
  logLevel = duckdb.LogLevel.DEBUG,
}: MakeDBProps) => {
  // ensure we can properly dispose of the worker
  let worker_url: string | undefined;

  try {
    // Select a bundle based on browser checks
    const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();

    // Select a bundle based on browser checks
    const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES);

    worker_url = URL.createObjectURL(
      new Blob([`importScripts("${bundle.mainWorker}");`], {
        type: "text/javascript",
      }),
    );

    // Instantiate the asynchronus version of DuckDB-wasm
    const worker = new Worker(worker_url);
    const logger = new duckdb.ConsoleLogger(logLevel);
    const db = new duckdb.AsyncDuckDB(logger, worker);
    await db.instantiate(bundle.mainModule, bundle.pthreadWorker);

    URL.revokeObjectURL(worker_url);

    // https://github.com/holdenmatt/duckdb-wasm-kit/blob/1dfa5ac9b2a49254dbf0f043963f432f4fe7e593/src/init/initializeDuckDb.ts#L51C3-L62C4
    // if (config) {
    //   if (config.path) {
    //     const res = await fetch(config.path);
    //     const buffer = await res.arrayBuffer();
    //     const fileNameMatch = config.path.match(/[^/]*$/);
    //     if (fileNameMatch) {
    //       config.path = fileNameMatch[0];
    //     }
    //     await db.registerFileBuffer(config.path, new Uint8Array(buffer));
    //   }
    //   await db.open(config);
    // }

    // #TODO: add adjustable config as props
    await db.open({
      query: { castBigIntToDouble: true },
    });

    return db;
  } catch (e) {
    console.error("Failed to create DuckDB instance: ", e);
    throw e;
  } finally {
    if (worker_url) {
      URL.revokeObjectURL(worker_url);
    }
  }
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

type LocalFileSource = {
  kind: "LOCAL_FILE";
  name: string;
  handle: FileSystemFileHandle; // cheaper than storing the file itself
};

type RemoteSource = {
  kind: "REMOTE";
  name: string;
  url: string;
};

type DataSource = LocalFileSource | RemoteSource;

type DuckDBInstanceOptions = {
  session?: string;
  cache?: {
    noCache?: boolean; // if true, do not cache any connections
    cacheTimeout?: number; // how long to cache the results of a query
  };
  logLevel?: duckdb.LogLevel; // log level for DuckDB internally (default is ERROR)
  extensions?: DuckDBExtension[]; // list of extensions to load
};

const CACHE_KEYS = {
  queries: "queries",
  files: "files",
};

export type FetchResultsReturn = {
  rows: Record<string, unknown>[];
  schema: ResultColumn[];
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

  #session: string | null = null; // should only be set once. If it changes, we should reset the DuckDB instance.
  #db: AsyncDuckDB | null = null;

  /**
   * Map of connection IDs to connections.
   * We use this to cleanup connections after they are used.
   */

  #connPool: duckdb.AsyncDuckDBConnection[] = [];

  // config

  // sources
  #sources: DataSource[] = [];

  #logLevel: duckdb.LogLevel = duckdb.LogLevel.ERROR;
  #extensions: DuckDBExtension[] = ["icu"]; // default is to load the icu extension

  // Cache settings
  #shouldCache: boolean = true; // default is to allow caching
  #cacheTimeout: number = 60 * 60 * 1000; // default is to cache for 1 hour
  #queryCache: string = CACHE_KEYS.queries; // results from duckdb queries
  #fileCache: string = CACHE_KEYS.files; // downloaded files from S3.

  static getInstance(): DuckDBInstance {
    if (!DuckDBInstance.instance) {
      DuckDBInstance.instance = new DuckDBInstance();
    }

    return DuckDBInstance.instance;
  }

  constructor(props?: DuckDBInstanceOptions) {
    if (props?.session) {
      this.#session = props.session;
    }
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

    if (props?.logLevel) {
      this.#logLevel = props.logLevel;
    }
  }

  // ----------- Config methods ----------------

  toggleCache(shouldCache: boolean) {
    this.#shouldCache = shouldCache;
  }

  clearQueryCache() {
    return caches.delete(this.#queryCache);
  }

  clearFileCache() {
    return caches.delete(this.#fileCache);
  }

  // replace with Valtio
  getConfig() {
    return {
      shouldCache: this.#shouldCache,
      cacheTimeout: this.#cacheTimeout,
      extensions: this.#extensions,
    };
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
  async _getDB(): Promise<AsyncDuckDB> {
    if (this.#db) return this.#db;

    // I think it'll assign the value to this.#db immediately ensuring another call to this method will not create a new instance.
    // Alternatively, we could use a promise to ensure that the instance is only created once.
    this.#db = await makeDB({
      logLevel: this.#logLevel,
    });

    return this.#db;
  }

  /**
   * Dispose of the DuckDB instance and close any remaining connections.
   * Should run in onDestroy lifecycle hook.
   */
  async dispose() {
    console.log("Disposing DuckDBInstance");

    type RejectedConn = {
      status: "rejected";
      value: duckdb.AsyncDuckDBConnection;
      reason: Error;
    };

    const closeFuncPromise = (conn: duckdb.AsyncDuckDBConnection) => {
      return new Promise<RejectedConn | void>((resolve, reject) => {
        conn
          .close()
          .then(() => void resolve())
          .catch((e) =>
            reject({
              status: "rejected",
              value: conn,
              reason: e,
            }),
          );
      });
    };

    // Cleanup any other resources.
    // See https://jakearchibald.com/2023/unhandled-rejections/ on unhandled promise rejections (we should handle them).

    const connPromises = await Promise.allSettled(
      this.#connPool.map((conn) => closeFuncPromise(conn)),
    );

    const newConnPool: duckdb.AsyncDuckDBConnection[] = [];

    for await (const promise of connPromises) {
      if (promise.status === "fulfilled") continue;

      if (promise.status === "rejected") {
        console.error(
          "Failed to close connection in disposal: ",
          promise.reason,
        );
      }
    }

    // clear files and caches

    const queryCache = caches
      .delete(this.#queryCache)
      .catch((e) =>
        console.error("Failed to delete query cache in disposal: ", e),
      );
    const fileCache = caches
      .delete(this.#fileCache)
      .catch((e) =>
        console.error("Failed to delete file cache in disposal: ", e),
      );

    await Promise.all([queryCache, fileCache]);

    if (this.#db) {
      (await this.#db)
        .terminate()
        .catch((e) => console.error("Failed to terminate DuckDBInstance: ", e));
    }

    this.#db = null;
    this.#session = null;

    // clear caches
  }

  /**
   * Reset the DuckDB instance but keep the database open and the session.
   */

  async reset() {
    // close all connections
    await Promise.all(this.#connPool.map((conn) => conn.close())).catch((e) => {
      console.error("Failed to close connections on reset: ", e);
    });
    await this.#db?.dropFiles().catch((e) => {
      console.error("Failed to drop files on reset: ", e);
    });
    await this.#db?.reset().catch((e) => {
      console.error("Failed to reset DuckDBInstance: ", e);
    });
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

    // load ICU (DuckDB wasm has limited plugins compared to other distributions.)
    if (this.#extensions) {
      for (const extension of this.#extensions) {
        await conn.query(`LOAD ${extension};`);
      }
    }

    // set errors as JSON (not in the release yet, but will be in the next release);
    // await conn.query("SET errors_as_json = true;");

    // Note: extensions are automatically handled by DuckDB wasm; https://duckdb.org/docs/api/wasm/extensions

    // Use the connection; once done, instead of closing it, we will return it to the pool.
    return conn;
  }

  /**
   * Cancel any pending queries and add back to the connection pool.
   *
   * Don't close the connection as it will be reused.
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
    await db.dropFile(fileName).catch((e) => {
      console.error("Failed to drop file: ", e);
    });
    await db.registerFileHandle(
      fileName,
      file,
      DuckDBDataProtocol.BROWSER_FILEREADER,
      true,
    );
  }

  // ------- Query methods ------- //

  /**
   * Query a stream.
   *
   * @source [Excalichart](https://github.com/excalichart/excalichart/blob/c47a3665af936cb1bb33a8c91df098beb8060308/src/lib/io/DuckDBClient.ts#L20C2-L53C3)
   * @source [Observable stdlib](https://github.com/observablehq/stdlib/blob/main/src/duckdb.js)
   */
  public async queryStream<T extends TypeMap = any>(
    query: string,
    params?: Array<unknown>,
  ) {
    // #TODO: see if we can reuse connections as in the async generator we don't have access to parent this context.
    const connection = await this.#connect();

    const cleanup = this.#cleanupConnection.bind(this, connection);

    let reader: AsyncRecordBatchStreamReader<T>;
    let batch: IteratorResult<RecordBatch<T>, any>;
    try {
      if (params && params.length > 0) {
        const statement = await connection.prepare(query);
        reader = await statement.send(...params);
      } else {
        reader = await connection.send(query);
      }
      batch = await reader.next();
      if (batch.done) throw new Error("missing first batch");
    } catch (error) {
      await this.#cleanupConnection(connection);
      throw error;
    }
    return {
      schema: getArrowTableSchema(batch.value),
      async *readRows() {
        try {
          while (!batch.done) {
            yield batch.value.toArray();
            batch = await reader.next();
          }
        } finally {
          // todo: check this works.
          await cleanup();
        }
      },
    };
  }

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
  async fetchResults({
    query,
    noCache,
  }: {
    query: string;
    noCache?: boolean;
  }): Promise<FetchResultsReturn> {
    const conn = await this.#connect();

    // Allow local override of caching
    const shouldCache = this.#shouldCache && !noCache;

    try {
      if (shouldCache) {
        // ensure all relevant query parameters are included in the cache key
        const cacheKey = await this.createHashKey(query);

        // check if the query results are already cached
        const queries = await caches.open(this.#queryCache);
        const cached = await queries.match(cacheKey);

        if (cached) {
          // check if response header is expired
          const cacheControl = cached.headers.get("Cache-Control");

          const allHeaders = [...cached.headers.entries()];

          console.log("cacheControl: ", cacheControl);
          console.log("cached.headers: ", allHeaders);
          console.log("response url", {
            url: cached.url,
            status: cached.status,
            statusText: cached.statusText,
            type: cached.type,
          });

          // if (cacheControl) {
          //   try {

          //   const maxAge = cacheControl.split("=")[1];

          //   const maxAgeInt = parseInt(maxAge, 10);
          //   if (maxAgeInt && maxAgeInt > 0) {
          //     const now = new Date();
          //     const cacheDate = new Date(cached.headers.get("Date") || now);
          //     const expiration = new Date(cacheDate.getTime() + maxAgeInt * 1000);
          //     if (expiration > now) {
          //       const response = await cached.json();
          //       return response;
          //     }
          //   }
          // } catch (error) {
          //   console.error("Error in cacheControl: ", error);
          // }
          // }

          const response = await cached.json();
          return response;
        }
      }

      // check cardinality incase the query is too large
      try {
        const cleanSQL = query.replace(/'/g, "''"); // escape single quotes
        const explain = await conn.query(
          `SELECT json_serialize_sql('${cleanSQL}', format:= true);`,
        );

        // @ts-expect-error: depedency issue with arrowjs/esnext-esm
        const asJson = explain.toArray().map((row) => row.toJSON()) as Record<
          string,
          string
        >[];
        const firstRow = asJson[0];
        const value = firstRow ? Object.values(firstRow)[0] : null;

        if (value) {
          const parsed = JSON.parse(value);
          console.log("parsed: ", parsed);
          // const cardinality = parsed?.cardinality;
          // if(cardinality && cardinality > 100000){
          //   throw new Error("Query is too large to run in the browser. Please run in a local environment.");
          // }
        }
      } catch (e) {
        console.error("Error in explain: ", e);
      }

      const queryResults = await conn.query(query);

      //  https://github.com/evidence-dev/evidence/blob/5603970a6c99acf00b9f04deaea5890766a08908/packages/duckdb/index.cjs#L139C3-L157C6

      // const count_query = `WITH root as (${cleanQuery(queryString)}) SELECT COUNT(*) FROM root`;
      // const expected_count = await db.all(count_query).catch(() => null);
      // const expected_row_count = expected_count?.[0]["count_star()"];

      // const column_query = `DESCRIBE ${cleanQuery(queryString)}`;
      // const column_types = await db
      //   .all(column_query)
      //   .then(duckdbDescribeToEvidenceType)
      //   .catch(() => null);

      // const results = await asyncIterableToBatchedAsyncGenerator(
      //   stream,
      //   batchSize,
      //   {
      //     mapResultsToEvidenceColumnTypes:
      //       column_types == null ? mapResultsToEvidenceColumnTypes : undefined,
      //     standardizeRow,
      //     closeConnection: () => db.close(),
      //   },
      // );

      const schema = getArrowTableSchema(queryResults);

      // @ts-expect-error: depedency issue with arrowjs/esnext-esm
      const rows = queryResults.toArray().map((row) => row.toJSON()) as Record<
        string,
        unknown
      >[];

      const results = { rows, schema };

      if (!shouldCache) return results;

      // cache the results

      const headers = new Headers();
      headers.append("Content-Type", "application/json");
      headers.append("Cache-Control", `private,max-age=${this.#cacheTimeout}`);

      const response = new Response(JSON.stringify(results), {
        status: 200,
        statusText: "OK",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": `private,max-age=${this.#cacheTimeout}`,
        },
      });

      const cacheKey = await this.createHashKey(query);
      const queries = await caches.open(this.#queryCache);
      await queries.put(cacheKey, response);

      const t6 = performance.now();

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
    const key = `Query ${query}`;
    console.time(key);

    const conn = await this.#connect();
    try {
      const result = await this.queryStream(query, params);
      const results: StructRow[] = [];

      for await (const rows of result.readRows()) {
        for (const row of rows) {
          results.push(row);
        }
      }

      // @ts-expect-error: #TODO: not sure which arrow type to use.
      results.schema = result.schema;

      console.timeEnd(key);

      return results;
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

      if (!query) return flattened;

      const queryLower = query.toLowerCase();
      const queryWords = queryLower.split(" ");
      const lastWord = queryWords[queryWords.length - 1];

      const filteredCompletions = flattened.filter((completion) =>
        // @ts-expect-error: #TODO: fix this
        completion?.label.toLowerCase().startsWith(lastWord),
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
