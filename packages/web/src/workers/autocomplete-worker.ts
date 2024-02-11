import * as Comlink from "comlink";
import { DuckDBInstance } from "@/modules/duckdb-singleton";

const autocomplete = async (value: string) => {
  const db = new DuckDBInstance();

  try {
    const suggestions = await db.autoCompletion({
      query: value,
    });

    return suggestions;
  } catch (e) {
    console.error("Autocomplete error: ", e);
    return [];
  } finally {
    await db.dispose();
  }
};

export type AutocompleteWorker = typeof autocomplete;
Comlink.expose(autocomplete);
