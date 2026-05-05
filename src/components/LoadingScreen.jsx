/**
 * LoadingScreen.jsx — App Startup Splash
 *
 * Shows while we check permissions and get initial GPS fix.
 * Uses lightweight Animated API (no third-party lib needed).
 */

import React, { useEffect, useRef, memo } from 'react';
import { View, Text, Animated, Easing, StyleSheet, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const LoadingScreen = memo(() => {
  const rotation = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const dotOpacity1 = useRef(new Animated.Value(0.2)).current;
  const dotOpacity2 = useRef(new Animated.Value(0.2)).current;
  const dotOpacity3 = useRef(new Animated.Value(0.2)).current;

  useEffect(() => {
    // Spinning ring
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Logo pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoScale, { toValue: 1.05, duration: 800, useNativeDriver: true }),
        Animated.timing(logoScale, { toValue: 0.95, duration: 800, useNativeDriver: true }),
      ])
    ).start();

    // Bouncing dots
    const makeDotAnim = (dot, delay) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0.2, duration: 400, useNativeDriver: true }),
          Animated.delay(800 - delay),
        ])
      ).start();

    makeDotAnim(dotOpacity1, 0);
    makeDotAnim(dotOpacity2, 200);
    makeDotAnim(dotOpacity3, 400);
  }, []);

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Background glow */}
      <View style={styles.bgGlow} />

      {/* Logo */}
      <Animated.View style={[styles.logoContainer, { transform: [{ scale: logoScale }] }]}>
        <Ionicons name="location" size={44} color="#6366F1" />
      </Animated.View>

      <Text style={styles.appName}>Where is the Crowd</Text>
      <Text style={styles.tagline}>Live Crowd Intelligence</Text>

      {/* Spinner */}
      <Animated.View style={[styles.spinner, { transform: [{ rotate: spin }] }]} />

      {/* Dots */}
      <View style={styles.dotsRow}>
        {[dotOpacity1, dotOpacity2, dotOpacity3].map((dot, i) => (
          <Animated.View key={i} style={[styles.dot, { opacity: dot }]} />
        ))}
      </View>
      <Text style={styles.loadingText}>Checking location services...</Text>
    </View>
  );
});

export default LoadingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070714',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bgGlow: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(99,102,241,0.12)',
    top: '30%',
    alignSelf: 'center',
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(99,102,241,0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(99,102,241,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  appName: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  tagline: {
    fontSize: 13,
    color: 'rgba(99,102,241,0.9)',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 48,
  },
  spinner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: 'rgba(99,102,241,0.2)',
    borderTopColor: '#6366F1',
    marginBottom: 28,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6366F1',
  },
  loadingText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 0.3,
  },
});
