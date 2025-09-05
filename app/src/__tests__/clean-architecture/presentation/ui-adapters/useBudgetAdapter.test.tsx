
// Test: useBudgetAdapter
// Responsável por testar o hook React para interagir com BudgetViewModel
// Conecta React com a camada de apresentação Clean Architecture

import { renderHook, act } from '@testing-library/react-native';
import { useBudgetAdapter } from '../../../../clean-architecture/presentation/ui-adapters/useBudgetAdapter';
import { BudgetViewModel } from '../../../../clean-architecture/presentation/view-models/BudgetViewModel';
import { Budget } from '../../../../clean-architecture/domain/entities/Budget';
import { Money } from '../../../../clean-architecture/shared/utils/Money';

// Mock BudgetViewModel
const mockBudgetViewModel = {
  budgets: [] as Budget[],
  loading: false,
  error: null,
  selectedBudget: null,
  loadBudgets: jest.fn(),
  createBudget: jest.fn(),
  updateBudget: jest.fn(),
  deleteBudget: jest.fn(),
  selectBudget: jest.fn(),
  clearSelection: jest.fn(),
  setError: jest.fn(),
  clearError: jest.fn(),
};

// Mock Budget entity
const mockBudget = new Budget({
  id: 'budget-1',
  userId: 'user-1',
  name: 'Orçamento Janeiro 2024',
  startPeriod: new Date('2024-01-01'),
  endPeriod: new Date('2024-01-31'),
  type: 'manual',
  totalPlannedValue: new Money(5000.00, 'BRL'),
  createdAt: new Date('2024-01-01'),
});

const mockBudgets = [
  mockBudget,
  new Budget({
    id: 'budget-2',
    userId: 'user-1',
    name: 'Orçamento Fevereiro 2024',
    startPeriod: new Date('2024-02-01'),
    endPeriod: new Date('2024-02-29'),
    type: 'manual',
    totalPlannedValue: new Money(4500.00, 'BRL'),
    createdAt: new Date('2024-02-01'),
  }),
];

