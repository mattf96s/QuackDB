import type { Config } from "@wasm-fmt/sql_fmt";

export const formatSQL = async (sql: string, options?: Config) => {
  const init = await import("@wasm-fmt/sql_fmt");
  await init.default();
  return init.format(sql, "query.sql", {
    lines_between_queries: 2,
    indent_style: "tab",
    ...options,
  });
};
