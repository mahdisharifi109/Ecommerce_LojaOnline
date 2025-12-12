import * as React from "react"
import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light" | "system"

interface ThemeProviderState {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: "dark" | "light"
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
  resolvedTheme: "light",
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
  attribute?: string
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "theme",
  attribute = "class",
  enableSystem = true,
  disableTransitionOnChange = false,
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem(storageKey) as Theme) || defaultTheme
    }
    return defaultTheme
  })

  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">("light")

  useEffect(() => {
    const root = window.document.documentElement

    // Remover classes de tema anteriores
    root.classList.remove("light", "dark")

    // Determinar o tema a aplicar
    let effectiveTheme: "dark" | "light"

    if (theme === "system" && enableSystem) {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      effectiveTheme = systemTheme
    } else {
      effectiveTheme = theme === "dark" ? "dark" : "light"
    }

    // Desativar transições durante a mudança de tema se necessário
    if (disableTransitionOnChange) {
      root.classList.add("[&_*]:!transition-none")
      window.setTimeout(() => {
        root.classList.remove("[&_*]:!transition-none")
      }, 0)
    }

    // Aplicar o tema
    if (attribute === "class") {
      root.classList.add(effectiveTheme)
    } else {
      root.setAttribute(attribute, effectiveTheme)
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setResolvedTheme((prev) => {
      if (prev !== effectiveTheme) return effectiveTheme
      return prev
    })
  }, [theme, attribute, enableSystem, disableTransitionOnChange])

  // Escutar mudanças no tema do sistema
  useEffect(() => {
    if (!enableSystem) return

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    
    const handleChange = () => {
      if (theme === "system") {
        const root = window.document.documentElement
        root.classList.remove("light", "dark")
        const systemTheme = mediaQuery.matches ? "dark" : "light"
        root.classList.add(systemTheme)
        setResolvedTheme(systemTheme)
      }
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [theme, enableSystem])

  const value = {
    theme,
    setTheme: (newTheme: Theme) => {
      localStorage.setItem(storageKey, newTheme)
      setTheme(newTheme)
    },
    resolvedTheme,
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}