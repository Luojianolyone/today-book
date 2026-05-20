import { create } from 'zustand'

type Theme = 'dark' | 'light'

interface ThemeState {
  theme: Theme
  toggle: () => void
}

const THEME_KEY = 'theme'

// Initial theme is already set by inline script in index.html
// to prevent FOUC (flash of unstyled content)
const initialTheme: Theme = document.documentElement.classList.contains('light') ? 'light' : 'dark'

export const useThemeStore = create<ThemeState>((set) => ({
  theme: initialTheme,
  toggle: () => {
    set((state) => {
      const next: Theme = state.theme === 'dark' ? 'light' : 'dark'
      localStorage.setItem(THEME_KEY, next)
      // Disable transitions during theme switch to prevent color flash
      document.documentElement.classList.add('no-transition')
      document.documentElement.classList.replace(state.theme, next)
      // Re-enable transitions after a single frame
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          document.documentElement.classList.remove('no-transition')
        })
      })
      return { theme: next }
    })
  },
}))
