/**
 * CrowdMarker.jsx — Individual Map Marker with Density Glow
 *
 * Why a custom marker instead of default pins?
 *  - Provides instant visual feedback: Red/Yellow/Green glow rings.
 *  - `stopPropagation` prevents map re-renders when only the marker state changes.
 *  - Wrapped in React.memo: only re-renders if the specific venue's data changes
 *    — critical when we have 20+ markers on screen.
 *
 * Rendering strategy:
 *  - Uses <Marker> with `tracksViewChanges={false}` to prevent expensive
 *    native view re-traversal on every map pan/zoom. We only set it to true
 *    briefly when selected, then back to false.
 */

import React, { memo, useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps';
import { DENSITY_CONFIG } from '../data/mockData';

const CrowdMarker = memo(({ venue, onPress }) => {
  // Track whether this marker is "active" to briefly re-enable view tracking
  const [isSelected, setIsSelected] = useState(false);

  const config = DENSITY_CONFIG[venue.density];

  const handlePress = useCallback(() => {
    setIsSelected(true);
    onPress(venue);
    // Reset after short delay — stops React Native from continuously
    // re-traversing this marker's native view tree
    setTimeout(() => setIsSelected(false), 500);
  }, [venue, onPress]);

  return (
    <Marker
      coordinate={venue.coordinate}
      onPress={handlePress}
      // PERFORMANCE: tracksViewChanges=false prevents the native layer from
      // continuously diff-ing the custom view on each map animation frame.
      tracksViewChanges={isSelected}
      anchor={{ x: 0.5, y: 0.5 }}
      identifier={venue.id}
    >
      {/* Custom callout is handled by the BottomSheet — no default callout */}
      <View style={styles.markerWrapper}>
        {/* Outer glow ring */}
        <View style={[styles.glowRing, { borderColor: config.glow, backgroundColor: config.glow }]} />
        {/* Inner solid dot */}
        <View style={[styles.dot, { backgroundColor: config.color }]}>
          <Text style={styles.emoji}>{config.emoji}</Text>
        </View>
      </View>
    </Marker>
  );
}, (prevProps, nextProps) => {
  // Custom comparison: only re-render if the venue's density or coordinates changed
  return (
    prevProps.venue.density === nextProps.venue.density &&
    prevProps.venue.coordinate.latitude === nextProps.venue.coordinate.latitude
  );
});

export default CrowdMarker;

const styles = StyleSheet.create({
  markerWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
  },
  glowRing: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    opacity: 0.4,
  },
  dot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 8,
  },
  emoji: {
    fontSize: 14,
  },
});
