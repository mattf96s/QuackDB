import { type Table } from "@apache-arrow/esnext-esm";
import { z } from "zod";

/**
 * Query meta Zod schema
 */
export const queryMetaSchema = z.object({
  cacheHit: z.boolean(),
  executionTime: z.number(),
  sql: z.string(),
  error: z.string().nullable(),
  status: z.enum(["IDLE", "SUCCESS", "ERROR", "CANCELLED"]),
  hash: z.string(),
  created: z.string().datetime(),
});

/**
 * Store metadata about the query execution (WIP)
 */
export type QueryMeta = z.infer<typeof queryMetaSchema>;

export type QueryResponse = {
  table: Table;
  meta: QueryMeta | null;
  count: number;
};
