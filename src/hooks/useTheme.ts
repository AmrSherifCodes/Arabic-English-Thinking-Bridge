import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';
const THEME_STORAGE_KEY = 'tb.theme';

function getInitialTheme(): Theme {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) === 'dark' ? 'dark' : 'light';
  } catch (error) {
    console.warn('Could not read the saved theme preference.', error);
    return 'light';
  }
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (error) {
      console.warn('Could not save the theme preference.', error);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(currentTheme => (currentTheme === 'dark' ? 'light' : 'dark'));
  };

  return { theme, toggleTheme };
}
