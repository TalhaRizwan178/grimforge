import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SplashForge() {
  const pulseScale = useRef(new Animated.Value(0.95)).current;
  const pulseOpacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulseScale, {
            toValue: 1.15,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(pulseOpacity, {
            toValue: 1.0,
            duration: 1200,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(pulseScale, {
            toValue: 0.95,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(pulseOpacity, {
            toValue: 0.6,
            duration: 1200,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.flameContainer,
          {
            transform: [{ scale: pulseScale }],
            opacity: pulseOpacity,
          },
        ]}
      >
        <Ionicons
          name="flame"
          size={84}
          color="#bf360c"
          style={styles.flameShadow}
        />
      </Animated.View>

      <Text style={styles.title}>
        GRIM<Text style={{ color: '#bf360c' }}>FORGE</Text>
      </Text>
      
      <Text style={styles.subtitle}>
        THE SAGAS OF SHADOWS
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050508',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flameContainer: {
    marginBottom: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flameShadow: {
    textShadowColor: '#ff3d00',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 18,
  },
  title: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 6,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: '#5e5645',
    fontSize: 9,
    letterSpacing: 3,
    textAlign: 'center',
  },
});
