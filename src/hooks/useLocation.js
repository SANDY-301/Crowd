/**
 * useLocation.js — Aggressive Location Enforcement Hook
 *
 * This hook handles the FULL location lifecycle:
 *  1. Requests foreground location permissions from the user.
 *  2. Checks that the device's GPS/Location Services are actually ON.
 *  3. Starts a continuous location watcher so the app always has fresh coords.
 *  4. Exposes a `locationBlocked` flag — if true, the UI renders a full-screen
 *     blocker, preventing any app interaction until location is granted & active.
 *
 * Why a custom hook?
 *  - Keeps all location logic in one place (single responsibility).
 *  - Components stay clean — they just read { location, locationBlocked, error }.
 *  - The watcher is cleaned up on unmount to prevent memory leaks.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import * as Location from 'expo-location';
import { AppState } from 'react-native';

export const useLocation = () => {
  const [location, setLocation] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState(null); // 'granted' | 'denied' | 'undetermined'
  const [locationServicesEnabled, setLocationServicesEnabled] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const watcherRef = useRef(null);   // holds the subscription so we can clean it up
  const appStateRef = useRef(AppState.currentState);

  // ── Core Permission + Location Check ────────────────────────────────────────
  const checkAndRequestLocation = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Is the device's GPS hardware/service on at all?
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      setLocationServicesEnabled(servicesEnabled);

      if (!servicesEnabled) {
        setIsLoading(false);
        return; // GPS is off — blocker will render
      }

      // Step 2: Check existing permission status first (avoid redundant prompts)
      const { status: existingStatus } = await Location.getForegroundPermissionsAsync();

      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        // Step 3: Request permission — show system dialog
        const { status } = await Location.requestForegroundPermissionsAsync();
        finalStatus = status;
      }

      setPermissionStatus(finalStatus);

      if (finalStatus !== 'granted') {
        setIsLoading(false);
        return; // Permission denied — blocker will render
      }

      // Step 4: Get initial fast position
      const currentPos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLocation(currentPos.coords);

      // Step 5: Start continuous watcher for live tracking
      // Distance filter = 10m so we don't fire updates every millimeter
      watcherRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          distanceInterval: 10,      // metres — reduces update frequency
          timeInterval: 5000,        // minimum 5s between updates (battery friendly)
        },
        (pos) => {
          setLocation(pos.coords);
        }
      );
    } catch (err) {
      setError(err.message || 'Location error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── App State Listener — Re-check when user returns from Settings ─────────
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextState) => {
      // When app comes back to foreground, re-check services & permission
      // (user may have toggled GPS or changed permission in Settings)
      if (appStateRef.current.match(/inactive|background/) && nextState === 'active') {
        await checkAndRequestLocation();
      }
      appStateRef.current = nextState;
    });

    return () => subscription.remove();
  }, [checkAndRequestLocation]);

  // ── Initial call on mount ─────────────────────────────────────────────────
  useEffect(() => {
    checkAndRequestLocation();

    // Cleanup watcher on unmount — prevents memory leaks
    return () => {
      if (watcherRef.current) {
        watcherRef.current.remove();
      }
    };
  }, [checkAndRequestLocation]);

  // ── Derived State ─────────────────────────────────────────────────────────
  // locationBlocked = true means show the full-screen blocker UI
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
    retry: checkAndRequestLocation, // expose retry so the blocker screen can have a "Try Again" button
  };
};
