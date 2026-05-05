/**
 * Header.jsx — Top HUD with live stats
 */

import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Header = memo(({ highCount, mediumCount, lowCount, userLocation }) => (
  <View style={styles.container}>
    <View style={styles.left}>
      <Text style={styles.appName}>📍 CrowdMap</Text>
      <Text style={styles.subtitle}>Live Crowd Intelligence</Text>
    </View>
    <View style={styles.pills}>
      <View style={[styles.pill, { backgroundColor: 'rgba(255,59,48,0.15)', borderColor: '#FF3B30' }]}>
        <Text style={[styles.pillText, { color: '#FF3B30' }]}>🔴 {highCount}</Text>
      </View>
      <View style={[styles.pill, { backgroundColor: 'rgba(255,159,10,0.15)', borderColor: '#FF9F0A' }]}>
        <Text style={[styles.pillText, { color: '#FF9F0A' }]}>🟡 {mediumCount}</Text>
      </View>
      <View style={[styles.pill, { backgroundColor: 'rgba(48,209,88,0.15)', borderColor: '#30D158' }]}>
        <Text style={[styles.pillText, { color: '#30D158' }]}>🟢 {lowCount}</Text>
      </View>
    </View>
  </View>
));

export default Header;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 52,
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: 'rgba(7,7,20,0.85)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 5,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.07)',
  },
  left: {},
  appName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 11,
    color: 'rgba(99,102,241,0.9)',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  pills: {
    flexDirection: 'row',
    gap: 6,
  },
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
