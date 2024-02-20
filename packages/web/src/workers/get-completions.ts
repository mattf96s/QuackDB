/// <reference lib="webworker" />

import * as duckdb from "@duckdb/duckdb-wasm";
import * as Comlink from "comlink";

const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();

export const makeDB = async () => {
  // Select a bundle based on browser checks
  const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES);

  const worker_url = URL.createObjectURL(
    new Blob([`importScripts("${bundle.mainWorker!}");`], {
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
 * DuckDB in a web worker.
 * 
 * @docs [Comlink](https://github.com/GoogleChromeLabs/comlink/blob/main/docs/examples/03-classes-example/worker.js)
 * 
 * @example
  ```ts
  const MyClass = Comlink.wrap(new Worker("worker.js"));
  const instance = await new MyClass(); // don't forget the await!
  await instance.doSomething();
  ```
 */
class MyAutocompleter {
  private static instance: MyAutocompleter;

  #db: duckdb.AsyncDuckDB | undefined;

  #connPool: duckdb.AsyncDuckDBConnection[] = [];

  // singleton
  static getInstance(): MyAutocompleter {
    if (!MyAutocompleter.instance) {
      MyAutocompleter.instance = new MyAutocompleter();
    }

    return MyAutocompleter.instance;
  }

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

    return this.#db;
  }

  /**
   * Dispose of the DuckDB instance and close any remaining connections.
   * Should run in onDestroy lifecycle hook.
   */
  async dispose() {
    // close all connections
    await Promise.all(this.#connPool.map((conn) => conn.close())).catch((e) => {
      console.error("Failed to close connections in disposal: ", e);
    });
    await this.#db?.terminate().catch((e) => {
      console.error("Failed to terminate DuckDBInstance: ", e);
    });
  }

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

    await conn.query(`load sql_auto_complete;`);

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

  async getCompletions(sql: string, cancel: Promise<void>) {
    const conn = await this.#connect();
    try {
      // escape single quotes
      const cleanSQL = sql.replace(/'/g, "''");

      const prepare = await conn.prepare(
        `SELECT * FROM sql_auto_complete('${cleanSQL}')`,
      );

      const results = prepare.send();

      // will either resolve with the query results or resolve with undefined if the cancel promise resolves first.
      // if the cancel promise resolves first, we will abort the query and return an empty array.
      const response = await Promise.race([results, cancel]);

      if (!response) {
        await prepare.close();
        return [];
      }

      // @ts-expect-error: types are not correct
      const parsed = results.toArray().map((row) => row.toJSON());

      return parsed;
    } catch (error) {
      console.error("Error with autocomplete: ", error);
      return [];
    } finally {
      await this.#cleanupConnection(conn);
    }
  }

  async validateQuery(sql: string, cancel: Promise<void>) {
    const conn = await this.#connect();
    try {
      // escape single quotes
      const cleanSQL = sql.replace(/'/g, "''");

      const serializeQuery = conn.query(
        `SELECT json_serialize_sql('${cleanSQL}')`,
      );
      const cardinalityQuery = conn.query(`EXPLAIN ${cleanSQL}`);
      const tokenQuery = this.#db?.tokenize(cleanSQL);

      const combined = Promise.all([
        serializeQuery,
        cardinalityQuery,
        tokenQuery,
      ]);

      // will either resolve with the query results or resolve with undefined if the cancel promise resolves first.
      // if the cancel promise resolves first, we will abort the query and return an empty array.
      const response = await Promise.race([combined, cancel]);

      if (!response) {
        return {
          serialized: "",
          cardinality: [],
          tokens: [],
          error: "cancelled",
        };
      }

      const [serializedRes, cardinalityRes, tokensRes] = await combined;

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const tokens = tokensRes.toArray().map((row) => row.toJSON());
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const serialized = serializedRes.toArray().map((row) => row.toJSON());
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const cardinality = cardinalityRes.toArray().map((row) => row.toJSON());

      return {
        serialized,
        cardinality,
        tokens,
        error: null,
      };
    } catch (e) {
      console.error("Error with autocomplete: ", e);

      return {
        serialized: "",
        cardinality: [],
        tokens: [],
        error: e instanceof Error ? e.message : e,
      };
    } finally {
      await this.#cleanupConnection(conn);
    }
  }
}

export type GetCompletionsWorker = typeof MyAutocompleter;
Comlink.expose(MyAutocompleter);
