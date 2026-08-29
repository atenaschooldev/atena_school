"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { useTheme } from '@/hooks/use-theme'
import { baseColors } from '@/config/theme-customizer-constants'
import { colorThemes, tweakcnThemes } from '@/config/theme-data'
import type { ThemePreset, ImportedTheme } from '@/types/theme-customizer'

const STORAGE_KEY = "atena_theme_customizer_state"

interface ThemeCustomizerState {
  selectedTheme: string
  selectedTweakcnTheme: string
  selectedRadius: string
  importedTheme: ImportedTheme | null
  brandColorsValues: Record<string, string>
}

const defaultState: ThemeCustomizerState = {
  selectedTheme: "default",
  selectedTweakcnTheme: "",
  selectedRadius: "0.5rem",
  importedTheme: null,
  brandColorsValues: {},
}

interface ThemeCustomizerContextType {
  selectedTheme: string
  setSelectedTheme: (theme: string) => void
  selectedTweakcnTheme: string
  setSelectedTweakcnTheme: (theme: string) => void
  selectedRadius: string
  setSelectedRadius: (radius: string) => void
  importedTheme: ImportedTheme | null
  setImportedTheme: (theme: ImportedTheme | null) => void
  brandColorsValues: Record<string, string>
  setBrandColorsValues: React.Dispatch<React.SetStateAction<Record<string, string>>>
  isDarkMode: boolean
  resetTheme: () => void
  applyTheme: (themeValue: string, darkMode: boolean) => void
  applyTweakcnTheme: (themePreset: ThemePreset, darkMode: boolean) => void
  applyImportedTheme: (themeData: ImportedTheme, darkMode: boolean) => void
  applyRadius: (radius: string) => void
  handleColorChange: (cssVar: string, value: string) => void
  updateBrandColorsFromTheme: (styles: Record<string, string>) => void
}

const ThemeCustomizerContext = createContext<ThemeCustomizerContextType | undefined>(undefined)

