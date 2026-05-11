import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext(null);

const DEFAULT_READING = {
  fontFamily: 'crimson',
  fontSize: 19,
  lineHeight: 'normal',
  width: 'standard',
  alignment: 'left',
};

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => localStorage.getItem('gf_theme') || 'midnight');
  const [reading, setReadingState] = useState(() => {
    try {
      const saved = localStorage.getItem('gf_reading');
      return saved ? { ...DEFAULT_READING, ...JSON.parse(saved) } : DEFAULT_READING;
    } catch { return DEFAULT_READING; }
  });

  // Apply theme to <html> data-theme attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('gf_theme', theme);
  }, [theme]);

  const setTheme = useCallback((t) => setThemeState(t), []);

  const updateReading = useCallback((patch) => {
    setReadingState(prev => {
      const next = { ...prev, ...patch };
      localStorage.setItem('gf_reading', JSON.stringify(next));
      return next;
    });
  }, []);

  const incrementFontSize = useCallback(() => {
    setReadingState(prev => {
      const next = { ...prev, fontSize: Math.min(prev.fontSize + 1, 28) };
      localStorage.setItem('gf_reading', JSON.stringify(next));
      return next;
    });
  }, []);

  const decrementFontSize = useCallback(() => {
    setReadingState(prev => {
      const next = { ...prev, fontSize: Math.max(prev.fontSize - 1, 14) };
      localStorage.setItem('gf_reading', JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, reading, updateReading, incrementFontSize, decrementFontSize }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
