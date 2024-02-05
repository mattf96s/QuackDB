import type { Table, TypeMap } from "@apache-arrow/esnext-esm";
import { type AsyncDuckDB, DuckDBDataProtocol } from "@duckdb/duckdb-wasm";
import { makeDB } from "@/lib/modules/duckdb";

type DuckDBInstanceOptions = {
  noCache?: boolean;
  cacheName?: string;
  cacheTimeout?: number;
};

/**
 * Singleton class for DuckDB instance.
 * This is used to share a single DuckDB instance across the app.
 * This is useful for caching and sharing datasets across components.
 *
 * @example
 * const db = DuckDBInstance.getInstance();
 */
export class DuckDBInstance {
  private static instance: DuckDBInstance;

  db: AsyncDuckDB | null = null;
  noCache: boolean = false;
  cacheName: string = "queries";
  cacheTimeout: number = 3600;

  static getInstance(): DuckDBInstance {
    if (!DuckDBInstance.instance) {
      DuckDBInstance.instance = new DuckDBInstance();
    }

    return DuckDBInstance.instance;
  }

  constructor(props?: DuckDBInstanceOptions) {
    if (props?.cacheName) this.cacheName = props.cacheName;
    if (props?.noCache) this.noCache = props.noCache;
    if (props?.cacheTimeout) this.cacheTimeout = props.cacheTimeout;
  }

  private async getDB() {
    if (this.db) {
      return this.db;
    }

    this.db = await makeDB();
    await this.db.open({
      query: { castBigIntToDouble: true, castDecimalToDouble: true },
    });

    return this.db;
  }

  async connect() {
    const db = await this.getDB();
    return db.connect();
  }

  async dispose() {
    if (this.db) {
      await this.db.terminate();
      this.db = null;
    }
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

  // // prepare query so we can cancel it on changes
  // private async prepareQuery(query: string) {
  //   const conn = await this.connect();
  //   const stmt = await conn.prepare(query);
  //   return stmt;
  // }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async query<T extends TypeMap = any>(query: string, params?: T[]) {
    const conn = await this.connect();
    try {
      let result: Table<T>;

      if (params) {
        const stmt = await conn.prepare(query);
        result = await stmt.query(...params);
      } else {
        result = await conn.query(query);
      }

      await conn.close();

      return result;
    } catch (e) {
      console.error("Error in query: ", e);
    } finally {
      await conn.close();
    }
  }

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
   * const results = await DuckDBInstance.fetchResults({ query: "SELECT * FROM sales;" });
   */
  async fetchResults({ query }: { query: string }) {
    const conn = await this.connect();
    try {
      if (!this.noCache) {
        // ensure all relevant query parameters are included in the cache key
        const cacheKey = await this.createHashKey(query);

        // check if the query results are already cached
        const queries = await caches.open(this.cacheName);
        const cached = await queries.match(cacheKey);

        if (cached && !this.noCache) {
          const response = await cached.json();
          return response;
        }
      }

      const results = await conn.query(query);

      // @ts-expect-error: depedency issue with arrowjs/esnext-esm
      const asJson = results.toArray().map((row) => row.toJSON());

      if (this.noCache) return asJson;

      // cache the results
      const data = JSON.stringify(asJson);

      const response = new Response(data, {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": `max-age=${this.cacheTimeout}`,
        },
      });

      const cacheKey = await this.createHashKey(query);
      const queries = await caches.open(this.cacheName);
      await queries.put(cacheKey, response);

      return asJson;
    } catch (e) {
      console.error("Error in fetchResults: ", e);
    } finally {
      await conn.close();
    }
  }

  toggleNoCache(newState: boolean) {
    this.noCache = newState;
  }
}
