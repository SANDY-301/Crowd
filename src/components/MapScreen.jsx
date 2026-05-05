/**
 * MapScreen.jsx — Core Map Screen
 *
 * Performance Architecture:
 *
 *  1. useMemo for crowd data: generateCrowdData() runs ONCE, not on re-renders.
 *  2. useMemo for density counts: computed once, not on every render.
 *  3. useCallback for onMarkerPress: stable reference prevents marker re-renders.
 *  4. MapView with moveOnMarkerPress=false to prevent unwanted camera jumps.
 *  5. CrowdMarker uses React.memo + custom comparator: re-renders only when
 *     its own venue data changes — critical with 20+ markers.
 *  6. react-native-map-clustering: clusters nearby markers into a single
 *     cluster bubble on low zoom levels — prevents 1000s of DOM nodes.
 *  7. Markers use tracksViewChanges=false: eliminates the most common
 *     source of map lag in React Native — native view traversal on each frame.
 */

import React, { useState, useMemo, useCallback, memo } from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { PROVIDER_DEFAULT, Circle } from 'react-native-maps';
import ClusteredMapView from 'react-native-map-clustering';

import { generateCrowdData, DENSITY } from '../data/mockData';
import CrowdMarker from './CrowdMarker';
import VenueDetailSheet from './VenueDetailSheet';
import Header from './Header';
import LegendBar from './LegendBar';

// Default region: Chennai
const INITIAL_REGION = {
  latitude: 13.0407,
  longitude: 80.2337,
  latitudeDelta: 0.25,
  longitudeDelta: 0.25,
};

// Custom cluster renderer to match our dark theme
const renderCluster = (cluster) => {
  const { id, geometry, onPress, properties } = cluster;
  const points = properties.point_count;
  const size = Math.min(60, 30 + points * 2);
  return (
    <CrowdMarker
      key={`cluster_${id}`}
      venue={{
        id: `cluster_${id}`,
        name: `${points} places`,
        coordinate: {
          latitude: geometry.coordinates[1],
          longitude: geometry.coordinates[0],
        },
        density: DENSITY.HIGH,
        type: 'transport',
        crowdCount: `${points * 200}+`,
        prediction: `Cluster of ${points} crowded spots`,
        lastUpdated: new Date().toISOString(),
      }}
      onPress={() => {}}
    />
  );
};

const MapScreen = memo(({ userLocation }) => {
  // ── Generate data ONCE — useMemo ensures no re-computation on re-renders ──
  const crowdData = useMemo(() => generateCrowdData(), []);

  const [selectedVenue, setSelectedVenue] = useState(null);

  // ── Stable callback — useCallback prevents marker children from re-rendering
  const handleMarkerPress = useCallback((venue) => {
    setSelectedVenue(venue);
  }, []);

  const handleSheetClose = useCallback(() => {
    setSelectedVenue(null);
  }, []);

  // ── Derived counts — computed once per render, not inside child components ──
  const { highCount, mediumCount, lowCount } = useMemo(() => ({
    highCount: crowdData.filter(v => v.density === DENSITY.HIGH).length,
    mediumCount: crowdData.filter(v => v.density === DENSITY.MEDIUM).length,
    lowCount: crowdData.filter(v => v.density === DENSITY.LOW).length,
  }), [crowdData]);

  // ── User location region (if available) ───────────────────────────────────
  const initialRegion = useMemo(() => {
    if (userLocation) {
      return {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.08,
        longitudeDelta: 0.08,
      };
    }
    return INITIAL_REGION;
  }, [userLocation?.latitude, userLocation?.longitude]);

  return (
    <View style={styles.container}>
      {/* Header HUD */}
      <Header highCount={highCount} mediumCount={mediumCount} lowCount={lowCount} />

      {/* Clustered Map — groups nearby markers to prevent hundreds of DOM nodes */}
      <ClusteredMapView
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={initialRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={false}
        showsScale={false}
        moveOnMarkerPress={false}        // prevents unwanted camera jump
        clusterColor="#6366F1"
        clusterTextColor="#FFF"
        clusterFontFamily="System"
        radius={60}                      // clustering radius in dp — higher = more aggressive clustering
        maxZoom={20}
        minZoom={1}
        animationEnabled={false}         // disabling cluster animation reduces CPU spikes
        customMapStyle={DARK_MAP_STYLE}
      >
        {/* User location accuracy circle */}
        {userLocation && (
          <Circle
            center={{ latitude: userLocation.latitude, longitude: userLocation.longitude }}
            radius={300}
            fillColor="rgba(99,102,241,0.08)"
            strokeColor="rgba(99,102,241,0.25)"
            strokeWidth={1}
          />
        )}

        {/* Render all venue markers — each is memo'd, only updates if its own data changes */}
        {crowdData.map((venue) => (
          <CrowdMarker
            key={venue.id}
            venue={venue}
            onPress={handleMarkerPress}
          />
        ))}
      </ClusteredMapView>

      {/* Legend */}
      <LegendBar />

      {/* Venue detail bottom sheet */}
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
