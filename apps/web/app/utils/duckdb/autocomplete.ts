import { type DuckDBInstance } from "~/modules/duckdb-singleton";

/**
 * Get completions for the given SQL string at the given cursor position.
 *
 * @source [Harlequin](https://github.com/tconbeer/harlequin/blob/main/src/harlequin_duckdb/completions.py)
 */
export const getCompletions = async (db: DuckDBInstance) => {
  const keywordsQuery = db.fetchResults({
    query: `
  select distinct
    keyword_name as label,
    'kw' as type_label,
    case when keyword_category = 'reserved' then 100 else 1000 end as priority,
    null as context
  from duckdb_keywords()
`,
  });

  const functionsQuery = db.fetchResults({
    query: `
      select distinct
            function_name as label,
            case when function_type = 'pragma' then 'pragma'
                when function_type = 'macro' then 'macro'
                when function_type = 'aggregate' then 'agg'
                when function_type = 'scalar' then 'fn'
                when function_type = 'table' then 'fn->T'
                else 'fn' end as type_label,
            1000 as priority,
            case 
                when database_name == 'system' then null 
                else schema_name 
            end as context
        from duckdb_functions()
        where database_name != 'temp'
        `,
  });

  const settingsQuery = db.fetchResults({
    query: `
      select distinct
        name as label,
        'set' as type_label,
        2000 as priority,
        null as context
      from duckdb_settings()`,
  });

  const typesQuery = db.fetchResults({
    query: `
        with
          system_types as (
              select distinct
                  type_name as label, 
                  'type' as type_label, 
                  1000 as priority, 
                  null as context
              from duckdb_types()
              where database_name = 'system'
          ),
          custom_types as (
              select distinct
                  type_name as label,
                  'type' as type_label,
                  1000 as priority,
                  schema_name as context
              from duckdb_types()
              where
                  database_name not in ('system', 'temp')
                  and type_name not in (select label from system_types)
          )
        select *
        from system_types
        union all
        select *
        from custom_types
      `,
  });

  // const columnsQuery = db.fetchResults({
  //   query: `
  //     with
  //       columns as (
  //           select
  //               table_name || '.' || column_name as label,
  //               'column' as type_label,
  //               1000 as priority,
  //               table_schema as context
  //           from duckdb_columns()
  //       ),
  //       views as (
  //           select
  //               view_name || '.' || column_name as label,
  //               'column' as type_label,
  //               1000 as priority,
  //               schema_name as context
  //           from duckdb_view_columns()
  //       )
  //     select *
  //     from columns
  //     union all
  //     select *
  //     from views
  //     `,
  // });

  const completions = await Promise.all([
    keywordsQuery,
    functionsQuery,
    settingsQuery,
    typesQuery,
    // columnsQuery,
  ]);

  const allCompletions = completions.flat();

  return allCompletions;
};
