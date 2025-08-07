import { ApplicationStore } from '@/clean-architecture/shared/state/ApplicationStore';
import { EventBus } from '@/clean-architecture/shared/events/EventBus';

describe('ApplicationStore', () => {
  let applicationStore: ApplicationStore;
  let eventBus: EventBus;

  beforeEach(() => {
    eventBus = new EventBus();
    applicationStore = new ApplicationStore(eventBus);
  });

  it('should create ApplicationStore instance', () => {
    expect(applicationStore).toBeDefined();
    expect(applicationStore).toBeInstanceOf(ApplicationStore);
  });

  it('should get initial state', () => {
    const state = applicationStore.getState();
    expect(state).toBeDefined();
    expect(state.operations).toEqual([]);
    expect(state.accounts).toEqual([]);
    expect(state.categories).toEqual([]);
  });

  it('should update state', () => {
    const newOperations = [{ id: '1', name: 'Test Operation' }];
    
    applicationStore.setState({ operations: newOperations });
    
    const state = applicationStore.getState();
    expect(state.operations).toEqual(newOperations);
  });

  it('should notify listeners on state change', () => {
    const mockListener = jest.fn();
    applicationStore.subscribe(mockListener);
    
    applicationStore.setState({ operations: [{ id: '1' }] });
    
    expect(mockListener).toHaveBeenCalled();
  });
});
