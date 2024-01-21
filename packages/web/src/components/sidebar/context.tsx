import * as React from 'react'
import { useSessionStorage } from "@uidotdev/usehooks";

type SidebarProviderProps = { children: React.ReactNode }

const SidebarStateContext = React.createContext<
	{ isOpen: boolean; onToggleSidebar: (isOpen: boolean) => void } | undefined
>(undefined)

function SidebarProvider({ children }: SidebarProviderProps) {
	const [isOpenCookie, setIsOpenCookie] = useSessionStorage('desktop-sidebar', false)

	const onToggleSidebar = React.useCallback(
		(isOpen: boolean) => {
			setIsOpenCookie(isOpen)
		},
		[isOpenCookie],
	)

	const value = React.useMemo(() => {
		return {
			isOpen: isOpenCookie,
			onToggleSidebar,
		}
	}, [isOpenCookie, onToggleSidebar])

	return (
		<SidebarStateContext.Provider value={value}>
			{children}
		</SidebarStateContext.Provider>
	)
}

function useSidebar() {
	const context = React.useContext(SidebarStateContext)
	if (context === undefined) {
		throw new Error('useSidebar must be used within a SidebarProvider')
	}
	return context
}

export { SidebarProvider, useSidebar }
