/**
 * POST /perf/collect handler
 * Collects performance metrics for monitoring and analytics
 */
import { FastifyRequest, FastifyReply } from 'fastify';
import { 
  perfCollectRequestSchema, 
  PerfCollectRequest, 
  perfCollectResponseSchema,
  PerfCollectResponse 
} from '../schemas/performance';
import { log } from '../lib/log';

export async function perfCollectHandler(
  request: FastifyRequest<{ Body: PerfCollectRequest }>,
  reply: FastifyReply
) {
  try {
    // Validate request body
    const validatedData = perfCollectRequestSchema.parse(request.body);

    // Log performance data for debugging (in production, this would go to monitoring service)
    const logMeta: Record<string, unknown> = {
      sessionId: validatedData.sessionId,
      markerCount: validatedData.markers.length,
      markers: validatedData.markers.map(m => ({
        name: m.name,
        value: Math.round(m.value * 100) / 100, // Round to 2 decimal places
        timestamp: m.timestamp,
      })),
    };

    if (validatedData.tenantId) {
      logMeta.tenantId = validatedData.tenantId;
    }

    if (validatedData.metadata) {
      logMeta.metadata = validatedData.metadata;
    }

    log('info', 'Performance data collected', logMeta);

    // Aggregate some basic stats for logging
    const markerStats = validatedData.markers.reduce((acc, marker) => {
      const category = marker.name.split(':')[0] || 'other';
      if (!acc[category]) {
        acc[category] = { count: 0, totalValue: 0, maxValue: 0 };
      }
      acc[category].count++;
      acc[category].totalValue += marker.value;
      acc[category].maxValue = Math.max(acc[category].maxValue, marker.value);
      return acc;
    }, {} as Record<string, { count: number; totalValue: number; maxValue: number }>);

    // Log aggregated stats
    log('info', 'Performance metrics summary', {
      sessionId: validatedData.sessionId,
      stats: Object.entries(markerStats).map(([category, stats]) => ({
        category,
        count: stats.count,
        avgValue: Math.round((stats.totalValue / stats.count) * 100) / 100,
        maxValue: Math.round(stats.maxValue * 100) / 100,
      })),
    });

    // Check for performance issues and log warnings
    validatedData.markers.forEach(marker => {
      if (marker.name.includes('webvital:')) {
        const vitalName = marker.name.split(':')[1];
        let threshold = 0;
        
        switch (vitalName) {
          case 'CLS':
            threshold = 0.1; // Cumulative Layout Shift threshold
            break;
          case 'FID':
            threshold = 100; // First Input Delay in ms
            break;
          case 'FCP':
            threshold = 1800; // First Contentful Paint in ms
            break;
          case 'LCP':
            threshold = 2500; // Largest Contentful Paint in ms
            break;
          case 'TTFB':
            threshold = 800; // Time to First Byte in ms
            break;
        }
        
        if (threshold > 0 && marker.value > threshold) {
          const warnMeta: Record<string, unknown> = {
            sessionId: validatedData.sessionId,
            vital: vitalName,
            value: marker.value,
            threshold,
          };

          if (validatedData.tenantId) {
            warnMeta.tenantId = validatedData.tenantId;
          }

          if (marker.url) {
            warnMeta.url = marker.url;
          }

          log('warn', `Performance threshold exceeded: ${vitalName}`, warnMeta);
        }
      }
    });

    // Construct response
    const response: PerfCollectResponse = {
      success: true,
      processed: validatedData.markers.length,
      sessionId: validatedData.sessionId,
    };

    // Validate response
    const validatedResponse = perfCollectResponseSchema.parse(response);

    // Return success response
    reply.status(200).send(validatedResponse);

  } catch (error) {
    log('error', 'Failed to process performance data', {
      error: error instanceof Error ? error.message : String(error),
      body: request.body,
    });

    // Return error response
    reply.status(400).send({
      error: {
        code: 'PERF_COLLECTION_FAILED',
        message: 'Failed to process performance data',
        hint: error instanceof Error ? error.message : 'Invalid request format',
      },
    });
  }
}