// Test: useBudgetItemAdapter
// Responsável por testar o hook React para interagir com BudgetItemViewModel
// Conecta React com a camada de apresentação Clean Architecture

import { renderHook, act } from '@testing-library/react-native';
import { useBudgetItemAdapter } from '../../../../clean-architecture/presentation/ui-adapters/useBudgetItemAdapter';
import { BudgetItemViewModel } from '../../../../clean-architecture/presentation/view-models/BudgetItemViewModel';
import { BudgetItem } from '../../../../clean-architecture/domain/entities/BudgetItem';
import { Money } from '../../../../clean-architecture/shared/utils/Money';

// Mock BudgetItemViewModel
const mockBudgetItemViewModel = {
  createBudgetItem: jest.fn(),
  getBudgetItems: jest.fn(),
};

// Mock BudgetItem entity
const mockBudgetItem = new BudgetItem({
  id: 'budget-item-1',
  budgetId: 'budget-1',
  categoryName: 'Alimentação',
  plannedValue: new Money(1000.00, 'BRL'),
  categoryType: 'expense',
  actualValue: new Money(800.00, 'BRL'),
  createdAt: new Date('2024-01-01'),
});

const mockBudgetItems = [
  mockBudgetItem,
  new BudgetItem({
    id: 'budget-item-2',
    budgetId: 'budget-1',
    categoryName: 'Transporte',
    plannedValue: new Money(500.00, 'BRL'),
    categoryType: 'expense',
    actualValue: new Money(450.00, 'BRL'),
    createdAt: new Date('2024-01-01'),
  }),
];

describe('useBudgetItemAdapter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useBudgetItemAdapter());

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.budgetItems).toEqual([]);
    });

    it('should initialize with provided ViewModel', () => {
      const { result } = renderHook(() => useBudgetItemAdapter(mockBudgetItemViewModel as any));

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.budgetItems).toEqual([]);
    });
  });

  describe('budget item management', () => {
    it('should create budget item', async () => {
      const budgetItemData = {
        budgetId: 'budget-1',
        categoryName: 'Nova Categoria',
        plannedValue: new Money(750.00, 'BRL'),
        categoryType: 'expense' as const,
      };

      mockBudgetItemViewModel.createBudgetItem.mockResolvedValue({
        isSuccess: () => true,
        isFailure: () => false,
        getOrThrow: () => ({ budgetItem: mockBudgetItem }),
      });

      const { result } = renderHook(() => useBudgetItemAdapter(mockBudgetItemViewModel as any));

      let createdItem;
      await act(async () => {
        createdItem = await result.current.createBudgetItem(budgetItemData);
      });

      expect(createdItem).toEqual(mockBudgetItem);
      expect(mockBudgetItemViewModel.createBudgetItem).toHaveBeenCalledWith(budgetItemData);
    });

    it('should handle budget item creation error', async () => {
      const budgetItemData = {
        budgetId: 'budget-1',
        categoryName: 'Categoria Inválida',
        plannedValue: new Money(0, 'BRL'),
        categoryType: 'expense' as const,
      };

      const error = new Error('Erro ao criar item de orçamento');
      mockBudgetItemViewModel.createBudgetItem.mockRejectedValue(error);

      const { result } = renderHook(() => useBudgetItemAdapter(mockBudgetItemViewModel as any));

      await act(async () => {
        try {
          await result.current.createBudgetItem(budgetItemData);
        } catch (e) {
          expect(e).toBe(error);
        }
      });

      expect(result.current.error).toBe('Erro ao criar item de orçamento');
    });

    it('should get budget items', async () => {
      mockBudgetItemViewModel.getBudgetItems.mockResolvedValue({
        isSuccess: () => true,
        isFailure: () => false,
        getOrThrow: () => ({ budgetItems: mockBudgetItems }),
      });

      const { result } = renderHook(() => useBudgetItemAdapter(mockBudgetItemViewModel as any));

      let items;
      await act(async () => {
        items = await result.current.getBudgetItems('budget-1');
      });

      expect(items).toEqual(mockBudgetItems);
      expect(mockBudgetItemViewModel.getBudgetItems).toHaveBeenCalledWith({ budgetId: 'budget-1', categoryName: undefined });
    });

    it('should handle get budget items error', async () => {
      const error = new Error('Erro ao buscar itens de orçamento');
      mockBudgetItemViewModel.getBudgetItems.mockRejectedValue(error);

      const { result } = renderHook(() => useBudgetItemAdapter(mockBudgetItemViewModel as any));

      await act(async () => {
        try {
          await result.current.getBudgetItems('budget-1');
        } catch (e) {
          expect(e).toBe(error);
        }
      });

      expect(result.current.error).toBe('Erro ao buscar itens de orçamento');
    });
  });

  describe('reactive state management', () => {
    it('should manage state internally', () => {
      const { result } = renderHook(() => useBudgetItemAdapter(mockBudgetItemViewModel as any));

      expect(result.current.loading).toBe(false);
      expect(result.current.budgetItems).toEqual([]);
      expect(result.current.error).toBeNull();
    });
  });

  describe('error handling', () => {
    it('should clear errors', () => {
      const { result } = renderHook(() => useBudgetItemAdapter(mockBudgetItemViewModel as any));

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });

    it('should set custom error', () => {
      const { result } = renderHook(() => useBudgetItemAdapter(mockBudgetItemViewModel as any));

      act(() => {
        result.current.setError('Erro customizado');
      });

      expect(result.current.error).toBe('Erro customizado');
    });
  });

  describe('loading state', () => {
    it('should start with loading false', () => {
      const { result } = renderHook(() => useBudgetItemAdapter(mockBudgetItemViewModel as any));

      expect(result.current.loading).toBe(false);
    });
  });

  describe('budget items state', () => {
    it('should start with empty budget items', () => {
      const { result } = renderHook(() => useBudgetItemAdapter(mockBudgetItemViewModel as any));

      expect(result.current.budgetItems).toEqual([]);
    });
  });

  describe('force update mechanism', () => {
    it('should force re-render when forceUpdate is called', () => {
      const { result } = renderHook(() => useBudgetItemAdapter(mockBudgetItemViewModel as any));

      const initialRenderCount = result.current.renderCount || 0;

      act(() => {
        result.current.forceUpdate();
      });

      // The hook should have re-rendered
      expect(result.current.renderCount).toBeGreaterThan(initialRenderCount);
    });
  });
});
