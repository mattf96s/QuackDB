// https://github.com/neondatabase/semicolons
import * as semicolons from "postgres-semicolons";

/**
 * Splits a string containing multiple SQL statements into individual statements.
 *
 * This function safely parses SQL text that may contain multiple statements separated
 * by semicolons, while properly handling:
 * - String literals that contain semicolons
 * - Comments that contain semicolons
 * - Complex SQL syntax where semicolons don't indicate statement boundaries
 *
 * Uses Postgres-compatible parsing rules with standard conforming strings enabled.
 * Returns only non-empty statements, filtering out whitespace-only segments.
 *
 * @param sql - The SQL string containing one or more statements
 * @returns Array of individual SQL statements with leading/trailing whitespace trimmed
 *
 * @example
 * ```typescript
 * const sql = "SELECT * FROM users; INSERT INTO logs VALUES ('test'); -- comment with ;";
 * const statements = splitSQL(sql);
 * // Returns: ["SELECT * FROM users", "INSERT INTO logs VALUES ('test')", "-- comment with ;"]
 * ```
 *
 * @see https://github.com/neondatabase/semicolons
 */
export const splitSQL = (sql: string) => {
	const standardConformingStrings = true;
	const splits = semicolons.parseSplits(sql, standardConformingStrings);
	return semicolons.nonEmptyStatements(sql, splits.positions);
};
