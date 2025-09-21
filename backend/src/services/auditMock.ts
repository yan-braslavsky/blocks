/**
 * Audit service for tracking recommendation mutations and user actions
 * Provides mock implementation for recommendation change tracking
 */

export interface AuditEvent {
  id: string;
  timestamp: Date;
  userId: string;
  tenantId: string;
  action: AuditAction;
  resourceType: AuditResourceType;
  resourceId: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export enum AuditAction {
  // Recommendation actions
  RECOMMENDATION_CREATED = 'recommendation.created',
  RECOMMENDATION_UPDATED = 'recommendation.updated',
  RECOMMENDATION_ACCEPTED = 'recommendation.accepted',
  RECOMMENDATION_REJECTED = 'recommendation.rejected',
  RECOMMENDATION_DISMISSED = 'recommendation.dismissed',
  RECOMMENDATION_IMPLEMENTED = 'recommendation.implemented',
  
  // User management actions
  USER_LOGIN = 'user.login',
  USER_LOGOUT = 'user.logout',
  USER_CREATED = 'user.created',
  USER_UPDATED = 'user.updated',
  USER_DELETED = 'user.deleted',
  
  // System actions
  EXPORT_GENERATED = 'export.generated',
  CONNECTION_TESTED = 'connection.tested',
  TENANT_SETUP = 'tenant.setup'
}

export enum AuditResourceType {
  RECOMMENDATION = 'recommendation',
  USER = 'user',
  TENANT = 'tenant',
  EXPORT = 'export',
  CONNECTION = 'connection'
}

export interface RecommendationMutationDetails {
  previousStatus?: string;
  newStatus: string;
  reason?: string;
  implementationDate?: Date;
  estimatedSavings?: number;
  actualSavings?: number;
  notes?: string;
}

export interface AuditQuery {
  tenantId?: string;
  userId?: string;
  action?: AuditAction;
  resourceType?: AuditResourceType;
  resourceId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

/**
 * Mock audit service implementation
 */
export class AuditService {
  private events: AuditEvent[] = [];
  private idCounter = 1;

  /**
   * Record an audit event
   */
  async recordEvent(event: Omit<AuditEvent, 'id' | 'timestamp'>): Promise<AuditEvent> {
    const auditEvent: AuditEvent = {
      id: `audit-${this.idCounter.toString().padStart(8, '0')}`,
      timestamp: new Date(),
      ...event
    };

    this.events.push(auditEvent);
    this.idCounter++;

    // Simulate async operation
    await this.simulateLatency();

    return auditEvent;
  }

  /**
   * Record a recommendation mutation
   */
  async recordRecommendationMutation(
    userId: string,
    tenantId: string,
    recommendationId: string,
    action: AuditAction,
    details: RecommendationMutationDetails,
    metadata?: { ipAddress?: string; userAgent?: string }
  ): Promise<AuditEvent> {
    const eventData: Omit<AuditEvent, 'id' | 'timestamp'> = {
      userId,
      tenantId,
      action,
      resourceType: AuditResourceType.RECOMMENDATION,
      resourceId: recommendationId,
      details
    };

    // Only add optional properties if they exist
    if (metadata?.ipAddress) {
      eventData.ipAddress = metadata.ipAddress;
    }
    if (metadata?.userAgent) {
      eventData.userAgent = metadata.userAgent;
    }

    return this.recordEvent(eventData);
  }

  /**
   * Query audit events
   */
  async queryEvents(query: AuditQuery): Promise<{ events: AuditEvent[]; total: number }> {
    await this.simulateLatency();

    let filteredEvents = [...this.events];

    // Apply filters
    if (query.tenantId) {
      filteredEvents = filteredEvents.filter(e => e.tenantId === query.tenantId);
    }

    if (query.userId) {
      filteredEvents = filteredEvents.filter(e => e.userId === query.userId);
    }

    if (query.action) {
      filteredEvents = filteredEvents.filter(e => e.action === query.action);
    }

    if (query.resourceType) {
      filteredEvents = filteredEvents.filter(e => e.resourceType === query.resourceType);
    }

    if (query.resourceId) {
      filteredEvents = filteredEvents.filter(e => e.resourceId === query.resourceId);
    }

    if (query.startDate) {
      filteredEvents = filteredEvents.filter(e => e.timestamp >= query.startDate!);
    }

    if (query.endDate) {
      filteredEvents = filteredEvents.filter(e => e.timestamp <= query.endDate!);
    }

    // Sort by timestamp (newest first)
    filteredEvents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    const total = filteredEvents.length;

    // Apply pagination
    const offset = query.offset || 0;
    const limit = query.limit || 50;
    const paginatedEvents = filteredEvents.slice(offset, offset + limit);

    return {
      events: paginatedEvents,
      total
    };
  }

