type DuckDBSnippet = {
  name: string;
  description: string;
  code: string;
  language: string;
  tags: string[];
};

/**
 * Snippets for DuckDB
 */
export const snippets: DuckDBSnippet[] = [
  {
    name: "List Tables",
    description: "List all tables in the database",
    code: `SHOW TABLES`,
    language: "sql",
    tags: ["tables", "metadata"],
  },
  {
    name: "List Views",
    description: "List all view in the database",
    code: `SHOW VIEWS`,
    language: "sql",
    tags: ["views", "metadata"],
  },
  {
    name: "Insert Parquet",
    description: "Insert data from a parquet file into a table or view",
    code: `CREATE OR REPLACE TABLE tbl AS SELECT * FROM parquet_scan('file.parquet')`,
    language: "sql",
    tags: ["views", "tables", "parquet"],
  },
  {
    name: "Insert CSV",
    description: "Insert data from a csv file into a table or view",
    code: `CREATE OR REPLACE TABLE tbl AS SELECT * FROM read_csv_auto(file.csv)`,
    language: "sql",
    tags: ["views", "tables", "csv"],
  },
  {
    name: "Insert JSON",
    description: "Insert data from a json file into a table or view",
    code: `CREATE OR REPLACE TABLE tbl AS SELECT * FROM read_json_auto(file.json)`,
    language: "sql",
    tags: ["views", "tables", "json"],
  },
];
