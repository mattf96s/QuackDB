import { matchSorter } from "match-sorter";
import { languages, type Range } from "monaco-editor";
import type { DuckDBInstance } from "~/modules/duckdb-singleton";

/**
 * Starting words for the suggestions (when query is empty).
 *
 * Everything in the [Overview](https://duckdb.org/docs/sql/statements/overview)
 */
const startingStmts = [
  // most common
  "SELECT",
  "FROM",
  "CREATE",
  "CREATE OR REPLACE",
  "WITH",
  "INSERT",
  "PIVOT",
  "EXPLAIN",
  "SET",
  "RESET",
  "DROP",
  // statements
  "ALTER TABLE",
  "ALTER VIEW",
  "ATTACH",
  "BEGIN",
  "BEGIN TRANSACTION",
  "DETACH",
  "CALL",
  "CHECKPOINT",
  "COMMENT ON",
  "COPY",
  "CREATE INDEX",
  "CREATE MACRO",
  "CREATE SCHEMA",
  "CREATE SECRET",
  "CREATE SEQUENCE",
  "CREATE TABLE",
  "CREATE VIEW",
  "CREATE TYPE",
  "DELETE",
  "DROP",
  "EXPORT DATABASE",
  "IMPORT DATABASE",
  "PRIGMA",
  "UNPIVOT",
  "UPDATE",
  "USE",
  "VACUUM",
];

