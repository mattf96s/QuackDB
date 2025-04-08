/**
 * Hashes a string using SHA-256.
 *
 * @source https://github.com/huggingface/chat-ui/blob/main/src/lib/utils/sha256.ts
 */
export async function sha256(input: string): Promise<string> {
  const utf8 = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", utf8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((bytes) => bytes.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}
