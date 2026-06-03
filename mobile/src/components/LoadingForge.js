import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { fontFamilies } from '../theme/fonts';
import PulsingFlame from './PulsingFlame';

export default function LoadingForge({ message = 'Forging...', fullPage = false }) {
  const context = useTheme();
  const theme = context ? context.theme : {
    bg: '#0a0a0f',
    bg2: '#0e0e15',
    bg3: '#12121a',
    bg4: '#181822',
    border: '#2a1a1a',
    text: '#f4ebd0',
    text2: '#d4cbb0',
    muted: '#9e9580',
    faint: '#5e5645',
    accent: '#bf360c',
    accentD: '#801300',
    gold: '#d4af37',
  };
  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    // Spin animation
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 0.4,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const content = (
    <View style={styles.container}>
      <View style={[styles.spinnerWrapper, { borderColor: theme.border }]}>
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <View style={styles.borderSpinner}>
            <View style={[styles.activeSection, { borderTopColor: theme.accent }]} />
          </View>
        </Animated.View>
        <View style={styles.iconWrapper}>
          <PulsingFlame size={26} color={theme.accent} glowColor={theme.accentD || theme.accent} />
        </View>
      </View>
      
      <Animated.Text style={[
        styles.loadingText,
        { color: theme.muted, opacity: pulseValue }
      ]}>
        {message}
      </Animated.Text>
    </View>
  );

  if (fullPage) {
    return (
      <View style={[styles.fullPageContainer, { backgroundColor: theme.bg }]}>
        {content}
      </View>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  fullPageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 15,
  },
  spinnerWrapper: {
    position: 'relative',
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  borderSpinner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeSection: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  iconWrapper: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 10,
    fontFamily: fontFamilies.display,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
});
