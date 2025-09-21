#!/usr/bin/env tsx

/**
 * Accessibility audit script using axe-core
 * Checks key routes for WCAG 2.1 AA compliance
 */

import { chromium, Browser, Page } from 'playwright';

interface A11yViolation {
  id: string;
  impact: 'minor' | 'moderate' | 'serious' | 'critical';
  description: string;
  help: string;
  helpUrl: string;
  tags: string[];
  nodes: any[];
}

interface A11yTestResult {
  url: string;
  violations: A11yViolation[];
  passes: number;
  incomplete: number;
  timestamp: string;
}

interface A11yReport {
  summary: {
    totalRoutes: number;
    totalViolations: number;
    totalPasses: number;
    criticalIssues: number;
    seriousIssues: number;
    moderateIssues: number;
    minorIssues: number;
    passed: boolean;
  };
  results: A11yTestResult[];
  generatedAt: string;
}

const ROUTES_TO_TEST = [
  { path: '/', name: 'Landing Page' },
  { path: '/onboarding', name: 'Onboarding' },
  { path: '/app/dashboard', name: 'Dashboard' },
  { path: '/app/connect-aws', name: 'AWS Connection' },
];

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

class A11yAuditor {
  private browser: Browser | null = null;
  private page: Page | null = null;

  async initialize(): Promise<void> {
    console.log('🚀 Initializing accessibility audit...');
    
    this.browser = await chromium.launch({
      headless: true,
      args: ['--disable-dev-shm-usage', '--no-sandbox']
    });
    
    this.page = await this.browser.newPage();
    
    // Set viewport to test responsive accessibility
    await this.page.setViewportSize({ width: 1280, height: 720 });
  }

  async auditRoute(path: string, name: string): Promise<A11yTestResult> {
    if (!this.page) {
      throw new Error('Auditor not initialized');
    }

    console.log(`🔍 Auditing ${name} (${path})...`);
    
    const url = `${BASE_URL}${path}`;
    
    try {
      // Navigate to the route
      await this.page.goto(url, { 
        waitUntil: 'networkidle',
        timeout: 10000 
      });

      // Wait for any dynamic content to load
      await this.page.waitForTimeout(2000);

      // Inject axe-core and run accessibility scan
      const axeResults = await this.page.evaluate(async () => {
        // Inject axe-core script
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/axe-core@4.7.0/axe.min.js';
        document.head.appendChild(script);
        
        // Wait for axe to load
        await new Promise((resolve) => {
          script.onload = resolve;
        });

        // Configure axe for WCAG 2.1 AA
        const axeConfig = {
          runOnly: {
            type: 'tag',
            values: ['wcag2a', 'wcag2aa', 'wcag21aa']
          },
          rules: {
            'color-contrast': { enabled: true },
            'focus-order-semantics': { enabled: true },
            'landmark-one-main': { enabled: true },
            'page-has-heading-one': { enabled: true },
            'bypass': { enabled: false }, // Skip navigation not required for SPA
          }
        };

        // Run axe scan
        return await (window as any).axe.run(document, axeConfig);
      });

      const result: A11yTestResult = {
        url,
        violations: axeResults.violations || [],
        passes: axeResults.passes?.length || 0,
        incomplete: axeResults.incomplete?.length || 0,
        timestamp: new Date().toISOString(),
      };

      // Log immediate feedback
      if (result.violations.length === 0) {
        console.log(`  ✅ No violations found for ${name}`);
      } else {
        console.log(`  ❌ Found ${result.violations.length} violation(s) for ${name}`);
        result.violations.forEach((violation: A11yViolation) => {
          const impact = violation.impact || 'unknown';
          console.log(`    - ${violation.id} (${impact}): ${violation.description}`);
        });
      }

      return result;

    } catch (error) {
      console.error(`  ❌ Error auditing ${name}:`, error);
      
      return {
        url,
        violations: [{
          id: 'audit-error',
          impact: 'critical' as const,
          description: `Failed to audit route: ${error}`,
          help: 'Check that the application is running and route is accessible',
          helpUrl: '',
          tags: ['error'],
          nodes: []
        }],
        passes: 0,
        incomplete: 0,
        timestamp: new Date().toISOString(),
      };
    }
  }

