"use client";

import * as React from "react";

/**
 * Media query hook which also listens for changes.
 *
 * @example
 *
 * ```tsx
 * const isDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
 * ```
 * Taken from [Shadcn](https://github.com/shadcn-ui/ui/blob/main/apps/v4/hooks/use-media-query.tsx)
 */
export function useMediaQuery(query: string) {
	const [value, setValue] = React.useState(false);

	React.useEffect(() => {
		function onChange(event: MediaQueryListEvent) {
			setValue(event.matches);
		}

		const result = matchMedia(query);
		result.addEventListener("change", onChange);
		setValue(result.matches);

		return () => result.removeEventListener("change", onChange);
	}, [query]);

	return value;
}
