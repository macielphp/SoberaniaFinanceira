/**
 * Teste para verificar se a resolução de paths está funcionando
 */
describe('Path Resolution Test', () => {
  it('should resolve EventBus using path mapping', () => {
    // Teste usando path mapping
    const { EventBus } = require('@/clean-architecture/shared/events/EventBus');
    
    const eventBus = new EventBus();
    const mockHandler = jest.fn();
    
    eventBus.subscribe('test-event', mockHandler);
    eventBus.publish('test-event', { message: 'Hello World' });
    
    expect(mockHandler).toHaveBeenCalledWith({ message: 'Hello World' });
  });

  it('should resolve Container using path mapping', () => {
    // Teste usando path mapping
    const { container } = require('@/clean-architecture/shared/di/Container');
    
    expect(container).toBeDefined();
    expect(typeof container.resolve).toBe('function');
  });

  it('should resolve ApplicationStore using path mapping', () => {
    // Teste usando path mapping
    const { ApplicationStore } = require('@/clean-architecture/shared/state/ApplicationStore');
    
    expect(ApplicationStore).toBeDefined();
    expect(typeof ApplicationStore).toBe('function');
  });
});
