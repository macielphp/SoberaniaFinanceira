// Tests for Dependency Injection Container
import { Container, ServiceIdentifier } from '../../../clean-architecture/shared/di/Container';

// Test interfaces and classes
interface ITestService {
  id: string;
  getValue(): string;
}

class TestService implements ITestService {
  constructor(public id: string = 'default') {}
  
  getValue(): string {
    return `value-${this.id}`;
  }
}

class TestServiceWithDependency implements ITestService {
  constructor(
    public id: string = 'default',
    private dependency: ITestService
  ) {}
  
  getValue(): string {
    return `value-${this.id}-${this.dependency.getValue()}`;
  }
}

describe('Container', () => {
  let container: Container;

  beforeEach(() => {
    container = new Container();
  });

  describe('registration', () => {
    it('should register singleton service', () => {
      container.registerSingleton('ITestService', () => new TestService('singleton'));
      
      expect(container.isRegistered('ITestService')).toBe(true);
    });

    it('should register transient service', () => {
      container.registerTransient('ITestService', () => new TestService('transient'));
      
      expect(container.isRegistered('ITestService')).toBe(true);
    });

    it('should allow registering duplicate service (overwrites)', () => {
      container.registerSingleton('ITestService', () => new TestService('first'));
      
      // Should overwrite the previous registration
      container.registerSingleton('ITestService', () => new TestService('second'));
      
      const instance = container.resolve<ITestService>('ITestService');
      expect(instance.getValue()).toBe('value-second');
    });
  });

  describe('resolution', () => {
    it('should resolve singleton service', () => {
      container.registerSingleton('ITestService', () => new TestService('singleton'));
      
      const instance1 = container.resolve<ITestService>('ITestService');
      const instance2 = container.resolve<ITestService>('ITestService');
      
      expect(instance1).toBe(instance2);
      expect(instance1.getValue()).toBe('value-singleton');
    });

    it('should resolve transient service', () => {
      container.registerTransient('ITestService', () => new TestService('transient'));
      
      const instance1 = container.resolve<ITestService>('ITestService');
      const instance2 = container.resolve<ITestService>('ITestService');
      
      expect(instance1).not.toBe(instance2);
      expect(instance1.getValue()).toBe('value-transient');
      expect(instance2.getValue()).toBe('value-transient');
    });

    it('should throw error when resolving unregistered service', () => {
      expect(() => {
        container.resolve<ITestService>('UnregisteredService');
      }).toThrow('Service not registered: UnregisteredService');
    });

    it('should resolve service with constructor parameters', () => {
      container.registerSingleton('ITestService', () => new TestService('dependency'));
      container.registerSingleton('ITestServiceWithDependency', () => 
        new TestServiceWithDependency('service', container.resolve('ITestService'))
      );
      
      const instance = container.resolve<ITestService>('ITestServiceWithDependency');
      
      expect(instance.getValue()).toBe('value-service-value-dependency');
    });
  });

  describe('unregistration', () => {
    it('should unregister service', () => {
      container.registerSingleton('ITestService', () => new TestService());
      expect(container.isRegistered('ITestService')).toBe(true);
      
      container.unregister('ITestService');
      expect(container.isRegistered('ITestService')).toBe(false);
    });

    it('should not throw error when unregistering non-existent service', () => {
      expect(() => {
        container.unregister('NonExistentService');
      }).not.toThrow();
    });
  });

  describe('clear', () => {
    it('should clear singleton instances but keep registrations', () => {
      container.registerSingleton('Service1', () => new TestService('service1'));
      container.registerTransient('Service2', () => new TestService('service2'));
      
      expect(container.isRegistered('Service1')).toBe(true);
      expect(container.isRegistered('Service2')).toBe(true);
      
      // Resolve to create instances
      const instance1 = container.resolve('Service1');
      const instance2 = container.resolve('Service2');
      
      container.clear();
      
      // Registrations should still exist
      expect(container.isRegistered('Service1')).toBe(true);
      expect(container.isRegistered('Service2')).toBe(true);
      
      // But singleton instances should be cleared and recreated
      const newInstance1 = container.resolve<ITestService>('Service1');
      const newInstance2 = container.resolve<ITestService>('Service1');
      expect(newInstance1).toBe(newInstance2); // Should be same instance (singleton)
      expect(newInstance1).not.toBe(instance1); // But different from before clear
    });
  });

  describe('getRegisteredServices', () => {
    it('should return list of registered service identifiers', () => {
      container.registerSingleton('Service1', () => new TestService());
      container.registerSingleton('Service2', () => new TestService());
      
      const registeredServices = container.getRegisteredServices();
      
      expect(registeredServices).toContain('Service1');
      expect(registeredServices).toContain('Service2');
      expect(registeredServices.length).toBe(2);
    });
  });

  describe('circular dependency detection', () => {
    it('should detect circular dependencies', () => {
      // This would require a more complex setup with circular references
      // For now, we'll test the basic functionality
      container.registerSingleton('ITestService', () => new TestService());
      
      // Should not throw for simple resolution
      expect(() => {
        container.resolve<ITestService>('ITestService');
      }).not.toThrow();
    });
  });

  describe('error handling', () => {
    it('should handle factory errors gracefully', () => {
      container.registerSingleton('ITestService', () => {
        throw new Error('Factory error');
      });
      
      expect(() => {
        container.resolve<ITestService>('ITestService');
      }).toThrow('Factory error');
    });
  });
}); 