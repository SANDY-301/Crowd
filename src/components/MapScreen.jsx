/**
 * MapScreen.jsx — Core Map Screen
 *
 * Performance Architecture:
 *  1. useMemo for crowd data — generateCrowdData() runs ONCE.
 *  2. useMemo for density counts — computed once per render.
 *  3. useCallback for onMarkerPress — stable ref prevents marker re-renders.
 *  4. MapView with moveOnMarkerPress=false — no unwanted camera jumps.
 *  5. CrowdMarker uses React.memo + custom comparator — only re-renders
 *     when its own venue data changes.
 *  6. tracksViewChanges=false on each Marker — eliminates the #1 source of
 *     map lag in React Native (native view traversal on every frame).
 *
 * NOTE: react-native-map-clustering removed — incompatible with
 * react-native-maps 1.20.1 on Expo SDK 54. Using native MapView directly.
 */

import React, { useState, useMemo, useCallback, memo, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { PROVIDER_DEFAULT, Circle, UrlTile, Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';

import { generateCrowdData, DENSITY } from '../data/mockData';
import CrowdMarker from './CrowdMarker';
import VenueDetailSheet from './VenueDetailSheet';
import Header from './Header';
import SearchBar from './SearchBar';
import LegendBar from './LegendBar';

// Default region: Chennai city centre
const INITIAL_REGION = {
  latitude: 13.0407,
  longitude: 80.2337,
  latitudeDelta: 0.25,
  longitudeDelta: 0.25,
};

const MapScreen = memo(({ userLocation }) => {
  // Generate data ONCE — useMemo ensures no re-computation on re-renders
  const crowdData = useMemo(() => generateCrowdData(), []);

  const mapRef = useRef(null);

  const [selectedVenue, setSelectedVenue] = useState(null);
  const [globalMarker, setGlobalMarker] = useState(null);

  // Stable callback — useCallback prevents marker children from re-rendering
  const handleMarkerPress = useCallback((venue) => {
    if (venue.isGlobal) {
      setGlobalMarker(venue.coordinate);
      setSelectedVenue(null);
      if (mapRef.current) {
        mapRef.current.animateToRegion({
          latitude: venue.coordinate.latitude,
          longitude: venue.coordinate.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }, 1000);
      }
      return;
    }

    setGlobalMarker(null);
    setSelectedVenue(venue);
    
    // Pan map to venue when selected
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: venue.coordinate.latitude - 0.005, // offset so it's not hidden by bottom sheet
        longitude: venue.coordinate.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }, 500);
    }
  }, []);

  const handleSheetClose = useCallback(() => {
    setSelectedVenue(null);
  }, []);

  // Derived counts — computed once, not inside child components
  const { highCount, mediumCount, lowCount } = useMemo(() => ({
    highCount:   crowdData.filter(v => v.density === DENSITY.HIGH).length,
    mediumCount: crowdData.filter(v => v.density === DENSITY.MEDIUM).length,
    lowCount:    crowdData.filter(v => v.density === DENSITY.LOW).length,
  }), [crowdData]);

  // Center map on user's live location if available, else use Chennai
  const initialRegion = useMemo(() => {
    if (userLocation) {
      return {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      };
    }
    return INITIAL_REGION;
  }, [userLocation?.latitude, userLocation?.longitude]);

  return (
    <View style={styles.container}>
      {/* Header HUD */}
      <Header
        highCount={highCount}
        mediumCount={mediumCount}
        lowCount={lowCount}
      />

      <SearchBar data={crowdData} onSelect={handleMarkerPress} />

      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={initialRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={false}
        showsScale={false}
        moveOnMarkerPress={false}
        customMapStyle={DARK_MAP_STYLE}
        // Performance: disable unnecessary overlays
        showsTraffic={false}
        showsBuildings={false}
        showsIndoors={false}
        showsPointsOfInterest={false}
        mapType="none" // Hide default map to show OSM tiles
        // Prevents map from re-rendering on every tiny pan gesture
        rotateEnabled={false}
        pitchEnabled={false}
      >
        {/* OpenStreetMap 100% Free Tiles */}
        <UrlTile
          urlTemplate="https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
          flipY={false}
        />

        {/* User accuracy circle — subtle glow around blue dot */}
        {userLocation && (
          <Circle
            center={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            }}
            radius={400}
            fillColor="rgba(99,102,241,0.07)"
            strokeColor="rgba(99,102,241,0.2)"
            strokeWidth={1}
          />
        )}

        {/* All venue markers — each memo'd, only re-renders if its density changes */}
        {crowdData.map((venue) => (
          <CrowdMarker
            key={venue.id}
            venue={venue}
            onPress={handleMarkerPress}
          />
        ))}

        {/* Global Search Marker */}
        {globalMarker && (
          <Marker coordinate={globalMarker}>
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="location" size={44} color="#FF3B30" />
            </View>
          </Marker>
        )}
      </MapView>

      {/* Bottom legend */}
      <LegendBar />

      {/* Venue detail bottom sheet — slides up on marker tap */}
      <VenueDetailSheet venue={selectedVenue} onClose={handleSheetClose} />
    </View>
  );
});

export default MapScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#070714' },
  map: { flex: 1 },
});

// ─── Dark Custom Map Style ────────────────────────────────────────────────────
const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#0d0d1a' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#0a1a0a' }] },
  { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#6b9a76' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1a1a2e' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212a37' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9ca5b3' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#16213e' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#1f2835' }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#f3d19c' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#2f3948' }] },
  { featureType: 'transit.station', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#070d1f' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#515c6d' }] },
  { featureType: 'water', elementType: 'labels.text.stroke', stylers: [{ color: '#17263c' }] },
];
