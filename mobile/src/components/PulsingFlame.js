import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Animated flame icon — scale + opacity pulse with accent glow.
 * Matches SplashForge / web pulse-glow behavior.
 */
export default function PulsingFlame({
  size = 36,
  color = '#bf360c',
  glowColor = '#ff3d00',
  style,
}) {
  const pulseScale = useRef(new Animated.Value(0.95)).current;
  const pulseOpacity = useRef(new Animated.Value(0.65)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulseScale, { toValue: 1.12, duration: 1250, useNativeDriver: true }),
          Animated.timing(pulseOpacity, { toValue: 1, duration: 1250, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(pulseScale, { toValue: 0.92, duration: 1250, useNativeDriver: true }),
          Animated.timing(pulseOpacity, { toValue: 0.55, duration: 1250, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.wrap,
        style,
        { transform: [{ scale: pulseScale }], opacity: pulseOpacity },
      ]}
    >
      <Animated.View
        style={[
          styles.glow,
          {
            width: size * 1.6,
            height: size * 1.6,
            borderRadius: size * 0.8,
            backgroundColor: glowColor,
            opacity: pulseOpacity.interpolate({
              inputRange: [0.55, 1],
              outputRange: [0.15, 0.35],
            }),
          },
        ]}
      />
      <Ionicons
        name="flame"
        size={size}
        color={color}
        style={{
          textShadowColor: glowColor,
          textShadowOffset: { width: 0, height: 0 },
          textShadowRadius: 14,
        }}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
  },
});
