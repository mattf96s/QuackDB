export const lintSql = async (sql: string) => {
  const { asyncRun } = await import("./fluff");

  console.log("lintSql: ", sql);
  const script = `
    import sqlfluff
    from js import sql
    lint_result = sqlfluff.lint(sql, dialect="duckdb")
  `;
  const context = { sql };
  try {
    // @ts-expect-error - TODO: fix this
    const { results, error } = await asyncRun(script, context);
    if (results) {
      console.log("pyodideWorker return results: ", results);
    } else if (error) {
      console.log("pyodideWorker error: ", error);
    }
  } catch (e) {
    console.log(
      // @ts-expect-error - TODO: fix this
      `Error in pyodideWorker at ${e.filename}, Line: ${e.lineno}, ${e.message}`,
    );
  }
};
// export const lintSql = async (sql: string) => {

//     worker.postMessage({ sql });
//     return new Promise((resolve, reject) => {
//         worker.onmessage = (event) => {
//             resolve(event.data);
//         };
//         worker.onerror = (error) => {
//             reject(error);
//         };
//     });
// }
