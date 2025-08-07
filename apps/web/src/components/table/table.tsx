// // https://github.com/TobikoData/sqlmesh/blob/main/web/client/src/library/components/table/Table.tsx
// import "@tanstack/react-table";
// import { useEffect, useMemo, useRef, useState } from "react";
// import Input from "@components/input/Input";
// import {
//   ChevronDownIcon,
//   ChevronUpDownIcon,
//   ChevronUpIcon,
// } from "@heroicons/react/24/solid";
// import {
//   flexRender,
//   getCoreRowModel,
//   getFilteredRowModel,
//   getSortedRowModel,
//   type RowData,
//   type SortingState,
//   useReactTable,
// } from "@tanstack/react-table";
// import { useVirtualizer } from "@tanstack/react-virtual";
// import { isArrayNotEmpty, isNotNil } from "@utils/index";
// import clsx from "clsx";
// import { EnumSize } from "@/types/enum";
// import { type TableColumn, type TableRow } from "./help";

// declare module "@tanstack/table-core" {
//   // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   interface ColumnMeta<TData extends RowData, TValue> {
//     type: string;
//   }
// }

// const MIN_HEIGHT_ROW = 24;

// export default function Table({
//   headline,
//   data = [[], []],
//   action,
// }: {
//   data: [TableColumn[], TableRow[]];
//   headline?: string;
//   action?: React.ReactNode;
// }): JSX.Element {
//   const elTableContainer = useRef<HTMLDivElement>(null);

//   const columns = useMemo(
//     () =>
//       data[0].map(({ name, type }) => ({
//         accessorKey: name,
//         meta: {
//           type,
//         },
//       })),
//     [data[0]],
//   );

//   const [sorting, setSorting] = useState<SortingState>([]);
//   const [filter, setFilter] = useState("");

//   const table = useReactTable({
//     data: data[1],
//     columns,
//     state: {
//       sorting,
//       globalFilter: filter,
//     },
//     onGlobalFilterChange: setFilter,
//     onSortingChange: setSorting,
//     getCoreRowModel: getCoreRowModel(),
//     getSortedRowModel: getSortedRowModel(),
//     getFilteredRowModel: getFilteredRowModel(),
//   });
//   const totalColumns = data[0].length + 1;
//   const { rows } = table.getRowModel();
//   const rowVirtualizer = useVirtualizer({
//     getScrollElement: () => elTableContainer.current,
//     estimateSize: () => MIN_HEIGHT_ROW,
//     count: rows.length,
//     overscan: 10,
//   });
//   const virtualRows = rowVirtualizer.getVirtualItems();
//   const totalSize = rowVirtualizer.getTotalSize();
//   const paddingTop = virtualRows.length > 0 ? virtualRows?.[0]?.start ?? 0 : 0;
//   const paddingBottom =
//     virtualRows.length > 0
//       ? totalSize - (virtualRows?.[virtualRows.length - 1]?.end ?? 0)
//       : 0;

//   useEffect(() => {
//     setFilter("");
//     setSorting([]);
//   }, [data]);

//   return (
//     <div className="flex h-full w-full flex-col">
//       <Header
//         headline={headline}
//         filter={filter}
//         setFilter={setFilter}
//       />
//       {action}
//       <div
//         ref={elTableContainer}
//         className="hover:scrollbar scrollbar--horizontal scrollbar--vertical h-full w-full overflow-auto"
//       >
//         <table
//           cellPadding={0}
//           cellSpacing={0}
//           className="w-full whitespace-nowrap text-left text-xs font-medium slashed-zero tabular-nums text-neutral-700 dark:text-neutral-300"
//         >
//           {isArrayNotEmpty(columns) && (
//             <thead className="sticky top-0">
//               {table.getHeaderGroups().map((headerGroup) => (
//                 <tr
//                   key={headerGroup.id}
//                   className="bg-neutral-10 backdrop-blur-lg"
//                   style={{ height: `${MIN_HEIGHT_ROW}px` }}
//                 >
//                   <th className="border-light dark:border-dark border-r-2 pb-1 pl-2 pr-4 pt-1 text-sm last:border-r-0">
//                     Row #
//                   </th>
//                   {headerGroup.headers.map((header) => (
//                     <th
//                       key={header.id}
//                       className="border-light dark:border-dark border-r-2 pb-1 pl-2 pr-4 pt-1 text-sm last:border-r-0"
//                     >
//                       {header.isPlaceholder ? (
//                         <></>
//                       ) : (
//                         <div
//                           className={clsx(
//                             header.column.getCanSort()
//                               ? "flex cursor-pointer select-none"
//                               : "",
//                             ["int", "float"].includes(
//                               header.column.columnDef.meta!.type,
//                             ) && "justify-end",
//                           )}
//                           onClick={header.column.getToggleSortingHandler()}
//                         >
//                           {header.column.getCanSort() && (
//                             <ChevronUpDownIcon className="mr-1 w-4" />
//                           )}
//                           {flexRender(
//                             header.column.columnDef.header,
//                             header.getContext(),
//                           )}
//                           {{
//                             asc: <ChevronDownIcon className="ml-1 w-4" />,
//                             desc: <ChevronUpIcon className="ml-1 w-4" />,
//                           }[header.column.getIsSorted() as string] ?? null}
//                         </div>
//                       )}
//                     </th>
//                   ))}
//                 </tr>
//               ))}
//             </thead>
//           )}
//           <tbody>
//             {paddingTop > 0 && (
//               <tr>
//                 <td style={{ height: `${paddingTop}px` }} />
//               </tr>
//             )}
//             {isArrayNotEmpty(virtualRows) ? (
//               virtualRows.map((virtualRow) => {
//                 const row = rows[virtualRow.index]!;

