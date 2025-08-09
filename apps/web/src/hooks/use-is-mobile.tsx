"use client";
import * as React from "react";

/**
 * https://github.com/shadcn-ui/ui/blob/main/apps/v4/hooks/use-mobile.ts
 */
export function useIsMobile(mobileBreakpoint = 768) {
	const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
		undefined,
	);

	React.useEffect(() => {
		const mql = window.matchMedia(`(max-width: ${mobileBreakpoint - 1}px)`);
		const onChange = () => {
			setIsMobile(window.innerWidth < mobileBreakpoint);
		};
		mql.addEventListener("change", onChange);
		setIsMobile(window.innerWidth < mobileBreakpoint);
		return () => mql.removeEventListener("change", onChange);
	}, [mobileBreakpoint]);

	return !!isMobile;
}
