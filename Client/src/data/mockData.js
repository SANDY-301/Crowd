/**
 * crowdConfig.js — Crowd Density Configuration
 *
 * Contains DENSITY constants and DENSITY_CONFIG used across the app
 * for marker colours, icons, and labels. All crowd data is now
 * live from MongoDB via the Node.js backend.
 */

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
    icon: 'warning',
    bgGradient: ['#3D0000', '#1A0000'],
  },
  [DENSITY.MEDIUM]: {
    color: '#FF9F0A',
    glow: 'rgba(255,159,10,0.35)',
    label: 'Moderately Crowded',
    icon: 'alert-circle',
    bgGradient: ['#2E1A00', '#130B00'],
  },
  [DENSITY.LOW]: {
    color: '#30D158',
    glow: 'rgba(48,209,88,0.35)',
    label: 'Mostly Free',
    icon: 'checkmark-circle',
    bgGradient: ['#00200A', '#000D04'],
  },
};
