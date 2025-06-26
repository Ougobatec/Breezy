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

    // Retirer toutes les classes de thème
    html.classList.remove('light', 'dark', 'system');

    // Appliquer la classe correspondante
    html.classList.add(theme);

    // Pour le mode système, écouter les changements de préférence
    let mediaQuery;
    const handleChange = () => {
      // Pas besoin de faire quoi que ce soit, le CSS gère tout
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