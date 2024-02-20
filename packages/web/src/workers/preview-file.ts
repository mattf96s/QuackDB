import { DuckDBDataProtocol } from "@duckdb/duckdb-wasm";
import * as duckdb from "@duckdb/duckdb-wasm";
import * as Comlink from "comlink";
import { columnMapper } from "@/utils/duckdb/helpers/columnMapper";

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

type PreviewFileOptions = {
  offset?: number;
  limit?: number;
};

async function previewFile(
  fileHandle: FileSystemFileHandle,
  options?: PreviewFileOptions,
) {
  const file = await fileHandle.getFile();

  return await parseFile(file, options);
}

function getMimeType(file: File) {
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

const parseFile = async (file: File, options?: PreviewFileOptions) => {
  const kind = getMimeType(file);
  const filename = file.name;

  try {
    const db = await makeDB();
    await db.open({
      query: {
        castBigIntToDouble: true,
        castTimestampToDate: true,
        castDecimalToDouble: true,
      },
    });

    await db.registerFileHandle(
      file.name,
      file,
      DuckDBDataProtocol.BROWSER_FILEREADER,
      true,
    );

    const conn = await db.connect();

    switch (kind) {
      case "application/parquet": {
        await conn.query(
          `CREATE OR REPLACE VIEW '${filename}' AS SELECT * FROM parquet_scan('${filename}')`,
        );
        break;
      }
      case "text/csv": {
        conn.query(
          `CREATE OR REPLACE VIEW '${filename}' AS SELECT * FROM read_csv_auto('${filename}')`,
        );
        break;
      }
      case "application/json": {
        conn.query(
          `CREATE OR REPLACE VIEW '${filename}' AS SELECT * FROM read_json_auto('${filename}')`,
        );
        break;
      }
      default: {
        throw new Error(`File type ${kind} not supported`);
      }
    }

    let query = `SELECT * FROM '${filename}'`;

    const limit = options?.limit || 100;
    query += ` LIMIT ${limit}`;

    const offset = options?.offset || 0;
    query += ` OFFSET ${offset}`;

    const countQuery = `SELECT COUNT(*) FROM '${filename}'`;

    const [queryResults, columns, countRes] = await Promise.all([
      conn.query(query),
      columnMapper(conn, filename),
      conn.query(countQuery),
    ]);

    const results = await queryResults
      .toArray()
      .map((row: { toJSON(): Record<string, unknown> }) => row.toJSON());

    const count = countRes
      .toArray()
      .map((row: { toJSON(): Record<string, unknown> }) => row.toJSON())[0][
      "count_star()"
    ];

    await conn.close();

    return { results, columns, count };
  } catch (e) {
    console.error(e);
    return {
      results: [],
      columns: null,
      count: 0,
    };
  }
};

export type PreviewFileWorker = typeof previewFile;
Comlink.expose(previewFile);
