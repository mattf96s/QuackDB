import type { Config } from "@wasm-fmt/sql_fmt/vite";

export const formatSQL = async (sql: string, options?: Config) => {
  const init = await import("@wasm-fmt/sql_fmt/vite");
  await init.default();
  return init.format(sql, "query.sql", {
    ...options,
  });
};
