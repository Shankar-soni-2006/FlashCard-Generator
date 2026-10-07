import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext(null)

const MODES = ['light', 'dark', 'system']
const query = () => window.matchMedia('(prefers-color-scheme: dark)')

export function ThemeProvider({ children }) {
  // 'light' | 'dark' | 'system'. Older versions stored only light/dark, which stay valid.
  const [mode, setMode] = useState(() => {
    const stored = localStorage.getItem('theme')
    return MODES.includes(stored) ? stored : 'system'
  })
  const [systemDark, setSystemDark] = useState(() => query().matches)

  useEffect(() => {
    const mq = query()
    const onChange = (e) => setSystemDark(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const dark = mode === 'system' ? systemDark : mode === 'dark'

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', mode)
  }, [dark, mode])

  return (
    <ThemeContext.Provider value={{ dark, mode, setMode, toggle: () => setMode(dark ? 'light' : 'dark') }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
