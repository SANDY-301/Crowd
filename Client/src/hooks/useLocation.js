/**
 * useLocation.js — Aggressive Location Enforcement Hook
 *
 * Enforces: GPS ON + permission GRANTED before the map renders.
 * - Requests foreground location permissions.
 * - Checks device GPS services are enabled.
 * - Starts a continuous watcher for live tracking.
 * - Exposes `locationBlocked` — triggers full-screen blocker if true.
 * - Has a 10s TIMEOUT safety so the loading spinner never hangs forever.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import * as Location from 'expo-location';
import { AppState, Platform } from 'react-native';
import Constants from 'expo-constants';

// Simple UUID for this session
const SESSION_ID = Math.random().toString(36).substring(2, 15);

// Dynamically get the laptop's local IP address so it works on physical phones too!
const hostUri = Constants.expoConfig?.hostUri;
const localIp = hostUri ? hostUri.split(':')[0] : '10.0.2.2';
const API_URL = Platform.OS === 'web' ? 'http://localhost:5000' : `http://${localIp}:5000`;

const pushLocationToBackend = async (coords) => {
  try {
    await fetch(`${API_URL}/api/location`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: SESSION_ID,
        latitude: coords.latitude,
        longitude: coords.longitude,
      })
    });
  } catch (err) {
    console.log('Backend sync error (Is Node server running?):', err.message);
  }
};

export const useLocation = () => {
  const [location, setLocation] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState(null);
  const [locationServicesEnabled, setLocationServicesEnabled] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const watcherRef = useRef(null);
  const appStateRef = useRef(AppState.currentState);
  const timeoutRef = useRef(null);

  // ── Core Permission + Location Check ────────────────────────────────────────
  const checkAndRequestLocation = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    // Safety: 10-second timeout — never leave user on spinning screen
    timeoutRef.current = setTimeout(() => {
      setIsLoading(false);
      setError('Location check timed out. Please try again.');
    }, 10000);

    try {
      // 1) Is device GPS enabled at all?
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      setLocationServicesEnabled(servicesEnabled);

      if (!servicesEnabled) {
        clearTimeout(timeoutRef.current);
        setIsLoading(false);
        return; // GPS is off — show blocker
      }

      // 2) Check existing permission (avoid redundant prompts)
      const { status: existingStatus } = await Location.getForegroundPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Location.requestForegroundPermissionsAsync();
        finalStatus = status;
      }

      setPermissionStatus(finalStatus);

      if (finalStatus !== 'granted') {
        clearTimeout(timeoutRef.current);
        setIsLoading(false);
        return; // Permission denied — show blocker
      }

      // 3) Get initial position (fast, balanced accuracy)
      const currentPos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLocation(currentPos.coords);
      pushLocationToBackend(currentPos.coords);

      // 4) Start continuous watcher (10m distance filter → battery friendly)
      if (watcherRef.current) {
        try { watcherRef.current.remove(); } catch(e) {}
      }
      watcherRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          distanceInterval: 10,
          timeInterval: 5000,
        },
        (pos) => {
          setLocation(pos.coords);
          pushLocationToBackend(pos.coords);
        }
      );
    } catch (err) {
      setError(err.message || 'Location error occurred');
      // Even on error, stop loading — show blocker with retry
      setPermissionStatus('denied');
    } finally {
      clearTimeout(timeoutRef.current);
      setIsLoading(false);
    }
  }, []);

  // ── Re-check when app comes back to foreground (user may have changed settings)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextState) => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextState === 'active'
      ) {
        await checkAndRequestLocation();
      }
      appStateRef.current = nextState;
    });
    return () => subscription.remove();
  }, [checkAndRequestLocation]);

  // ── Initial call on mount ─────────────────────────────────────────────────
  useEffect(() => {
    checkAndRequestLocation();
    return () => {
      clearTimeout(timeoutRef.current);
      if (watcherRef.current) {
        try { watcherRef.current.remove(); } catch(e) {}
      }
    };
  }, [checkAndRequestLocation]);

  // locationBlocked = true → render the full-screen blocker, not the map
  const locationBlocked =
    !isLoading &&
    (locationServicesEnabled === false || permissionStatus !== 'granted');

  return {
    location,
    locationBlocked,
    locationServicesEnabled,
    permissionStatus,
    error,
    isLoading,
    retry: checkAndRequestLocation,
  };
};
