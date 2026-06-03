import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Cinzel_400Regular, Cinzel_700Bold } from '@expo-google-fonts/cinzel';
import { CrimsonText_400Regular, CrimsonText_400Regular_Italic, CrimsonText_700Bold } from '@expo-google-fonts/crimson-text';
import { EBGaramond_400Regular } from '@expo-google-fonts/eb-garamond';
import { Merriweather_400Regular } from '@expo-google-fonts/merriweather';
import { SourceSerif4_400Regular } from '@expo-google-fonts/source-serif-4';
import { Lato_400Regular } from '@expo-google-fonts/lato';
import { DancingScript_400Regular } from '@expo-google-fonts/dancing-script';

// Context Providers
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';

// Router
import AppNavigator from './src/navigation/AppNavigator';
import SplashForge from './src/components/SplashForge';

function AppContent() {
  const { themeName } = useTheme();
  
  // Choose status bar style based on daylight vs dark themes
  const statusStyle = themeName === 'daylight' ? 'dark' : 'light';

  return (
    <NavigationContainer>
      <StatusBar style={statusStyle} />
      <AppNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Cinzel_400Regular,
    Cinzel_700Bold,
    CrimsonText_400Regular,
    CrimsonText_400Regular_Italic,
    CrimsonText_700Bold,
    EBGaramond_400Regular,
    Merriweather_400Regular,
    SourceSerif4_400Regular,
    Lato_400Regular,
    DancingScript_400Regular,
  });

  if (!fontsLoaded) {
    return <SplashForge />;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
