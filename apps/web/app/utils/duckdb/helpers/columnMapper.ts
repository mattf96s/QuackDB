import { type DuckDBInstance } from "~/modules/duckdb-singleton";

/**
 * Return a mapping from column names to data types, or the empty Map if no such table columns exist.
 * @source
 * https://github.com/holdenmatt/duckdb-wasm-kit/blob/main/src/util/queries.ts
 */
export async function columnMapper(
  query: DuckDBInstance["fetchResults"],
  name: string,
): Promise<Map<string, string>> {
  const results = await query({
    query: `select column_name, data_type from information_schema.columns where table_name = '${name}'`,
  });
  const arrow = results.table;

  const columns = new Map<string, string>();
  for (let i = 0; i < arrow.numRows; i++) {
    const row = arrow.get(i);
    if (row) {
      const [column_name, data_type] = row.toArray();
      columns.set(column_name, data_type);
    }
  }

  return columns;
}
