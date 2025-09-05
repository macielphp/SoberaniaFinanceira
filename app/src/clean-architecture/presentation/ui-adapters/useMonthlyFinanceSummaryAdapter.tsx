// UI Adapter: useMonthlyFinanceSummaryAdapter
// Hook React para interagir com MonthlyFinanceSummaryViewModel
// Conecta React com a camada de apresentação Clean Architecture

import { useState, useCallback } from 'react';
import { MonthlyFinanceSummaryViewModel } from '../view-models/MonthlyFinanceSummaryViewModel';
import { MonthlyFinanceSummary } from '../../domain/entities/MonthlyFinanceSummary';
import { Money } from '../../shared/utils/Money';

export interface UseMonthlyFinanceSummaryAdapterResult {
  // State
  loading: boolean;
  error: string | null;
  monthlyFinanceSummary: MonthlyFinanceSummary | null;
  renderCount: number;

  // Actions
  getMonthlyFinanceSummary: (userId: string, month: string) => Promise<MonthlyFinanceSummary>;
  setError: (error: string) => void;
  clearError: () => void;
  forceUpdate: () => void;
}

export function useMonthlyFinanceSummaryAdapter(
  viewModel?: MonthlyFinanceSummaryViewModel
): UseMonthlyFinanceSummaryAdapterResult {
  // Create ViewModel instance if not provided
  const [monthlyFinanceSummaryViewModel] = useState(() => {
    if (viewModel) {
      return viewModel;
    }
    
    // Create default ViewModel with mock dependencies
    // In a real app, these would be injected via DI container
    const mockGetUseCase = {
      execute: async (data: any) => {
        return {
          isSuccess: () => true,
          isFailure: () => false,
          getOrThrow: () => ({
            monthlyFinanceSummary: new MonthlyFinanceSummary({
              id: 'mock-id',
              userId: data.userId,
              month: data.month,
              totalIncome: new Money(0, 'BRL'),
              totalExpense: new Money(0, 'BRL'),
              balance: new Money(0, 'BRL'),
              totalPlannedBudget: new Money(0, 'BRL'),
              totalActualBudget: new Money(0, 'BRL'),
              createdAt: new Date(),
            }),
          }),
        };
      },
    };

    return new MonthlyFinanceSummaryViewModel(mockGetUseCase as any);
  });

  // State management
  const [renderCount, setRenderCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [monthlyFinanceSummary, setMonthlyFinanceSummary] = useState<MonthlyFinanceSummary | null>(null);

  // Force update mechanism
  const forceUpdate = useCallback(() => {
    setRenderCount(prev => prev + 1);
  }, []);

  // Actions
  const getMonthlyFinanceSummary = useCallback(async (userId: string, month: string): Promise<MonthlyFinanceSummary> => {
    try {
      setLoading(true);
      setError(null);
      
      const request = { userId, month };
      const result = await monthlyFinanceSummaryViewModel.getMonthlyFinanceSummaryByUserAndMonth(userId, month);
      
      if (result.isSuccess()) {
        const response = result.getOrThrow();
        const summary = response.monthlyFinanceSummaries[0] || null;
        setMonthlyFinanceSummary(summary);
        forceUpdate();
        return summary;
      } else {
        const error = result.getOrThrow();
        setError(error instanceof Error ? error.message : 'Erro desconhecido');
        forceUpdate();
        throw error;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao buscar resumo financeiro mensal';
      setError(errorMessage);
      setLoading(false);
      forceUpdate();
      throw error;
    } finally {
      setLoading(false);
    }
  }, [monthlyFinanceSummaryViewModel, forceUpdate]);

  const setCustomError = useCallback((errorMessage: string) => {
    setError(errorMessage);
    forceUpdate();
  }, [forceUpdate]);

  const clearCustomError = useCallback(() => {
    setError(null);
    forceUpdate();
  }, [forceUpdate]);

  return {
    // State
    loading,
    error,
    monthlyFinanceSummary,
    renderCount,

    // Actions
    getMonthlyFinanceSummary,
    setError: setCustomError,
    clearError: clearCustomError,
    forceUpdate,
  };
}
