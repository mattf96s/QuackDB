# Vite DuckDB

AWS Login: <https://d-93675d34f6.awsapps.com/start#/>

## Editor improvements

### SQL completion

- [Windmill](https://github.com/windmill-labs/windmill/blob/main/frontend/src/lib/components/Editor.svelte)
  <https://github.com/supabase/supabase/blob/master/apps/studio/components/interfaces/SQLEditor/SQLEditor.tsx>
  <https://github.com/cudbg/sqltutor/blob/main/src/pyodide.ts>
  <https://github.com/xhluca/react-pyodide-template/blob/main/src/App.js>
  <https://dev.to/franciscomendes10866/how-to-use-service-workers-with-react-17p2>
  <https://github.com/vitejs/vite/discussions/12052>
  <https://github.com/nshiab/simple-data-analysis/blob/main/src/class/SimpleDB.ts>
  <https://github.com/chartbrew/chartbrew/blob/master/client/src/containers/EmbeddedChart.js>

## Setup

### Oddities

We need to add `@types/wicg-file-system-access` to tsconfig to get types for the OPFS (Origin Private File System).

## File Directory Structure

```plaintext
root
  sessions
    [session-id]
      metadata.txt
      datasets
        stores.csv
        sales.json
        logs.parquet
      editors
        [editor-id]
          editor-state.json (latest state of the editor; can be restored to this state)
          versions
            -- 2021-07-01.json (previous states of the editor)
            -- 2021-07-02.json
            -- 2021-07-03.json
```
