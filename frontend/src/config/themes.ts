// Theme configuration for the To-Do application
// Defines color palettes for all available themes

export type ThemeName =
  | 'tech-modern'
  | 'warm-inviting'
  | 'professional-elegant'
  | 'natural-calm'
  | 'bold-energetic';

export interface Theme {
  name: ThemeName;
  displayName: string;
  colors: {
    // Background colors
    bgPrimary: string;
    bgSecondary: string;
    bgCard: string;
    bgHover: string;
    
    // Text colors
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    
    // Accent colors
    accentPrimary: string;
    accentSecondary: string;
    accentHover: string;
    
    // Border colors
    border: string;
    borderLight: string;
    borderFocus: string;
    
    // Button colors
    btnPrimary: string;
    btnPrimaryHover: string;
    btnSecondary: string;
    btnSecondaryHover: string;
    btnDanger: string;
    btnDangerHover: string;
    
    // Status colors
    success: string;
    warning: string;
    error: string;
  };
}

export interface ThemeConfig {
  [key: string]: Theme;
}

// Tech/Modern Theme (Default)
// Teal/cyan with dark slate backgrounds
const techModern: Theme = {
  name: 'tech-modern',
  displayName: 'Tech Modern',
  colors: {
    bgPrimary: '#0f172a',
    bgSecondary: '#1e293b',
    bgCard: 'rgba(30, 41, 59, 0.8)',
    bgHover: 'rgba(51, 65, 85, 0.6)',
    
    textPrimary: '#f1f5f9',
    textSecondary: '#cbd5e1',
    textMuted: '#94a3b8',
    
    accentPrimary: '#06b6d4',
    accentSecondary: '#0891b2',
    accentHover: '#22d3ee',
    
    border: 'rgba(148, 163, 184, 0.2)',
    borderLight: 'rgba(148, 163, 184, 0.1)',
    borderFocus: '#06b6d4',
    
    btnPrimary: '#06b6d4',
    btnPrimaryHover: '#0891b2',
    btnSecondary: 'rgba(148, 163, 184, 0.2)',
    btnSecondaryHover: 'rgba(148, 163, 184, 0.3)',
    btnDanger: '#ef4444',
    btnDangerHover: '#dc2626',
    
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
  },
};

// Warm/Inviting Theme
// Coral/peach with warm beige/cream backgrounds
const warmInviting: Theme = {
  name: 'warm-inviting',
  displayName: 'Warm Inviting',
  colors: {
    bgPrimary: '#2c1810',
    bgSecondary: '#3d2415',
    bgCard: 'rgba(61, 36, 21, 0.8)',
    bgHover: 'rgba(87, 54, 33, 0.6)',
    
    textPrimary: '#fef3e2',
    textSecondary: '#f5d7b1',
    textMuted: '#d4a574',
    
    accentPrimary: '#ff6b6b',
    accentSecondary: '#ee5a52',
    accentHover: '#ff8787',
    
    border: 'rgba(212, 165, 116, 0.25)',
    borderLight: 'rgba(212, 165, 116, 0.15)',
    borderFocus: '#ff6b6b',
    
    btnPrimary: '#ff6b6b',
    btnPrimaryHover: '#ee5a52',
    btnSecondary: 'rgba(212, 165, 116, 0.25)',
    btnSecondaryHover: 'rgba(212, 165, 116, 0.35)',
    btnDanger: '#dc2626',
    btnDangerHover: '#b91c1c',
    
    success: '#34d399',
    warning: '#fbbf24',
    error: '#f87171',
  },
};

// Professional/Elegant Theme
// Deep navy with gold/amber accents
const professionalElegant: Theme = {
  name: 'professional-elegant',
  displayName: 'Professional Elegant',
  colors: {
    bgPrimary: '#0a1628',
    bgSecondary: '#1a2332',
    bgCard: 'rgba(26, 35, 50, 0.85)',
    bgHover: 'rgba(42, 54, 74, 0.6)',
    
    textPrimary: '#f8fafc',
    textSecondary: '#e2e8f0',
    textMuted: '#94a3b8',
    
    accentPrimary: '#f59e0b',
    accentSecondary: '#d97706',
    accentHover: '#fbbf24',
    
    border: 'rgba(148, 163, 184, 0.25)',
    borderLight: 'rgba(148, 163, 184, 0.12)',
    borderFocus: '#f59e0b',
    
    btnPrimary: '#f59e0b',
    btnPrimaryHover: '#d97706',
    btnSecondary: 'rgba(148, 163, 184, 0.2)',
    btnSecondaryHover: 'rgba(148, 163, 184, 0.3)',
    btnDanger: '#ef4444',
    btnDangerHover: '#dc2626',
    
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
  },
};

// Natural/Calm Theme
// Forest green with earthy tones
const naturalCalm: Theme = {
  name: 'natural-calm',
  displayName: 'Natural Calm',
  colors: {
    bgPrimary: '#0f1e13',
    bgSecondary: '#1a2e1f',
    bgCard: 'rgba(26, 46, 31, 0.8)',
    bgHover: 'rgba(42, 64, 48, 0.6)',
    
    textPrimary: '#f0f9f4',
    textSecondary: '#d1e7dd',
    textMuted: '#94b8a3',
    
    accentPrimary: '#10b981',
    accentSecondary: '#059669',
    accentHover: '#34d399',
    
    border: 'rgba(148, 184, 163, 0.25)',
    borderLight: 'rgba(148, 184, 163, 0.12)',
    borderFocus: '#10b981',
    
    btnPrimary: '#10b981',
    btnPrimaryHover: '#059669',
    btnSecondary: 'rgba(148, 184, 163, 0.2)',
    btnSecondaryHover: 'rgba(148, 184, 163, 0.3)',
    btnDanger: '#ef4444',
    btnDangerHover: '#dc2626',
    
    success: '#10b981',
    warning: '#f59e0b',
    error: '#f87171',
  },
};

// Bold/Energetic Theme
// Vibrant orange/red with dark charcoal
const boldEnergetic: Theme = {
  name: 'bold-energetic',
  displayName: 'Bold Energetic',
  colors: {
    bgPrimary: '#1a1a1a',
    bgSecondary: '#2d2d2d',
    bgCard: 'rgba(45, 45, 45, 0.85)',
    bgHover: 'rgba(64, 64, 64, 0.6)',
    
    textPrimary: '#ffffff',
    textSecondary: '#e5e5e5',
    textMuted: '#a3a3a3',
    
    accentPrimary: '#ff5722',
    accentSecondary: '#f4511e',
    accentHover: '#ff7043',
    
    border: 'rgba(163, 163, 163, 0.3)',
    borderLight: 'rgba(163, 163, 163, 0.15)',
    borderFocus: '#ff5722',
    
    btnPrimary: '#ff5722',
    btnPrimaryHover: '#f4511e',
    btnSecondary: 'rgba(163, 163, 163, 0.25)',
    btnSecondaryHover: 'rgba(163, 163, 163, 0.35)',
    btnDanger: '#dc2626',
    btnDangerHover: '#b91c1c',
    
    success: '#22c55e',
    warning: '#fb923c',
    error: '#ef4444',
  },
};

// Export all themes as a mapped object
export const themes: ThemeConfig = {
  'tech-modern': techModern,
  'warm-inviting': warmInviting,
  'professional-elegant': professionalElegant,
  'natural-calm': naturalCalm,
  'bold-energetic': boldEnergetic,
};

// Default theme
export const defaultTheme: ThemeName = 'tech-modern';

// Helper to get theme names as array
export const themeNames: ThemeName[] = Object.keys(themes) as ThemeName[];

