import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { themes } from '../theme/colors';

const ThemeContext = createContext(null);

const DEFAULT_READING = {
  fontFamily: 'crimson',
  fontSize: 19,
  lineHeight: 'normal',
  width: 'standard',
  alignment: 'left',
};

export function ThemeProvider({ children }) {
  const [themeName, setThemeName] = useState('midnight');
  const [reading, setReadingState] = useState(DEFAULT_READING);
  const [loading, setLoading] = useState(true);

  // Load preferences from AsyncStorage
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('gf_theme');
        if (savedTheme && themes[savedTheme]) {
          setThemeName(savedTheme);
        }
        
        const savedReading = await AsyncStorage.getItem('gf_reading');
        if (savedReading) {
          setReadingState({ ...DEFAULT_READING, ...JSON.parse(savedReading) });
        }
      } catch (err) {
        console.warn('Failed to load theme preferences from storage', err);
      } finally {
        setLoading(false);
      }
    };
    loadPreferences();
  }, []);

  const setTheme = useCallback(async (t) => {
    if (themes[t]) {
      setThemeName(t);
      try {
        await AsyncStorage.setItem('gf_theme', t);
      } catch (err) {
        console.warn('Failed to save theme choice to storage', err);
      }
    }
  }, []);

  const updateReading = useCallback(async (patch) => {
    setReadingState((prev) => {
      const next = { ...prev, ...patch };
      AsyncStorage.setItem('gf_reading', JSON.stringify(next)).catch((err) =>
        console.warn('Failed to save reading preferences to storage', err)
      );
      return next;
    });
  }, []);

  const incrementFontSize = useCallback(() => {
    setReadingState((prev) => {
      const next = { ...prev, fontSize: Math.min(prev.fontSize + 1, 28) };
      AsyncStorage.setItem('gf_reading', JSON.stringify(next)).catch((err) =>
        console.warn('Failed to save font size increment', err)
      );
      return next;
    });
  }, []);

  const decrementFontSize = useCallback(() => {
    setReadingState((prev) => {
      const next = { ...prev, fontSize: Math.max(prev.fontSize - 1, 14) };
      AsyncStorage.setItem('gf_reading', JSON.stringify(next)).catch((err) =>
        console.warn('Failed to save font size decrement', err)
      );
      return next;
    });
  }, []);

  const currentTheme = themes[themeName] || themes.midnight;

  return (
    <ThemeContext.Provider
      value={{
        themeName,
        theme: currentTheme,
        setTheme,
        reading,
        updateReading,
        incrementFontSize,
        decrementFontSize,
        preferencesLoading: loading,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
