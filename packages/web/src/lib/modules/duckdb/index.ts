import * as duckdb from "@duckdb/duckdb-wasm";

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

export function getMimeType(file: File) {
  const { type } = file;
  if (type) {
    return type;
  }

  const { name } = file;
  const ext = name.split(".").pop();
  if (!ext) {
    return null;
  }

  switch (ext) {
    case "parquet": {
      return "application/parquet";
    }
    case "csv": {
      return "text/csv";
    }
    case "json": {
      return "application/json";
    }
    default: {
      return null;
    }
  }
}
// export class DuckDBClient {
//     _db: duckdb.AsyncDuckDB | null
//     _counter: number
//     _conn: duckdb.AsyncDuckDBConnection | undefined

//     constructor(_db: duckdb.AsyncDuckDB) {
//         this._db = _db
//         this._counter = 0
//     }

//     /**
//      * Retrieves the names of all tables in a database.
//      */
//     async describeTables() {
//         const conn = await this.connection()
//         const tables = (await conn.query(`SHOW TABLES`)).toArray()
//         // @ts-ignore
//         return tables.map(({ name }) => ({ name }))
//     }

//     /**
//      * Describe the columns of a table.
//      */
//     async describeColumns({ table }: { table: string }) {
//         const conn = await this.connection()
//         const columns = (await conn.query(`DESCRIBE ${table}`)).toArray()
//         // @ts-ignore
//         return columns.map(({ column_name, column_type }) => {
//             return {
//                 name: column_name,
//                 type: getColumnType(column_type),
//                 databaseType: column_type
//             }
//         })
//     }

//     async db() {

//         if (!this._db) {

//             this._db = await makeDB()
//             await this._db.open({
//                 query: {
//                     castBigIntToDouble: true,
//                     castTimestampToDate: true,
//                     castDecimalToDouble: true
//                 }
//             })

//         }
//         return this._db

//     }

//     async connection() {
//         if (!this._conn) {
//             const db = await this.db()
//             this._conn = await db.connect()
//         }
//         return this._conn
//     }

//     async reconnect() {
//         if (this._conn) {
//             this._conn.close()
//         }

//         delete this._conn
//     }

//     /**
//      * Run a query and return the result.
//      */
//     async query(query: string, params?: any[]) {
//         const conn = await this.connection()

//         let result: arrow.Table<any>

//         if (params) {
//             const stmt = await conn.prepare(query)
//             result = await stmt.query(...params)
//         } else {
//             result = await conn.query(query)
//         }

//         return result
//     }

//     /**
//      * Run a query and return the connection instead of the query result..
//      */
//     async client(query: string, params?: any[]): Promise<DuckDBClient> {
//         await this.query(query, params)
//         return this
//     }

//     /**
//      * Insert a JSON file.
//      */
//     async insertJSON(
//         name: string,
//         buffer: ArrayBufferLike,
//         options?: JSONInsertOptions
//     ): Promise<DuckDBClient> {
//         const db = await this.db()
//         await db.registerFileBuffer(name, new Uint8Array(buffer))
//         const conn = await db.connect()
//         await conn.insertJSONFromPath(name, { name, schema: 'main', ...options })
//         await conn.close()

//         return this
//     }

//     /**
//      * Insert parquet file.
//      */
//     async insertParquet(name: string, buffer: ArrayBufferLike): Promise<DuckDBClient> {
//         const db = await this.db()
//         await db.registerFileBuffer(name, new Uint8Array(buffer))
//         const conn = await db.connect()
//         await conn.query(`CREATE OR REPLACE VIEW '${name}' AS SELECT * FROM parquet_scan('${name}')`)
//         await conn.close()

//         return this
//     }

//     /**
//      * Insert a CSV file.
//      */
//     async insertCSV(
//         name: string,
//         buffer: ArrayBufferLike,
//         options?: CSVInsertOptions
//     ): Promise<DuckDBClient> {
//         const db = await this.db()
//         await db.registerFileBuffer(name, new Uint8Array(buffer))
//         const conn = await db.connect()
//         await conn.insertCSVFromPath(name, { name, schema: 'main', ...options })
//         await conn.close()

//         return this
//     }

//     /**
//      * Insert an Arrow table.
//      */
//     async insertArrowTable(
//         name: string,
//         table: arrow.Table,
//         options?: ArrowInsertOptions
//     ): Promise<DuckDBClient> {
//         const buffer = arrow.tableToIPC(table)
//         return this.insertArrowFromIPCStream(name, buffer, options)
//     }

//     /**
//      * Insert arrow from IPC stream.
//      */
//     async insertArrowFromIPCStream(
//         name: string,
//         buffer: Uint8Array,
//         options?: ArrowInsertOptions
//     ): Promise<DuckDBClient> {
//         const db = await this.db()
//         const conn = await db.connect()
//         await conn.insertArrowFromIPCStream(buffer, {
//             name,
//             schema: 'main',
//             ...options
//         })
//         await conn.close()

