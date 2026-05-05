/**
 * MapScreen.web.jsx — Core Map Screen (Web Implementation)
 *
 * Performance Architecture:
 *  1. Uses react-leaflet to render OpenStreetMap completely free on the web.
 *  2. No Google API keys needed.
 *  3. React Native Metro Bundler automatically picks up this file for the web platform,
 *     and MapScreen.jsx for iOS/Android.
 */

import React, { useState, useMemo, useCallback, memo, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css'; // Requires leaflet css

import { generateCrowdData, DENSITY, DENSITY_CONFIG } from '../data/mockData';
import VenueDetailSheet from './VenueDetailSheet';
import Header from './Header';
import LegendBar from './LegendBar';

// Default region: Chennai city centre
const INITIAL_REGION = {
  latitude: 13.0407,
  longitude: 80.2337,
};

// Create custom icons using SVG data URIs for Leaflet
const createCustomIcon = (density) => {
  const config = DENSITY_CONFIG[density];
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="50" height="50">
      <circle cx="25" cy="25" r="22" fill="${config.glow}" stroke="${config.glow}" stroke-width="2" opacity="0.4" />
      <circle cx="25" cy="25" r="16" fill="${config.color}" />
      <text x="25" y="30" font-size="14" text-anchor="middle" fill="white">${config.emoji}</text>
    </svg>
  `;
  return L.icon({
    iconUrl: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
    iconSize: [50, 50],
    iconAnchor: [25, 25],
    popupAnchor: [0, -25],
  });
};

const customIcons = {
  [DENSITY.HIGH]: createCustomIcon(DENSITY.HIGH),
  [DENSITY.MEDIUM]: createCustomIcon(DENSITY.MEDIUM),
  [DENSITY.LOW]: createCustomIcon(DENSITY.LOW),
};

const MapScreenWeb = memo(({ userLocation }) => {
  const crowdData = useMemo(() => generateCrowdData(), []);
  const [selectedVenue, setSelectedVenue] = useState(null);

  const handleSheetClose = useCallback(() => {
    setSelectedVenue(null);
  }, []);

  const { highCount, mediumCount, lowCount } = useMemo(() => ({
    highCount:   crowdData.filter(v => v.density === DENSITY.HIGH).length,
    mediumCount: crowdData.filter(v => v.density === DENSITY.MEDIUM).length,
    lowCount:    crowdData.filter(v => v.density === DENSITY.LOW).length,
  }), [crowdData]);

  const initialCenter = useMemo(() => {
    if (userLocation) {
      return [userLocation.latitude, userLocation.longitude];
    }
    return [INITIAL_REGION.latitude, INITIAL_REGION.longitude];
  }, [userLocation]);

  return (
    <View style={styles.container}>
      <Header highCount={highCount} mediumCount={mediumCount} lowCount={lowCount} />

      {/* Leaflet Map for Web */}
      <View style={styles.mapWrapper}>
        <MapContainer 
          center={initialCenter} 
          zoom={13} 
          scrollWheelZoom={true} 
          style={{ height: '100%', width: '100%', backgroundColor: '#070714' }}
        >
          {/* OpenStreetMap 100% Free Tiles */}
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {userLocation && (
            <Circle
              center={[userLocation.latitude, userLocation.longitude]}
              pathOptions={{ fillColor: 'rgba(99,102,241,0.07)', color: 'rgba(99,102,241,0.2)', weight: 1 }}
              radius={400}
            />
          )}

          {crowdData.map((venue) => (
            <Marker
              key={venue.id}
              position={[venue.coordinate.latitude, venue.coordinate.longitude]}
              icon={customIcons[venue.density]}
              eventHandlers={{
                click: () => setSelectedVenue(venue),
              }}
            />
          ))}
        </MapContainer>
      </View>

      <LegendBar />

      <VenueDetailSheet venue={selectedVenue} onClose={handleSheetClose} />
    </View>
  );
});

export default MapScreenWeb;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#070714' },
  mapWrapper: { flex: 1 },
});
