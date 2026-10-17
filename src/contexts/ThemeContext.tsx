'use client';

/**
 * Theme Provider with localStorage persistence.
 * 
 * Features:
 * - Dark/light mode toggle
 * - localStorage persistence
 * - No flash on page load
 * - System preference detection
 */

import { createContext, useContext, useEffect, useState, useSyncExternalStore, ReactNode } from 'react';

type Theme = 'dark' | 'light' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'dark' | 'light';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'vnibb-theme';

const subscribeToHydration = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;
function subscribeToSystemTheme(onChange: () => void) {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', onChange);
  return () => mediaQuery.removeEventListener('change', onChange);
}
const systemThemeSnapshot = () => window.matchMedia('(prefers-color-scheme: dark)').matches;

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  const hydrated = useSyncExternalStore(subscribeToHydration, clientSnapshot, serverSnapshot);
  const systemDark = useSyncExternalStore(subscribeToSystemTheme, systemThemeSnapshot, clientSnapshot);
  const resolvedTheme = theme === 'system' ? (systemDark ? 'dark' : 'light') : theme;

  if (hydrated && !mounted) {
    let initialTheme: Theme = 'dark';
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === 'dark' || stored === 'light' || stored === 'system') initialTheme = stored;
    } catch (error) {
      console.error('Failed to load theme from localStorage:', error);
    }
    setThemeState(initialTheme);
    setMounted(true);
  }

  // Apply theme to document
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    const resolved = resolvedTheme;
    
    // Remove both classes first
    root.classList.remove('light', 'dark');
    
    // Add the resolved theme
    root.classList.add(resolved);
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content',
        resolved === 'dark' ? '#000000' : '#ffffff'
      );
    }

  }, [resolvedTheme, mounted]);

  const setTheme = (newTheme: Theme) => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
      setThemeState(newTheme);
    } catch (error) {
      console.error('Failed to save theme to localStorage:', error);
      setThemeState(newTheme);
    }
  };

  // Prevent flash of unstyled content
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

/**
 * Script to inject before React hydration to prevent flash.
 * Add this to your root layout or _document.
 */
export const ThemeScript = () => {
  const script = `
    (function() {
      try {
        var theme = localStorage.getItem('${THEME_STORAGE_KEY}') || 'dark';
        var resolved = theme;
        
        if (theme === 'system') {
          resolved = window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light';
        }
        
        document.documentElement.classList.add(resolved);
      } catch (e) {
        console.error('Theme initialization error:', e);
      }
    })();
  `;

  return (
    <script
      dangerouslySetInnerHTML={{ __html: script }}
      suppressHydrationWarning
    />
  );
};