const keywords = [
  "ABORT",
  "ABSOLUTE",
  "ACCESS",
  "ACTION",
  "ADD",
  "ADMIN",
  "AFTER",
  "AGGREGATE",
  "ALL",
  "ALSO",
  "ALTER",
  "ALWAYS",
  "ANALYSE",
  "ANALYZE",
  "AND",
  "ANTI",
  "ANY",
  "ARRAY",
  "AS",
  "ASC",
  "ASOF",
  "ASSERTION",
  "ASSIGNMENT",
  "ASYMMETRIC",
  "AT",
  "ATTACH",
  "ATTRIBUTE",
  "AUTHORIZATION",
  "BACKWARD",
  "BEFORE",
  "BEGIN",
  "BETWEEN",
  "BIGINT",
  "BINARY",
  "BIT",
  "BOOLEAN",
  "BOTH",
  "BY",
  "CACHE",
  "CALL",
  "CALLED",
  "CASCADE",
  "CASCADED",
  "CASE",
  "CAST",
  "CATALOG",
  "CENTURIES",
  "CENTURY",
  "CHAIN",
  "CHAR",
  "CHARACTER",
  "CHARACTERISTICS",
  "CHECK",
  "CHECKPOINT",
  "CLASS",
  "CLOSE",
  "CLUSTER",
  "COALESCE",
  "COLLATE",
  "COLLATION",
  "COLUMN",
  "COLUMNS",
  "COMMENT",
  "COMMENTS",
  "COMMIT",
  "COMMITTED",
  "COMPRESSION",
  "CONCURRENTLY",
  "CONFIGURATION",
  "CONFLICT",
  "CONNECTION",
  "CONSTRAINT",
  "CONSTRAINTS",
  "CONTENT",
  "CONTINUE",
  "CONVERSION",
  "COPY",
  "COST",
  "CREATE",
  "CROSS",
  "CSV",
  "CUBE",
  "CURRENT",
  "CURSOR",
  "CYCLE",
  "DATA",
  "DATABASE",
  "DAY",
  "DAYS",
  "DEALLOCATE",
  "DEC",
  "DECADE",
  "DECADES",
  "DECIMAL",
  "DECLARE",
  "DEFAULT",
  "DEFAULTS",
  "DEFERRABLE",
  "DEFERRED",
  "DEFINER",
  "DELETE",
  "DELIMITER",
  "DELIMITERS",
  "DEPENDS",
  "DESC",
  "DESCRIBE",
  "DETACH",
  "DICTIONARY",
  "DISABLE",
  "DISCARD",
  "DISTINCT",
  "DO",
  "DOCUMENT",
  "DOMAIN",
  "DOUBLE",
  "DROP",
  "EACH",
  "ELSE",
  "ENABLE",
  "ENCODING",
  "ENCRYPTED",
  "END",
  "ENUM",
  "ESCAPE",
  "EVENT",
  "EXCEPT",
  "EXCLUDE",
  "EXCLUDING",
  "EXCLUSIVE",
  "EXECUTE",
  "EXISTS",
  "EXPLAIN",
  "EXPORT",
  "EXPORT_STATE",
  "EXTENSION",
  "EXTERNAL",
  "EXTRACT",
  "FALSE",
  "FAMILY",
  "FETCH",
  "FILTER",
  "FIRST",
  "FLOAT",
  "FOLLOWING",
  "FOR",
  "FORCE",
  "FOREIGN",
  "FORWARD",
  "FREEZE",
  "FROM",
  "FULL",
  "FUNCTION",
  "FUNCTIONS",
  "GENERATED",
  "GLOB",
  "GLOBAL",
  "GRANT",
  "GRANTED",
  "GROUP",
  "GROUPING",
  "GROUPING_ID",
  "GROUPS",
  "HANDLER",
  "HAVING",
  "HEADER",
  "HOLD",
  "HOUR",
  "HOURS",
  "IDENTITY",
  "IF",
  "IGNORE",
  "ILIKE",
  "IMMEDIATE",
  "IMMUTABLE",
  "IMPLICIT",
  "IMPORT",
  "IN",
  "INCLUDE",
  "INCLUDING",
  "INCREMENT",
  "INDEX",
  "INDEXES",
  "INHERIT",
  "INHERITS",
  "INITIALLY",
  "INLINE",
  "INNER",
  "INOUT",
  "INPUT",
  "INSENSITIVE",
  "INSERT",
  "INSTALL",
  "INSTEAD",
  "INT",
  "INTEGER",
  "INTERSECT",
  "INTERVAL",
  "INTO",
  "INVOKER",
  "IS",
  "ISNULL",
  "ISOLATION",
  "JOIN",
  "JSON",
  "KEY",
  "LABEL",
  "LANGUAGE",
  "LARGE",
  "LAST",
  "LATERAL",
  "LEADING",
  "LEAKPROOF",
  "LEFT",
  "LEVEL",
  "LIKE",
  "LIMIT",
  "LISTEN",
  "LOAD",
  "LOCAL",
  "LOCATION",
  "LOCK",
  "LOCKED",
  "LOGGED",
  "MACRO",
  "MAP",
  "MAPPING",
  "MATCH",
  "MATERIALIZED",
  "MAXVALUE",
  "METHOD",
  "MICROSECOND",
  "MICROSECONDS",
  "MILLENNIA",
  "MILLENNIUM",
  "MILLISECOND",
  "MILLISECONDS",
  "MINUTE",
  "MINUTES",
  "MINVALUE",
  "MODE",
  "MONTH",
  "MONTHS",
  "MOVE",
  "NAME",
  "NAMES",
  "NATIONAL",
  "NATURAL",
  "NCHAR",
  "NEW",
  "NEXT",
  "NO",
  "NONE",
  "NOT",
  "NOTHING",
  "NOTIFY",
  "NOTNULL",
  "NOWAIT",
  "NULL",
  "NULLIF",
  "NULLS",
  "NUMERIC",
  "OBJECT",
  "OF",
  "OFF",
  "OFFSET",
  "OIDS",
  "OLD",
  "ON",
  "ONLY",
  "OPERATOR",
  "OPTION",
  "OPTIONS",
  "OR",
  "ORDER",
  "ORDINALITY",
  "OTHERS",
  "OUT",
  "OUTER",
  "OVER",
  "OVERLAPS",
  "OVERLAY",
  "OVERRIDING",
  "OWNED",
  "OWNER",
  "PARALLEL",
  "PARSER",
  "PARTIAL",
  "PARTITION",
  "PASSING",
  "PASSWORD",
  "PERCENT",
  "PERSISTENT",
  "PIVOT",
  "PIVOT_LONGER",
  "PIVOT_WIDER",
  "PLACING",
  "PLANS",
  "POLICY",
  "POSITION",
  "POSITIONAL",
  "PRAGMA",
  "PRECEDING",
  "PRECISION",
  "PREPARE",
  "PREPARED",
  "PRESERVE",
  "PRIMARY",
  "PRIOR",
  "PRIVILEGES",
  "PROCEDURAL",
  "PROCEDURE",
  "PROGRAM",
  "PUBLICATION",
  "QUALIFY",
  "QUOTE",
  "RANGE",
  "READ",
  "REAL",
  "REASSIGN",
  "RECHECK",
  "RECURSIVE",
  "REF",
  "REFERENCES",
  "REFERENCING",
  "REFRESH",
  "REINDEX",
  "RELATIVE",
  "RELEASE",
  "RENAME",
  "REPEATABLE",
  "REPLACE",
  "REPLICA",
  "RESET",
  "RESPECT",
  "RESTART",
  "RESTRICT",
  "RETURNING",
  "RETURNS",
  "REVOKE",
  "RIGHT",
  "ROLE",
  "ROLLBACK",
  "ROLLUP",
  "ROW",
  "ROWS",
  "RULE",
  "SAMPLE",
  "SAVEPOINT",
  "SCHEMA",
  "SCHEMAS",
  "SCOPE",
  "SCROLL",
  "SEARCH",
  "SECOND",
  "SECONDS",
  "SECRET",
  "SECURITY",
  "SELECT",
  "SEMI",
  "SEQUENCE",
  "SEQUENCES",
  "SERIALIZABLE",
  "SERVER",
  "SESSION",
  "SET",
  "SETOF",
  "SETS",
  "SHARE",
  "SHOW",
  "SIMILAR",
  "SIMPLE",
  "SKIP",
  "SMALLINT",
  "SNAPSHOT",
  "SOME",
  "SQL",
  "STABLE",
  "STANDALONE",
  "START",
  "STATEMENT",
  "STATISTICS",
  "STDIN",
  "STDOUT",
  "STORAGE",
  "STORED",
  "STRICT",
  "STRIP",
  "STRUCT",
  "SUBSCRIPTION",
  "SUBSTRING",
  "SUMMARIZE",
  "SYMMETRIC",
  "SYSID",
  "SYSTEM",
  "TABLE",
  "TABLES",
  "TABLESAMPLE",
  "TABLESPACE",
  "TEMP",
  "TEMPLATE",
  "TEMPORARY",
  "TEXT",
  "THEN",
  "TIES",
  "TIME",
  "TIMESTAMP",
  "TO",
  "TRAILING",
  "TRANSACTION",
  "TRANSFORM",
  "TREAT",
  "TRIGGER",
  "TRIM",
  "TRUE",
  "TRUNCATE",
  "TRUSTED",
  "TRY_CAST",
  "TYPE",
  "TYPES",
  "UNBOUNDED",
  "UNCOMMITTED",
  "UNENCRYPTED",
  "UNION",
  "UNIQUE",
  "UNKNOWN",
  "UNLISTEN",
  "UNLOGGED",
  "UNPIVOT",
  "UNTIL",
  "UPDATE",
  "USE",
  "USER",
  "USING",
  "VACUUM",
  "VALID",
  "VALIDATE",
  "VALIDATOR",
  "VALUE",
  "VALUES",
  "VARCHAR",
  "VARIADIC",
  "VARYING",
  "VERBOSE",
  "VERSION",
  "VIEW",
  "VIEWS",
  "VIRTUAL",
  "VOLATILE",
  "WEEK",
  "WEEKS",
  "WHEN",
  "WHERE",
  "WHITESPACE",
  "WINDOW",
  "WITH",
  "WITHIN",
  "WITHOUT",
  "WORK",
  "WRAPPER",
  "WRITE",
  "XML",
  "XMLATTRIBUTES",
  "XMLCONCAT",
  "XMLELEMENT",
  "XMLEXISTS",
  "XMLFOREST",
  "XMLNAMESPACES",
  "XMLPARSE",
  "XMLPI",
  "XMLROOT",
  "XMLSERIALIZE",
  "XMLTABLE",
  "YEAR",
  "YEARS",
  "YES",
  "ZONE",
];