describe('useBudgetAdapter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useBudgetAdapter());

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.budgets).toEqual([]);
      expect(result.current.selectedBudget).toBeNull();
    });

    it('should initialize with provided ViewModel', () => {
      const { result } = renderHook(() => useBudgetAdapter(mockBudgetViewModel as any));

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.budgets).toEqual([]);
      expect(result.current.selectedBudget).toBeNull();
    });
  });

  describe('budget management', () => {
    it('should load budgets', async () => {
      mockBudgetViewModel.loadBudgets.mockResolvedValue(undefined);
      mockBudgetViewModel.budgets = mockBudgets;

      const { result } = renderHook(() => useBudgetAdapter(mockBudgetViewModel as any));

      await act(async () => {
        await result.current.loadBudgets();
      });

      expect(mockBudgetViewModel.loadBudgets).toHaveBeenCalled();
    });

    it('should handle load budgets error', async () => {
      const error = new Error('Erro ao carregar orçamentos');
      mockBudgetViewModel.loadBudgets.mockRejectedValue(error);

      const { result } = renderHook(() => useBudgetAdapter(mockBudgetViewModel as any));

      await act(async () => {
        try {
          await result.current.loadBudgets();
        } catch (e) {
          expect(e).toBe(error);
        }
      });

      expect(result.current.error).toBe('Erro ao carregar orçamentos');
    });

    it('should create budget', async () => {
      const budgetData = {
        userId: 'user-1',
        name: 'Novo Orçamento',
        startPeriod: new Date('2024-03-01'),
        endPeriod: new Date('2024-03-31'),
        type: 'manual' as const,
        totalPlannedValue: new Money(4000.00, 'BRL'),
      };

      mockBudgetViewModel.createBudget.mockResolvedValue({
        isSuccess: () => true,
        isFailure: () => false,
        getOrThrow: () => mockBudget,
      });
      mockBudgetViewModel.budgets = [mockBudget];

      const { result } = renderHook(() => useBudgetAdapter(mockBudgetViewModel as any));

      let createdBudget;
      await act(async () => {
        createdBudget = await result.current.createBudget(budgetData);
      });

      expect(createdBudget).toEqual(mockBudget);
      expect(mockBudgetViewModel.createBudget).toHaveBeenCalledWith(budgetData);
    });

    it('should handle create budget error', async () => {
      const budgetData = {
        userId: 'user-1',
        name: 'Orçamento Inválido',
        startPeriod: new Date('2024-03-01'),
        endPeriod: new Date('2024-03-31'),
        type: 'manual' as const,
        totalPlannedValue: new Money(0, 'BRL'),
      };

      const error = new Error('Erro ao criar orçamento');
      mockBudgetViewModel.createBudget.mockRejectedValue(error);

      const { result } = renderHook(() => useBudgetAdapter(mockBudgetViewModel as any));

      await act(async () => {
        try {
          await result.current.createBudget(budgetData);
        } catch (e) {
          expect(e).toBe(error);
        }
      });

      expect(result.current.error).toBe('Erro ao criar orçamento');
    });

    it('should update budget', async () => {
      const budgetId = 'budget-1';
      const updateData = {
        name: 'Orçamento Atualizado',
        totalPlannedValue: new Money(5500.00, 'BRL'),
      };

      const updatedBudget = new Budget({
        id: mockBudget.id,
        userId: mockBudget.userId,
        name: 'Orçamento Atualizado',
        startPeriod: mockBudget.startPeriod,
        endPeriod: mockBudget.endPeriod,
        type: mockBudget.type,
        totalPlannedValue: new Money(5500.00, 'BRL'),
        createdAt: mockBudget.createdAt,
      });

      mockBudgetViewModel.updateBudget.mockResolvedValue({
        isSuccess: () => true,
        isFailure: () => false,
        getOrThrow: () => updatedBudget,
      });

      const { result } = renderHook(() => useBudgetAdapter(mockBudgetViewModel as any));

      let resultBudget;
      await act(async () => {
        resultBudget = await result.current.updateBudget(budgetId, updateData);
      });

      expect(resultBudget).toEqual(updatedBudget);
      expect(mockBudgetViewModel.updateBudget).toHaveBeenCalledWith(budgetId, updateData);
    });

    it('should delete budget', async () => {
      const budgetId = 'budget-1';
      mockBudgetViewModel.deleteBudget.mockResolvedValue(undefined);

      const { result } = renderHook(() => useBudgetAdapter(mockBudgetViewModel as any));

      await act(async () => {
        await result.current.deleteBudget(budgetId);
      });

      expect(mockBudgetViewModel.deleteBudget).toHaveBeenCalledWith(budgetId);
    });
  });

  describe('budget selection', () => {
    it('should select budget', () => {
      const { result } = renderHook(() => useBudgetAdapter(mockBudgetViewModel as any));

      act(() => {
        result.current.selectBudget(mockBudget);
      });

      expect(mockBudgetViewModel.selectBudget).toHaveBeenCalledWith(mockBudget.id);
    });

    it('should clear selection', () => {
      const { result } = renderHook(() => useBudgetAdapter(mockBudgetViewModel as any));

      act(() => {
        result.current.clearSelection();
      });

      expect(result.current.selectedBudget).toBeNull();
    });
  });

  describe('reactive state management', () => {
    it('should manage state internally', () => {
      const { result } = renderHook(() => useBudgetAdapter(mockBudgetViewModel as any));

      expect(result.current.loading).toBe(false);
      expect(result.current.budgets).toEqual([]);
      expect(result.current.error).toBeNull();
      expect(result.current.selectedBudget).toBeNull();
    });
  });

  describe('error handling', () => {
    it('should clear errors', () => {
      const { result } = renderHook(() => useBudgetAdapter(mockBudgetViewModel as any));

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });

    it('should set custom error', () => {
      const { result } = renderHook(() => useBudgetAdapter(mockBudgetViewModel as any));

      act(() => {
        result.current.setError('Erro customizado');
      });

      expect(result.current.error).toBe('Erro customizado');
    });
  });

  describe('loading state', () => {
    it('should start with loading false', () => {
      const { result } = renderHook(() => useBudgetAdapter(mockBudgetViewModel as any));

      expect(result.current.loading).toBe(false);
    });
  });

  describe('budgets state', () => {
    it('should start with empty budgets', () => {
      const { result } = renderHook(() => useBudgetAdapter(mockBudgetViewModel as any));

      expect(result.current.budgets).toEqual([]);
    });
  });

  describe('selected budget state', () => {
    it('should start with null selected budget', () => {
      const { result } = renderHook(() => useBudgetAdapter(mockBudgetViewModel as any));

      expect(result.current.selectedBudget).toBeNull();
    });
  });

  describe('force update mechanism', () => {
    it('should force re-render when forceUpdate is called', () => {
      const { result } = renderHook(() => useBudgetAdapter(mockBudgetViewModel as any));

      const initialRenderCount = result.current.renderCount || 0;

      act(() => {
        result.current.forceUpdate();
      });

      // The hook should have re-rendered
      expect(result.current.renderCount).toBeGreaterThan(initialRenderCount);
    });
  });
});
