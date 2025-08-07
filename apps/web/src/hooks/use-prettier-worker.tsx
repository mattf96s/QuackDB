// import { useEffect, useRef, useState } from "react";

// /**
//  * (Original inspiration](https://github.com/ritz078/transform/blob/c6e0748bad06a31373e2a8324a764e9467646742/components/ConversionPanel.tsx#L87C3-L117C49)
//  *
//  */
// export const usePrettierWorker = () => {
//   const [isWorking, setIsWorking] = useState(false);
//   const prettierWorker = useRef<Worker | null>(null);

//   useEffect(() => {
//     let worker: Worker | undefined;
//     return () => {
//       worker?.terminate();
//     };
//   }, []);

//   useEffect(() => {
//     async function transform() {
//       try {
//         setIsWorking(true);
//         prettierWorker = prettierWorker || getWorker(PrettierWorker);

//         const result = await transformer({
//           value,
//           splitEditorValue: splitTitle ? splitValue : undefined,
//         });

//         let prettyResult = await prettierWorker.send({
//           value: result,
//           language: resultLanguage,
//         });

//         // Fix for #319
//         if (prettyResult.startsWith(";<")) {
//           prettyResult = prettyResult.slice(1);
//         }
//         setResult(prettyResult);
//         setMessage("");
//       } catch (e) {
//         console.error(e);
//         setMessage(e.message);
//       }
//       toggleUpdateSpinner(false);
//     }

//     transform();
//   }, [splitValue, value, splitTitle, settings]);
// };