const functions = [
  "-",
  "->>",
  "!__POSTFIX",
  "!~~",
  "!~~*",
  "@",
  "@>",
  "*",
  "**",
  "/",
  "//",
  "&",
  "&&",
  "%",
  "^",
  "^@",
  "+",
  "<->",
  "<@",
  "<#>",
  "<<",
  "<=>",
  ">>",
  "|",
  "||",
  "~",
  "~~",
  "~~*",
  "~~~",
  "ABS",
  "ACOS",
  "ADD_PARQUET_KEY",
  "ADD",
  "AGE",
  "AGGREGATE",
  "ALIAS",
  "ALL_PROFILING_OUTPUT",
  "ANY_VALUE",
  "APPLY",
  "APPROX_COUNT_DISTINCT",
  "APPROX_QUANTILE",
  "ARBITRARY",
  "ARG_MAX_NULL",
  "ARG_MAX",
  "ARG_MIN_NULL",
  "ARG_MIN",
  "ARGMAX",
  "ARGMIN",
  "ARRAY_AGG",
  "ARRAY_AGGR",
  "ARRAY_AGGREGATE",
  "ARRAY_APPEND",
  "ARRAY_APPLY",
  "ARRAY_CAT",
  "ARRAY_CONCAT",
  "ARRAY_CONTAINS",
  "ARRAY_COSINE_SIMILARITY",
  "ARRAY_CROSS_PRODUCT",
  "ARRAY_DISTANCE",
  "ARRAY_DISTINCT",
  "ARRAY_DOT_PRODUCT",
  "ARRAY_EXTRACT",
  "ARRAY_FILTER",
  "ARRAY_GRADE_UP",
  "ARRAY_HAS_ALL",
  "ARRAY_HAS_ANY",
  "ARRAY_HAS",
  "ARRAY_INDEXOF",
  "ARRAY_INNER_PRODUCT",
  "ARRAY_INTERSECT",
  "ARRAY_LENGTH",
  "ARRAY_POP_BACK",
  "ARRAY_POP_FRONT",
  "ARRAY_POSITION",
  "ARRAY_PREPEND",
  "ARRAY_PUSH_BACK",
  "ARRAY_PUSH_FRONT",
  "ARRAY_REDUCE",
  "ARRAY_RESIZE",
  "ARRAY_REVERSE_SORT",
  "ARRAY_REVERSE",
  "ARRAY_SELECT",
  "ARRAY_SLICE",
  "ARRAY_SORT",
  "ARRAY_TO_JSON",
  "ARRAY_TO_STRING",
  "ARRAY_TRANSFORM",
  "ARRAY_UNIQUE",
  "ARRAY_VALUE",
  "ARRAY_WHERE",
  "ARRAY_ZIP",
  "ARROW_SCAN_DUMB",
  "ARROW_SCAN",
  "ASCII",
  "ASIN",
  "ATAN",
  "ATAN2",
  "AVG",
  "BAR",
  "BASE64",
  "BIN",
  "BIT_AND",
  "BIT_COUNT",
  "BIT_LENGTH",
  "BIT_OR",
  "BIT_POSITION",
  "BIT_XOR",
  "BITSTRING_AGG",
  "BITSTRING",
  "BOOL_AND",
  "BOOL_OR",
  "CARDINALITY",
  "CBRT",
  "CEIL",
  "CEILING",
  "CENTURY",
  "CHECKPOINT",
  "CHR",
  "COL_DESCRIPTION",
  "COLLATIONS",
  "COMBINE",
  "CONCAT_WS",
  "CONCAT",
  "CONSTANT_OR_NULL",
  "CONTAINS",
  "COPY_DATABASE",
  "CORR",
  "COS",
  "COT",
  "COUNT_IF",
  "COUNT_STAR",
  "COUNT",
  "COVAR_POP",
  "COVAR_SAMP",
  "CREATE_SORT_KEY",
  "CURRENT_CATALOG",
  "CURRENT_DATABASE",
  "CURRENT_DATE",
  "CURRENT_LOCALTIME",
  "CURRENT_LOCALTIMESTAMP",
  "CURRENT_QUERY",
  "CURRENT_ROLE",
  "CURRENT_SCHEMA",
  "CURRENT_SCHEMAS",
  "CURRENT_SETTING",
  "CURRENT_USER",
  "CURRVAL",
  "DAMERAU_LEVENSHTEIN",
  "DATABASE_LIST",
  "DATABASE_SIZE",
  "DATE_ADD",
  "DATE_DIFF",
  "DATE_PART",
  "DATE_SUB",
  "DATE_TRUNC",
  "DATEDIFF",
  "DATEPART",
  "DATESUB",
  "DATETRUNC",
  "DAY",
  "DAYNAME",
  "DAYOFMONTH",
  "DAYOFWEEK",
  "DAYOFYEAR",
  "DECADE",
  "DECODE",
  "DEGREES",
  "DISABLE_CHECKPOINT_ON_SHUTDOWN",
  "DISABLE_OBJECT_CACHE",
  "DISABLE_OPTIMIZER",
  "DISABLE_PRINT_PROGRESS_BAR",
  "DISABLE_PROFILE",
  "DISABLE_PROFILING",
  "DISABLE_PROGRESS_BAR",
  "DISABLE_VERIFICATION",
  "DISABLE_VERIFY_EXTERNAL",
  "DISABLE_VERIFY_FETCH_ROW",
  "DISABLE_VERIFY_PARALLELISM",
  "DISABLE_VERIFY_SERIALIZER",
  "DIVIDE",
  "DUCKDB_COLUMNS",
  "DUCKDB_CONSTRAINTS",
  "DUCKDB_DATABASES",
  "DUCKDB_DEPENDENCIES",
  "DUCKDB_EXTENSIONS",
  "DUCKDB_FUNCTIONS",
  "DUCKDB_INDEXES",
  "DUCKDB_KEYWORDS",
  "DUCKDB_MEMORY",
  "DUCKDB_OPTIMIZERS",
  "DUCKDB_SCHEMAS",
  "DUCKDB_SECRETS",
  "DUCKDB_SEQUENCES",
  "DUCKDB_SETTINGS",
  "DUCKDB_TABLES",
  "DUCKDB_TEMPORARY_FILES",
  "DUCKDB_TYPES",
  "DUCKDB_VIEWS",
  "EDITDIST3",
  "ELEMENT_AT",
  "ENABLE_CHECKPOINT_ON_SHUTDOWN",
  "ENABLE_OBJECT_CACHE",
  "ENABLE_OPTIMIZER",
  "ENABLE_PRINT_PROGRESS_BAR",
  "ENABLE_PROFILE",
  "ENABLE_PROFILING",
  "ENABLE_PROGRESS_BAR",
  "ENABLE_VERIFICATION",
  "ENCODE",
  "ENDS_WITH",
  "ENTROPY",
  "ENUM_CODE",
  "ENUM_FIRST",
  "ENUM_LAST",
  "ENUM_RANGE_BOUNDARY",
  "ENUM_RANGE",
  "EPOCH_MS",
  "EPOCH_NS",
  "EPOCH_US",
  "EPOCH",
  "ERA",
  "ERROR",
  "EVEN",
  "EXCEL_TEXT",
  "EXP",
  "FACTORIAL",
  "FAVG",
  "FDIV",
  "FILTER",
  "FINALIZE",
  "FIRST",
  "FLATTEN",
  "FLOOR",
  "FMOD",
  "FORCE_CHECKPOINT",
  "FORMAT_BYTES",
  "FORMAT_PG_TYPE",
  "FORMAT_TYPE",
  "FORMAT",
  "FORMATREADABLEDECIMALSIZE",
  "FORMATREADABLESIZE",
  "FROM_BASE64",
  "FROM_BINARY",
  "FROM_HEX",
  "FROM_JSON_STRICT",
  "FROM_JSON",
  "FSUM",
  "FUNCTIONS",
  "GAMMA",
  "GCD",
  "GEN_RANDOM_UUID",
  "GENERATE_SERIES",
  "GENERATE_SUBSCRIPTS",
  "GEOMEAN",
  "GEOMETRIC_MEAN",
  "GET_BIT",
  "GET_BLOCK_SIZE",
  "GET_CURRENT_TIME",
  "GET_CURRENT_TIMESTAMP",
  "GLOB",
  "GRADE_UP",
  "GREATEST_COMMON_DIVISOR",
  "GREATEST",
  "GROUP_CONCAT",
  "HAMMING",
  "HAS_ANY_COLUMN_PRIVILEGE",
  "HAS_COLUMN_PRIVILEGE",
  "HAS_DATABASE_PRIVILEGE",
  "HAS_FOREIGN_DATA_WRAPPER_PRIVILEGE",
  "HAS_FUNCTION_PRIVILEGE",
  "HAS_LANGUAGE_PRIVILEGE",
  "HAS_SCHEMA_PRIVILEGE",
  "HAS_SEQUENCE_PRIVILEGE",
  "HAS_SERVER_PRIVILEGE",
  "HAS_TABLE_PRIVILEGE",
  "HAS_TABLESPACE_PRIVILEGE",
  "HASH",
  "HEX",
  "HISTOGRAM",
  "HOST",
  "HOUR",
  "ICU_CALENDAR_NAMES",
  "ICU_SORT_KEY",
  "ILIKE_ESCAPE",
  "IMPORT_DATABASE",
  "IN_SEARCH_PATH",
  "INDEX_SCAN",
  "INET_CLIENT_ADDR",
  "INET_CLIENT_PORT",
  "INET_SERVER_ADDR",
  "INET_SERVER_PORT",
  "INSTR",
  "ISFINITE",
  "ISINF",
  "ISNAN",
  "ISODOW",
  "ISOYEAR",
  "JACCARD",
  "JARO_SIMILARITY",
  "JARO_WINKLER_SIMILARITY",
  "JSON_ARRAY_LENGTH",
  "JSON_ARRAY",
  "JSON_CONTAINS",
  "JSON_DESERIALIZE_SQL",
  "JSON_EXECUTE_SERIALIZED_SQL",
  "JSON_EXTRACT_PATH_TEXT",
  "JSON_EXTRACT_PATH",
  "JSON_EXTRACT_STRING",
  "JSON_EXTRACT",
  "JSON_GROUP_ARRAY",
  "JSON_GROUP_OBJECT",
  "JSON_GROUP_STRUCTURE",
  "JSON_KEYS",
  "JSON_MERGE_PATCH",
  "JSON_OBJECT",
  "JSON_QUOTE",
  "JSON_SERIALIZE_PLAN",
  "JSON_SERIALIZE_SQL",
  "JSON_STRUCTURE",
  "JSON_TRANSFORM_STRICT",
  "JSON_TRANSFORM",
  "JSON_TYPE",
  "JSON_VALID",
  "JSON",
  "JULIAN",
  "KAHAN_SUM",
  "KURTOSIS_POP",
  "KURTOSIS",
  "LAST_DAY",
  "LAST",
  "LCASE",
  "LCM",
  "LEAST_COMMON_MULTIPLE",
  "LEAST",
  "LEFT_GRAPHEME",
  "LEFT",
  "LEN",
  "LENGTH_GRAPHEME",
  "LENGTH",
  "LEVENSHTEIN",
  "LGAMMA",
  "LIKE_ESCAPE",
  "LIST_AGGR",
  "LIST_AGGREGATE",
  "LIST_ANY_VALUE",
  "LIST_APPEND",
  "LIST_APPLY",
  "LIST_APPROX_COUNT_DISTINCT",
  "LIST_AVG",
  "LIST_BIT_AND",
  "LIST_BIT_OR",
  "LIST_BIT_XOR",
  "LIST_BOOL_AND",
  "LIST_BOOL_OR",
  "LIST_CAT",
  "LIST_CONCAT",
  "LIST_CONTAINS",
  "LIST_COSINE_SIMILARITY",
  "LIST_COUNT",
  "LIST_DISTANCE",
  "LIST_DISTINCT",
  "LIST_DOT_PRODUCT",
  "LIST_ELEMENT",
  "LIST_ENTROPY",
  "LIST_EXTRACT",
  "LIST_FILTER",
  "LIST_FIRST",
  "LIST_GRADE_UP",
  "LIST_HAS_ALL",
  "LIST_HAS_ANY",
  "LIST_HAS",
  "LIST_HISTOGRAM",
  "LIST_INDEXOF",
  "LIST_INNER_PRODUCT",
  "LIST_INTERSECT",
  "LIST_KURTOSIS_POP",
  "LIST_KURTOSIS",
  "LIST_LAST",
  "LIST_MAD",
  "LIST_MAX",
  "LIST_MEDIAN",
  "LIST_MIN",
  "LIST_MODE",
  "LIST_PACK",
  "LIST_POSITION",
  "LIST_PREPEND",
  "LIST_PRODUCT",
  "LIST_REDUCE",
  "LIST_RESIZE",
  "LIST_REVERSE_SORT",
  "LIST_REVERSE",
  "LIST_SELECT",
  "LIST_SEM",
  "LIST_SKEWNESS",
  "LIST_SLICE",
  "LIST_SORT",
  "LIST_STDDEV_POP",
  "LIST_STDDEV_SAMP",
  "LIST_STRING_AGG",
  "LIST_SUM",
  "LIST_TRANSFORM",
  "LIST_UNIQUE",
  "LIST_VALUE",
  "LIST_VAR_POP",
  "LIST_VAR_SAMP",
  "LIST_WHERE",
  "LIST_ZIP",
  "LIST",
  "LISTAGG",
  "LN",
  "LOG",
  "LOG10",
  "LOG2",
  "LOWER",
  "LPAD",
  "LTRIM",
  "MAD",
  "MAKE_DATE",
  "MAKE_TIME",
  "MAKE_TIMESTAMP",
  "MAKE_TIMESTAMPTZ",
  "MAP_CONCAT",
  "MAP_ENTRIES",
  "MAP_EXTRACT",
  "MAP_FROM_ENTRIES",
  "MAP_KEYS",
  "MAP_VALUES",
  "MAP",
  "MAX_BY",
  "MAX",
  "MD5_NUMBER_LOWER",
  "MD5_NUMBER_UPPER",
  "MD5_NUMBER",
  "MD5",
  "MEAN",
  "MEDIAN",
  "METADATA_INFO",
  "MICROSECOND",
  "MILLENNIUM",
  "MILLISECOND",
  "MIN_BY",
  "MIN",
  "MINUTE",
  "MISMATCHES",
  "MOD",
  "MODE",
  "MONTH",
  "MONTHNAME",
  "MULTIPLY",
  "NEXTAFTER",
  "NEXTVAL",
  "NFC_NORMALIZE",
  "NOT_ILIKE_ESCAPE",
  "NOT_LIKE_ESCAPE",
  "NOW",
  "NULLIF",
  "OBJ_DESCRIPTION",
  "OCTET_LENGTH",
  "ORD",
  "PARQUET_FILE_METADATA",
  "PARQUET_KV_METADATA",
  "PARQUET_METADATA",
  "PARQUET_SCAN",
  "PARQUET_SCHEMA",
  "PARSE_DIRNAME",
  "PARSE_DIRPATH",
  "PARSE_FILENAME",
  "PARSE_PATH",
  "PG_COLLATION_IS_VISIBLE",
  "PG_CONF_LOAD_TIME",
  "PG_CONVERSION_IS_VISIBLE",
  "PG_FUNCTION_IS_VISIBLE",
  "PG_GET_CONSTRAINTDEF",
  "PG_GET_EXPR",
  "PG_GET_VIEWDEF",
  "PG_HAS_ROLE",
  "PG_IS_OTHER_TEMP_SCHEMA",
  "PG_MY_TEMP_SCHEMA",
  "PG_OPCLASS_IS_VISIBLE",
  "PG_OPERATOR_IS_VISIBLE",
  "PG_OPFAMILY_IS_VISIBLE",
  "PG_POSTMASTER_START_TIME",
  "PG_SIZE_PRETTY",
  "PG_TABLE_IS_VISIBLE",
  "PG_TIMEZONE_NAMES",
  "PG_TS_CONFIG_IS_VISIBLE",
  "PG_TS_DICT_IS_VISIBLE",
  "PG_TS_PARSER_IS_VISIBLE",
  "PG_TS_TEMPLATE_IS_VISIBLE",
  "PG_TYPE_IS_VISIBLE",
  "PG_TYPEOF",
  "PI",
  "PLATFORM",
  "POSITION",
  "POW",
  "POWER",
  "PRAGMA_COLLATIONS",
  "PRAGMA_DATABASE_SIZE",
  "PRAGMA_METADATA_INFO",
  "PRAGMA_PLATFORM",
  "PRAGMA_SHOW",
  "PRAGMA_STORAGE_INFO",
  "PRAGMA_TABLE_INFO",
  "PRAGMA_USER_AGENT",
  "PRAGMA_VERSION",
  "PREFIX",
  "PRINTF",
  "PRODUCT",
  "QUANTILE_CONT",
  "QUANTILE_DISC",
  "QUANTILE",
  "QUARTER",
  "RADIANS",
  "RANDOM",
  "RANGE",
  "READ_BLOB",
  "READ_CSV_AUTO",
  "READ_CSV",
  "READ_JSON_AUTO",
  "READ_JSON_OBJECTS_AUTO",
  "READ_JSON_OBJECTS",
  "READ_JSON",
  "READ_NDJSON_AUTO",
  "READ_NDJSON_OBJECTS",
  "READ_NDJSON",
  "READ_PARQUET",
  "READ_TEXT",
  "REDUCE",
  "REGEXP_ESCAPE",
  "REGEXP_EXTRACT_ALL",
  "REGEXP_EXTRACT",
  "REGEXP_FULL_MATCH",
  "REGEXP_MATCHES",
  "REGEXP_REPLACE",
  "REGEXP_SPLIT_TO_ARRAY",
  "REGR_AVGX",
  "REGR_AVGY",
  "REGR_COUNT",
  "REGR_INTERCEPT",
  "REGR_R2",
  "REGR_SLOPE",
  "REGR_SXX",
  "REGR_SXY",
  "REGR_SYY",
  "REPEAT_ROW",
  "REPEAT",
  "REPLACE",
  "RESERVOIR_QUANTILE",
  "REVERSE",
  "RIGHT_GRAPHEME",
  "RIGHT",
  "ROUND_EVEN",
  "ROUND",
  "ROUNDBANKERS",
  "ROW_TO_JSON",
  "ROW",
  "RPAD",
  "RTRIM",
  "SECOND",
  "SEM",
  "SEQ_SCAN",
  "SESSION_USER",
  "SET_BIT",
  "SETSEED",
  "SHA256",
  "SHOBJ_DESCRIPTION",
  "SHOW_DATABASES",
  "SHOW_TABLES_EXPANDED",
  "SHOW_TABLES",
  "SHOW",
  "SIGN",
  "SIGNBIT",
  "SIN",
  "SKEWNESS",
  "SNIFF_CSV",
  "SPLIT_PART",
  "SPLIT",
  "SQL_AUTO_COMPLETE",
  "SQRT",
  "STARTS_WITH",
  "STATS",
  "STDDEV_POP",
  "STDDEV_SAMP",
  "STDDEV",
  "STORAGE_INFO",
  "STR_SPLIT_REGEX",
  "STR_SPLIT",
  "STRFTIME",
  "STRING_AGG",
  "STRING_SPLIT_REGEX",
  "STRING_SPLIT",
  "STRING_TO_ARRAY",
  "STRIP_ACCENTS",
  "STRLEN",
  "STRPOS",
  "STRPTIME",
  "STRUCT_EXTRACT",
  "STRUCT_INSERT",
  "STRUCT_PACK",
  "SUBSTR",
  "SUBSTRING_GRAPHEME",
  "SUBSTRING",
  "SUBTRACT",
  "SUFFIX",
  "SUM_NO_OVERFLOW",
  "SUM",
  "SUMKAHAN",
  "SUMMARY",
  "TABLE_INFO",
  "TAN",
  "TEST_ALL_TYPES",
  "TEST_VECTOR_TYPES",
  "TEXT",
  "TIME_BUCKET",
  "TIMEZONE_HOUR",
  "TIMEZONE_MINUTE",
  "TIMEZONE",
  "TO_BASE",
  "TO_BASE64",
  "TO_BINARY",
  "TO_CENTURIES",
  "TO_DAYS",
  "TO_DECADES",
  "TO_HEX",
  "TO_HOURS",
  "TO_JSON",
  "TO_MICROSECONDS",
  "TO_MILLENNIA",
  "TO_MILLISECONDS",
  "TO_MINUTES",
  "TO_MONTHS",
  "TO_SECONDS",
  "TO_TIMESTAMP",
  "TO_WEEKS",
  "TO_YEARS",
  "TODAY",
  "TRANSACTION_TIMESTAMP",
  "TRANSLATE",
  "TRIM",
  "TRUNC",
  "TRY_STRPTIME",
  "TXID_CURRENT",
  "TYPEOF",
  "UCASE",
  "UNBIN",
  "UNHEX",
  "UNICODE",
  "UNION_EXTRACT",
  "UNION_TAG",
  "UNION_VALUE",
  "UNNEST",
  "UPPER",
  "USER_AGENT",
  "USER",
  "UUID",
  "VAR_POP",
  "VAR_SAMP",
  "VARIANCE",
  "VECTOR_TYPE",
  "VERIFY_EXTERNAL",
  "VERIFY_FETCH_ROW",
  "VERIFY_PARALLELISM",
  "VERIFY_SERIALIZER",
  "VERSION",
  "WEEK",
  "WEEKDAY",
  "WEEKOFYEAR",
  "WHICH_SECRET",
  "XOR",
  "YEAR",
  "YEARWEEK",
];

