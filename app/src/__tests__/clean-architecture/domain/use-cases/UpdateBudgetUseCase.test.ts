import { UpdateBudgetUseCase } from '../../../../clean-architecture/domain/use-cases/UpdateBudgetUseCase';
import { Budget } from '../../../../clean-architecture/domain/entities/Budget';
import { Money } from '../../../../clean-architecture/shared/utils/Money';
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

describe('UpdateBudgetUseCase', () => {
  let updateBudgetUseCase: UpdateBudgetUseCase;
  let mockBudget: Budget;
  let mockUpdatedBudget: Budget;

  beforeEach(() => {
    jest.clearAllMocks();
    
    updateBudgetUseCase = new UpdateBudgetUseCase(mockBudgetRepository, mockEventBus);
    
    mockBudget = new Budget({
      id: 'budget-123',
      userId: 'user-456',
      name: 'Orçamento Janeiro 2024',
      startPeriod: new Date('2024-01-01'),
      endPeriod: new Date('2024-01-31'),
      type: 'manual',
      totalPlannedValue: new Money(5000, 'BRL')
    });

    mockUpdatedBudget = new Budget({
      id: 'budget-123',
      userId: 'user-456',
      name: 'Orçamento Janeiro 2024 Atualizado',
      startPeriod: new Date('2024-01-01'),
      endPeriod: new Date('2024-01-31'),
      type: 'manual',
      totalPlannedValue: new Money(6000, 'BRL')
    });
  });

  describe('execute', () => {
    it('should update budget name successfully', async () => {
      const request = {
        budgetId: 'budget-123',
        name: 'Orçamento Janeiro 2024 Atualizado'
      };

      mockBudgetRepository.findById.mockResolvedValue(mockBudget);
      mockBudgetRepository.save.mockResolvedValue(mockUpdatedBudget);

      const result = await updateBudgetUseCase.execute(request);

      expect(result.isSuccess()).toBe(true);
      expect(result.getOrThrow().budget).toEqual(mockUpdatedBudget);
      expect(mockBudgetRepository.findById).toHaveBeenCalledWith('budget-123');
      expect(mockBudgetRepository.save).toHaveBeenCalled();
      expect(mockEventBus.publish).toHaveBeenCalledWith('BudgetUpdated', expect.any(Object));
    });

    it('should update budget planned value successfully', async () => {
      const request = {
        budgetId: 'budget-123',
        totalPlannedValue: new Money(6000, 'BRL')
      };

      mockBudgetRepository.findById.mockResolvedValue(mockBudget);
      mockBudgetRepository.save.mockResolvedValue(mockUpdatedBudget);

      const result = await updateBudgetUseCase.execute(request);

      expect(result.isSuccess()).toBe(true);
      expect(result.getOrThrow().budget).toEqual(mockUpdatedBudget);
      expect(mockBudgetRepository.findById).toHaveBeenCalledWith('budget-123');
      expect(mockBudgetRepository.save).toHaveBeenCalled();
      expect(mockEventBus.publish).toHaveBeenCalledWith('BudgetUpdated', expect.any(Object));
    });

    it('should update budget date range successfully', async () => {
      const request = {
        budgetId: 'budget-123',
        startPeriod: new Date('2024-01-15'),
        endPeriod: new Date('2024-02-15')
      };

      mockBudgetRepository.findById.mockResolvedValue(mockBudget);
      mockBudgetRepository.save.mockResolvedValue(mockUpdatedBudget);

      const result = await updateBudgetUseCase.execute(request);

      expect(result.isSuccess()).toBe(true);
      expect(result.getOrThrow().budget).toEqual(mockUpdatedBudget);
      expect(mockBudgetRepository.findById).toHaveBeenCalledWith('budget-123');
      expect(mockBudgetRepository.save).toHaveBeenCalled();
      expect(mockEventBus.publish).toHaveBeenCalledWith('BudgetUpdated', expect.any(Object));
    });

    it('should handle empty budget ID', async () => {
      const request = {
        budgetId: '',
        name: 'Orçamento Atualizado'
      };

      const result = await updateBudgetUseCase.execute(request);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Budget ID cannot be empty');
      expect(mockBudgetRepository.findById).not.toHaveBeenCalled();
      expect(mockBudgetRepository.save).not.toHaveBeenCalled();
      expect(mockEventBus.publish).not.toHaveBeenCalled();
    });

    it('should handle empty budget name', async () => {
      const request = {
        budgetId: 'budget-123',
        name: ''
      };

      const result = await updateBudgetUseCase.execute(request);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Budget name cannot be empty');
      expect(mockBudgetRepository.findById).not.toHaveBeenCalled();
      expect(mockBudgetRepository.save).not.toHaveBeenCalled();
      expect(mockEventBus.publish).not.toHaveBeenCalled();
    });

    it('should handle zero planned value', async () => {
      const request = {
        budgetId: 'budget-123',
        totalPlannedValue: new Money(0, 'BRL')
      };

      const result = await updateBudgetUseCase.execute(request);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Budget planned value cannot be zero or negative');
      expect(mockBudgetRepository.findById).not.toHaveBeenCalled();
      expect(mockBudgetRepository.save).not.toHaveBeenCalled();
      expect(mockEventBus.publish).not.toHaveBeenCalled();
    });

    it('should handle invalid date range', async () => {
      const request = {
        budgetId: 'budget-123',
        startPeriod: new Date('2024-01-31'),
        endPeriod: new Date('2024-01-01') // End before start
      };

      const result = await updateBudgetUseCase.execute(request);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('End period must be after start period');
      expect(mockBudgetRepository.findById).not.toHaveBeenCalled();
      expect(mockBudgetRepository.save).not.toHaveBeenCalled();
      expect(mockEventBus.publish).not.toHaveBeenCalled();
    });

    it('should handle budget not found', async () => {
      const request = {
        budgetId: 'budget-999',
        name: 'Orçamento Atualizado'
      };

      mockBudgetRepository.findById.mockResolvedValue(null);

      const result = await updateBudgetUseCase.execute(request);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Budget not found');
      expect(mockBudgetRepository.findById).toHaveBeenCalledWith('budget-999');
      expect(mockBudgetRepository.save).not.toHaveBeenCalled();
      expect(mockEventBus.publish).not.toHaveBeenCalled();
    });

    it('should handle repository error', async () => {
      const request = {
        budgetId: 'budget-123',
        name: 'Orçamento Atualizado'
      };

      const errorMessage = 'Database connection failed';
      mockBudgetRepository.findById.mockResolvedValue(mockBudget);
      mockBudgetRepository.save.mockRejectedValue(new Error(errorMessage));

      const result = await updateBudgetUseCase.execute(request);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Failed to update budget');
      expect(mockBudgetRepository.findById).toHaveBeenCalledWith('budget-123');
      expect(mockBudgetRepository.save).toHaveBeenCalled();
      expect(mockEventBus.publish).not.toHaveBeenCalled();
    });

    it('should work without event bus', async () => {
      const useCaseWithoutEventBus = new UpdateBudgetUseCase(mockBudgetRepository);
      
      const request = {
        budgetId: 'budget-123',
        name: 'Orçamento Atualizado'
      };

      mockBudgetRepository.findById.mockResolvedValue(mockBudget);
      mockBudgetRepository.save.mockResolvedValue(mockUpdatedBudget);

      const result = await useCaseWithoutEventBus.execute(request);

      expect(result.isSuccess()).toBe(true);
      expect(result.getOrThrow().budget).toEqual(mockUpdatedBudget);
      expect(mockBudgetRepository.findById).toHaveBeenCalledWith('budget-123');
      expect(mockBudgetRepository.save).toHaveBeenCalled();
    });
  });
});
