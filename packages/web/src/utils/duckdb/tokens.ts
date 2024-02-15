import type { ScriptTokens, TokenType } from "@duckdb/duckdb-wasm";

// https://github.com/duckdb/duckdb-wasm/blob/main/packages/duckdb-wasm-shell/crate/src/duckdb/tokens.rs

export const tokenMap: typeof TokenType = {
  COMMENT: 5,
  IDENTIFIER: 0,
  KEYWORD: 4,
  NUMERIC_CONSTANT: 1,
  OPERATOR: 3,
  STRING_CONSTANT: 2,
};

// https://github.com/duckdb/duckdb-wasm/blob/e0271a99f3c4fe326b2fb623b91d0ccbb58c7709/packages/duckdb-wasm-shell/crate/src/prompt_buffer.rs#L374
export const parseTokens = (tokens: ScriptTokens[]) => {};
