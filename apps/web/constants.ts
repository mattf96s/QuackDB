/**
 * Meta information for the app.
 */
export const metaDetails = {
  themeColor: "#0a0a0a",
  description:
    "QuackDB: Explore the full power of DuckDB with our open-source, in-browser SQL editor. Designed for quick prototyping, data tasks, and visualizations, all while preserving your privacy.",
  msapplicationTileColor: "#00aba9",
};

// ----------- App ------------ //

export const prodDomain = "www.quackdb.com";

// ----------- Query ------------ //

/**
 * IndexedDB cache (accessed through idb-keyval).
 */
export const IDB_KEYS = {
  QUERY_HISTORY: "query-history", // the actual SQL query runs
};

/**
 * Caches API keys.
 */
export const CACHE_KEYS = {
  QUERY_RESULTS: "query-result", // the result of the SQL query for caching in caches.
};

export const LOCAL_STORAGE_KEYS = {};

export const sidebarWidth = 20;