//         return this
//     }

//     /**
//      * Create a database from FileArrachments.
//      */
//     async of(files: unknown[] = []) {
//         const db = await makeDB()
//         await db.open({
//             query: {
//                 castTimestampToDate: true
//             }
//         })

//         // ------ Observable-specific code ------
//         const toName = (file: unknown) =>
//             // @ts-expect-error
//             file.name.split('.').slice(0, -1).join('.').replace(/\@.+?/, '') // remove the "@X" versions Observable adds to file names

//         // If a single file is passed, wrap it in an array.
//         if (files.constructor.name === 'FileAttachment') {
//             files = [[toName(files), files]]
//         } else if (!Array.isArray(files)) {
//             files = Object.entries(files)
//         }

//         // ------ End Observable-specific code ------

//         // Add all files to the database. Import JSON and CSV. Create view for Parquet.
//         await Promise.all(
//             files.map(async (entry) => {
//                 let file
//                 let name
//                 let options = {}

//                 if (Array.isArray(entry)) {
//                     ;[name, file] = entry
//                     if (file.hasOwnProperty('file')) {
//                         ; ({ file, ...options } = file)
//                     }
//                     // @ts-expect-error
//                 } else if (entry.constructor.name === 'FileAttachment') {
//                     ;[name, file] = [toName(entry), entry]
//                 } else if (typeof entry === 'object') {
//                     // @ts-expect-error
//                     ; ({ file, name, ...options } = entry)
//                     name = name ?? toName(file)
//                 } else {
//                     console.error('Unrecognized entry', entry)
//                 }

//                 console.debug('entry', entry)
//                 console.debug('file', file)
//                 console.debug('name', name)
//                 console.debug('options', options)

//                 if (!file.url && Array.isArray(file)) {
//                     const data = file
//                     // file = { name: name + ".json" };
//                     // db.registerFileText(`${name}.json`, JSON.stringify(data));

//                     const table = arrow.tableFromJSON(data)
//                     const buffer = arrow.tableToIPC(table)

//                     const conn = await db.connect()
//                     await conn.insertArrowFromIPCStream(buffer, {
//                         name,
//                         schema: 'main',
//                         ...options
//                     })
//                     await conn.close()
//                     return
//                 } else {
//                     const url = await file.url()
//                     if (url.indexOf('blob:') === 0) {
//                         const buffer = await file.arrayBuffer()
//                         await db.registerFileBuffer(file.name, new Uint8Array(buffer))
//                     } else {
//                         await db.registerFileURL(
//                             file.name,
//                             url,
//                             duckdb.DuckDBDataProtocol.BROWSER_FSACCESS,
//                             true
//                         )
//                     }
//                 }

//                 const conn = await db.connect()
//                 if (file.name.endsWith('.csv')) {
//                     await conn.insertCSVFromPath(file.name, {
//                         name,
//                         schema: 'main',
//                         ...options
//                     })
//                 } else if (file.name.endsWith('.json')) {
//                     await conn.insertJSONFromPath(file.name, {
//                         name,
//                         schema: 'main',
//                         ...options
//                     })
//                 } else if (file.name.endsWith('.parquet')) {
//                     await conn.query(`CREATE VIEW '${name}' AS SELECT * FROM parquet_scan('${file.name}')`)
//                 } else {
//                     console.warn(`Don't know how to handle file type of ${file.name}`)
//                 }
//                 await conn.close()
//             })
//         )

//         return new DuckDBClient(db)
//     }
// }

// export const getColumnType = (type: string) => {
//     const typeLower = type.toLowerCase()
//     switch (typeLower) {
//         case 'bigint':
//         case 'int8':
//         case 'long':
//             return 'bigint'

//         case 'double':
//         case 'float8':
//         case 'numeric':
//         case 'decimal':
//         case 'decimal(s, p)':
//         case 'real':
//         case 'float4':
//         case 'float':
//         case 'float32':
//         case 'float64':
//             return 'number'

//         case 'hugeint':
//         case 'integer':
//         case 'smallint':
//         case 'tinyint':
//         case 'ubigint':

//         case 'int':
//         case 'signed':
//         case 'int2':
//         case 'short':
//         case 'int1':
//         case 'int64':
//         case 'int32':
//             return 'integer'

//         case 'boolean':
//         case 'bool':
//         case 'logical':
//             return 'boolean'

//         case 'date':
//         case 'interval': // date or time delta
//         case 'time':
//         case 'timestamp':
//         case 'timestamp with time zone':
//         case 'datetime':
//         case 'timestamptz':
//             return 'date'

//         case 'uuid':
//         case 'varchar':
//         case 'char':
//         case 'bpchar':
//         case 'text':
//         case 'string':
//         case 'utf8': // this type is unlisted in the `types`, but is returned by the db as `column_type`...
//             return 'string'
//         default:
//             return 'other'
//     }
// }
