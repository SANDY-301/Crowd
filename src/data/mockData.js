/**
 * mockData.js — Crowd Density Mock Data Service
 *
 * Generates realistic crowd locations with density levels, names, and
 * a time-based predictive algorithm. Since we use no paid API, all data
 * is procedurally generated but designed to mimic real-world patterns
 * (busy hours, peak crowd times at malls, stations, parks, etc.)
 *
 * Performance: Data is generated once at module load and memo-ized by
 * the consuming component — no expensive re-computation on re-renders.
 */

// ─── Venue Templates ────────────────────────────────────────────────────────
const VENUE_TEMPLATES = [
  // Chennai famous spots
  { name: 'T. Nagar Bus Stand', lat: 13.0407, lng: 80.2337, type: 'transport' },
  { name: 'Marina Beach', lat: 13.0500, lng: 80.2824, type: 'leisure' },
  { name: 'Central Railway Station', lat: 13.0827, lng: 80.2707, type: 'transport' },
  { name: 'Phoenix Marketcity', lat: 12.9969, lng: 80.2143, type: 'mall' },
  { name: 'Egmore Museum', lat: 13.0694, lng: 80.2608, type: 'leisure' },
  { name: 'Koyambedu Market', lat: 13.0693, lng: 80.1947, type: 'market' },
  { name: 'Express Avenue Mall', lat: 13.0578, lng: 80.2631, type: 'mall' },
  { name: 'Vadapalani Bus Terminus', lat: 13.0527, lng: 80.2120, type: 'transport' },
  { name: 'Anna Nagar Tower Park', lat: 13.0859, lng: 80.2101, type: 'leisure' },
  { name: 'Spencer Plaza', lat: 13.0641, lng: 80.2766, type: 'mall' },
  { name: 'Nungambakkam Metro', lat: 13.0600, lng: 80.2421, type: 'transport' },
  { name: 'Besant Nagar Beach', lat: 13.0002, lng: 80.2707, type: 'leisure' },
  { name: 'Ampa Skywalk Mall', lat: 13.0867, lng: 80.2065, type: 'mall' },
  { name: 'Royapettah Hospital', lat: 13.0528, lng: 80.2639, type: 'hospital' },
  { name: 'Tambaram Railway', lat: 12.9249, lng: 80.1000, type: 'transport' },
  { name: 'Guindy Metro', lat: 13.0067, lng: 80.2206, type: 'transport' },
  { name: 'Pondy Bazaar', lat: 13.0456, lng: 80.2305, type: 'market' },
  { name: 'Velachery Bus Stop', lat: 12.9815, lng: 80.2209, type: 'transport' },
  { name: 'Shollinganallur Junction', lat: 12.9010, lng: 80.2279, type: 'transport' },
  { name: 'OMR Food Street', lat: 12.9367, lng: 80.2306, type: 'leisure' },
];

// ─── Density Levels ──────────────────────────────────────────────────────────
export const DENSITY = {
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
};

export const DENSITY_CONFIG = {
  [DENSITY.HIGH]: {
    color: '#FF3B30',
    glow: 'rgba(255,59,48,0.35)',
    label: 'Heavily Crowded',
    emoji: '🔴',
    bgGradient: ['#3D0000', '#1A0000'],
  },
  [DENSITY.MEDIUM]: {
    color: '#FF9F0A',
    glow: 'rgba(255,159,10,0.35)',
    label: 'Moderately Crowded',
    emoji: '🟡',
    bgGradient: ['#2E1A00', '#130B00'],
  },
  [DENSITY.LOW]: {
    color: '#30D158',
    glow: 'rgba(48,209,88,0.35)',
    label: 'Mostly Free',
    emoji: '🟢',
    bgGradient: ['#00200A', '#000D04'],
  },
};

