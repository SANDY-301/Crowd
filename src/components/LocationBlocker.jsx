/**
 * LocationBlocker.jsx — Full-Screen Access Denied UI
 *
 * Renders a beautiful, dark-themed blocking screen when:
 *   - GPS is turned off on the device, OR
 *   - The user denied location permission.
 *
 * The screen completely prevents any map/app access.
 * It provides context-aware messages and a "Try Again" button
 * that re-invokes the permission check via the `retry` callback.
 *
 * Performance: Wrapped in React.memo — only re-renders when
 * locationServicesEnabled or permissionStatus actually changes.
 */

import React, { useEffect, useRef, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

const { width, height } = Dimensions.get('window');

const LocationBlocker = memo(({ locationServicesEnabled, permissionStatus, onRetry }) => {
  // ── Pulse Animation for the icon ──────────────────────────────────────────
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in the whole screen
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // Infinite pulsing of the lock icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // ── Context-aware message ─────────────────────────────────────────────────
  const isGpsOff = locationServicesEnabled === false;
  const isDenied = permissionStatus === 'denied';

  const title = isGpsOff ? 'GPS is Turned Off' : 'Location Access Denied';
  const subtitle = isGpsOff
    ? 'This app requires live GPS to show crowd density around you.\n\nPlease enable Location Services in your device Settings.'
    : 'This app needs location permission to function.\n\nPlease tap "Try Again" and allow location access when prompted.';
  const icon = isGpsOff ? '📡' : '🔒';

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <StatusBar style="light" />

      {/* Background concentric rings for visual depth */}
      <View style={styles.ring3} />
      <View style={styles.ring2} />
      <View style={styles.ring1} />

      {/* Pulsing icon */}
      <Animated.Text style={[styles.icon, { transform: [{ scale: pulseAnim }] }]}>
        {icon}
      </Animated.Text>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Explanation card */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>🗺️  Why is this required?</Text>
        <Text style={styles.infoText}>
          "Where is the Crowd" tracks live crowd density around your current location.
          Without GPS, we cannot show you real-time data or give accurate predictions.
        </Text>
      </View>

      {/* Retry button */}
      <TouchableOpacity
        style={styles.button}
        onPress={onRetry}
        activeOpacity={0.8}
        accessibilityLabel="Try Again — re-request location permission"
      >
        <Text style={styles.buttonText}>🔄  Try Again</Text>
      </TouchableOpacity>

      <Text style={styles.footerNote}>
        App cannot proceed without live location.
      </Text>
    </Animated.View>
  );
});

export default LocationBlocker;

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070714',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },

  // Concentric decorative rings
  ring1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(255,59,48,0.2)',
    top: height / 2 - 220,
  },
  ring2: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 1,
    borderColor: 'rgba(255,59,48,0.12)',
    top: height / 2 - 260,
  },
  ring3: {
    position: 'absolute',
    width: 360,
    height: 360,
    borderRadius: 180,
    borderWidth: 1,
    borderColor: 'rgba(255,59,48,0.06)',
    top: height / 2 - 300,
  },

  icon: {
    fontSize: 72,
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 14,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.55)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 28,
  },
  divider: {
    width: 60,
    height: 1,
    backgroundColor: 'rgba(255,59,48,0.4)',
    marginBottom: 24,
  },
  infoCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    padding: 18,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 32,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#FF3B30',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 50,
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
    marginBottom: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.3,
  },
  footerNote: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.25)',
    textAlign: 'center',
  },
});
