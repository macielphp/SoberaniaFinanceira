import { CacheManager } from '@/clean-architecture/shared/state/CacheManager';
import { EventBus } from '@/clean-architecture/shared/events/EventBus';

describe('CacheManager', () => {
  let cacheManager: CacheManager;
  let eventBus: EventBus;

  beforeEach(() => {
    eventBus = new EventBus();
    cacheManager = new CacheManager(eventBus);
  });

  afterEach(() => {
    cacheManager.stop();
  });

  it('should set and get cache values', () => {
    const domain = 'test-domain';
    const params = { id: '1' };
    const value = { data: 'test-value' };

    cacheManager.set(domain, params, value);
    const result = cacheManager.get(domain, params);

    expect(result).toEqual(value);
  });

  it('should check if key exists', () => {
    const domain = 'test-domain';
    const params = { id: '1' };
    const value = { data: 'test-value' };

    expect(cacheManager.has(domain, params)).toBe(false);

    cacheManager.set(domain, params, value);
    expect(cacheManager.has(domain, params)).toBe(true);
  });

  it('should invalidate cache on events', () => {
    const domain = 'operations';
    const params = { id: '1' };
    const value = { data: 'test-operation' };

    cacheManager.set(domain, params, value);
    expect(cacheManager.has(domain, params)).toBe(true);

    // Simulate operation creation event
    eventBus.publish('OperationCreated', { id: '2', name: 'New Operation' });

    // Cache should be invalidated
    expect(cacheManager.has(domain, params)).toBe(false);
  });

  it('should handle multiple cache domains', () => {
    const operationsDomain = 'operations';
    const categoriesDomain = 'categories';
    const accountsDomain = 'accounts';

    cacheManager.set(operationsDomain, { id: '1' }, []);
    cacheManager.set(categoriesDomain, { id: '1' }, []);
    cacheManager.set(accountsDomain, { id: '1' }, []);

    expect(cacheManager.has(operationsDomain, { id: '1' })).toBe(true);
    expect(cacheManager.has(categoriesDomain, { id: '1' })).toBe(true);
    expect(cacheManager.has(accountsDomain, { id: '1' })).toBe(true);

    // Simulate category creation event
    eventBus.publish('CategoryCreated', { id: '1', name: 'New Category' });

    // Only categories cache should be invalidated
    expect(cacheManager.has(operationsDomain, { id: '1' })).toBe(true);
    expect(cacheManager.has(categoriesDomain, { id: '1' })).toBe(false);
    expect(cacheManager.has(accountsDomain, { id: '1' })).toBe(true);
  });

  it('should clear all cache', () => {
    const domain1 = 'test-domain-1';
    const domain2 = 'test-domain-2';

    cacheManager.set(domain1, { id: '1' }, 'value1');
    cacheManager.set(domain2, { id: '2' }, 'value2');

    expect(cacheManager.has(domain1, { id: '1' })).toBe(true);
    expect(cacheManager.has(domain2, { id: '2' })).toBe(true);

    cacheManager.clear();

    expect(cacheManager.has(domain1, { id: '1' })).toBe(false);
    expect(cacheManager.has(domain2, { id: '2' })).toBe(false);
  });
});
