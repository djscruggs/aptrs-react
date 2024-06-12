
import { useContext, useState, createContext } from 'react';
import { MoonIcon, SunIcon} from '@heroicons/react/24/solid'
export const ThemeContext = createContext('light')

interface ThemeProps {
  size?: string
}
export function ThemeIcon({size}: ThemeProps) {
  const [theme, setTheme] = useState('light')
  if(!size) size = 'sm'
  const sizes: Record<string, string> = {
    'sm': 'w-8 h-8',
    'md': 'w-10 h-10',
    'lg': 'w-12 h-12',
    'xl': 'w-14 h-14',
  }
  if(!size) size = 'sm'
  const toggleTheme = () => {
    if(theme === 'light'){
      document.documentElement.classList.add('dark')
      setTheme('dark')
    } else {
      document.documentElement.classList.remove('dark')
      setTheme('light')
    }
  }
  return (
    <ThemeContext.Provider value={theme}>
    {theme === 'light' ? <SunIcon className={sizes[size]} onClick={toggleTheme} /> : <MoonIcon className={sizes[size]} onClick={toggleTheme} />}
    </ThemeContext.Provider>
  )
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState('dark')
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
}

