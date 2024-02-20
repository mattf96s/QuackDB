export const newfileContents = `
  -- Query external JSON API and create a new table
  CREATE TABLE new_tbl AS SELECT * FROM read_json_auto('https://api.datamuse.com/words?ml=sql');
  SELECT * FROM new_tbl;

  -- Query a parquet file
  SELECT * FROM read_parquet('stores.parquet');

  -- Query a CSV file
  SELECT * FROM read_csv('stores.csv');
`;
