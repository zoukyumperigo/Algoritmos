/**
 * App Theme Configuration
 * Includes dark mode for early morning warehouse use
 */

export const COLORS = {
  // Light Mode
  light: {
    primary: '#1E88E5',
    secondary: '#43A047',
    background: '#F5F5F5',
    surface: '#FFFFFF',
    error: '#E53935',
    warning: '#FB8C00',
    success: '#43A047',
    text: '#212121',
    textSecondary: '#757575',
    border: '#E0E0E0',
    disabled: '#BDBDBD',

    // Status colors
    available: '#4CAF50',
    assigned: '#2196F3',
    beingPrepared: '#FF9800',
    loaded: '#9C27B0',
    delivered: '#4CAF50',
  },

  // Dark Mode (for night/early morning use)
  dark: {
    primary: '#42A5F5',
    secondary: '#66BB6A',
    background: '#0D1B2A',
    surface: '#1B263B',
    error: '#EF5350',
    warning: '#FFA726',
    success: '#66BB6A',
    text: '#FFFFFF',
    textSecondary: '#B0BEC5',
    border: '#37474F',
    disabled: '#546E7A',

    // Status colors
    available: '#66BB6A',
    assigned: '#42A5F5',
    beingPrepared: '#FFA726',
    loaded: '#AB47BC',
    delivered: '#66BB6A',
  }
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 24,
  xxl: 32,
};

export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 16,
  full: 9999,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
};

// Button sizes for warehouse use (large for gloved hands)
export const BUTTON_SIZES = {
  sm: { height: 36, paddingHorizontal: SPACING.md },
  md: { height: 48, paddingHorizontal: SPACING.lg },
  lg: { height: 60, paddingHorizontal: SPACING.xl }, // Large for warehouse
};
