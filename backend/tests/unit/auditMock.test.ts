/**
 * Unit tests for audit service
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { 
  AuditService, 
  AuditAction, 
  AuditResourceType,
  type RecommendationMutationDetails 
} from '../../src/services/auditMock';

describe('AuditService', () => {
  let auditService: AuditService;

  beforeEach(async () => {
    auditService = new AuditService();
    await auditService.clearEvents();
  });

  describe('recordEvent', () => {
    it('should record a basic audit event', async () => {
      const eventData = {
        userId: 'user-123',
        tenantId: 'tenant-456',
        action: AuditAction.USER_LOGIN,
        resourceType: AuditResourceType.USER,
        resourceId: 'user-123',
        details: { loginMethod: 'password' }
      };

      const result = await auditService.recordEvent(eventData);

      expect(result.id).toMatch(/^audit-\d{8}$/);
      expect(result.timestamp).toBeInstanceOf(Date);
      expect(result.userId).toBe(eventData.userId);
      expect(result.tenantId).toBe(eventData.tenantId);
      expect(result.action).toBe(eventData.action);
      expect(result.resourceType).toBe(eventData.resourceType);
      expect(result.resourceId).toBe(eventData.resourceId);
      expect(result.details).toEqual(eventData.details);
    });

    it('should record events with optional metadata', async () => {
      const eventData = {
        userId: 'user-123',
        tenantId: 'tenant-456',
        action: AuditAction.EXPORT_GENERATED,
        resourceType: AuditResourceType.EXPORT,
        resourceId: 'export-001',
        details: { exportType: 'csv' },
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0'
      };

      const result = await auditService.recordEvent(eventData);

      expect(result.ipAddress).toBe(eventData.ipAddress);
      expect(result.userAgent).toBe(eventData.userAgent);
    });

    it('should generate sequential IDs', async () => {
      const event1 = await auditService.recordEvent({
        userId: 'user-1',
        tenantId: 'tenant-1',
        action: AuditAction.USER_LOGIN,
        resourceType: AuditResourceType.USER,
        resourceId: 'user-1',
        details: {}
      });

      const event2 = await auditService.recordEvent({
        userId: 'user-2',
        tenantId: 'tenant-1',
        action: AuditAction.USER_LOGIN,
        resourceType: AuditResourceType.USER,
        resourceId: 'user-2',
        details: {}
      });

      expect(event1.id).toBe('audit-00000001');
      expect(event2.id).toBe('audit-00000002');
    });
  });

  describe('recordRecommendationMutation', () => {
    it('should record recommendation acceptance', async () => {
      const details: RecommendationMutationDetails = {
        previousStatus: 'pending',
        newStatus: 'accepted',
        reason: 'Cost savings opportunity',
        estimatedSavings: 500.00
      };

      const result = await auditService.recordRecommendationMutation(
        'user-123',
        'tenant-456',
        'rec-789',
        AuditAction.RECOMMENDATION_ACCEPTED,
        details
      );

      expect(result.action).toBe(AuditAction.RECOMMENDATION_ACCEPTED);
      expect(result.resourceType).toBe(AuditResourceType.RECOMMENDATION);
      expect(result.resourceId).toBe('rec-789');
      expect(result.details).toEqual(details);
    });

    it('should record recommendation implementation with metadata', async () => {
      const details: RecommendationMutationDetails = {
        previousStatus: 'accepted',
        newStatus: 'implemented',
        implementationDate: new Date('2024-01-15'),
        actualSavings: 475.00,
        notes: 'Successfully implemented'
      };

      const metadata = {
        ipAddress: '10.0.0.1',
        userAgent: 'Blocks-App/1.0'
      };

      const result = await auditService.recordRecommendationMutation(
        'user-123',
        'tenant-456',
        'rec-789',
        AuditAction.RECOMMENDATION_IMPLEMENTED,
        details,
        metadata
      );

      expect(result.action).toBe(AuditAction.RECOMMENDATION_IMPLEMENTED);
      expect(result.ipAddress).toBe(metadata.ipAddress);
      expect(result.userAgent).toBe(metadata.userAgent);
      expect(result.details.actualSavings).toBe(475.00);
    });
  });

  describe('queryEvents', () => {
    beforeEach(async () => {
      // Setup test data
      await auditService.recordEvent({
        userId: 'user-1',
        tenantId: 'tenant-a',
        action: AuditAction.RECOMMENDATION_ACCEPTED,
        resourceType: AuditResourceType.RECOMMENDATION,
        resourceId: 'rec-1',
        details: { estimatedSavings: 100 }
      });

      await auditService.recordEvent({
        userId: 'user-2',
        tenantId: 'tenant-a',
        action: AuditAction.RECOMMENDATION_REJECTED,
        resourceType: AuditResourceType.RECOMMENDATION,
        resourceId: 'rec-2',
        details: { reason: 'Not viable' }
      });

      await auditService.recordEvent({
        userId: 'user-1',
        tenantId: 'tenant-b',
        action: AuditAction.USER_LOGIN,
        resourceType: AuditResourceType.USER,
        resourceId: 'user-1',
        details: {}
      });
    });

    it('should filter by tenantId', async () => {
      const result = await auditService.queryEvents({ tenantId: 'tenant-a' });

      expect(result.events).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.events.every(e => e.tenantId === 'tenant-a')).toBe(true);
    });

    it('should filter by userId', async () => {
      const result = await auditService.queryEvents({ userId: 'user-1' });

      expect(result.events).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.events.every(e => e.userId === 'user-1')).toBe(true);
    });

    it('should filter by action', async () => {
      const result = await auditService.queryEvents({ 
        action: AuditAction.RECOMMENDATION_ACCEPTED 
      });

      expect(result.events).toHaveLength(1);
      expect(result.events[0].action).toBe(AuditAction.RECOMMENDATION_ACCEPTED);
    });

    it('should filter by resourceType', async () => {
      const result = await auditService.queryEvents({ 
        resourceType: AuditResourceType.RECOMMENDATION 
      });

      expect(result.events).toHaveLength(2);
      expect(result.events.every(e => e.resourceType === AuditResourceType.RECOMMENDATION)).toBe(true);
    });

    it('should apply pagination', async () => {
      const result = await auditService.queryEvents({ 
        limit: 1, 
        offset: 1 
      });

      expect(result.events).toHaveLength(1);
      expect(result.total).toBe(3);
    });

    it('should sort by timestamp descending', async () => {
      const result = await auditService.queryEvents({});

      expect(result.events).toHaveLength(3);
      
      // Events should be in descending order (newest first)
      for (let i = 0; i < result.events.length - 1; i++) {
        expect(result.events[i].timestamp.getTime())
          .toBeGreaterThanOrEqual(result.events[i + 1].timestamp.getTime());
      }
    });
  });

  describe('getRecommendationAuditTrail', () => {
    it('should return audit trail for specific recommendation', async () => {
      await auditService.recordRecommendationMutation(
        'user-1',
        'tenant-1',
        'rec-123',
        AuditAction.RECOMMENDATION_CREATED,
        { newStatus: 'pending' }
      );

      await auditService.recordRecommendationMutation(
        'user-1',
        'tenant-1',
        'rec-123',
        AuditAction.RECOMMENDATION_ACCEPTED,
        { previousStatus: 'pending', newStatus: 'accepted' }
      );

      await auditService.recordRecommendationMutation(
        'user-2',
        'tenant-1',
        'rec-456',
        AuditAction.RECOMMENDATION_REJECTED,
        { previousStatus: 'pending', newStatus: 'rejected' }
      );

      const trail = await auditService.getRecommendationAuditTrail('rec-123');

      expect(trail).toHaveLength(2);
      expect(trail.every(e => e.resourceId === 'rec-123')).toBe(true);
      expect(trail.every(e => e.resourceType === AuditResourceType.RECOMMENDATION)).toBe(true);
    });
  });

  describe('getAuditStats', () => {
    beforeEach(async () => {
      // Create mixed audit events
      await auditService.recordEvent({
        userId: 'user-1',
        tenantId: 'tenant-1',
        action: AuditAction.RECOMMENDATION_ACCEPTED,
        resourceType: AuditResourceType.RECOMMENDATION,
        resourceId: 'rec-1',
        details: {}
      });

      await auditService.recordEvent({
        userId: 'user-1',
        tenantId: 'tenant-1',
        action: AuditAction.RECOMMENDATION_ACCEPTED,
        resourceType: AuditResourceType.RECOMMENDATION,
        resourceId: 'rec-2',
        details: {}
      });

      await auditService.recordEvent({
        userId: 'user-1',
        tenantId: 'tenant-1',
        action: AuditAction.USER_LOGIN,
        resourceType: AuditResourceType.USER,
        resourceId: 'user-1',
        details: {}
      });

      await auditService.recordEvent({
        userId: 'user-1',
        tenantId: 'tenant-1',
        action: AuditAction.EXPORT_GENERATED,
        resourceType: AuditResourceType.EXPORT,
        resourceId: 'export-1',
        details: {}
      });
    });

    it('should return correct audit statistics', async () => {
      const stats = await auditService.getAuditStats('tenant-1');

      expect(stats.totalEvents).toBe(4);
      expect(stats.recommendationActions).toBe(2);
      expect(stats.userActions).toBe(1);
      expect(stats.systemActions).toBe(1);
      expect(stats.topActions).toHaveLength(3);
      
      // Check top action
      expect(stats.topActions[0].action).toBe(AuditAction.RECOMMENDATION_ACCEPTED);
      expect(stats.topActions[0].count).toBe(2);
    });
  });

  describe('generateSampleData', () => {
    it('should generate sample audit events', async () => {
      await auditService.generateSampleData('tenant-sample');

      const result = await auditService.queryEvents({ tenantId: 'tenant-sample' });

      expect(result.events.length).toBeGreaterThan(0);
      expect(result.events.every(e => e.tenantId === 'tenant-sample')).toBe(true);
      
      // Should include different types of actions
      const actions = result.events.map(e => e.action);
      expect(actions).toContain(AuditAction.RECOMMENDATION_ACCEPTED);
      expect(actions).toContain(AuditAction.RECOMMENDATION_IMPLEMENTED);
      expect(actions).toContain(AuditAction.RECOMMENDATION_REJECTED);
      expect(actions).toContain(AuditAction.EXPORT_GENERATED);
    });
  });

  describe('enum values', () => {
    it('should have correct AuditAction enum values', () => {
      expect(AuditAction.RECOMMENDATION_ACCEPTED).toBe('recommendation.accepted');
      expect(AuditAction.USER_LOGIN).toBe('user.login');
      expect(AuditAction.EXPORT_GENERATED).toBe('export.generated');
    });

    it('should have correct AuditResourceType enum values', () => {
      expect(AuditResourceType.RECOMMENDATION).toBe('recommendation');
      expect(AuditResourceType.USER).toBe('user');
      expect(AuditResourceType.EXPORT).toBe('export');
    });
  });
});