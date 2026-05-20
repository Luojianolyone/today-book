import { useThemeStore } from '@/stores/themeStore'

/** Returns 'dark' or 'light' string for conditional class names */
export function useTheme() {
  const isDark = useThemeStore((s) => s.theme) === 'dark'
  return {
    isDark,
    isLight: !isDark,
    /** Pick a class for dark / light */
    pick: (darkClass: string, lightClass: string) => (isDark ? darkClass : lightClass),
  }
}
