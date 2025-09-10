import { BudgetPerformanceViewModel } from '../../../../clean-architecture/presentation/view-models/BudgetPerformanceViewModel';
import { Budget } from '../../../../clean-architecture/domain/entities/Budget';
import { BudgetItem } from '../../../../clean-architecture/domain/entities/BudgetItem';
import { MonthlyFinanceSummary } from '../../../../clean-architecture/domain/entities/MonthlyFinanceSummary';
import { Money } from '../../../../clean-architecture/shared/utils/Money';
import { Result, success, failure } from '../../../../clean-architecture/shared/utils/Result';

// Mock dos Use Cases
const mockGetBudgetsUseCase = {
  execute: jest.fn(),
};

const mockGetBudgetItemsUseCase = {
  execute: jest.fn(),
};

const mockGetMonthlyFinanceSummaryUseCase = {
  execute: jest.fn(),
};

jest.mock('../../../../clean-architecture/domain/use-cases/GetBudgetsUseCase', () => ({
  GetBudgetsUseCase: jest.fn(() => mockGetBudgetsUseCase),
}));

jest.mock('../../../../clean-architecture/domain/use-cases/GetBudgetItemsUseCase', () => ({
  GetBudgetItemsUseCase: jest.fn(() => mockGetBudgetItemsUseCase),
}));

jest.mock('../../../../clean-architecture/domain/use-cases/GetMonthlyFinanceSummaryUseCase', () => ({
  GetMonthlyFinanceSummaryUseCase: jest.fn(() => mockGetMonthlyFinanceSummaryUseCase),
}));

