/**
 * Parse a file extension from a path
 * @param path - The path to parse
 * @returns file extension without the dot (e.g. 'png')
 *
 * @category Text
 *
 * @source https://github.com/repalash/ts-browser-helpers/blob/c9318f8f54514d588d460b83ed4ccf7479570007/src/text.ts#L33C1-L59C2
 */
export function parseFileExtension(path: string): string {
  if (!path || path === "" || path.match(/__MACOSX\/.*\._/)) return ""; // todo: proper hidden files checks
  path = path.replace(/\?.*$/, ""); // remove query string

  const basename = path.split(/[\\/]/).pop() ?? "",
    pos = basename.lastIndexOf(".");
  if (basename === "" || pos < 1) return "";
  return basename.slice(pos + 1);
}

/**
* Get the filename from a path, similar to PHP's basename()
* @param url
*
* @category Text

* @source https://github.com/repalash/ts-browser-helpers/blob/c9318f8f54514d588d460b83ed4ccf7479570007/src/text.ts#L33C1-L59C2
*/
export function getFilenameFromPath(url: string) {
  return url.substring(url.lastIndexOf("/") + 1);
}
