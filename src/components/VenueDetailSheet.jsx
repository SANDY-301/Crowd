/**
 * VenueDetailSheet.jsx — Bottom Sheet with Crowd Details & Prediction
 */

import React, { useEffect, useRef, useCallback, memo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, Dimensions, ScrollView, Easing,
} from 'react-native';
import { DENSITY, DENSITY_CONFIG } from '../data/mockData';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.48;

const VenueDetailSheet = memo(({ venue, onClose }) => {
  const slideAnim = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const barWidth = useRef(new Animated.Value(0)).current;

  const config = venue ? DENSITY_CONFIG[venue.density] : null;
  const densityPercent = venue
    ? { [DENSITY.HIGH]: 0.9, [DENSITY.MEDIUM]: 0.55, [DENSITY.LOW]: 0.2 }[venue.density]
    : 0;

  useEffect(() => {
    if (venue) {
      barWidth.setValue(0);
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, damping: 18, stiffness: 200, useNativeDriver: true }),
        Animated.timing(backdropOpacity, { toValue: 0.65, duration: 300, useNativeDriver: true }),
        Animated.timing(barWidth, { toValue: densityPercent, duration: 800, delay: 300, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: SHEET_HEIGHT, duration: 250, easing: Easing.in(Easing.ease), useNativeDriver: true }),
        Animated.timing(backdropOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [venue]);

  const handleClose = useCallback(() => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: SHEET_HEIGHT, duration: 250, easing: Easing.in(Easing.ease), useNativeDriver: true }),
      Animated.timing(backdropOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => onClose());
  }, [onClose]);

  const typeBadgeMap = { transport:'🚉 Transport', mall:'🛍 Mall', market:'🛒 Market', leisure:'🌴 Leisure', hospital:'🏥 Hospital' };

  const formatTime = (iso) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (!venue) return null;

  return (
    <>
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} pointerEvents={venue ? 'auto' : 'none'}>
        <TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={handleClose} />
      </Animated.View>
      <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.handle} />
        <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
        <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
          <View style={styles.headerRow}>
            <View style={[styles.densityBadge, { backgroundColor: config.color + '22', borderColor: config.color + '55' }]}>
              <Text style={[styles.densityBadgeText, { color: config.color }]}>{config.emoji} {config.label}</Text>
            </View>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>{typeBadgeMap[venue.type] || '📍 Place'}</Text>
            </View>
          </View>
          <Text style={styles.venueName}>{venue.name}</Text>
          <View style={styles.countRow}>
            <Text style={styles.countText}>👥 ~{venue.crowdCount}</Text>
            <Text style={styles.liveTag}>LIVE</Text>
          </View>
          <View style={styles.barSection}>
            <Text style={styles.barLabel}>Crowd Level</Text>
            <View style={styles.barBg}>
              <Animated.View style={[styles.barFill, { width: barWidth.interpolate({ inputRange:[0,1], outputRange:['0%','100%'] }), backgroundColor: config.color }]} />
            </View>
            <View style={styles.barLegend}>
              <Text style={styles.barLegendText}>Empty</Text>
              <Text style={styles.barLegendText}>Packed</Text>
            </View>
          </View>
          <View style={[styles.predictionCard, { borderColor: config.color + '44' }]}>
            <View style={styles.predictionHeader}>
              <Text style={styles.predictionTitle}>🔮  AI Prediction</Text>
            </View>
            <Text style={[styles.predictionText, { color: config.color }]}>{venue.prediction}</Text>
          </View>
          <View style={styles.statsRow}>
            {[
              { icon:'🕐', label:'Updated', value: formatTime(venue.lastUpdated) },
              { icon:'📡', label:'Status', value:'Live', valueColor:'#30D158' },
              { icon:'🔁', label:'Refresh', value:'5 min' },
            ].map((s, i) => (
              <View key={i} style={styles.statCard}>
                <Text style={styles.statIcon}>{s.icon}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
                <Text style={[styles.statValue, s.valueColor && { color: s.valueColor }]}>{s.value}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </Animated.View>
    </>
  );
}, (prev, next) => prev.venue?.id === next.venue?.id);

export default VenueDetailSheet;

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: '#000', zIndex: 10 },
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: SHEET_HEIGHT,
    backgroundColor: '#0F0F1E', borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24, zIndex: 20,
    borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#000', shadowOffset: { width: 0, height: -8 }, shadowOpacity: 0.6, shadowRadius: 24, elevation: 30,
  },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.15)', alignSelf: 'center', marginBottom: 12 },
  closeBtn: { position: 'absolute', right: 20, top: 20, width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  closeBtnText: { color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: '700' },
  headerRow: { flexDirection: 'row', gap: 8, marginBottom: 10, marginTop: 4, flexWrap: 'wrap' },
  densityBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1 },
  densityBadgeText: { fontSize: 12, fontWeight: '700' },
  typeBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.07)' },
  typeBadgeText: { fontSize: 12, color: 'rgba(255,255,255,0.55)', fontWeight: '600' },
  venueName: { fontSize: 22, fontWeight: '800', color: '#FFF', marginBottom: 10, letterSpacing: -0.3 },
  countRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 },
  countText: { fontSize: 15, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  liveTag: { fontSize: 10, fontWeight: '800', color: '#30D158', backgroundColor: 'rgba(48,209,88,0.15)', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6, letterSpacing: 1, overflow: 'hidden' },
  barSection: { marginBottom: 20 },
  barLabel: { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  barBg: { width: '100%', height: 8, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  barLegend: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  barLegendText: { fontSize: 10, color: 'rgba(255,255,255,0.3)' },
  predictionCard: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 16, borderWidth: 1, marginBottom: 20 },
  predictionHeader: { marginBottom: 8 },
  predictionTitle: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 0.8 },
  predictionText: { fontSize: 15, fontWeight: '600', lineHeight: 22 },
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: { flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  statIcon: { fontSize: 20, marginBottom: 4 },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 },
  statValue: { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: '700' },
});
