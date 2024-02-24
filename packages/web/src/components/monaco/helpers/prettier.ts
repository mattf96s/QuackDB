import prettier from "prettier";
import SqlPlugin from "prettier-plugin-sql";

/**
 * Format SQL code using prettier
 *
 * @source // https://github.com/near/queryapi/blob/main/frontend/src/utils/formatters.js
 */
export const formatSQL = (code: string) => {
  return prettier.format(code, {
    parser: "sql",
    formatter: "sql-formatter",
    plugins: [SqlPlugin],
    pluginSearchDirs: false,
    language: "postgresql",
    database: "postgresql",
  });
};
