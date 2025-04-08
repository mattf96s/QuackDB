/**
 * Add a timeout to an async function invocation.
 *
 * @source https://github.com/huggingface/chat-ui/blob/main/src/lib/utils/timeout.ts
 * 
 * @example
 const result = await timeout(fetch("https://api.example.com"), 5000);
 */
export const timeout = <T>(prom: Promise<T>, time: number): Promise<T> => {
  let timer: NodeJS.Timeout;
  return Promise.race([
    prom,
    new Promise<T>((_r, rej) => (timer = setTimeout(rej, time))),
  ]).finally(() => clearTimeout(timer));
};