// Might as well merge them now.
const allWords = [...keywords, ...functions];

type GetSuggestionsInput = {
  word: string;
  query: string;
  range: Range;
  signal: AbortSignal;
};

const getSuggestions = (word: string) => {
  const isEmpty = word.length === 0;

  const items = isEmpty ? startingStmts : allWords;

  const matches = matchSorter(items, word);

  return matches;
};

export class SuggestionMaker {
  #db: DuckDBInstance | null = null;

  constructor(db: DuckDBInstance) {
    this.#db = db;
  }

  dispose() {
    // Not sure if we need to do anything here.
    this.#db = null;
  }

  async #useAutoComplete(query: string): Promise<string[]> {
    const escaped = query.replace(/'/g, "''");

    if (!this.#db) return [];

    try {
      const results = await this.#db.fetchResults({
        query: `SELECT suggestion FROM SQL_AUTO_COMPLETE('${escaped}');`,
      });

      return results.table
        .toArray()
        .map((r) => r.toJSON())
        .map((row) => `${row.suggestion}`.toUpperCase());
    } catch (e) {
      console.error("Error in useAutoComplete: ", e);
      return [];
    }
  }

  #getStaticSuggestions(word: string) {
    return getSuggestions(word);
  }

  async #getMetaSuggestions(word: string) {
    if (!this.#db) return [];
    const tableQuery = this.#db
      .fetchResults({
        query: `SELECT table_name FROM duckdb_tables() WHERE table_name ILIKE '%${word}%' limit 10;`,
      })
      .then((res) => res.table.toArray().map((r) => r.toJSON()));

    const viewQuery = this.#db
      .fetchResults({
        query: `SELECT view_name FROM duckdb_views() WHERE view_name ILIKE '%${word}%' limit 10;`,
      })
      .then((res) => res.table.toArray().map((r) => r.toJSON()));

    const columnNamesQuery = this.#db
      .fetchResults({
        query: `SELECT column_name FROM duckdb_columns() WHERE column_name ILIKE '%${word}%' limit 10;`,
      })
      .then((res) => res.table.toArray().map((r) => r.toJSON()));

    const [tables, views, columns] = await Promise.all([
      tableQuery,
      viewQuery,
      columnNamesQuery,
    ]);

    return [
      ...tables.map((row) => `${row.table_name}`.toUpperCase()),
      ...views.map((row) => `${row.view_name}`.toUpperCase()),
      ...columns.map((row) => `${row.column_name}`.toUpperCase()),
    ];
  }

  async getSuggestions({
    query,
    word,
    range,
    signal,
  }: GetSuggestionsInput): Promise<languages.CompletionItem[]> {
    const staticSuggestions = this.#getStaticSuggestions(word);
    const [autoSugestions, metaSuggestions] = await Promise.all([
      this.#useAutoComplete(query),
      this.#getMetaSuggestions(word),
    ]);

    if (signal.aborted) {
      return [];
    }

    const combined = [
      ...new Set([...autoSugestions, ...metaSuggestions, ...staticSuggestions]),
    ];

    const matches = matchSorter(combined, word, {
      threshold: matchSorter.rankings.CONTAINS,
    }) as string[];

    return matches.map((match) => ({
      label: `${match}`,
      kind: languages.CompletionItemKind.Keyword,
      insertText: `${match}`,
      range,
    }));
  }
}