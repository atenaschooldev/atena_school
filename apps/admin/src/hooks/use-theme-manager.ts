"use client"

import { useTheme } from '@/hooks/use-theme'
import { useThemeCustomizerContext } from '@/contexts/theme-customizer-context'

export function useThemeManager() {
  const { theme, setTheme } = useTheme()
  const customizer = useThemeCustomizerContext()

  return {
    theme,
    setTheme,
    ...customizer,
  }
}
