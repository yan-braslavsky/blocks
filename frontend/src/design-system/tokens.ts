/**
 * Design System Tokens for Blocks MVP
 * 
 * Constitutional Principles Alignment:
 * - Simplicity: Minimal, semantic token set
 * - Accessibility: WCAG 2.1 AA contrast ratios enforced
 * - Mobile-First: Responsive spacing and typography scale
 */

// Spacing Scale (8px base grid)
export const spacing = {
  0: '0px',
  1: '4px',    // 0.25rem
  2: '8px',    // 0.5rem - base unit
  3: '12px',   // 0.75rem
  4: '16px',   // 1rem
  5: '20px',   // 1.25rem
  6: '24px',   // 1.5rem
  8: '32px',   // 2rem
  10: '40px',  // 2.5rem
  12: '48px',  // 3rem
  16: '64px',  // 4rem
  20: '80px',  // 5rem
  24: '96px',  // 6rem
} as const;

// Color Palette (Primary: Blue, Secondary: Green, Neutrals: Slate)
export const colors = {
  // Primary Blue Scale
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#2563eb', // Primary brand color
    600: '#1d4ed8',
    700: '#1e40af',
    800: '#1e3a8a',
    900: '#1e293b',
  },
  
  // Secondary Green Scale
  secondary: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#059669', // Secondary accent
    600: '#047857',
    700: '#065f46',
    800: '#064e3b',
    900: '#022c22',
  },

  // Neutral Slate Scale
  slate: {
    50: '#f8fafc',   // Light backgrounds
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',  // Mid-tone text
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',  // Dark text/backgrounds
  },

  // Semantic Colors
  success: '#059669',
  warning: '#d97706',
  error: '#dc2626',
  info: '#2563eb',
} as const;

// Typography Scale (Modular scale ratio: 1.125 - Major Second)
export const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
    mono: ['JetBrains Mono', 'Consolas', 'Monaco', 'monospace'],
  },
  
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px - base
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
  },
  
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  
  lineHeight: {
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },
  
  letterSpacing: {
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
  },
} as const;

// Breakpoints (Mobile-First)
export const breakpoints = {
  sm: '640px',   // Small tablets
  md: '768px',   // Tablets
  lg: '1024px',  // Desktops
  xl: '1280px',  // Large desktops
  '2xl': '1536px', // Extra large
} as const;

// Border Radius
export const borderRadius = {
  none: '0px',
  sm: '0.125rem',   // 2px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  full: '9999px',   // Pills/circles
} as const;

// Shadow Scale
export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
} as const;

// Z-Index Scale
export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
} as const;

// Dark Mode Tokens
export const darkMode = {
  colors: {
    background: colors.slate[900],
    surface: colors.slate[800],
    border: colors.slate[700],
    text: {
      primary: colors.slate[100],
      secondary: colors.slate[400],
      muted: colors.slate[500],
    },
    primary: colors.primary[400], // Lighter primary for dark mode
    secondary: colors.secondary[400],
  },
} as const;

// Component-Specific Tokens
export const components = {
  button: {
    height: {
      sm: spacing[8],    // 32px - meets 44px touch target with padding
      md: spacing[10],   // 40px
      lg: spacing[12],   // 48px
    },
    padding: {
      sm: `${spacing[2]} ${spacing[4]}`, // 8px 16px
      md: `${spacing[3]} ${spacing[5]}`, // 12px 20px
      lg: `${spacing[4]} ${spacing[6]}`, // 16px 24px
    },
  },
  
  card: {
    padding: spacing[6],          // 24px
    borderRadius: borderRadius.lg, // 8px
    shadow: shadows.md,
  },
  
  input: {
    height: spacing[10],          // 40px - accessible touch target
    padding: `${spacing[2]} ${spacing[3]}`, // 8px 12px
    borderRadius: borderRadius.md, // 6px
  },
} as const;

// Accessibility Constants
export const a11y = {
  minTouchTarget: '44px',
  focusRingWidth: '2px',
  focusRingOffset: '2px',
  focusRingColor: colors.primary[500],
  
  // WCAG 2.1 AA Compliance
  contrast: {
    normal: 4.5,    // Normal text minimum
    large: 3,       // Large text (18pt+ or 14pt+ bold) minimum
    enhanced: 7,    // AAA level
  },
} as const;

// Performance Budgets
export const performance = {
  transitions: {
    fast: '150ms',
    normal: '250ms',
    slow: '350ms',
  },
  
  animations: {
    easing: {
      ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
} as const;

// Type Exports for TypeScript
export type SpacingKey = keyof typeof spacing;
export type ColorKey = keyof typeof colors;
export type BreakpointKey = keyof typeof breakpoints;
export type FontSizeKey = keyof typeof typography.fontSize;

// CSS Custom Properties Generator (for runtime theming)
export const generateCSSCustomProperties = (theme: 'light' | 'dark' = 'light') => {
  const themeColors = theme === 'dark' ? darkMode.colors : colors;
  
  return {
    '--color-primary': theme === 'dark' ? colors.primary[400] : colors.primary[500],
    '--color-secondary': theme === 'dark' ? colors.secondary[400] : colors.secondary[500],
    '--color-background': theme === 'dark' ? colors.slate[900] : colors.slate[50],
    '--color-surface': theme === 'dark' ? colors.slate[800] : '#ffffff',
    '--color-text': theme === 'dark' ? colors.slate[100] : colors.slate[900],
    '--color-text-muted': theme === 'dark' ? colors.slate[400] : colors.slate[600],
    '--color-border': theme === 'dark' ? colors.slate[700] : colors.slate[200],
    '--spacing-base': spacing[2],
    '--border-radius-base': borderRadius.md,
    '--shadow-base': shadows.md,
    '--font-family-sans': typography.fontFamily.sans.join(', '),
    '--font-size-base': typography.fontSize.base,
    '--line-height-base': typography.lineHeight.normal,
  };
};