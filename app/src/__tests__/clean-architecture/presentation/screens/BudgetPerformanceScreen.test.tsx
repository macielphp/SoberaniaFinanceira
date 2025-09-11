import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { BudgetPerformanceScreen } from '../../../../clean-architecture/presentation/screens/BudgetPerformanceScreen';
import { BudgetPerformanceViewModel } from '../../../../clean-architecture/presentation/view-models/BudgetPerformanceViewModel';
import { Budget } from '../../../../clean-architecture/domain/entities/Budget';
import { Money } from '../../../../clean-architecture/shared/utils/Money';

// Mock do Money
jest.mock('../../../../clean-architecture/shared/utils/Money', () => ({
  Money: jest.fn().mockImplementation((amount: number, currency: string = 'BRL') => ({
    amount,
    currency,
    value: amount,
    format: () => `R$ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    toString: () => `R$ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  })),
}));

// Mock do BudgetPerformanceViewModel
const mockBudgetPerformanceViewModel = {
  loading: false,
  error: null as string | null,
  performanceAnalysis: null as any,
  categoryPerformance: [] as any[],
  recommendations: [] as any[],
  statistics: null as any,
  analyzeBudgetPerformance: jest.fn(),
  analyzeCategoryPerformance: jest.fn(),
  clearError: jest.fn(),
};

// Mock do BudgetPerformanceViewModel constructor
jest.mock('../../../../clean-architecture/presentation/view-models/BudgetPerformanceViewModel', () => ({
  BudgetPerformanceViewModel: jest.fn(() => mockBudgetPerformanceViewModel),
}));

describe('BudgetPerformanceScreen', () => {
  const mockBudget = new Budget({
    id: 'budget-1',
    name: 'Orçamento Mensal',
    startPeriod: new Date('2024-01-01'),
    endPeriod: new Date('2024-01-31'),
    totalPlannedValue: new Money(5000, 'BRL'),
    type: 'manual',
    userId: 'user-1',
    isActive: true,
    status: 'active',
    createdAt: new Date('2024-01-01'),
  });

  const mockBudgetPerformance = {
    budgetId: 'budget-1',
    totalPlanned: new Money(5000, 'BRL'),
    totalActual: new Money(4500, 'BRL'),
    performancePercentage: 90,
    variance: new Money(-500, 'BRL'),
    variancePercentage: -10,
    isOnTrack: true,
    trend: 'improving',
    monthlyBreakdown: [
      { month: 'Janeiro', planned: new Money(5000, 'BRL'), actual: new Money(4500, 'BRL'), performance: 90 },
    ],
  };

  const mockCategoryPerformance = [
    {
      categoryId: 'cat-1',
      categoryName: 'Alimentação',
      planned: new Money(2000, 'BRL'),
      actual: new Money(1800, 'BRL'),
      performance: 90,
      variance: new Money(-200, 'BRL'),
      trend: 'improving',
    },
    {
      categoryId: 'cat-2',
      categoryName: 'Transporte',
      planned: new Money(1500, 'BRL'),
      actual: new Money(1600, 'BRL'),
      performance: 107,
      variance: new Money(100, 'BRL'),
      trend: 'declining',
    },
  ];

  const mockRecommendations = [
    {
      id: 'rec-1',
      type: 'savings',
      title: 'Reduza gastos com alimentação',
      description: 'Você pode economizar R$ 200,00 reduzindo refeições fora de casa',
      impact: new Money(200, 'BRL'),
      priority: 'high',
    },
    {
      id: 'rec-2',
      type: 'optimization',
      title: 'Otimize gastos com transporte',
      description: 'Considere usar transporte público para economizar',
      impact: new Money(150, 'BRL'),
      priority: 'medium',
    },
  ];

  const mockStatistics = {
    averagePerformance: 85,
    bestMonth: 'Janeiro',
    worstMonth: 'Fevereiro',
    totalSavings: new Money(500, 'BRL'),
    improvementRate: 15,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock default values
    mockBudgetPerformanceViewModel.loading = false;
    mockBudgetPerformanceViewModel.error = null;
    mockBudgetPerformanceViewModel.performanceAnalysis = mockBudgetPerformance;
    mockBudgetPerformanceViewModel.categoryPerformance = mockCategoryPerformance;
    mockBudgetPerformanceViewModel.recommendations = mockRecommendations;
    mockBudgetPerformanceViewModel.statistics = mockStatistics;
    
    // Mock methods
    mockBudgetPerformanceViewModel.analyzeBudgetPerformance.mockResolvedValue(mockBudgetPerformance);
    mockBudgetPerformanceViewModel.analyzeCategoryPerformance.mockResolvedValue(mockCategoryPerformance);
  });

  describe('rendering', () => {
    it('should render loading state', () => {
      mockBudgetPerformanceViewModel.loading = true;
      const { getByTestId } = render(<BudgetPerformanceScreen budgetId="budget-1" />);
      
      expect(getByTestId('loading-indicator')).toBeTruthy();
    });

    it('should render error state', async () => {
      mockBudgetPerformanceViewModel.error = 'Erro ao carregar performance';
      const { getByText } = render(<BudgetPerformanceScreen budgetId="budget-1" />);
      
      await waitFor(() => {
        expect(getByText('Erro ao carregar performance')).toBeTruthy();
      });
    });

    it('should render empty state when no data', async () => {
      mockBudgetPerformanceViewModel.performanceAnalysis = null;
      mockBudgetPerformanceViewModel.categoryPerformance = [];
      
      const { getByText } = render(<BudgetPerformanceScreen budgetId="budget-1" />);
      
      await waitFor(() => {
        expect(getByText('Nenhum dado de performance encontrado')).toBeTruthy();
        expect(getByText('Tente novamente mais tarde')).toBeTruthy();
      });
    });
  });

  // Performance information tests not implemented yet

  // Recommendations and statistics not implemented yet

  describe('interactions', () => {
    it('should call analyzeBudgetPerformance on mount', () => {
      render(<BudgetPerformanceScreen budgetId="budget-1" />);
      
      expect(mockBudgetPerformanceViewModel.analyzeBudgetPerformance).toHaveBeenCalledWith('budget-1');
    });

    it('should call analyzeCategoryPerformance on mount', () => {
      render(<BudgetPerformanceScreen budgetId="budget-1" />);
      
      expect(mockBudgetPerformanceViewModel.analyzeCategoryPerformance).toHaveBeenCalledWith('budget-1');
    });
  });

  describe('error handling', () => {
    it('should clear error when component unmounts', () => {
      const { unmount } = render(<BudgetPerformanceScreen budgetId="budget-1" />);
      
      unmount();
      
      expect(mockBudgetPerformanceViewModel.clearError).toHaveBeenCalled();
    });
  });

  // Accessibility tests not implemented yet
});
