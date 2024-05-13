// https://github.com/neondatabase/semicolons
import * as semicolons from "postgres-semicolons";

/**
 * Split SQL into individual statements
 * see https://github.com/neondatabase/semicolons
 */
export const splitSQL = (sql: string) => {
  const standardConformingStrings = true;
  const splits = semicolons.parseSplits(sql, standardConformingStrings);
  return semicolons.nonEmptyStatements(sql, splits.positions);
};
