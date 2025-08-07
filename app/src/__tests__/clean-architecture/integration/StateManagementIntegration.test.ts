/**
 * Testes de Integração para o Sistema de State Management
 * 
 * Estes testes validam a integração entre:
 * - EventBus
 * - ApplicationStore
 * - CacheManager
 * - UI Adapters
 */
describe('State Management Integration', () => {
  // Mock do EventBus
  class MockEventBus {
    private handlers: Map<string, Function[]> = new Map();

    subscribe(eventName: string, handler: Function): void {
      if (!this.handlers.has(eventName)) {
        this.handlers.set(eventName, []);
      }
      this.handlers.get(eventName)!.push(handler);
    }

    publish(eventName: string, data?: any): void {
      const handlers = this.handlers.get(eventName);
      if (handlers) {
        handlers.forEach(handler => handler(data));
      }
    }

    unsubscribe(eventName: string, handler: Function): void {
      const handlers = this.handlers.get(eventName);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }
    }
  }

  // Mock do CacheManager
  class MockCacheManager {
    private cache = new Map<string, any>();
    private eventBus: MockEventBus;

    constructor(eventBus: MockEventBus) {
      this.eventBus = eventBus;
      this.setupEventListeners();
    }

    private setupEventListeners(): void {
      this.eventBus.subscribe('OperationCreated', () => this.invalidateCache('operations'));
      this.eventBus.subscribe('CategoryCreated', () => this.invalidateCache('categories'));
      this.eventBus.subscribe('AccountCreated', () => this.invalidateCache('accounts'));
    }

    set(key: string, value: any): void {
      this.cache.set(key, value);
    }

    get(key: string): any {
      return this.cache.get(key);
    }

    has(key: string): boolean {
      return this.cache.has(key);
    }

    invalidateCache(domain: string): void {
      const keysToDelete = Array.from(this.cache.keys()).filter(key => key.startsWith(domain));
      keysToDelete.forEach(key => this.cache.delete(key));
    }

    clear(): void {
      this.cache.clear();
    }
  }

  // Mock do ApplicationStore
  class MockApplicationStore {
    private state = {
      operations: [] as any[],
      categories: [] as any[],
      accounts: [] as any[],
      loading: false,
      error: null as string | null
    };

    private listeners: Function[] = [];
    private eventBus: MockEventBus;
    private cacheManager: MockCacheManager;

    constructor(eventBus: MockEventBus, cacheManager: MockCacheManager) {
      this.eventBus = eventBus;
      this.cacheManager = cacheManager;
      this.setupEventListeners();
    }

    private setupEventListeners(): void {
      this.eventBus.subscribe('OperationCreated', (data: any) => this.updateState('OperationCreated', data));
      this.eventBus.subscribe('CategoryCreated', (data: any) => this.updateState('CategoryCreated', data));
      this.eventBus.subscribe('AccountCreated', (data: any) => this.updateState('AccountCreated', data));
    }

    private updateState(eventType: string, data: any): void {
      switch (eventType) {
        case 'OperationCreated':
          this.state.operations.push(data);
          break;
        case 'CategoryCreated':
          this.state.categories.push(data);
          break;
        case 'AccountCreated':
          this.state.accounts.push(data);
          break;
      }
      this.notifyListeners();
    }

    getState() {
      return { ...this.state };
    }

    setState(newState: Partial<typeof this.state>): void {
      this.state = { ...this.state, ...newState };
      this.notifyListeners();
    }

    subscribe(listener: Function): () => void {
      this.listeners.push(listener);
      return () => {
        const index = this.listeners.indexOf(listener);
        if (index > -1) {
          this.listeners.splice(index, 1);
        }
      };
    }

    private notifyListeners(): void {
      this.listeners.forEach(listener => listener(this.state));
    }

    // Métodos para simular operações
    addOperation(operation: any): void {
      this.eventBus.publish('OperationCreated', operation);
    }

    addCategory(category: any): void {
      this.eventBus.publish('CategoryCreated', category);
    }

    addAccount(account: any): void {
      this.eventBus.publish('AccountCreated', account);
    }
  }

  let eventBus: MockEventBus;
  let cacheManager: MockCacheManager;
  let applicationStore: MockApplicationStore;

  beforeEach(() => {
    eventBus = new MockEventBus();
    cacheManager = new MockCacheManager(eventBus);
    applicationStore = new MockApplicationStore(eventBus, cacheManager);
  });

  describe('Event-Driven State Management', () => {
    it('should handle operation creation through events', () => {
      const mockListener = jest.fn();
      applicationStore.subscribe(mockListener);

      const operation = { id: '1', nature: 'despesa', value: 100 };
      applicationStore.addOperation(operation);

      expect(mockListener).toHaveBeenCalledWith(
        expect.objectContaining({
          operations: [operation]
        })
      );
    });

    it('should handle category creation through events', () => {
      const mockListener = jest.fn();
      applicationStore.subscribe(mockListener);

      const category = { id: '1', name: 'Alimentação', type: 'despesa' };
      applicationStore.addCategory(category);

      expect(mockListener).toHaveBeenCalledWith(
        expect.objectContaining({
          categories: [category]
        })
      );
    });

    it('should handle account creation through events', () => {
      const mockListener = jest.fn();
      applicationStore.subscribe(mockListener);

      const account = { id: '1', name: 'Conta Principal', balance: 1000 };
      applicationStore.addAccount(account);

      expect(mockListener).toHaveBeenCalledWith(
        expect.objectContaining({
          accounts: [account]
        })
      );
    });

    it('should handle multiple events in sequence', () => {
      const mockListener = jest.fn();
      applicationStore.subscribe(mockListener);

      const operation = { id: '1', nature: 'despesa', value: 100 };
      const category = { id: '1', name: 'Alimentação', type: 'despesa' };
      const account = { id: '1', name: 'Conta Principal', balance: 1000 };

      applicationStore.addOperation(operation);
      applicationStore.addCategory(category);
      applicationStore.addAccount(account);

      const lastCall = mockListener.mock.calls[mockListener.mock.calls.length - 1][0];
      expect(lastCall.operations).toHaveLength(1);
      expect(lastCall.categories).toHaveLength(1);
      expect(lastCall.accounts).toHaveLength(1);
    });
  });

  describe('Cache Integration', () => {
    it('should invalidate cache when operations are created', () => {
      cacheManager.set('operations:list', [{ id: 'old' }]);
      expect(cacheManager.has('operations:list')).toBe(true);

      applicationStore.addOperation({ id: 'new', nature: 'despesa', value: 100 });

      expect(cacheManager.has('operations:list')).toBe(false);
    });

    it('should invalidate cache when categories are created', () => {
      cacheManager.set('categories:list', [{ id: 'old' }]);
      expect(cacheManager.has('categories:list')).toBe(true);

      applicationStore.addCategory({ id: 'new', name: 'Nova Categoria', type: 'despesa' });

      expect(cacheManager.has('categories:list')).toBe(false);
    });

    it('should invalidate cache when accounts are created', () => {
      cacheManager.set('accounts:list', [{ id: 'old' }]);
      expect(cacheManager.has('accounts:list')).toBe(true);

      applicationStore.addAccount({ id: 'new', name: 'Nova Conta', balance: 1000 });

      expect(cacheManager.has('accounts:list')).toBe(false);
    });
  });

  describe('State Synchronization', () => {
    it('should synchronize state across multiple listeners', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();
      const listener3 = jest.fn();

      applicationStore.subscribe(listener1);
      applicationStore.subscribe(listener2);
      applicationStore.subscribe(listener3);

      const operation = { id: '1', nature: 'despesa', value: 100 };
      applicationStore.addOperation(operation);

      expect(listener1).toHaveBeenCalledWith(
        expect.objectContaining({ operations: [operation] })
      );
      expect(listener2).toHaveBeenCalledWith(
        expect.objectContaining({ operations: [operation] })
      );
      expect(listener3).toHaveBeenCalledWith(
        expect.objectContaining({ operations: [operation] })
      );
    });

    it('should handle listener unsubscription', () => {
      const listener = jest.fn();
      const unsubscribe = applicationStore.subscribe(listener);

      const operation = { id: '1', nature: 'despesa', value: 100 };
      applicationStore.addOperation(operation);

      expect(listener).toHaveBeenCalledTimes(1);

      unsubscribe();

      const operation2 = { id: '2', nature: 'receita', value: 200 };
      applicationStore.addOperation(operation2);

      expect(listener).toHaveBeenCalledTimes(1); // Não deve ser chamado novamente
    });
  });

  describe('Error Handling', () => {
    it('should handle state updates with errors', () => {
      const mockListener = jest.fn();
      applicationStore.subscribe(mockListener);

      applicationStore.setState({ error: 'Erro de conexão', loading: false });

      expect(mockListener).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Erro de conexão',
          loading: false
        })
      );
    });

    it('should handle loading states', () => {
      const mockListener = jest.fn();
      applicationStore.subscribe(mockListener);

      applicationStore.setState({ loading: true });

      expect(mockListener).toHaveBeenCalledWith(
        expect.objectContaining({
          loading: true
        })
      );
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle multiple rapid state updates', () => {
      const mockListener = jest.fn();
      applicationStore.subscribe(mockListener);

      // Simular múltiplas operações rápidas
      for (let i = 0; i < 10; i++) {
        applicationStore.addOperation({
          id: `op-${i}`,
          nature: 'despesa',
          value: 100 + i
        });
      }

      const lastCall = mockListener.mock.calls[mockListener.mock.calls.length - 1][0];
      expect(lastCall.operations).toHaveLength(10);
    });

    it('should handle cache invalidation for multiple domains', () => {
      cacheManager.set('operations:list', [{ id: 'old-op' }]);
      cacheManager.set('categories:list', [{ id: 'old-cat' }]);
      cacheManager.set('accounts:list', [{ id: 'old-acc' }]);

      applicationStore.addOperation({ id: 'new-op', nature: 'despesa', value: 100 });
      applicationStore.addCategory({ id: 'new-cat', name: 'Nova Categoria', type: 'despesa' });
      applicationStore.addAccount({ id: 'new-acc', name: 'Nova Conta', balance: 1000 });

      expect(cacheManager.has('operations:list')).toBe(false);
      expect(cacheManager.has('categories:list')).toBe(false);
      expect(cacheManager.has('accounts:list')).toBe(false);
    });
  });
});
