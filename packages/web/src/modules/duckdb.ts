import type { Table, TypeMap } from "@apache-arrow/esnext-esm";
import {
  AsyncDuckDB,
  type AsyncDuckDBConnection,
  ConsoleLogger,
  DuckDBDataProtocol,
  getJsDelivrBundles,
  LogLevel,
  selectBundle,
} from "@duckdb/duckdb-wasm";

/**
 * Turn SQL query into a hash key.
 * Used to cache query results.
 */
const createHashKey = async (query: string) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(query);
  const hash = await crypto.subtle.digest("SHA-256", data);
  const cacheKey = `query-${new Uint8Array(hash).join("-")}`;
  return cacheKey;
};

/**
 * Initialize the DuckDB database.
 * @returns
 */
const initDB = async () => {
  // Select a bundle based on browser checks
  const JSDELIVR_BUNDLES = getJsDelivrBundles();

  // Select a bundle based on browser checks
  const bundle = await selectBundle(JSDELIVR_BUNDLES);

  const worker_url = URL.createObjectURL(
    new Blob([`importScripts("${bundle.mainWorker}");`], {
      type: "text/javascript",
    }),
  );

  // Instantiate the asynchronus version of DuckDB-wasm
  const worker = new Worker(worker_url);
  const logger = new ConsoleLogger(LogLevel.ERROR);
  const db = new AsyncDuckDB(logger, worker);
  await db.instantiate(bundle.mainModule, bundle.pthreadWorker);

  URL.revokeObjectURL(worker_url);

  return db;
};

class DuckDBInstance {
  private static instance: DuckDBInstance;

  db: AsyncDuckDB | null = null;
  conn: AsyncDuckDBConnection | null = null;

  static getInstance(): DuckDBInstance {
    if (!DuckDBInstance.instance) {
      DuckDBInstance.instance = new DuckDBInstance();
    }

    return DuckDBInstance.instance;
  }

  constructor() {}

  private async getDB() {
    if (this.db) {
      return this.db;
    }

    this.db = await initDB();
    await this.db.open({
      query: { castBigIntToDouble: true, castDecimalToDouble: true },
    });

    return this.db;
  }

  async connect() {
    if (this.conn) {
      return this.conn;
    }

    const db = await this.getDB();
    this.conn = await db.connect();
    return this.conn;
  }

  async registerFileHandle(fileName: string, file: File) {
    const db = await this.getDB();
    await db.registerFileHandle(
      fileName,
      file,
      DuckDBDataProtocol.BROWSER_FILEREADER,
      true,
    );
  }

  // prepare query so we can cancel it on changes
  private async prepareQuery(query: string) {
    const conn = await this.connect();
    const stmt = await conn.prepare(query);
    return stmt;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async query<T extends TypeMap = any>(query: string, params?: T[]) {
    const conn = await this.connect();

    let result: Table<T>;

    if (params) {
      const stmt = await conn.prepare(query);
      result = await stmt.query(...params);
    } else {
      result = await conn.query(query);
    }

    return result;
  }
}

type FetchDataProps = {
  query: string;
  shouldCache?: boolean;
  timeout?: number;
};

const queryCacheBucket = "query-cache";

/**
 * Fetch data from DuckDB.
 * Caches the results in the browser.
 */
const fetchData =
  (conn: AsyncDuckDBConnection) =>
  async ({ query, shouldCache = true, timeout = 30000 }: FetchDataProps) => {
    if (shouldCache) {
      // ensure all relevant query parameters are included in the cache key
      const cacheKey = await createHashKey(query);

      // check if the query results are already cached
      const queries = await caches.open(queryCacheBucket);
      const cached = await queries.match(cacheKey);

      if (cached) {
        const data = await cached.json();
        return data;
      }
    }

    // timeout error
    class TimeoutError extends Error {
      constructor(message: string) {
        super(message);
        this.name = "TimeoutError";
      }
    }

    // use Promise.race to cancel the query if it takes too long
    const timeoutP = new Promise((reject) => {
      setTimeout(() => {
        reject(new TimeoutError("Query timed out"));
      }, timeout);
    });

    const [results] = await Promise.all([conn.query(query), timeoutP]);

    if (!results) {
      throw new Error("Query failed");
    }

    // can't see how it won't be an Arrow Table...
    const asJson = (results as Table).toArray().map((row) => row.toJSON());

    if (!shouldCache) {
      return asJson;
    }

    // cache the results

    try {
      const data = JSON.stringify(asJson);
      const response = new Response(data, {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "max-age=3600",
        },
      });

      const cacheKey = await createHashKey(query);

      // check if the query results are already cached
      const queries = await caches.open(queryCacheBucket);
      await queries.put(cacheKey, response);
    } catch (e) {
      // non fatal error
      console.error("Failed to cache query results", e);
    }

    return asJson;
  };