  /**
   * Get audit events for a specific recommendation
   */
  async getRecommendationAuditTrail(
    recommendationId: string,
    tenantId?: string
  ): Promise<AuditEvent[]> {
    const query: AuditQuery = {
      resourceType: AuditResourceType.RECOMMENDATION,
      resourceId: recommendationId,
      ...(tenantId && { tenantId })
    };

    const result = await this.queryEvents(query);
    return result.events;
  }

  /**
   * Get recent audit events for a tenant
   */
  async getRecentEvents(tenantId: string, limit: number = 20): Promise<AuditEvent[]> {
    const query: AuditQuery = {
      tenantId,
      limit
    };

    const result = await this.queryEvents(query);
    return result.events;
  }

  /**
   * Get audit statistics for a tenant
   */
  async getAuditStats(tenantId: string, days: number = 30): Promise<{
    totalEvents: number;
    recommendationActions: number;
    userActions: number;
    systemActions: number;
    topActions: Array<{ action: AuditAction; count: number }>;
  }> {
    await this.simulateLatency();

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const query: AuditQuery = {
      tenantId,
      startDate
    };

    const result = await this.queryEvents(query);
    const events = result.events;

    const totalEvents = events.length;
    const recommendationActions = events.filter(e => 
      e.resourceType === AuditResourceType.RECOMMENDATION
    ).length;
    const userActions = events.filter(e => 
      e.resourceType === AuditResourceType.USER
    ).length;
    const systemActions = events.filter(e => 
      [AuditResourceType.EXPORT, AuditResourceType.CONNECTION, AuditResourceType.TENANT]
        .includes(e.resourceType)
    ).length;

    // Count actions
    const actionCounts = new Map<AuditAction, number>();
    events.forEach(event => {
      const count = actionCounts.get(event.action) || 0;
      actionCounts.set(event.action, count + 1);
    });

    // Get top 5 actions
    const topActions = Array.from(actionCounts.entries())
      .map(([action, count]) => ({ action, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalEvents,
      recommendationActions,
      userActions,
      systemActions,
      topActions
    };
  }

  /**
   * Clear all audit events (for testing purposes)
   */
  async clearEvents(): Promise<void> {
    this.events = [];
    this.idCounter = 1;
  }

  /**
   * Generate sample audit data for development/testing
   */
  async generateSampleData(tenantId: string): Promise<void> {
    const sampleEvents = [
      {
        userId: 'user-001',
        tenantId,
        action: AuditAction.RECOMMENDATION_ACCEPTED,
        resourceType: AuditResourceType.RECOMMENDATION,
        resourceId: 'rec-001',
        details: {
          previousStatus: 'pending',
          newStatus: 'accepted',
          reason: 'Cost savings opportunity identified',
          estimatedSavings: 450.00
        }
      },
      {
        userId: 'user-001',
        tenantId,
        action: AuditAction.RECOMMENDATION_IMPLEMENTED,
        resourceType: AuditResourceType.RECOMMENDATION,
        resourceId: 'rec-001',
        details: {
          previousStatus: 'accepted',
          newStatus: 'implemented',
          implementationDate: new Date(),
          actualSavings: 425.00,
          notes: 'Successfully right-sized EC2 instances'
        }
      },
      {
        userId: 'user-002',
        tenantId,
        action: AuditAction.RECOMMENDATION_REJECTED,
        resourceType: AuditResourceType.RECOMMENDATION,
        resourceId: 'rec-002',
        details: {
          previousStatus: 'pending',
          newStatus: 'rejected',
          reason: 'Would impact production performance'
        }
      },
      {
        userId: 'user-001',
        tenantId,
        action: AuditAction.EXPORT_GENERATED,
        resourceType: AuditResourceType.EXPORT,
        resourceId: 'export-001',
        details: {
          exportType: 'full',
          recordCount: 125
        }
      }
    ];

    for (const event of sampleEvents) {
      await this.recordEvent(event);
    }
  }

  private async simulateLatency(): Promise<void> {
    if (process.env.SIMULATE_LATENCY === '1') {
      const latency = parseInt(process.env.LATENCY_MS || '50', 10);
      await new Promise(resolve => setTimeout(resolve, latency));
    }
  }
}

// Export singleton instance
export const auditService = new AuditService();