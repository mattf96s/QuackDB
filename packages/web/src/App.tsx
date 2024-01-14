import { ThemeProvider } from "@/lib/components/theme-provider"
import { Outlet } from "react-router-dom"

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Outlet />
    </ThemeProvider>
  )
}

export default App
