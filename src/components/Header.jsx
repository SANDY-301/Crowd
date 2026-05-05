/**
 * Header.jsx — Top HUD with live stats
 */

import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Header = memo(({ highCount, mediumCount, lowCount, userLocation }) => {
  const insets = useSafeAreaInsets();
  
  return (
  <View style={[styles.container, { paddingTop: Math.max(insets.top, 20) + 10 }]}>
    <View style={styles.left}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
        <Ionicons name="location" size={20} color="#6366F1" />
        <Text style={styles.appName}>CrowdMap</Text>
      </View>
      <Text style={styles.subtitle}>Live Crowd Intelligence</Text>
    </View>
    <View style={styles.pills}>
      <View style={[styles.pill, { backgroundColor: 'rgba(255,59,48,0.15)', borderColor: '#FF3B30' }]}>
        <Ionicons name="ellipse" size={8} color="#FF3B30" />
        <Text style={[styles.pillText, { color: '#FF3B30' }]}>{highCount}</Text>
      </View>
      <View style={[styles.pill, { backgroundColor: 'rgba(255,159,10,0.15)', borderColor: '#FF9F0A' }]}>
        <Ionicons name="ellipse" size={8} color="#FF9F0A" />
        <Text style={[styles.pillText, { color: '#FF9F0A' }]}>{mediumCount}</Text>
      </View>
      <View style={[styles.pill, { backgroundColor: 'rgba(48,209,88,0.15)', borderColor: '#30D158' }]}>
        <Ionicons name="ellipse" size={8} color="#30D158" />
        <Text style={[styles.pillText, { color: '#30D158' }]}>{lowCount}</Text>
      </View>
    </View>
  </View>
  );
});

export default Header;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
