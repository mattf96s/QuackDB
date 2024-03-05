// // https://github.com/deephaven/web-client-ui/blob/main/packages/code-studio/public/download/serviceWorker.js
// /* eslint-disable no-restricted-globals */
// /* eslint-disable no-console */

// const tableExportMap = new Map();
// const encode = TextEncoder.prototype.encode.bind(new TextEncoder());

// self.addEventListener("install", () => {
//   console.debug("installing service worker");
//   self.skipWaiting();
// });

// self.addEventListener("activate", (event) => {
//   console.debug("activate service worker");
// });

// function createCSVResponseHeader(filename) {
//   return new Headers({
//     "Content-Type": "text/csv",
//     "Content-Security-Policy": "default-src 'none'",
//     "X-Content-Security-Policy": "default-src 'none'",
//     "X-WebKit-CSP": "default-src 'none'",
//     "X-XSS-Protection": "1; mode=block",
//     "Content-Disposition": `attachment; filename*=UTF-8''${filename}`,
//   });
// }

// function createReadableStream(port) {
//   return new ReadableStream({
//     start(controller) {
//       // eslint-disable-next-line no-param-reassign
//       port.onmessage = ({ data }) => {
//         const { cancel, end, header, rows } = data;
//         if (end) {
//           port.close();
//           return controller.close();
//         }
//         if (cancel) {
//           port.close();
//           return controller.error("stream canceled");
//         }
//         if (header) {
//           return controller.enqueue(encode(header));
//         }
//         if (rows) {
//           return controller.enqueue(encode(rows));
//         }
//         return null;
//       };
//     },
//     pull(controller) {
//       port.postMessage({ readableStreamPulling: true });
//     },
//     cancel() {},
//   });
// }

// self.onfetch = (event) => {
//   const { request } = event;
//   const { url } = request;

//   console.log(`fetching... ${url}`);

//   if (tableExportMap.get(url)) {
//     const { readableStream, encodedFileName } = tableExportMap.get(url);

//     tableExportMap.delete(url);

//     event.respondWith(
//       new Response(readableStream, {
//         headers: createCSVResponseHeader(encodedFileName),
//       }),
//     );
//   }
// };

// self.onmessage = (event) => {
//   const { data, ports } = event;
//   const { encodedFileName } = data;

//   // ignore ping message
//   if (data === "ping") {
//     return;
//   }
//   if (encodedFileName && ports[0]) {
//     console.log(
//       `service worker setting ${encodedFileName} download stream on service worker`,
//     );
//     const rs = createReadableStream(ports[0]);
//     const downloadUrl = new URL(encodedFileName, self.registration.scope).href;
//     tableExportMap.set(downloadUrl, {
//       readableStream: rs,
//       port: ports[0],
//       encodedFileName,
//     });
//     ports[0].postMessage({ download: downloadUrl });
//   }
// };