export function ThemeCustomizerProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme()

  const [state, setState] = useState<ThemeCustomizerState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        return {
          ...defaultState,
          ...parsed,
        }
      }
    } catch (e) {
      console.error("Failed to load theme customizer state:", e)
    }
    return defaultState
  })

  // Save to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch (e) {
      console.error("Failed to save theme customizer state:", e)
    }
  }, [state])

  const isDarkMode = useMemo(() => {
    if (theme === "dark") return true
    if (theme === "light") return false
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
    }
    return false
  }, [theme])

  const resetTheme = useCallback(() => {
    const root = document.documentElement
    const allPossibleVars = [
      'background', 'foreground', 'card', 'card-foreground', 'popover', 'popover-foreground',
      'primary', 'primary-foreground', 'secondary', 'secondary-foreground', 'muted', 'muted-foreground',
      'accent', 'accent-foreground', 'destructive', 'destructive-foreground', 'border', 'input',
      'ring', 'radius',
      'chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5',
      'sidebar', 'sidebar-background', 'sidebar-foreground', 'sidebar-primary', 'sidebar-primary-foreground', 
      'sidebar-accent', 'sidebar-accent-foreground', 'sidebar-border', 'sidebar-ring',
      'font-sans', 'font-serif', 'font-mono',
      'shadow-2xs', 'shadow-xs', 'shadow-sm', 'shadow', 'shadow-md', 'shadow-lg', 'shadow-xl', 'shadow-2xl',
      'spacing', 'tracking-normal',
      'card-header', 'card-content', 'card-footer', 'muted-background', 'accent-background',
      'destructive-background', 'warning', 'warning-foreground', 'success', 'success-foreground',
      'info', 'info-foreground'
    ]
    
    allPossibleVars.forEach(varName => {
      root.style.removeProperty(`--${varName}`)
    })
    
    const inlineStyles = root.style
    for (let i = inlineStyles.length - 1; i >= 0; i--) {
      const property = inlineStyles[i]
      if (property.startsWith('--')) {
        root.style.removeProperty(property)
      }
    }

    setState({
      selectedTheme: "default",
      selectedTweakcnTheme: "",
      selectedRadius: "0.5rem",
      importedTheme: null,
      brandColorsValues: {},
    })
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {}
  }, [])

  const updateBrandColorsFromTheme = useCallback((styles: Record<string, string>) => {
    const newValues: Record<string, string> = {}
    baseColors.forEach(color => {
      const cssVar = color.cssVar.replace('--', '')
      if (styles[cssVar]) {
        newValues[color.cssVar] = styles[cssVar]
      }
    })
    setState(prev => ({ ...prev, brandColorsValues: newValues }))
  }, [])

  const applyTheme = useCallback((themeValue: string, darkMode: boolean) => {
    const targetTheme = colorThemes.find(t => t.value === themeValue)
    if (!targetTheme) return

    const styles = darkMode ? targetTheme.preset.styles.dark : targetTheme.preset.styles.light
    const root = document.documentElement

    Object.entries(styles).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value)
    })

    updateBrandColorsFromTheme(styles)
    setState(prev => ({
      ...prev,
      selectedTheme: themeValue,
      selectedTweakcnTheme: "",
      importedTheme: null,
    }))
  }, [updateBrandColorsFromTheme])

  const applyTweakcnTheme = useCallback((themePreset: ThemePreset, darkMode: boolean) => {
    const styles = darkMode ? themePreset.styles.dark : themePreset.styles.light
    const root = document.documentElement

    Object.entries(styles).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value)
    })

    updateBrandColorsFromTheme(styles)
  }, [updateBrandColorsFromTheme])

  const applyImportedTheme = useCallback((themeData: ImportedTheme, darkMode: boolean) => {
    const root = document.documentElement
    const themeVars = darkMode ? themeData.dark : themeData.light
    
    Object.entries(themeVars).forEach(([variable, value]) => {
      root.style.setProperty(`--${variable}`, value)
    })
    
    const newBrandColors: Record<string, string> = {}
    baseColors.forEach(color => {
      const varName = color.cssVar.replace('--', '')
      if (themeVars[varName]) {
        newBrandColors[color.cssVar] = themeVars[varName]
      }
    })
    setState(prev => ({
      ...prev,
      importedTheme: themeData,
      selectedTheme: "",
      selectedTweakcnTheme: "",
      brandColorsValues: newBrandColors,
    }))
  }, [])

  const applyRadius = useCallback((radius: string) => {
    document.documentElement.style.setProperty('--radius', radius)
    setState(prev => ({ ...prev, selectedRadius: radius }))
  }, [])

  const handleColorChange = useCallback((cssVar: string, value: string) => {
    document.documentElement.style.setProperty(cssVar, value)
    setState(prev => ({
      ...prev,
      brandColorsValues: {
        ...prev.brandColorsValues,
        [cssVar]: value,
      }
    }))
  }, [])

  const setSelectedTheme = useCallback((themeName: string) => {
    setState(prev => ({ ...prev, selectedTheme: themeName }))
  }, [])

  const setSelectedTweakcnTheme = useCallback((tweakcnThemeName: string) => {
    setState(prev => ({ ...prev, selectedTweakcnTheme: tweakcnThemeName }))
  }, [])

  const setSelectedRadius = useCallback((radius: string) => {
    setState(prev => ({ ...prev, selectedRadius: radius }))
  }, [])

  const setImportedTheme = useCallback((themeData: ImportedTheme | null) => {
    setState(prev => ({ ...prev, importedTheme: themeData }))
  }, [])

  const setBrandColorsValues = useCallback((setter: any) => {
    setState(prev => ({
      ...prev,
      brandColorsValues: typeof setter === 'function' ? setter(prev.brandColorsValues) : setter
    }))
  }, [])

  // Auto-apply persisted theme and radius on mount & dark mode toggle
  useEffect(() => {
    const root = document.documentElement
    // Apply radius
    if (state.selectedRadius) {
      root.style.setProperty('--radius', state.selectedRadius)
    }

    // Apply theme preset
    if (state.importedTheme) {
      const themeVars = isDarkMode ? state.importedTheme.dark : state.importedTheme.light
      Object.entries(themeVars).forEach(([variable, value]) => {
        root.style.setProperty(`--${variable}`, value)
      })
    } else if (state.selectedTweakcnTheme) {
      const selectedPreset = tweakcnThemes.find(t => t.value === state.selectedTweakcnTheme)?.preset
      if (selectedPreset) {
        const styles = isDarkMode ? selectedPreset.styles.dark : selectedPreset.styles.light
        Object.entries(styles).forEach(([key, value]) => {
          root.style.setProperty(`--${key}`, value)
        })
      }
    } else if (state.selectedTheme && state.selectedTheme !== "default") {
      const targetTheme = colorThemes.find(t => t.value === state.selectedTheme)
      if (targetTheme) {
        const styles = isDarkMode ? targetTheme.preset.styles.dark : targetTheme.preset.styles.light
        Object.entries(styles).forEach(([key, value]) => {
          root.style.setProperty(`--${key}`, value)
        })
      }
    }

    // Apply any custom brand color overrides
    if (state.brandColorsValues && Object.keys(state.brandColorsValues).length > 0) {
      Object.entries(state.brandColorsValues).forEach(([cssVar, value]) => {
        root.style.setProperty(cssVar, value)
      })
    }
  }, [isDarkMode, state.selectedTheme, state.selectedTweakcnTheme, state.selectedRadius, state.importedTheme, state.brandColorsValues])

  const value = {
    selectedTheme: state.selectedTheme,
    setSelectedTheme,
    selectedTweakcnTheme: state.selectedTweakcnTheme,
    setSelectedTweakcnTheme,
    selectedRadius: state.selectedRadius,
    setSelectedRadius,
    importedTheme: state.importedTheme,
    setImportedTheme,
    brandColorsValues: state.brandColorsValues,
    setBrandColorsValues,
    isDarkMode,
    resetTheme,
    applyTheme,
    applyTweakcnTheme,
    applyImportedTheme,
    applyRadius,
    handleColorChange,
    updateBrandColorsFromTheme,
  }

  return (
    <ThemeCustomizerContext.Provider value={value}>
      {children}
    </ThemeCustomizerContext.Provider>
  )
}

export function useThemeCustomizerContext() {
  const context = useContext(ThemeCustomizerContext)
  if (!context) {
    throw new Error("useThemeCustomizerContext must be used within a ThemeCustomizerProvider")
  }
  return context
}