//                 return (
//                   <tr
//                     key={row.id}
//                     className="even:bg-neutral-5 hover:bg-neutral-20 hover:text-neutral-900 dark:hover:text-neutral-100"
//                     style={{ maxHeight: `${virtualRow.size}px` }}
//                   >
//                     <td
//                       style={{ maxHeight: `${virtualRow.size}px` }}
//                       className="border-light dark:border-dark border-r-2 pl-2 pr-4 text-sm last:border-r-0"
//                     >
//                       {row.index + 1}
//                     </td>
//                     {row.getVisibleCells().map((cell) => (
//                       <td
//                         key={cell.id}
//                         style={{ maxHeight: `${virtualRow.size}px` }}
//                         className={clsx(
//                           "border-light dark:border-dark border-r-2 p-4 py-1 last:border-r-0",
//                           ["int", "float"].includes(
//                             cell.column.columnDef.meta!.type,
//                           ) && "text-right",
//                         )}
//                       >
//                         {flexRender(
//                           cell.column.columnDef.cell,
//                           cell.getContext(),
//                         )}
//                       </td>
//                     ))}
//                   </tr>
//                 );
//               })
//             ) : (
//               <GhostRows
//                 columns={totalColumns > 0 ? totalColumns : undefined}
//               />
//             )}
//             {paddingBottom > 0 && (
//               <tr>
//                 <td style={{ height: `${paddingBottom}px` }} />
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//       <Footer count={rows.length} />
//     </div>
//   );
// }

// function Header({
//   headline,
//   filter,
//   setFilter,
// }: {
//   filter: string;
//   setFilter: (search: string) => void;
//   headline?: string;
// }): JSX.Element {
//   return (
//     <div className="flex items-center py-1 text-xs font-medium text-neutral-600 dark:text-neutral-300">
//       {isNotNil(headline) && <h4 className="w-full font-bold">{headline}</h4>}
//       <div className="flex items-center justify-end">
//         <Input
//           className="!m-0 mb-2"
//           size={EnumSize.sm}
//         >
//           {({ className }) => (
//             <Input.Textfield
//               type="search"
//               className={clsx(className, "w-full")}
//               value={filter}
//               placeholder="Filter Rows"
//               onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
//                 setFilter(e.target.value);
//               }}
//             />
//           )}
//         </Input>
//       </div>
//     </div>
//   );
// }

// export function Footer({ count }: { count: number }): JSX.Element {
//   return (
//     <div className="py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300">
//       <p>Total Rows: {count}</p>
//     </div>
//   );
// }

// export function GhostRows({
//   rows = 7,
//   columns = 5,
// }: {
//   rows?: number;
//   columns?: number;
// }): JSX.Element {
//   return (
//     <>
//       {Array(rows)
//         .fill(undefined)
//         .map((_, row) => (
//           <tr
//             key={row}
//             className="odd:bg-neutral-10"
//             style={{ height: `${MIN_HEIGHT_ROW}px` }}
//           >
//             {Array(columns)
//               .fill(undefined)
//               .map((_, col) => (
//                 <td
//                   key={col}
//                   className="border-light dark:border-dark border-r-2 p-4 py-1 last:border-r-0"
//                 ></td>
//               ))}
//           </tr>
//         ))}
//     </>
//   );
// }
