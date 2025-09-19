import type { Config } from 'tailwindcss';
import { colors, spacing, typography, borderRadius, shadows, breakpoints } from './src/design-system/tokens';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // Design System Integration
      colors: {
        ...colors,
        // Semantic aliases
        background: 'var(--color-background)',
        surface: 'var(--color-surface)', 
        border: 'var(--color-border)',
        foreground: 'var(--color-text)',
        muted: 'var(--color-text-muted)',
      },
      spacing,
      fontFamily: {
        sans: [...typography.fontFamily.sans],
        mono: [...typography.fontFamily.mono],
      },
      fontSize: typography.fontSize,
      fontWeight: typography.fontWeight,
      lineHeight: typography.lineHeight,
      letterSpacing: typography.letterSpacing,
      borderRadius,
      boxShadow: shadows,
      screens: breakpoints,
      
      // Custom animations
      animation: {
        'fade-in': 'fadeIn 0.15s ease-out',
        'slide-up': 'slideUp 0.2s ease-out',
        'slide-down': 'slideDown 0.2s ease-out',
        'scale-in': 'scaleIn 0.15s ease-out',
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      
      // Component utilities
      minHeight: {
        'touch-target': '44px', // Accessibility requirement
      },
      
      // Grid templates for dashboard layouts
      gridTemplateColumns: {
        'kpi': 'repeat(auto-fit, minmax(280px, 1fr))',
        'dashboard': '1fr 300px',
        'dashboard-mobile': '1fr',
      },
    },
  },
  plugins: [
    // Focus-visible polyfill for better accessibility
    require('@tailwindcss/typography'),
    
    // Custom plugin for design system utilities
    function({ addUtilities, theme }: any) {
      const newUtilities = {
        // Touch-friendly interactive elements
        '.touch-target': {
          minHeight: theme('minHeight.touch-target'),
          minWidth: theme('minHeight.touch-target'),
        },
        
        // Focus ring utility
        '.focus-ring': {
          outline: 'none',
          boxShadow: `0 0 0 2px ${theme('colors.primary.500')}`,
        },
        
        // Safe area utilities for mobile
        '.safe-top': {
          paddingTop: 'env(safe-area-inset-top)',
        },
        '.safe-bottom': {
          paddingBottom: 'env(safe-area-inset-bottom)',
        },
        
        // Scroll utilities
        '.scroll-smooth': {
          scrollBehavior: 'smooth',
        },
        
        // Text truncation with tooltip affordance
        '.truncate-with-tooltip': {
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          cursor: 'help',
        },
      };
      
      addUtilities(newUtilities);
    },
  ],
};

export default config;