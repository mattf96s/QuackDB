export const createInsertSnippet = (file: File) => {
  const kind = getMimeType(file);
  const filename = file.name;

  switch (kind) {
    case "application/parquet": {
      return `CREATE OR REPLACE VIEW '${filename}' AS SELECT * FROM parquet_scan('${filename}')`;
    }
    case "text/csv": {
      return `CREATE OR REPLACE VIEW '${filename}' AS SELECT * FROM read_csv_auto('${filename}')`;
    }
    case "application/json": {
      return `CREATE OR REPLACE VIEW '${filename}' AS SELECT * FROM read_json_auto('${filename}')`;
    }
    default: {
      return `Unknown file type: ${kind}`;
    }
  }
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
