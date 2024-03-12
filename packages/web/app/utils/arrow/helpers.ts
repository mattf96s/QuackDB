// https://github.com/observablehq/stdlib/blob/main/src/arrow.js

import type { DataType, Field, RecordBatch, Table } from "apache-arrow";

// Returns true if the vaue is an Apache Arrow table. This uses a “duck” test
// (instead of strict instanceof) because we want it to work with a range of
// Apache Arrow versions at least 7.0.0 or above.
// https://arrow.apache.org/docs/7.0/js/classes/Arrow_dom.Table.html

export function isArrowTable(value: unknown): value is Table {
  if (
    value &&
    typeof value === "object" &&
    "getChild" in value &&
    typeof value.getChild === "function" &&
    "toArray" in value &&
    typeof value.toArray === "function" &&
    "schema" in value &&
    value.schema &&
    typeof value.schema === "object" &&
    "fields" in value.schema &&
    Array.isArray(value.schema.fields)
  ) {
    return true;
  }
  return false;
}

/**
 * Returns the schema of an Apache Arrow table as an array of objects.
 */
export function getArrowTableSchema(table: Table | RecordBatch) {
  return table.schema.fields.map(getArrowFieldSchema);
}

type JavaScriptArrowType =
  | "integer"
  | "number"
  | "buffer"
  | "string"
  | "boolean"
  | "date"
  | "array"
  | "object"
  | "other";

export type ResultColumn = {
  name: string;
  type: JavaScriptArrowType;
  nullable: boolean;
  databaseType: string;
};

/**
 * Returns the schema of an Apache Arrow field as an object.
 */
function getArrowFieldSchema(field: Field): ResultColumn {
  return {
    name: field.name,
    type: getArrowType(field.type),
    nullable: field.nullable,
    databaseType: String(field.type),
  };
}

// https://github.com/apache/arrow/blob/89f9a0948961f6e94f1ef5e4f310b707d22a3c11/js/src/enum.ts#L140-L141

/**
 * Returns the type of an Apache Arrow field as a string.
 */
export function getArrowType(type: DataType): JavaScriptArrowType {
  switch (type.typeId) {
    case 2: // Int
      return "integer";
    case 3: // Float
    case 7: // Decimal
      return "number";
    case 4: // Binary
    case 15: // FixedSizeBinary
      return "buffer";
    case 5: // Utf8
      return "string";
    case 6: // Bool
      return "boolean";
    case 8: // Date
    case 9: // Time
    case 10: // Timestamp
      return "date";
    case 12: // List
    case 16: // FixedSizeList
      return "array";
    case 13: // Struct
    case 14: // Union
      return "object";
    case 11: // Interval
    case 17: // Map
    default:
      return "other";
  }
}
