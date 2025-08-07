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
