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
import { SafeAreaView, StyleSheet, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';

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
      <>
        <StatusBar style="light" />
        <LoadingScreen />
      </>
    );
  }

  // ── 2. GPS off or permission denied — hard block ──────────────────────────
  if (locationBlocked) {
    return (
      <>
        <StatusBar style="light" />
        <LocationBlocker
          locationServicesEnabled={locationServicesEnabled}
          permissionStatus={permissionStatus}
          onRetry={retry}
        />
      </>
    );
  }

  // ── 3. All clear — render the map ─────────────────────────────────────────
  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="light" />
      <MapScreen userLocation={location} />
    </SafeAreaView>
  );
});

export default App;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#070714',
  },
});
