import '@testing-library/jest-dom/vitest';

// Configure accessibility testing for recommendations dashboard
// jest-axe will be imported directly in accessibility test files

// Common accessibility test configuration for recommendations dashboard
export const accessibilityRules = {
  'color-contrast': { enabled: true },
  'keyboard-navigation': { enabled: true },
  'landmark-unique': { enabled: true },
  'heading-order': { enabled: true }
};