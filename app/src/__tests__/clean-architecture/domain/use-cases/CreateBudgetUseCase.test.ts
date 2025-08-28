import { CreateBudgetUseCase } from '../../../../clean-architecture/domain/use-cases/CreateBudgetUseCase';
import { Budget } from '../../../../clean-architecture/domain/entities/Budget';
import { Money } from '../../../../clean-architecture/shared/utils/Money';
import { Result } from '../../../../clean-architecture/shared/utils/Result';
import { EventBus } from '../../../../clean-architecture/shared/events/EventBus';

// Mock repository
const mockBudgetRepository = {
  save: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  findByUser: jest.fn(),
  findByStatus: jest.fn(),
  findActiveByUser: jest.fn(),
  findByDateRange: jest.fn(),
  delete: jest.fn(),
  deleteAll: jest.fn(),
  count: jest.fn(),
};

// Mock event bus
const mockEventBus = {
  subscribe: jest.fn(),
  unsubscribe: jest.fn(),
  publish: jest.fn(),
  clear: jest.fn(),
  getHandlerCount: jest.fn(),
  hasHandlers: jest.fn(),
  getEventNames: jest.fn(),
} as unknown as jest.Mocked<EventBus>;

describe('CreateBudgetUseCase', () => {
  let createBudgetUseCase: CreateBudgetUseCase;
  let mockBudget: Budget;

  beforeEach(() => {
    jest.clearAllMocks();
    
    createBudgetUseCase = new CreateBudgetUseCase(mockBudgetRepository, mockEventBus);
    
    mockBudget = new Budget({
      id: 'budget-123',
      userId: 'user-456',
      name: 'Orçamento Janeiro 2024',
      startPeriod: new Date('2024-01-01'),
      endPeriod: new Date('2024-01-31'),
      type: 'manual',
      totalPlannedValue: new Money(5000, 'BRL')
    });
  });

  describe('execute', () => {
    it('should create budget successfully', async () => {
      const request = {
        userId: 'user-456',
        name: 'Orçamento Janeiro 2024',
        startPeriod: new Date('2024-01-01'),
        endPeriod: new Date('2024-01-31'),
        type: 'manual' as const,
        totalPlannedValue: new Money(5000, 'BRL')
      };

      mockBudgetRepository.save.mockResolvedValue(mockBudget);

      const result = await createBudgetUseCase.execute(request);

      expect(result.isSuccess()).toBe(true);
      expect(result.getOrThrow().budget).toEqual(mockBudget);
      expect(mockBudgetRepository.save).toHaveBeenCalled();
      expect(mockEventBus.publish).toHaveBeenCalledWith('BudgetCreated', expect.any(Object));
    });

    it('should handle validation error for empty name', async () => {
      const request = {
        userId: 'user-456',
        name: '',
        startPeriod: new Date('2024-01-01'),
        endPeriod: new Date('2024-01-31'),
        type: 'manual' as const,
        totalPlannedValue: new Money(5000, 'BRL')
      };

      const result = await createBudgetUseCase.execute(request);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Budget name cannot be empty');
      expect(mockBudgetRepository.save).not.toHaveBeenCalled();
      expect(mockEventBus.publish).not.toHaveBeenCalled();
    });

    it('should handle validation error for invalid type', async () => {
      const request = {
        userId: 'user-456',
        name: 'Orçamento Teste',
        startPeriod: new Date('2024-01-01'),
        endPeriod: new Date('2024-01-31'),
        type: 'invalid' as any,
        totalPlannedValue: new Money(5000, 'BRL')
      };

      const result = await createBudgetUseCase.execute(request);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Invalid budget type');
      expect(mockBudgetRepository.save).not.toHaveBeenCalled();
      expect(mockEventBus.publish).not.toHaveBeenCalled();
    });

    it('should handle validation error for zero planned value', async () => {
      const request = {
        userId: 'user-456',
        name: 'Orçamento Teste',
        startPeriod: new Date('2024-01-01'),
        endPeriod: new Date('2024-01-31'),
        type: 'manual' as const,
        totalPlannedValue: new Money(0, 'BRL')
      };

      const result = await createBudgetUseCase.execute(request);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Budget planned value cannot be zero');
      expect(mockBudgetRepository.save).not.toHaveBeenCalled();
      expect(mockEventBus.publish).not.toHaveBeenCalled();
    });

    it('should handle validation error for invalid date range', async () => {
      const request = {
        userId: 'user-456',
        name: 'Orçamento Teste',
        startPeriod: new Date('2024-01-31'),
        endPeriod: new Date('2024-01-01'), // End before start
        type: 'manual' as const,
        totalPlannedValue: new Money(5000, 'BRL')
      };

      const result = await createBudgetUseCase.execute(request);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('End period must be after start period');
      expect(mockBudgetRepository.save).not.toHaveBeenCalled();
      expect(mockEventBus.publish).not.toHaveBeenCalled();
    });

    it('should handle repository error', async () => {
      const request = {
        userId: 'user-456',
        name: 'Orçamento Teste',
        startPeriod: new Date('2024-01-01'),
        endPeriod: new Date('2024-01-31'),
        type: 'manual' as const,
        totalPlannedValue: new Money(5000, 'BRL')
      };

      const errorMessage = 'Database connection failed';
      mockBudgetRepository.save.mockRejectedValue(new Error(errorMessage));

      const result = await createBudgetUseCase.execute(request);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Failed to create budget');
      expect(mockEventBus.publish).not.toHaveBeenCalled();
    });

    it('should work without event bus', async () => {
      const useCaseWithoutEventBus = new CreateBudgetUseCase(mockBudgetRepository);
      
      const request = {
        userId: 'user-456',
        name: 'Orçamento Teste',
        startPeriod: new Date('2024-01-01'),
        endPeriod: new Date('2024-01-31'),
        type: 'manual' as const,
        totalPlannedValue: new Money(5000, 'BRL')
      };

      mockBudgetRepository.save.mockResolvedValue(mockBudget);

      const result = await useCaseWithoutEventBus.execute(request);

      expect(result.isSuccess()).toBe(true);
      expect(result.getOrThrow().budget).toEqual(mockBudget);
      expect(mockBudgetRepository.save).toHaveBeenCalled();
    });
  });
});
