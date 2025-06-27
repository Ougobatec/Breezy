"use client";
import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(undefined);

  // Lecture du localStorage AVANT le rendu
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
      setTheme(savedTheme);
    } else {
      setTheme('system');
    }
  }, []);

  useEffect(() => {
    if (!theme) return;
    const html = document.documentElement;

    // Retirer la classe dark
    html.classList.remove('dark');

    // Appliquer le thème approprié
    if (theme === 'dark') {
      html.classList.add('dark');
    } else if (theme === 'system') {
      // Pour le mode système, vérifier la préférence
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        html.classList.add('dark');
      }
    }
    // Pour 'light', on ne fait rien (pas de classe)

    // Pour le mode système, écouter les changements de préférence
    let mediaQuery;
    const handleChange = (e) => {
      if (theme === 'system') {
        if (e.matches) {
          html.classList.add('dark');
        } else {
          html.classList.remove('dark');
        }
      }
    };

    if (theme === 'system') {
      mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', handleChange);
    }

    return () => {
      if (mediaQuery) mediaQuery.removeEventListener('change', handleChange);
    };
  }, [theme]);

  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  if (!theme) return null;

  return (
    <ThemeContext.Provider value={{ theme, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};