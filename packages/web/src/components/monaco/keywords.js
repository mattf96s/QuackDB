// https://github.com/microsoft/monaco-editor/blob/main/src/basic-languages/pgsql/keywords.js
import txt from "/keywords.txt";

const keywords = await getPostgreSQLKeywords();
keywords.sort();

async function getPostgreSQLKeywords() {
    // https://www.postgresql.org/docs/current/sql-keywords-appendix.html

    const source = await fetch(txt)
        .then((response) => response.text())
        .then((text) => text.split(/\r\n|\r|\n/));

    const tokens = [];
    for (let line of source) {
        const pieces = line.split(/\t/);
        if (/non-reserved/.test(pieces[1])) {
            continue;
        }
        if (/reserved/.test(pieces[1])) {
            tokens.push(pieces[0]);
        }
    }

    tokens.push(...["PIVOT", "PIVOT_LONGER", "PIVOT_WIDER", "UNPIVOT"]);
    tokens.push(...['READ_PARQUET', 'PARQUET_SCHEMA', 'PARQUET_METADATA', 'READ_CSV', 'READ_JSON_AUTO', 'READ_JSON', 'GLOB'])

    return tokens;
}

export { keywords };
