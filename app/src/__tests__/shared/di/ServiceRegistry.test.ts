// Tests for ServiceRegistry
import { ServiceRegistry } from '../../../clean-architecture/shared/di/ServiceRegistry';
import { Container } from '../../../clean-architecture/shared/di/Container';

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

describe('ServiceRegistry', () => {
  let container: Container;
  let registry: ServiceRegistry;

  beforeEach(() => {
    container = new Container();
    registry = new ServiceRegistry(container);
  });

  describe('registration', () => {
    it('should register singleton service with dependencies', () => {
      const dependencies = ['IDependency1', 'IDependency2'];
      
      registry.registerSingleton('ITestService', () => new TestService('test'), dependencies);
      
      const registrations = registry.getRegistrations();
      const serviceRegistration = registrations.find(r => r.identifier === 'ITestService');
      
      expect(serviceRegistration).toBeDefined();
      expect(serviceRegistration?.singleton).toBe(true);
      expect(serviceRegistration?.dependencies).toEqual(dependencies);
    });

    it('should register transient service without dependencies', () => {
      registry.registerTransient('ITestService', () => new TestService('test'));
      
      const registrations = registry.getRegistrations();
      const serviceRegistration = registrations.find(r => r.identifier === 'ITestService');
      
      expect(serviceRegistration).toBeDefined();
      expect(serviceRegistration?.singleton).toBe(false);
      expect(serviceRegistration?.dependencies).toBeUndefined();
    });
  });

  describe('configuration', () => {
    it('should configure services in container', () => {
      registry.registerSingleton('ITestService', () => new TestService('test'));
      
      expect(container.isRegistered('ITestService')).toBe(false);
      
      registry.configure();
      
      expect(container.isRegistered('ITestService')).toBe(true);
    });
  });

  describe('dependency validation', () => {
    it('should validate dependencies exist', () => {
      registry.registerSingleton('IDependency', () => new TestService('dependency'));
      registry.registerSingleton('ITestService', () => new TestService('test'), ['IDependency']);
      
      // Should not throw when all dependencies exist
      expect(() => {
        registry.validateDependencies();
      }).not.toThrow();
    });

    it('should detect circular dependencies', () => {
      registry.registerSingleton('ServiceA', () => new TestService('A'), ['ServiceB']);
      registry.registerSingleton('ServiceB', () => new TestService('B'), ['ServiceA']);
      
      expect(() => {
        registry.validateDependencies();
      }).toThrow('Circular dependency detected');
    });
  });

  describe('service information', () => {
    it('should return registrations', () => {
      registry.registerSingleton('Service1', () => new TestService('1'));
      registry.registerTransient('Service2', () => new TestService('2'));
      
      const registrations = registry.getRegistrations();
      
      expect(registrations.length).toBe(2);
      expect(registrations.some(r => r.identifier === 'Service1')).toBe(true);
      expect(registrations.some(r => r.identifier === 'Service2')).toBe(true);
    });
  });

  describe('clear', () => {
    it('should clear all registrations', () => {
      registry.registerSingleton('Service1', () => new TestService('1'));
      registry.registerTransient('Service2', () => new TestService('2'));
      
      expect(registry.getRegistrations().length).toBe(2);
      
      registry.clear();
      
      expect(registry.getRegistrations().length).toBe(0);
    });
  });
}); 