describe('BudgetPerformanceViewModel', () => {
  let budgetPerformanceViewModel: BudgetPerformanceViewModel;

  const mockBudget = new Budget({
    id: 'budget-1',
    userId: 'user1',
    name: 'Orçamento Mensal',
    startPeriod: new Date('2024-01-01'),
    endPeriod: new Date('2024-01-31'),
    type: 'manual',
    totalPlannedValue: new Money(5000),
    isActive: true,
    status: 'active',
    createdAt: new Date('2024-01-01'),
  });

  const mockBudgetItems = [
    new BudgetItem({
      id: 'item-1',
      budgetId: 'budget-1',
      categoryName: 'Alimentação',
      categoryType: 'expense',
      plannedValue: new Money(1000),
      actualValue: new Money(800),
    }),
    new BudgetItem({
      id: 'item-2',
      budgetId: 'budget-1',
      categoryName: 'Transporte',
      categoryType: 'expense',
      plannedValue: new Money(500),
      actualValue: new Money(450),
    }),
  ];

  const mockMonthlySummary = new MonthlyFinanceSummary({
    id: 'summary-1',
    userId: 'user1',
    month: '2024-01',
    totalIncome: new Money(6000),
    totalExpense: new Money(4000),
    balance: new Money(2000),
    totalPlannedBudget: new Money(5000),
    totalActualBudget: new Money(4000),
    createdAt: new Date('2024-01-01'),
  });

  beforeEach(() => {
    jest.clearAllMocks();
    const mockBudgetRepository = {} as any;
    const mockBudgetItemRepository = {} as any;
    const mockMonthlyFinanceSummaryRepository = {} as any;
    
    budgetPerformanceViewModel = new BudgetPerformanceViewModel(
      mockBudgetRepository,
      mockBudgetItemRepository,
      mockMonthlyFinanceSummaryRepository
    );
  });

  describe('initialization', () => {
    it('should initialize with empty state', () => {
      expect(budgetPerformanceViewModel.performanceAnalysis).toBeNull();
      expect(budgetPerformanceViewModel.categoryPerformance).toEqual([]);
      expect(budgetPerformanceViewModel.loading).toBe(false);
      expect(budgetPerformanceViewModel.error).toBeNull();
    });
  });

  describe('analyzeBudgetPerformance', () => {
    it('should analyze budget performance successfully', async () => {
      // Mock budget data
      mockGetBudgetsUseCase.execute.mockResolvedValue(success({ budgets: [mockBudget] }));
      
      // Mock budget items
      mockGetBudgetItemsUseCase.execute.mockResolvedValue(success({ budgetItems: mockBudgetItems }));
      
      // Mock monthly summary
      mockGetMonthlyFinanceSummaryUseCase.execute.mockResolvedValue(
        success({ monthlyFinanceSummaries: [mockMonthlySummary] })
      );

      const result = await budgetPerformanceViewModel.analyzeBudgetPerformance('budget-1', 1);

      expect(result.budgetId).toBe('budget-1');
      expect(result.budgetName).toBe('Orçamento Mensal');
      expect(result.totalPlanned).toBe(5000);
      expect(result.totalActual).toBe(4000);
      expect(result.overallPercentage).toBe(80);
      expect(result.monthlyPerformance).toHaveLength(1);
      expect(result.averagePerformance).toBe(80);
      expect(result.isOnTrack).toBe(true);
      expect(result.recommendations).toContain('Orçamento está sendo executado conforme planejado. Continue mantendo o controle!');
      
      expect(budgetPerformanceViewModel.performanceAnalysis).toEqual(result);
      expect(budgetPerformanceViewModel.loading).toBe(false);
      expect(budgetPerformanceViewModel.error).toBeNull();
    });

    it('should handle error when budget not found', async () => {
      mockGetBudgetsUseCase.execute.mockResolvedValue(success({ budgets: [] }));

      await expect(budgetPerformanceViewModel.analyzeBudgetPerformance('budget-1')).rejects.toThrow('Budget not found');
      expect(budgetPerformanceViewModel.error).toBe('Budget not found');
      expect(budgetPerformanceViewModel.loading).toBe(false);
    });

    it('should handle error when loading budget items fails', async () => {
      mockGetBudgetsUseCase.execute.mockResolvedValue(success({ budgets: [mockBudget] }));
      mockGetBudgetItemsUseCase.execute.mockResolvedValue(failure(new Error('Database error')));

      await expect(budgetPerformanceViewModel.analyzeBudgetPerformance('budget-1')).rejects.toThrow('Database error');
      expect(budgetPerformanceViewModel.error).toBe('Database error');
      expect(budgetPerformanceViewModel.loading).toBe(false);
    });

    it('should handle months without data gracefully', async () => {
      mockGetBudgetsUseCase.execute.mockResolvedValue(success({ budgets: [mockBudget] }));
      mockGetBudgetItemsUseCase.execute.mockResolvedValue(success({ budgetItems: mockBudgetItems }));
      
      // Mock no monthly summaries
      mockGetMonthlyFinanceSummaryUseCase.execute.mockResolvedValue(
        success({ monthlyFinanceSummaries: [] })
      );

      const result = await budgetPerformanceViewModel.analyzeBudgetPerformance('budget-1', 2);

      expect(result.monthlyPerformance).toHaveLength(0);
      expect(result.averagePerformance).toBe(0);
      expect(result.bestMonth).toBeNull();
      expect(result.worstMonth).toBeNull();
    });
  });

  describe('analyzeCategoryPerformance', () => {
    it('should analyze category performance successfully', async () => {
      mockGetBudgetItemsUseCase.execute.mockResolvedValue(success({ budgetItems: mockBudgetItems }));

      const result = await budgetPerformanceViewModel.analyzeCategoryPerformance('budget-1');

      expect(result).toHaveLength(2);
      
      const alimentacaoCategory = result.find(c => c.categoryName === 'Alimentação');
      expect(alimentacaoCategory).toBeDefined();
      expect(alimentacaoCategory!.plannedValue).toBe(1000);
      expect(alimentacaoCategory!.actualValue).toBe(800);
      expect(alimentacaoCategory!.percentage).toBe(80);
      expect(alimentacaoCategory!.variance).toBe(-200);

      const transporteCategory = result.find(c => c.categoryName === 'Transporte');
      expect(transporteCategory).toBeDefined();
      expect(transporteCategory!.plannedValue).toBe(500);
      expect(transporteCategory!.actualValue).toBe(450);
      expect(transporteCategory!.percentage).toBe(90);
      expect(transporteCategory!.variance).toBe(-50);

      expect(budgetPerformanceViewModel.categoryPerformance).toEqual(result);
      expect(budgetPerformanceViewModel.loading).toBe(false);
      expect(budgetPerformanceViewModel.error).toBeNull();
    });

    it('should handle error when loading budget items fails', async () => {
      mockGetBudgetItemsUseCase.execute.mockResolvedValue(failure(new Error('Database error')));

      await expect(budgetPerformanceViewModel.analyzeCategoryPerformance('budget-1')).rejects.toThrow('Database error');
      expect(budgetPerformanceViewModel.error).toBe('Database error');
      expect(budgetPerformanceViewModel.loading).toBe(false);
    });

    it('should group budget items by category correctly', async () => {
      const multipleItems = [
        ...mockBudgetItems,
        new BudgetItem({
          id: 'item-3',
          budgetId: 'budget-1',
          categoryName: 'Alimentação',
          categoryType: 'expense',
          plannedValue: new Money(200),
          actualValue: new Money(150),
        }),
      ];

      mockGetBudgetItemsUseCase.execute.mockResolvedValue(success({ budgetItems: multipleItems }));

      const result = await budgetPerformanceViewModel.analyzeCategoryPerformance('budget-1');

      expect(result).toHaveLength(2); // Still 2 categories
      
      const alimentacaoCategory = result.find(c => c.categoryName === 'Alimentação');
      expect(alimentacaoCategory!.plannedValue).toBe(1200); // 1000 + 200
      expect(alimentacaoCategory!.actualValue).toBe(950); // 800 + 150
      expect(alimentacaoCategory!.budgetItemCount).toBe(2);
    });
  });

  describe('helper methods', () => {
    it('should clear error', () => {
      budgetPerformanceViewModel.error = 'Test error';
      budgetPerformanceViewModel.clearError();
      expect(budgetPerformanceViewModel.error).toBeNull();
    });

    it('should get performance analysis', () => {
      const mockAnalysis = {
        budgetId: 'budget-1',
        budgetName: 'Test Budget',
        totalPlanned: 5000,
        totalActual: 4000,
        overallPercentage: 80,
        monthlyPerformance: [],
        averagePerformance: 80,
        bestMonth: null,
        worstMonth: null,
        isOnTrack: true,
        recommendations: ['Test recommendation'],
      };

      budgetPerformanceViewModel.performanceAnalysis = mockAnalysis;
      expect(budgetPerformanceViewModel.getPerformanceAnalysis()).toEqual(mockAnalysis);
    });

    it('should get category performance', () => {
      const mockCategoryPerformance = [
        {
          categoryName: 'Test Category',
          categoryType: 'expense' as const,
          plannedValue: 1000,
          actualValue: 800,
          percentage: 80,
          variance: -200,
          budgetItemCount: 1,
        },
      ];

      budgetPerformanceViewModel.categoryPerformance = mockCategoryPerformance;
      expect(budgetPerformanceViewModel.getCategoryPerformance()).toEqual(mockCategoryPerformance);
    });

    it('should get loading state', () => {
      budgetPerformanceViewModel.loading = true;
      expect(budgetPerformanceViewModel.getLoadingState()).toBe(true);
    });

    it('should get error state', () => {
      budgetPerformanceViewModel.error = 'Test error';
      expect(budgetPerformanceViewModel.getErrorState()).toBe('Test error');
    });
  });

  describe('recommendations generation', () => {
    it('should generate recommendation for over-budget', async () => {
      mockGetBudgetsUseCase.execute.mockResolvedValue(success({ budgets: [mockBudget] }));
      mockGetBudgetItemsUseCase.execute.mockResolvedValue(success({ budgetItems: mockBudgetItems }));
      
      // Mock over-budget scenario
      const overBudgetSummary = new MonthlyFinanceSummary({
        id: 'summary-1',
        userId: 'user1',
        month: '2024-01',
        totalIncome: new Money(6000),
        totalExpense: new Money(4000),
        balance: new Money(2000), // 6000 - 4000 = 2000
        totalPlannedBudget: new Money(5000),
        totalActualBudget: new Money(6000), // Over budget
        createdAt: new Date('2024-01-01'),
      });

      mockGetMonthlyFinanceSummaryUseCase.execute.mockResolvedValue(
        success({ monthlyFinanceSummaries: [overBudgetSummary] })
      );

      const result = await budgetPerformanceViewModel.analyzeBudgetPerformance('budget-1', 1);

      expect(result.recommendations).toContain('Orçamento está sendo ultrapassado. Considere reduzir gastos ou aumentar a receita.');
    });

    it('should generate recommendation for low performance', async () => {
      mockGetBudgetsUseCase.execute.mockResolvedValue(success({ budgets: [mockBudget] }));
      mockGetBudgetItemsUseCase.execute.mockResolvedValue(success({ budgetItems: mockBudgetItems }));
      
      // Mock low performance scenario
      const lowPerformanceSummary = new MonthlyFinanceSummary({
        id: 'summary-1',
        userId: 'user1',
        month: '2024-01',
        totalIncome: new Money(6000),
        totalExpense: new Money(4000),
        balance: new Money(2000),
        totalPlannedBudget: new Money(5000),
        totalActualBudget: new Money(2000), // Low performance
        createdAt: new Date('2024-01-01'),
      });

      mockGetMonthlyFinanceSummaryUseCase.execute.mockResolvedValue(
        success({ monthlyFinanceSummaries: [lowPerformanceSummary] })
      );

      const result = await budgetPerformanceViewModel.analyzeBudgetPerformance('budget-1', 1);

      expect(result.recommendations).toContain('Performance média está baixa. Revise as categorias com maior variação.');
    });
  });
});
