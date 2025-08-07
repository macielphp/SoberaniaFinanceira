import { CacheManager } from '../../../clean-architecture/shared/state/CacheManager';
import { EventBus } from '../../../clean-architecture/shared/events/EventBus';

describe('CacheManager', () => {
  let cacheManager: CacheManager;
  let eventBus: EventBus;

  beforeEach(() => {
    eventBus = new EventBus();
    cacheManager = new CacheManager(eventBus, {
      defaultTTL: 1000, // 1 segundo para testes
      maxSize: 5,
      cleanupInterval: 500, // 500ms para testes
    });
  });

  afterEach(() => {
    cacheManager.stop();
  });

  describe('Basic Operations', () => {
    it('should set and get items correctly', () => {
      const testData = { id: '1', name: 'Test' };
      
      cacheManager.set('test-domain', { id: '1' }, testData);
      const result = cacheManager.get('test-domain', { id: '1' });
      
      expect(result).toEqual(testData);
    });

    it('should return null for non-existent items', () => {
      const result = cacheManager.get('test-domain', { id: '1' });
      expect(result).toBeNull();
    });

    it('should check if item exists', () => {
      expect(cacheManager.has('test-domain', { id: '1' })).toBe(false);
      
      cacheManager.set('test-domain', { id: '1' }, { data: 'test' });
      expect(cacheManager.has('test-domain', { id: '1' })).toBe(true);
    });

    it('should delete items correctly', () => {
      cacheManager.set('test-domain', { id: '1' }, { data: 'test' });
      expect(cacheManager.has('test-domain', { id: '1' })).toBe(true);
      
      cacheManager.delete('test-domain', { id: '1' });
      expect(cacheManager.has('test-domain', { id: '1' })).toBe(false);
    });

    it('should clear all items', () => {
      cacheManager.set('test-domain', { id: '1' }, { data: 'test1' });
      cacheManager.set('test-domain', { id: '2' }, { data: 'test2' });
      
      expect(cacheManager.has('test-domain', { id: '1' })).toBe(true);
      expect(cacheManager.has('test-domain', { id: '2' })).toBe(true);
      
      cacheManager.clear();
      
      expect(cacheManager.has('test-domain', { id: '1' })).toBe(false);
      expect(cacheManager.has('test-domain', { id: '2' })).toBe(false);
    });
  });

  describe('TTL (Time To Live)', () => {
    it('should expire items after TTL', async () => {
      cacheManager.set('test-domain', { id: '1' }, { data: 'test' }, 100); // 100ms TTL
      
      expect(cacheManager.get('test-domain', { id: '1' })).toEqual({ data: 'test' });
      
      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 150));
      
      expect(cacheManager.get('test-domain', { id: '1' })).toBeNull();
    });

    it('should use default TTL when not specified', async () => {
      cacheManager = new CacheManager(eventBus, { defaultTTL: 100 }); // 100ms default
      
      cacheManager.set('test-domain', { id: '1' }, { data: 'test' });
      
      expect(cacheManager.get('test-domain', { id: '1' })).toEqual({ data: 'test' });
      
      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 150));
      
      expect(cacheManager.get('test-domain', { id: '1' })).toBeNull();
    });
  });

  describe('Max Size and Eviction', () => {
    it('should evict oldest items when max size is reached', () => {
      // Add items up to max size
      for (let i = 1; i <= 5; i++) {
        cacheManager.set('test-domain', { id: i.toString() }, { data: `test${i}` });
      }
      
      // All items should be in cache
      for (let i = 1; i <= 5; i++) {
        expect(cacheManager.has('test-domain', { id: i.toString() })).toBe(true);
      }
      
      // Add one more item
      cacheManager.set('test-domain', { id: '6' }, { data: 'test6' });
      
      // The oldest item (id: '1') should be evicted
      expect(cacheManager.has('test-domain', { id: '1' })).toBe(false);
      
      // Other items should still be in cache
      for (let i = 2; i <= 6; i++) {
        expect(cacheManager.has('test-domain', { id: i.toString() })).toBe(true);
      }
    });
  });

  describe('Domain Invalidation', () => {
    it('should invalidate all items in a domain', () => {
      cacheManager.set('operations', { id: '1' }, { data: 'op1' });
      cacheManager.set('operations', { id: '2' }, { data: 'op2' });
      cacheManager.set('categories', { id: '1' }, { data: 'cat1' });
      
      expect(cacheManager.has('operations', { id: '1' })).toBe(true);
      expect(cacheManager.has('operations', { id: '2' })).toBe(true);
      expect(cacheManager.has('categories', { id: '1' })).toBe(true);
      
      cacheManager.invalidateDomain('operations');
      
      expect(cacheManager.has('operations', { id: '1' })).toBe(false);
      expect(cacheManager.has('operations', { id: '2' })).toBe(false);
      expect(cacheManager.has('categories', { id: '1' })).toBe(true); // Should remain
    });
  });

  describe('Event-Based Invalidation', () => {
    it('should invalidate operations cache on operation events', () => {
      cacheManager.set('operations', { id: '1' }, { data: 'op1' });
      cacheManager.set('financial-summary', {}, { total: 1000 });
      
      // Trigger operation event
      eventBus.publish('OperationCreated', { id: 'new-op' });
      
      expect(cacheManager.has('operations', { id: '1' })).toBe(false);
      expect(cacheManager.has('financial-summary', {})).toBe(false);
    });

    it('should invalidate categories cache on category events', () => {
      cacheManager.set('categories', { id: '1' }, { data: 'cat1' });
      cacheManager.set('financial-summary', {}, { total: 1000 });
      
      // Trigger category event
      eventBus.publish('CategoryCreated', { id: 'new-cat' });
      
      expect(cacheManager.has('categories', { id: '1' })).toBe(false);
      expect(cacheManager.has('financial-summary', {})).toBe(false);
    });

    it('should invalidate accounts cache on account events', () => {
      cacheManager.set('accounts', { id: '1' }, { data: 'acc1' });
      cacheManager.set('financial-summary', {}, { total: 1000 });
      
      // Trigger account event
      eventBus.publish('AccountCreated', { id: 'new-acc' });
      
      expect(cacheManager.has('accounts', { id: '1' })).toBe(false);
      expect(cacheManager.has('financial-summary', {})).toBe(false);
    });

    it('should invalidate goals cache on goal events', () => {
      cacheManager.set('goals', { id: '1' }, { data: 'goal1' });
      
      // Trigger goal event
      eventBus.publish('GoalCreated', { id: 'new-goal' });
      
      expect(cacheManager.has('goals', { id: '1' })).toBe(false);
    });
  });

  describe('Key Generation', () => {
    it('should generate consistent keys for same parameters', () => {
      const params1 = { id: '1', type: 'test' };
      const params2 = { type: 'test', id: '1' }; // Same params, different order
      
      cacheManager.set('test-domain', params1, { data: 'test' });
      
      expect(cacheManager.get('test-domain', params2)).toEqual({ data: 'test' });
    });

    it('should generate different keys for different parameters', () => {
      cacheManager.set('test-domain', { id: '1' }, { data: 'test1' });
      cacheManager.set('test-domain', { id: '2' }, { data: 'test2' });
      
      expect(cacheManager.get('test-domain', { id: '1' })).toEqual({ data: 'test1' });
      expect(cacheManager.get('test-domain', { id: '2' })).toEqual({ data: 'test2' });
    });
  });

  describe('Statistics', () => {
    it('should provide cache statistics', () => {
      const stats = cacheManager.getStats();
      
      expect(stats).toHaveProperty('size');
      expect(stats).toHaveProperty('maxSize');
      expect(stats).toHaveProperty('hitRate');
      expect(stats).toHaveProperty('missRate');
      expect(stats.size).toBe(0);
      expect(stats.maxSize).toBe(5);
    });

    it('should provide cache information', () => {
      cacheManager.set('test-domain', { id: '1' }, { data: 'test' }, 1000);
      
      const cacheInfo = cacheManager.getCacheInfo();
      
      expect(cacheInfo).toHaveLength(1);
      expect(cacheInfo[0]).toHaveProperty('key');
      expect(cacheInfo[0]).toHaveProperty('domain');
      expect(cacheInfo[0]).toHaveProperty('age');
      expect(cacheInfo[0]).toHaveProperty('ttl');
      expect(cacheInfo[0]).toHaveProperty('expired');
      expect(cacheInfo[0].domain).toBe('test-domain');
      expect(cacheInfo[0].expired).toBe(false);
    });
  });

  describe('Cleanup', () => {
    it('should automatically cleanup expired items', async () => {
      cacheManager.set('test-domain', { id: '1' }, { data: 'test' }, 100);
      
      expect(cacheManager.has('test-domain', { id: '1' })).toBe(true);
      
      // Wait for cleanup
      await new Promise(resolve => setTimeout(resolve, 600));
      
      expect(cacheManager.has('test-domain', { id: '1' })).toBe(false);
    });
  });

  describe('Lifecycle', () => {
    it('should stop cleanup timer when stopped', () => {
      cacheManager.set('test-domain', { id: '1' }, { data: 'test' }, 100);
      
      cacheManager.stop();
      
      // Timer should be stopped, but we can't easily test this
      // The main test is that it doesn't throw an error
      expect(() => cacheManager.stop()).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty parameters', () => {
      cacheManager.set('test-domain', {}, { data: 'test' });
      expect(cacheManager.get('test-domain', {})).toEqual({ data: 'test' });
    });

    it('should handle complex parameters', () => {
      const complexParams = {
        filters: { nature: 'despesa', state: 'confirmed' },
        dateRange: { start: '2024-01-01', end: '2024-01-31' },
        includeVariable: true,
      };
      
      cacheManager.set('test-domain', complexParams, { data: 'complex' });
      expect(cacheManager.get('test-domain', complexParams)).toEqual({ data: 'complex' });
    });

    it('should handle null and undefined values', () => {
      cacheManager.set('test-domain', { id: null, value: undefined }, { data: 'test' });
      expect(cacheManager.get('test-domain', { id: null, value: undefined })).toEqual({ data: 'test' });
    });
  });
});
