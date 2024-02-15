import { pipeline } from "@xenova/transformers";

class SQLTransformer {
  static task = "text-generation";
  static model = "motherduckdb/DuckDB-NSQL-7B-v0.1";
  static instance = null;

  static async getInstance(progress_callback = null) {
    if (this.instance === null) {
      // @ts-expect-error: testing
      this.instance = pipeline(this.task, this.model, { progress_callback });
    }

    return this.instance;
  }
}

// Listen for messages from the main thread
// self.addEventListener("message", async (event) => {
//   // Retrieve the translation pipeline. When called for the first time,
//   // this will load the pipeline and save it for future use.
//   const translator = await SQLTransformer.getInstance((x) => {
//     // We also add a progress callback to the pipeline so that we can
//     // track model loading.
//     self.postMessage(x);
//   });

//   // Actually perform the translation
//   const output = await translator(event.data.text, {
//     tgt_lang: event.data.tgt_lang,
//     src_lang: event.data.src_lang,

//     // Allows for partial output
//     callback_function: (x) => {
//       self.postMessage({
//         status: "update",
//         output: translator.tokenizer.decode(x[0].output_token_ids, {
//           skip_special_tokens: true,
//         }),
//       });
//     },
//   });

//   // Send the output back to the main thread
//   self.postMessage({
//     status: "complete",
//     output: output,
//   });
// });
// https://huggingface.co/docs/transformers.js/en/tutorials/react
