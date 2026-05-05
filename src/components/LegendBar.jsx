/**
 * LegendBar.jsx — Bottom legend showing color code meanings
 */

import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const LEGEND = [
  { color: '#FF3B30', label: 'High Crowd' },
  { color: '#FF9F0A', label: 'Moderate' },
  { color: '#30D158', label: 'Mostly Free' },
];

const LegendBar = memo(() => (
  <View style={styles.container}>
    {LEGEND.map((item) => (
      <View key={item.label} style={styles.item}>
        <View style={[styles.dot, { backgroundColor: item.color, shadowColor: item.color }]} />
        <Text style={styles.label}>{item.label}</Text>
      </View>
    ))}
  </View>
));

export default LegendBar;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(7,7,20,0.85)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    zIndex: 5,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 4,
  },
  label: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.65)',
    fontWeight: '600',
  },
});
