// Gets the current editors highlighted text a string.
// function getEditorSelection(): string | null {
//   if (editor == null) return null;
//   const selection = editor.getSelection();
//   if (selection == null) return null;
//   return model!.getValueInRange(selection);
// }

// function conceptActionKeyId(conceptNamespace: string, conceptName: string) {
//   return `add-to-concept-${conceptNamespace}-${conceptName}`;
// }

/**
 * Not sure what this does but seems useful.
 *
 * Originally in Svelte --> so check reactivity.
 *
 * @source [Lilac](https://github.com/lilacai/lilac/blob/2e527f5a569961ae53b9b5f77b2a1dd5fbeca6f8/web/blueprint/src/lib/components/datasetView/ItemMediaTextContent.svelte#L298)
 */
// export const rememberContextKeys = (
//   editor: editor.IStandaloneCodeEditor,
//   searches: Search[] | null,
// ) => {
//   // Remember all of the context key conditions so we don't keep re-creating them.
//   const contextKeys: { [key: string]: editor.IContextKey } = {};

//   if (editor != null) {
//     // Create conditions for concepts from searches. Always set all the values to false. They will get
//     // reset below when searches are defined so we don't keep growing the actions.
//     for (const contextKey of Object.values(contextKeys)) {
//       contextKey.set(false);
//     }

//     // Set the conditions for each concept to true if they exist in the searches.
//     for (const search of searches || []) {
//       if (search.type != "concept") continue;
//       const actionKeyId = conceptActionKeyId(
//         search.concept_namespace,
//         search.concept_name,
//       );
//       // Don't recreate the key if it exists.
//       if (contextKeys[actionKeyId] == null) {
//         const contextKey = editor.createContextKey(actionKeyId, true);
//         contextKeys[actionKeyId] = contextKey;
//       } else {
//         contextKeys[actionKeyId].set(true);
//       }
//     }
//   }
// };

/**
 * Add the concept actions to the right-click menu.
 *
 * @source [Lilac](https://github.com/lilacai/lilac/blob/2e527f5a569961ae53b9b5f77b2a1dd5fbeca6f8/web/blueprint/src/lib/components/datasetView/ItemMediaTextContent.svelte#L334C3-L369C6)
 */
// export const addConceptActions = () => {
//   if (editor != null && searches != null) {
//     for (const search of searches) {
//       if (search.type == "concept") {
//         const idAdd = `add-positive-to-concept-${search.concept_name}`;
//         if (editor.getAction(idAdd) != null) continue;
//         editor.addAction({
//           id: idAdd,
//           label: `👍 add as positive to concept "${search.concept_name}"`,
//           contextMenuGroupId: "navigation_concepts",
//           precondition: conceptActionKeyId(
//             search.concept_namespace,
//             search.concept_name,
//           ),
//           run: () => {
//             const selection = getEditorSelection();
//             if (selection == null) return;

//             const label = true;
//             addConceptLabel(
//               search.concept_namespace,
//               search.concept_name,
//               selection,
//               label,
//             );
//           },
//         });
//         editor.addAction({
//           id: "add-negative-to-concept",
//           label: `👎 add as negative to concept "${search.concept_name}"`,
//           contextMenuGroupId: "navigation_concepts",
//           precondition: conceptActionKeyId(
//             search.concept_namespace,
//             search.concept_name,
//           ),
//           run: () => {
//             const selection = getEditorSelection();
//             if (selection == null) return;

//             const label = false;
//             addConceptLabel(
//               search.concept_namespace,
//               search.concept_name,
//               selection,
//               label,
//             );
//           },
//         });
//       }
//     }
//   }
// };

/**
 *  Add the search actions to the right-click menu.
 *
 * @source [Lilac](https://github.com/lilacai/lilac/blob/2e527f5a569961ae53b9b5f77b2a1dd5fbeca6f8/web/blueprint/src/lib/components/datasetView/ItemMediaTextContent.svelte#L372C2-L372C53)
 */
// export const addConceptActions = () => {
//   // Add the search actions to the right-click menu.

//   if (editor != null && embeddings != null) {
//     for (const embedding of embeddings) {
//       const idEmbedding = `find-similar-${embedding}`;
//       if (editor.getAction(idEmbedding) != null) continue;
//       editor.addAction({
//         id: idEmbedding,
//         label:
//           `🔍 More like this` +
//           (embeddings.length > 1 ? ` with ${embedding}` : ""),
//         contextMenuGroupId: "navigation_searches",
//         run: () => {
//           if (datasetViewStore == null || field == null) return;
//           const selection = getEditorSelection();
//           if (selection == null) return;

//           datasetViewStore.addSearch({
//             path: field.path,
//             type: "semantic",
//             query_type: "document",
//             query: selection,
//             embedding,
//           });
//         },
//       });
//     }
//     const idKeyword = "keyword-search";
//     if (editor.getAction(idKeyword) == null) {
//       editor.addAction({
//         id: idKeyword,
//         label: "🔍 Keyword search",
//         contextMenuGroupId: "navigation_searches",
//         run: () => {
//           if (datasetViewStore == null || field == null) return;
//           const selection = getEditorSelection();
//           if (selection == null) return;

//           datasetViewStore.addSearch({
//             path: field.path,
//             type: "keyword",
//             query: selection,
//           });
//         },
//       });
//     }
//   }
// };
