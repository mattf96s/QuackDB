/**
 * Format for singular or plural
 * @example
 * const inflectedItems = inflect('item')
 * print(`You have ${inflectedItems(10)} in your trolley.`)
 * Credit: https://kyleshevlin.com/snippets/inflect/
 */
export const inflect =
	(singular: string, plural = singular + 's') =>
	(quantity: number) =>
		quantity === 1 ? singular : plural

/** Remove diacritics from a string. */
export const removeDiacritics = (value: string) =>
	value.normalize('NFD').replace(/[\u0300-\u036f]/g, '')

/** Format enum to sentence case  */
export const enumToStringFormatter = (word: string) => {
	if (!word) return ''
	return word
		.split('_')
		.map(subword => {
			const first = subword.slice(0, 1)
			const rest = subword.slice(1, subword.length)
			return first.toUpperCase() + rest.toLowerCase()
		})
		.join(' ')
}

// Credit: https://stackoverflow.com/a/18650828/2391795
export function formatBytes(bytes: number, decimals?: number) {
	if (bytes == 0) return '0 Bytes'
	const k = 1024,
		dm = decimals || 2,
		sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
		i = Math.floor(Math.log(bytes) / Math.log(k))
	return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

// commonly inflected words
export const inflectedItems = inflect('item')
export const inflectedFiles = inflect('file')
export const inflectedFolders = inflect('folder')
