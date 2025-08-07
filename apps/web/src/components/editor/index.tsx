// import lz from "lz-string";
// import { Suspense, useCallback, useEffect, useState } from "react";
// import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
// import { Textarea } from "@/components/ui/textarea";
// import { localStore } from "./utils/share";

// const getStoredCode = (location: Location) => {
//   let init_code = "";
//   if (location.hash.startsWith("#code/")) {
//     const code = location.hash.replace("#code/", "").trim();
//     localStore.code = init_code = lz.decompressFromEncodedURIComponent(code);
//   } else {
//     init_code = localStore.code;
//   }

//   return init_code;
// };

// export default function CodeEditor() {
//   const [code, setCode] = useState("");
//   const [selection, setSelection] = useState({ lo: 0, hi: 0 });

//   useEffect(() => {
//     setCode(getStoredCode(window.location));
//   }, []);

//   const onChange = useCallback((value?: string) => {
//     if (value !== undefined) {
//       setCode(value);
//     }
//   }, []);

//   return (
//     <Suspense fallback={"Loading..."}>
//       <PanelGroup
//         direction="vertical"
//         className="app-main"
//       >
//         <Panel
//           defaultSize={50}
//           minSize={33}
//           maxSize={66}
//         >
//           <Textarea
//             value={code}
//             onChange={(e) => onChange(e.target.value)}
//           />
//         </Panel>
//         <PanelResizeHandle className="divider" />
//         <Panel>
//           <pre>{code}</pre>
//         </Panel>
//       </PanelGroup>
//     </Suspense>
//   );
// }
