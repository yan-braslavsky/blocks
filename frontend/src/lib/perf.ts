/**
 * Performance markers for client-side monitoring
 * Collects timing data and sends to mock collector endpoint
 */

export interface PerfMarker {
  name: string;
  value: number;
  timestamp: number;
  url?: string;
  userAgent?: string;
  connectionType?: string;
}

export interface PerfBatch {
  sessionId: string;
  tenantId?: string;
  markers: PerfMarker[];
  metadata?: Record<string, string>;
}

class PerformanceCollector {
  private markers: PerfMarker[] = [];
  private sessionId: string;
  private batchSize = 10;
  private flushInterval = 30000; // 30 seconds
  private timer: NodeJS.Timeout | null = null;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.setupAutoFlush();
    this.setupPageVisibilityListener();
  }

  /**
   * Mark a performance event
   */
  mark(name: string, value?: number): void {
    const marker: PerfMarker = {
      name,
      value: value ?? performance.now(),
      timestamp: Date.now(),
    };

    if (typeof window !== 'undefined') {
      marker.url = window.location.pathname;
    }

    if (typeof navigator !== 'undefined') {
      marker.userAgent = navigator.userAgent;
    }

    const connectionType = this.getConnectionType();
    if (connectionType) {
      marker.connectionType = connectionType;
    }

    this.markers.push(marker);

    // Auto-flush if batch size reached
    if (this.markers.length >= this.batchSize) {
      this.flush();
    }
  }

  /**
   * Measure time between two marks
   */
  measure(name: string, startMark: string, endMark?: string): void {
    try {
      if (endMark) {
        performance.measure(name, startMark, endMark);
      } else {
        performance.measure(name, startMark);
      }

      const entry = performance.getEntriesByName(name, 'measure')[0];
      if (entry) {
        this.mark(`measure:${name}`, entry.duration);
      }
    } catch (error) {
      console.warn('Performance measure failed:', error);
    }
  }

  /**
   * Mark Core Web Vitals
   */
  markWebVital(
    name: 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB',
    value: number
  ): void {
    this.mark(`webvital:${name}`, value);
  }

  /**
   * Mark custom timing
   */
  markTiming(name: string, startTime: number, endTime?: number): void {
    const duration = (endTime ?? performance.now()) - startTime;
    this.mark(`timing:${name}`, duration);
  }

  /**
   * Flush accumulated markers to collector
   */
  async flush(): Promise<void> {
    if (this.markers.length === 0) return;

    const batch: PerfBatch = {
      sessionId: this.sessionId,
      markers: [...this.markers],
      metadata: {
        timestamp: new Date().toISOString(),
        url: typeof window !== 'undefined' ? window.location.href : '',
      },
    };

    const tenantId = this.getTenantId();
    if (tenantId) {
      batch.tenantId = tenantId;
    }

    this.markers = []; // Clear markers

    try {
      await fetch('/api/perf/collect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(batch),
      });
    } catch (error) {
      console.warn('Failed to send performance data:', error);
      // Re-add markers on failure for retry
      this.markers.unshift(...batch.markers);
    }
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.flush(); // Final flush
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private getTenantId(): string | undefined {
    // Extract from context/localStorage - placeholder for now
    return typeof window !== 'undefined'
      ? window.localStorage.getItem('tenantId') || undefined
      : undefined;
  }

  private getConnectionType(): string | undefined {
    if (typeof navigator !== 'undefined' && 'connection' in navigator) {
      const connection = (navigator as any).connection;
      return connection?.effectiveType || connection?.type;
    }
    return undefined;
  }

  private setupAutoFlush(): void {
    this.timer = setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  private setupPageVisibilityListener(): void {
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          this.flush();
        }
      });
    }
  }
}

// Global instance
export const perf =
  typeof window !== 'undefined' ? new PerformanceCollector() : null;

// Convenience functions
export function markPerf(name: string, value?: number): void {
  perf?.mark(name, value);
}

export function measurePerf(
  name: string,
  startMark: string,
  endMark?: string
): void {
  perf?.measure(name, startMark, endMark);
}

export function markWebVital(
  name: 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB',
  value: number
): void {
  perf?.markWebVital(name, value);
}

export function markTiming(
  name: string,
  startTime: number,
  endTime?: number
): void {
  perf?.markTiming(name, startTime, endTime);
}

// Auto-cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    perf?.destroy();
  });
}
