export const lintSql = async (sql: string) => {


    worker.postMessage({ sql });
    return new Promise((resolve, reject) => {
        worker.onmessage = (event) => {
            resolve(event.data);
        };
        worker.onerror = (error) => {
            reject(error);
        };
    });
}

export const useSqlFluff = () => {

}