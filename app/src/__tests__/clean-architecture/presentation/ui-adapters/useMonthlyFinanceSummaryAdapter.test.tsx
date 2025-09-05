// Test: useMonthlyFinanceSummaryAdapter
// Responsável por testar o hook React para interagir com MonthlyFinanceSummaryViewModel
// Conecta React com a camada de apresentação Clean Architecture

import { renderHook, act } from '@testing-library/react-native';
import { useMonthlyFinanceSummaryAdapter } from '../../../../clean-architecture/presentation/ui-adapters/useMonthlyFinanceSummaryAdapter';
import { MonthlyFinanceSummaryViewModel } from '../../../../clean-architecture/presentation/view-models/MonthlyFinanceSummaryViewModel';
import { MonthlyFinanceSummary } from '../../../../clean-architecture/domain/entities/MonthlyFinanceSummary';
import { Money } from '../../../../clean-architecture/shared/utils/Money';

// Mock MonthlyFinanceSummaryViewModel
const mockMonthlyFinanceSummaryViewModel = {
  getMonthlyFinanceSummaryByUserAndMonth: jest.fn(),
};

// Mock MonthlyFinanceSummary entity
const mockMonthlyFinanceSummary = new MonthlyFinanceSummary({
  id: 'summary-1',
  userId: 'user-1',
  month: '2024-01',
  totalIncome: new Money(5000.00, 'BRL'),
  totalExpense: new Money(3000.00, 'BRL'),
  balance: new Money(2000.00, 'BRL'),
  totalPlannedBudget: new Money(4000.00, 'BRL'),
  totalActualBudget: new Money(3500.00, 'BRL'),
  createdAt: new Date('2024-01-01'),
});

const mockMonthlyFinanceSummaries = [
  mockMonthlyFinanceSummary,
  new MonthlyFinanceSummary({
    id: 'summary-2',
    userId: 'user-1',
    month: '2024-02',
    totalIncome: new Money(4500.00, 'BRL'),
    totalExpense: new Money(3200.00, 'BRL'),
    balance: new Money(1300.00, 'BRL'),
    totalPlannedBudget: new Money(3800.00, 'BRL'),
    totalActualBudget: new Money(3600.00, 'BRL'),
    createdAt: new Date('2024-02-01'),
  }),
];