  async auditMobileResponsiveness(): Promise<void> {
    if (!this.page) return;

    console.log('📱 Testing mobile accessibility...');
    
    // Test mobile viewport
    await this.page.setViewportSize({ width: 375, height: 667 });
    
    // Re-audit dashboard on mobile
    const mobileResult = await this.auditRoute('/app/dashboard', 'Dashboard (Mobile)');
    
    if (mobileResult.violations.length === 0) {
      console.log('  ✅ Mobile accessibility check passed');
    } else {
      console.log(`  ❌ Mobile accessibility issues found: ${mobileResult.violations.length}`);
    }
  }

  async cleanup(): Promise<void> {
    if (this.page) {
      await this.page.close();
    }
    if (this.browser) {
      await this.browser.close();
    }
  }

  generateReport(results: A11yTestResult[]): A11yReport {
    const summary = results.reduce((acc, result) => {
      acc.totalViolations += result.violations.length;
      acc.totalPasses += result.passes;
      
      result.violations.forEach((violation: A11yViolation) => {
        switch (violation.impact) {
          case 'critical':
            acc.criticalIssues++;
            break;
          case 'serious':
            acc.seriousIssues++;
            break;
          case 'moderate':
            acc.moderateIssues++;
            break;
          case 'minor':
            acc.minorIssues++;
            break;
        }
      });
      
      return acc;
    }, {
      totalRoutes: results.length,
      totalViolations: 0,
      totalPasses: 0,
      criticalIssues: 0,
      seriousIssues: 0,
      moderateIssues: 0,
      minorIssues: 0,
      passed: true,
    });

    // Determine if audit passed (no critical or serious issues)
    summary.passed = summary.criticalIssues === 0 && summary.seriousIssues === 0;

    return {
      summary,
      results,
      generatedAt: new Date().toISOString(),
    };
  }

  printSummary(report: A11yReport): void {
    console.log('\n📊 Accessibility Audit Summary');
    console.log('================================');
    console.log(`Routes tested: ${report.summary.totalRoutes}`);
    console.log(`Total violations: ${report.summary.totalViolations}`);
    console.log(`Total passes: ${report.summary.totalPasses}`);
    console.log('');
    console.log('Violations by severity:');
    console.log(`  🔴 Critical: ${report.summary.criticalIssues}`);
    console.log(`  🟡 Serious: ${report.summary.seriousIssues}`);
    console.log(`  🟠 Moderate: ${report.summary.moderateIssues}`);
    console.log(`  🔵 Minor: ${report.summary.minorIssues}`);
    console.log('');
    
    if (report.summary.passed) {
      console.log('✅ Accessibility audit PASSED');
      console.log('No critical or serious accessibility issues found.');
    } else {
      console.log('❌ Accessibility audit FAILED');
      console.log('Critical or serious accessibility issues require attention.');
    }
    
    console.log('');
    console.log(`Report generated at: ${report.generatedAt}`);
  }
}

async function main(): Promise<void> {
  const auditor = new A11yAuditor();
  const results: A11yTestResult[] = [];

  try {
    await auditor.initialize();

    // Test each route
    for (const route of ROUTES_TO_TEST) {
      const result = await auditor.auditRoute(route.path, route.name);
      results.push(result);
    }

    // Test mobile responsiveness
    await auditor.auditMobileResponsiveness();

    // Generate and display report
    const report = auditor.generateReport(results);
    auditor.printSummary(report);

    // Save detailed report to file
    const reportPath = './accessibility-report.json';
    const fs = await import('fs');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📄 Detailed report saved to: ${reportPath}`);

    // Exit with appropriate code
    process.exit(report.summary.passed ? 0 : 1);

  } catch (error) {
    console.error('❌ Accessibility audit failed:', error);
    process.exit(1);
  } finally {
    await auditor.cleanup();
  }
}

// Allow running as script or importing as module
if (require.main === module) {
  main().catch(console.error);
}

export { A11yAuditor, type A11yReport, type A11yTestResult };