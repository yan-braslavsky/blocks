module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3000',
        'http://localhost:3000/onboarding',
        'http://localhost:3000/app/dashboard',
        'http://localhost:3000/app/connect-aws'
      ],
      startServerCommand: '', // Servers are started in workflow
      numberOfRuns: 3,
      settings: {
        chromeFlags: '--no-sandbox',
        // Use mobile simulation for primary audit
        formFactor: 'mobile',
        throttling: {
          rttMs: 150,
          throughputKbps: 1600,
          cpuSlowdownMultiplier: 4,
        }
      }
    },
    assert: {
      assertions: {
        // Performance thresholds (non-blocking, informational)
        'categories:performance': ['warn', { minScore: 0.7 }],
        'categories:accessibility': ['warn', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.8 }],
        'categories:seo': ['warn', { minScore: 0.8 }],
        
        // Core Web Vitals
        'first-contentful-paint': ['warn', { maxNumericValue: 3500 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 4000 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.15 }],
        'total-blocking-time': ['warn', { maxNumericValue: 400 }],
        
        // Resource optimization
        'unused-javascript': ['warn', { maxNumericValue: 100000 }],
        'render-blocking-resources': ['warn', { maxNumericValue: 500 }],
        
        // Accessibility
        'color-contrast': 'error',
        'image-alt': 'error',
        'label': 'error',
        'valid-lang': 'error',
        
        // Security
        'is-on-https': 'off', // Allow HTTP for local testing
        'uses-https': 'off',   // Allow HTTP for local testing
      }
    },
    upload: {
      target: 'temporary-public-storage'
    }
  }
};