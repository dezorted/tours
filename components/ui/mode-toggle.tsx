"use client"

import { useTheme } from "next-themes"

export function ModeToggle() {
  // Keep the useTheme hook to avoid breaking any code that might depend on it
  const { setTheme, theme } = useTheme()

  // Return null instead of the button to remove the theme toggle
  return null
}