// ─── Predictive Time-to-Free Algorithm ───────────────────────────────────────
/**
 * Returns how many minutes until this venue is expected to free up,
 * based on current hour, venue type, and crowd density.
 *
 * Logic:
 *  - Transport hubs: peak 8–10 AM and 5–8 PM (rush hours)
 *  - Malls: peak 11 AM–9 PM
 *  - Markets: peak 7 AM–1 PM
 *  - Leisure: peak 4 PM–8 PM (evenings / weekends)
 *  - HIGH density → longer expected free time
 */
const getPredictiveTime = (density, type) => {
  const hour = new Date().getHours();

  const baseMinutes = {
    [DENSITY.HIGH]: { transport: 35, mall: 50, market: 45, leisure: 60, hospital: 90 },
    [DENSITY.MEDIUM]: { transport: 15, mall: 25, market: 20, leisure: 30, hospital: 45 },
    [DENSITY.LOW]: { transport: 5, mall: 10, market: 8, leisure: 12, hospital: 15 },
  };

  const base = (baseMinutes[density][type] || baseMinutes[density].mall);

  // Add time-of-day modifier — peak hours add more wait
  let modifier = 0;
  if (type === 'transport' && (hour >= 8 && hour <= 10 || hour >= 17 && hour <= 20)) modifier = 20;
  else if (type === 'mall' && hour >= 14 && hour <= 21) modifier = 15;
  else if (type === 'market' && hour >= 8 && hour <= 12) modifier = 10;
  else if (type === 'leisure' && hour >= 16 && hour <= 20) modifier = 15;

  // Add small random jitter for realism (±5 min)
  const jitter = Math.floor(Math.random() * 10) - 5;
  return Math.max(5, base + modifier + jitter);
};

/**
 * Generates a human-readable prediction message.
 */
export const getPredictionMessage = (density, type) => {
  const minutes = getPredictiveTime(density, type);
  if (density === DENSITY.HIGH) {
    return `Expected to be partially free in ~${minutes} minutes`;
  } else if (density === DENSITY.MEDIUM) {
    return `Expected to clear up in ~${minutes} minutes`;
  } else {
    return `Very little wait — free in ~${minutes} minutes`;
  }
};

// ─── Live Crowd Count Simulator ───────────────────────────────────────────────
/**
 * Simulates an estimated crowd count based on density level.
 * Returns a range string like "1,200 – 1,500 people".
 */
export const getCrowdCount = (density) => {
  const ranges = {
    [DENSITY.HIGH]: [1000, 2500],
    [DENSITY.MEDIUM]: [400, 900],
    [DENSITY.LOW]: [50, 300],
  };
  const [min, max] = ranges[density];
  const count = Math.floor(Math.random() * (max - min)) + min;
  const upper = count + Math.floor(Math.random() * 200);
  return `${count.toLocaleString()} – ${upper.toLocaleString()} people`;
};

// ─── Main Generator ───────────────────────────────────────────────────────────
/**
 * generateCrowdData()
 *
 * Returns a stable array of crowd points. Called ONCE and passed down
 * via props / useMemo — never regenerated on re-render.
 */
export const generateCrowdData = () => {
  return VENUE_TEMPLATES.map((venue, index) => {
    // Deterministic density based on index + type (repeatable across re-renders)
    const densityValues = [DENSITY.HIGH, DENSITY.MEDIUM, DENSITY.LOW];
    const densityIndex = index % 3;
    const density = densityValues[densityIndex];

    // Slightly jitter coordinates so markers don't perfectly overlap
    const latJitter = (Math.random() - 0.5) * 0.001;
    const lngJitter = (Math.random() - 0.5) * 0.001;

    return {
      id: `venue_${index}`,
      name: venue.name,
      type: venue.type,
      coordinate: {
        latitude: venue.lat + latJitter,
        longitude: venue.lng + lngJitter,
      },
      density,
      crowdCount: getCrowdCount(density),
      prediction: getPredictionMessage(density, venue.type),
      lastUpdated: new Date(Date.now() - Math.floor(Math.random() * 300000)).toISOString(),
    };
  });
};
