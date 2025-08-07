export type CreateViewProps = {
  kind: string;
  filename: string; // with extension
  collectionName: string; // without extension
  tableOrView: "TABLE" | "VIEW";
};

/**
 * Create a DuckDB view from a file
 */
export const createView = ({
  kind,
  filename,
  tableOrView,
  collectionName,
}: CreateViewProps) => {
  switch (kind) {
    case "application/parquet": {
      return `CREATE OR REPLACE ${tableOrView} '${collectionName}' AS SELECT * FROM read_parquet('${filename}')`;
    }
    case "text/csv": {
      return `CREATE OR REPLACE ${tableOrView} '${collectionName}' AS SELECT * FROM read_csv_auto('${filename}')`;
    }
    case "application/json": {
      return `CREATE OR REPLACE ${tableOrView} '${collectionName}' AS SELECT * FROM read_json_auto('${filename}')`;
    }
    // #TODO: sql

    default: {
      return `Unknown file type: ${kind}`;
    }
  }
};

type CreateInsertSnippetProps = Pick<
  CreateViewProps,
  "collectionName" | "tableOrView"
> & {
  file: File;
};

export const createInsertSnippet = ({
  collectionName,
  file,
  tableOrView,
}: CreateInsertSnippetProps) => {
  const kind = getMimeType(file);
  const filename = file.name;

  if (!kind) {
    return `Unknown file type: ${filename}`;
  }

  return createView({ kind, filename, collectionName, tableOrView });
};

function getMimeType(file: File) {
  const { type } = file;
  if (type) {
    return type;
  }

  const { name } = file;
  const ext = name.split(".").pop();
  if (!ext) {
    return null;
  }

  switch (ext) {
    case "parquet": {
      return "application/parquet";
    }
    case "csv": {
      return "text/csv";
    }
    case "json": {
      return "application/json";
    }
    default: {
      return null;
    }
  }
}
