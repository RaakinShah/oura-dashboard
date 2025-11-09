'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    setMounted(true);
    // Check localStorage and system preference
    const stored = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (stored) {
      setTheme(stored);
      if (stored === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else if (systemPrefersDark) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);

    // Update the DOM
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Save to localStorage
    localStorage.setItem('theme', newTheme);
  };

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="mt-3 pt-3 border-t border-gray-800/50">
        <div className="flex w-full items-center justify-between px-3 py-2 rounded-xl bg-gray-800/50">
          <span className="text-xs text-gray-400 font-medium">Theme</span>
          <div className="h-4 w-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3 pt-3 border-t border-gray-800/50">
      <button
        onClick={toggleTheme}
        className="flex w-full items-center justify-between px-3 py-2 rounded-xl bg-gray-800/50 hover:bg-gray-800 transition-all duration-200 group"
        aria-label="Toggle dark mode"
      >
        <span className="text-xs text-gray-400 font-medium">Theme</span>
        <div className="flex items-center gap-2">
          {theme === 'dark' ? (
            <Moon className="h-4 w-4 text-purple-400" />
          ) : (
            <Sun className="h-4 w-4 text-yellow-400" />
          )}
        </div>
      </button>
    </div>
  );
}
