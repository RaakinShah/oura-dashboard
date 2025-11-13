import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'oura-theme';

export function useDarkMode() {
  const [theme, setTheme] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  // Initialize theme from storage or system preference
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    const initialTheme = stored || 'system';
    setTheme(initialTheme);
    applyTheme(initialTheme);
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      if (theme === 'system') {
        const newTheme = e.matches ? 'dark' : 'light';
        setResolvedTheme(newTheme);
        document.documentElement.classList.toggle('dark', e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const applyTheme = (newTheme: Theme) => {
    const isDark =
      newTheme === 'dark' ||
      (newTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    document.documentElement.classList.toggle('dark', isDark);
    setResolvedTheme(isDark ? 'dark' : 'light');
    localStorage.setItem(STORAGE_KEY, newTheme);
  };

  const setDarkMode = (newTheme: Theme) => {
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  const toggleDarkMode = () => {
    const newTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
    setDarkMode(newTheme);
  };

  return {
    theme,
    resolvedTheme,
    setTheme: setDarkMode,
    toggleTheme: toggleDarkMode,
    isDark: resolvedTheme === 'dark',
  };
}
