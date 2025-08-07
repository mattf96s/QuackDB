export const datasetFileExts = [
  "csv",
  "json",
  "txt",
  "duckdb",
  "sqlite",
  "postgresql",
  "parquet",
  "arrow",
  "excel",
  "url",
] as const;

export type DatasetFileExt = (typeof datasetFileExts)[number];

export function isDatasetFileExt(x: unknown): x is DatasetFileExt {
  return datasetFileExts.includes(x as DatasetFileExt);
}

export const datasetMimeTypes = [
  "text/csv",
  "application/json",
  "text/plain",
  "application/duckdb",
  "application/sqlite",
  "application/postgresql",
  "application/parquet",
  "application/arrow",
  "application/excel",
  "text/x-uri",
];

// ------ Dataset Mime Types ------ //

export type DatasetMimeType = (typeof datasetMimeTypes)[number];

export function isDatasetMimeType(x: unknown): x is DatasetMimeType {
  return datasetMimeTypes.includes(x as DatasetMimeType);
}

export const datasetExtMap: Record<DatasetFileExt, DatasetMimeType> = {
  csv: "text/csv",
  json: "application/json",
  txt: "text/plain",
  duckdb: "application/duckdb",
  sqlite: "application/sqlite",
  postgresql: "application/postgresql",
  parquet: "application/parquet",
  arrow: "application/arrow",
  excel: "application/excel",
  url: "text/x-uri", // remote sources
};

export type Dataset = {
  kind: "DATASET";
  mimeType: DatasetMimeType;
  ext: DatasetFileExt;
  handle: FileSystemFileHandle;
  path: string;
};
