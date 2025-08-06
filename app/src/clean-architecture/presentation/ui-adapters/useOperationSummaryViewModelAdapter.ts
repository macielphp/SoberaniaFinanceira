import { useState, useCallback, useEffect } from 'react';
import { OperationSummaryViewModel } from '../view-models/OperationSummaryViewModel';
import { Operation } from '../../domain/entities/Operation';
import { Category } from '../../domain/entities/Category';
import { Money } from '../../shared/utils/Money';
import { container } from '../../shared/di/Container';

export const useOperationSummaryViewModelAdapter = () => {
  const [operations, setOperations] = useState<Operation[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewModel, setViewModel] = useState<OperationSummaryViewModel | null>(null);

  const loadOperations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Carregar operações e categorias dos repositórios
      const operationRepository = container.resolve<any>('IOperationRepository');
      const categoryRepository = container.resolve<any>('ICategoryRepository');
      
      const [operationsData, categoriesData] = await Promise.all([
        operationRepository.findAll(),
        categoryRepository.findAll()
      ]);
      
      const newViewModel = new OperationSummaryViewModel(operationsData, categoriesData);
      setViewModel(newViewModel);
      setOperations(operationsData);
      setCategories(categoriesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar operações');
    } finally {
      setLoading(false);
    }
  }, []);

  const getTotalIncomeForMonth = useCallback((date: Date) => {
    if (!viewModel) return new Money(0);
    return viewModel.getTotalIncomeForMonth(date);
  }, [viewModel]);

  const getTotalExpensesForMonth = useCallback((date: Date) => {
    if (!viewModel) return new Money(0);
    return viewModel.getTotalExpensesForMonth(date);
  }, [viewModel]);

  const getNetBalanceForMonth = useCallback((date: Date) => {
    if (!viewModel) return new Money(0);
    return viewModel.getNetBalanceForMonth(date);
  }, [viewModel]);

  const getAccountSummary = useCallback((accountId: string) => {
    if (!viewModel) {
      return {
        totalIncome: new Money(0),
        totalExpenses: new Money(0),
        netBalance: new Money(0),
      };
    }
    return viewModel.getAccountSummary(accountId);
  }, [viewModel]);

  const getPeriodSummary = useCallback((startDate: Date, endDate: Date) => {
    if (!viewModel) {
      return {
        totalIncome: new Money(0),
        totalExpenses: new Money(0),
        netBalance: new Money(0),
        startDate,
        endDate,
      };
    }
    return viewModel.getPeriodSummary(startDate, endDate);
  }, [viewModel]);

  const getExpensesByCategory = useCallback((date: Date) => {
    if (!viewModel) return [];
    return viewModel.getExpensesByCategory(date);
  }, [viewModel]);

  const getIncomeByCategory = useCallback((date: Date) => {
    if (!viewModel) return [];
    return viewModel.getIncomeByCategory(date);
  }, [viewModel]);

  useEffect(() => {
    loadOperations();
  }, [loadOperations]);

  return {
    operations,
    categories,
    loading,
    error,
    loadOperations,
    getTotalIncomeForMonth,
    getTotalExpensesForMonth,
    getNetBalanceForMonth,
    getAccountSummary,
    getPeriodSummary,
    getExpensesByCategory,
    getIncomeByCategory,
  };
}; 