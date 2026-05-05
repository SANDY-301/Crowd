/**
 * App.jsx — Root Entry Point: "Where is the Crowd"
 *
 * Render flow:
 *
 *  [App starts]
 *       │
 *       ▼
 *  isLoading === true  →  <LoadingScreen />   (checking GPS + permission)
 *       │
 *       ▼
 *  locationBlocked === true  →  <LocationBlocker />  (full-screen block, no map access)
 *       │
 *       ▼
 *  All clear  →  <MapScreen />  (the actual app)
 *
 * This cascading guard ensures the app CANNOT render the map
 * without confirmed live location — aggressive enforcement as requested.
 */

import React, { memo } from 'react';
import { SafeAreaView, StyleSheet, Platform, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useLocation } from './src/hooks/useLocation';
import LoadingScreen from './src/components/LoadingScreen';
import LocationBlocker from './src/components/LocationBlocker';
import MapScreen from './src/components/MapScreen';

const App = memo(() => {
  const {
    location,
    locationBlocked,
    locationServicesEnabled,
    permissionStatus,
    isLoading,
    retry,
  } = useLocation();

  // ── 1. Still checking permissions / getting first GPS fix ─────────────────
  if (isLoading) {
    return (
      <SafeAreaProvider>
        <StatusBar style="light" />
        <LoadingScreen />
      </SafeAreaProvider>
    );
  }

  // ── 2. GPS off or permission denied — hard block ──────────────────────────
  if (locationBlocked) {
    return (
      <SafeAreaProvider>
        <StatusBar style="light" />
        <LocationBlocker
          locationServicesEnabled={locationServicesEnabled}
          permissionStatus={permissionStatus}
          onRetry={retry}
        />
      </SafeAreaProvider>
    );
  }

  // ── 3. All clear — render the map ─────────────────────────────────────────
  return (
    <SafeAreaProvider>
      <View style={styles.root}>
        <StatusBar style="light" />
        <MapScreen userLocation={location} />
      </View>
    </SafeAreaProvider>
  );
});

export default App;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#070714',
  },
});