describe('useMonthlyFinanceSummaryAdapter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useMonthlyFinanceSummaryAdapter());

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.monthlyFinanceSummary).toBeNull();
    });

    it('should initialize with provided ViewModel', () => {
      const { result } = renderHook(() => useMonthlyFinanceSummaryAdapter(mockMonthlyFinanceSummaryViewModel as any));

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.monthlyFinanceSummary).toBeNull();
    });
  });

  describe('monthly finance summary management', () => {
    it('should get monthly finance summary', async () => {
      const userId = 'user-1';
      const month = '2024-01';

      mockMonthlyFinanceSummaryViewModel.getMonthlyFinanceSummaryByUserAndMonth.mockResolvedValue({
        isSuccess: () => true,
        isFailure: () => false,
        getOrThrow: () => ({ monthlyFinanceSummaries: [mockMonthlyFinanceSummary] }),
      });

      const { result } = renderHook(() => useMonthlyFinanceSummaryAdapter(mockMonthlyFinanceSummaryViewModel as any));

      let summary;
      await act(async () => {
        summary = await result.current.getMonthlyFinanceSummary(userId, month);
      });

      expect(summary).toEqual(mockMonthlyFinanceSummary);
      expect(mockMonthlyFinanceSummaryViewModel.getMonthlyFinanceSummaryByUserAndMonth).toHaveBeenCalledWith(userId, month);
    });

    it('should handle get monthly finance summary error', async () => {
      const userId = 'user-1';
      const month = '2024-01';
      const error = new Error('Erro ao buscar resumo financeiro mensal');
      
      mockMonthlyFinanceSummaryViewModel.getMonthlyFinanceSummaryByUserAndMonth.mockRejectedValue(error);

      const { result } = renderHook(() => useMonthlyFinanceSummaryAdapter(mockMonthlyFinanceSummaryViewModel as any));

      await act(async () => {
        try {
          await result.current.getMonthlyFinanceSummary(userId, month);
        } catch (e) {
          expect(e).toBe(error);
        }
      });

      expect(result.current.error).toBe('Erro ao buscar resumo financeiro mensal');
    });

    it('should handle failure response from ViewModel', async () => {
      const userId = 'user-1';
      const month = '2024-01';
      const error = new Error('Resumo não encontrado');

      mockMonthlyFinanceSummaryViewModel.getMonthlyFinanceSummaryByUserAndMonth.mockResolvedValue({
        isSuccess: () => false,
        isFailure: () => true,
        getOrThrow: () => error,
      });

      const { result } = renderHook(() => useMonthlyFinanceSummaryAdapter(mockMonthlyFinanceSummaryViewModel as any));

      await act(async () => {
        try {
          await result.current.getMonthlyFinanceSummary(userId, month);
        } catch (e) {
          expect(e).toBe(error);
        }
      });

      expect(result.current.error).toBe('Resumo não encontrado');
    });
  });

  describe('reactive state management', () => {
    it('should manage state internally', () => {
      const { result } = renderHook(() => useMonthlyFinanceSummaryAdapter(mockMonthlyFinanceSummaryViewModel as any));

      expect(result.current.loading).toBe(false);
      expect(result.current.monthlyFinanceSummary).toBeNull();
      expect(result.current.error).toBeNull();
    });
  });

  describe('error handling', () => {
    it('should clear errors', () => {
      const { result } = renderHook(() => useMonthlyFinanceSummaryAdapter(mockMonthlyFinanceSummaryViewModel as any));

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });

    it('should set custom error', () => {
      const { result } = renderHook(() => useMonthlyFinanceSummaryAdapter(mockMonthlyFinanceSummaryViewModel as any));

      act(() => {
        result.current.setError('Erro customizado');
      });

      expect(result.current.error).toBe('Erro customizado');
    });
  });

  describe('loading state', () => {
    it('should start with loading false', () => {
      const { result } = renderHook(() => useMonthlyFinanceSummaryAdapter(mockMonthlyFinanceSummaryViewModel as any));

      expect(result.current.loading).toBe(false);
    });

    it('should set loading to true during async operations', async () => {
      const userId = 'user-1';
      const month = '2024-01';

      // Mock a delayed response
      mockMonthlyFinanceSummaryViewModel.getMonthlyFinanceSummaryByUserAndMonth.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          isSuccess: () => true,
          isFailure: () => false,
          getOrThrow: () => ({ monthlyFinanceSummaries: [mockMonthlyFinanceSummary] }),
        }), 100))
      );

      const { result } = renderHook(() => useMonthlyFinanceSummaryAdapter(mockMonthlyFinanceSummaryViewModel as any));

      // Start the async operation
      act(() => {
        result.current.getMonthlyFinanceSummary(userId, month);
      });

      // Check that loading is true during the operation
      expect(result.current.loading).toBe(true);

      // Wait for the operation to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      });

      // Check that loading is false after completion
      expect(result.current.loading).toBe(false);
    });
  });

  describe('monthly finance summary state', () => {
    it('should start with null monthly finance summary', () => {
      const { result } = renderHook(() => useMonthlyFinanceSummaryAdapter(mockMonthlyFinanceSummaryViewModel as any));

      expect(result.current.monthlyFinanceSummary).toBeNull();
    });

    it('should update monthly finance summary after successful fetch', async () => {
      const userId = 'user-1';
      const month = '2024-01';

      mockMonthlyFinanceSummaryViewModel.getMonthlyFinanceSummaryByUserAndMonth.mockResolvedValue({
        isSuccess: () => true,
        isFailure: () => false,
        getOrThrow: () => ({ monthlyFinanceSummaries: [mockMonthlyFinanceSummary] }),
      });

      const { result } = renderHook(() => useMonthlyFinanceSummaryAdapter(mockMonthlyFinanceSummaryViewModel as any));

      expect(result.current.monthlyFinanceSummary).toBeNull();

      await act(async () => {
        await result.current.getMonthlyFinanceSummary(userId, month);
      });

      expect(result.current.monthlyFinanceSummary).toEqual(mockMonthlyFinanceSummary);
    });
  });

  describe('force update mechanism', () => {
    it('should force re-render when forceUpdate is called', () => {
      const { result } = renderHook(() => useMonthlyFinanceSummaryAdapter(mockMonthlyFinanceSummaryViewModel as any));

      const initialRenderCount = result.current.renderCount || 0;

      act(() => {
        result.current.forceUpdate();
      });

      // The hook should have re-rendered
      expect(result.current.renderCount).toBeGreaterThan(initialRenderCount);
    });
  });
});
