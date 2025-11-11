"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-5 w-5" />
        <div className="h-5 w-5" />
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 px-2">
      <button
        // onClick={() => setTheme("light")} // Temporarily disabled - will be re-enabled when dark theme is fully implemented
        className={`p-1.5 rounded-md transition-colors ${
          theme === "light"
            ? "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100"
            : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
        }`}
        aria-label="Switch to light mode"
      >
        <Sun className="h-4 w-4" />
      </button>
      <button
        // onClick={() => setTheme("dark")} // Temporarily disabled - will be re-enabled when dark theme is fully implemented
        className={`p-1.5 rounded-md transition-colors ${
          theme === "dark"
            ? "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100"
            : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
        }`}
        aria-label="Switch to dark mode"
      >
        <Moon className="h-4 w-4" />
      </button>
    </div>
  )
}
