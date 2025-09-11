import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { BudgetDetailScreen } from '../../../../clean-architecture/presentation/screens/BudgetDetailScreen';
import { BudgetViewModel } from '../../../../clean-architecture/presentation/view-models/BudgetViewModel';
import { BudgetItemViewModel } from '../../../../clean-architecture/presentation/view-models/BudgetItemViewModel';
import { Budget } from '../../../../clean-architecture/domain/entities/Budget';
import { BudgetItem } from '../../../../clean-architecture/domain/entities/BudgetItem';
import { Money } from '../../../../clean-architecture/shared/utils/Money';

// Mock do Money
jest.mock('../../../../clean-architecture/shared/utils/Money', () => ({
  Money: jest.fn().mockImplementation((amount: number, currency: string = 'BRL') => ({
    amount,
    currency,
    format: () => `R$ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  })),
}));

// Mock do BudgetViewModel
const mockBudgetViewModel = {
  loading: false,
  error: null as string | null,
  budgets: [] as Budget[],
  currentBudget: null as Budget | null,
  loadBudgets: jest.fn(),
  createBudget: jest.fn(),
  updateBudget: jest.fn(),
  deleteBudget: jest.fn(),
  getBudgetById: jest.fn(),
  activateBudget: jest.fn(),
  clearError: jest.fn(),
  setCurrentBudget: jest.fn(),
  getActiveBudgets: jest.fn(),
  getBudgetsByType: jest.fn(),
  getBudgetsByDateRange: jest.fn(),
  getBudgetsByStatus: jest.fn(),
  getTotalPlannedValue: jest.fn(),
  getTotalPlannedValueByType: jest.fn(),
  getBudgetsCount: jest.fn(),
  getActiveBudgetsCount: jest.fn(),
  hasActiveBudgets: jest.fn(),
  isBudgetActive: jest.fn(),
  getBudgetByIdSync: jest.fn(),
};

// Mock do BudgetItemViewModel
const mockBudgetItemViewModel = {
  createBudgetItem: jest.fn(),
  getBudgetItems: jest.fn(),
  updateBudgetItem: jest.fn(),
  deleteBudgetItem: jest.fn(),
  getBudgetItemById: jest.fn(),
};

// Mock do BudgetViewModel constructor
jest.mock('../../../../clean-architecture/presentation/view-models/BudgetViewModel', () => ({
  BudgetViewModel: jest.fn(() => mockBudgetViewModel),
}));

// Mock do BudgetItemViewModel constructor
jest.mock('../../../../clean-architecture/presentation/view-models/BudgetItemViewModel', () => ({
  BudgetItemViewModel: jest.fn(() => mockBudgetItemViewModel),
}));

describe('BudgetDetailScreen', () => {
  const mockBudget = new Budget({
    id: 'budget-1',
    userId: 'user1',
    name: 'Orçamento Mensal',
    startPeriod: new Date('2024-01-01'),
    endPeriod: new Date('2024-01-31'),
    type: 'manual',
    totalPlannedValue: new Money(5000, 'BRL'),
    isActive: true,
    status: 'active',
    createdAt: new Date('2024-01-01'),
  });

  const mockBudgetItems = [
    new BudgetItem({
      id: 'item-1',
      budgetId: 'budget-1',
      categoryName: 'Alimentação',
      plannedValue: new Money(2000, 'BRL'),
      categoryType: 'expense',
      actualValue: new Money(1800, 'BRL'),
      createdAt: new Date('2024-01-01'),
    }),
    new BudgetItem({
      id: 'item-2',
      budgetId: 'budget-1',
      categoryName: 'Transporte',
      plannedValue: new Money(1500, 'BRL'),
      categoryType: 'expense',
      actualValue: new Money(1600, 'BRL'),
      createdAt: new Date('2024-01-01'),
    }),
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockBudgetViewModel.currentBudget = mockBudget;
    mockBudgetViewModel.loading = false;
    mockBudgetViewModel.error = null;
    mockBudgetViewModel.getBudgetByIdSync.mockReturnValue(mockBudget);
    
    // Mock BudgetItemViewModel methods
    mockBudgetItemViewModel.getBudgetItems.mockResolvedValue({
      isSuccess: () => true,
      isFailure: () => false,
      getOrThrow: () => mockBudgetItems,
    });
  });

  describe('rendering', () => {
    it('should render budget detail screen with budget information', () => {
      const { getByText } = render(<BudgetDetailScreen budgetId="budget-1" />);
      
      expect(getByText('Orçamento Mensal')).toBeTruthy();
      expect(getByText('R$ 5.000,00')).toBeTruthy();
      expect(getByText('01/01/2024 - 31/01/2024')).toBeTruthy();
    });

    it('should render budget items list', () => {
      const { getByText } = render(<BudgetDetailScreen budgetId="budget-1" />);
      
      expect(getByText('Alimentação')).toBeTruthy();
      expect(getByText('Transporte')).toBeTruthy();
      expect(getByText('R$ 2.000,00')).toBeTruthy();
      expect(getByText('R$ 1.500,00')).toBeTruthy();
    });

    it('should render loading state', () => {
      mockBudgetViewModel.loading = true;
      const { getByTestId } = render(<BudgetDetailScreen budgetId="budget-1" />);
      
      expect(getByTestId('loading-indicator')).toBeTruthy();
    });

    it('should render error state', () => {
      mockBudgetViewModel.error = 'Erro ao carregar orçamento';
      const { getByText } = render(<BudgetDetailScreen budgetId="budget-1" />);
      
      expect(getByText('Erro ao carregar orçamento')).toBeTruthy();
    });

    it('should render empty state when no budget items', () => {
      mockBudgetItemViewModel.getBudgetItems.mockResolvedValue({
        isSuccess: () => true,
        isFailure: () => false,
        getOrThrow: () => [],
      });
      
      const { getByText } = render(<BudgetDetailScreen budgetId="budget-1" />);
      
      expect(getByText('Nenhum item encontrado')).toBeTruthy();
      expect(getByText('Adicione itens ao seu orçamento')).toBeTruthy();
    });
  });

  describe('budget information', () => {
    it('should display budget status correctly', () => {
      const { getByText } = render(<BudgetDetailScreen budgetId="budget-1" />);
      
      expect(getByText('Ativo')).toBeTruthy();
    });

    it('should display budget type correctly', () => {
      const { getByText } = render(<BudgetDetailScreen budgetId="budget-1" />);
      
      expect(getByText('Manual')).toBeTruthy();
    });

    it('should display budget progress correctly', () => {
      const { getByText } = render(<BudgetDetailScreen budgetId="budget-1" />);
      
      expect(getByText('Progresso: 68%')).toBeTruthy();
    });
  });

  describe('budget items', () => {
    it('should display budget item information correctly', () => {
      const { getByText } = render(<BudgetDetailScreen budgetId="budget-1" />);
      
      expect(getByText('Alimentação')).toBeTruthy();
      expect(getByText('R$ 2.000,00')).toBeTruthy();
      expect(getByText('R$ 1.800,00')).toBeTruthy();
      expect(getByText('90%')).toBeTruthy();
    });

    it('should display budget item status correctly', () => {
      const { getByText } = render(<BudgetDetailScreen budgetId="budget-1" />);
      
      expect(getByText('Dentro do orçamento')).toBeTruthy();
      expect(getByText('Acima do orçamento')).toBeTruthy();
    });
  });

  describe('interactions', () => {
    it('should call loadBudget on mount', () => {
      render(<BudgetDetailScreen budgetId="budget-1" />);
      
      expect(mockBudgetViewModel.getBudgetByIdSync).toHaveBeenCalledWith('budget-1');
    });

    it('should handle edit budget button press', () => {
      const mockOnEdit = jest.fn();
      const { getByText } = render(
        <BudgetDetailScreen budgetId="budget-1" onEdit={mockOnEdit} />
      );
      
      fireEvent.press(getByText('Editar'));
      
      expect(mockOnEdit).toHaveBeenCalledWith(mockBudget);
    });

    it('should handle delete budget button press', () => {
      const mockOnDelete = jest.fn();
      const { getByText } = render(
        <BudgetDetailScreen budgetId="budget-1" onDelete={mockOnDelete} />
      );
      
      fireEvent.press(getByText('Excluir'));
      
      expect(mockOnDelete).toHaveBeenCalledWith(mockBudget);
    });

    it('should handle add budget item button press', () => {
      const mockOnAddItem = jest.fn();
      const { getByText } = render(
        <BudgetDetailScreen budgetId="budget-1" onAddItem={mockOnAddItem} />
      );
      
      fireEvent.press(getByText('Adicionar Item'));
      
      expect(mockOnAddItem).toHaveBeenCalledWith(mockBudget);
    });

    it('should handle budget item press', () => {
      const mockOnItemPress = jest.fn();
      const { getByText } = render(
        <BudgetDetailScreen budgetId="budget-1" onItemPress={mockOnItemPress} />
      );
      
      fireEvent.press(getByText('Alimentação'));
      
      expect(mockOnItemPress).toHaveBeenCalledWith(mockBudgetItems[0]);
    });

    it('should handle refresh', () => {
      const { getByTestId } = render(<BudgetDetailScreen budgetId="budget-1" />);
      
      fireEvent(getByTestId('budget-items-list'), 'onRefresh');
      
      expect(mockBudgetItemViewModel.getBudgetItems).toHaveBeenCalledWith('budget-1');
    });
  });

  describe('statistics', () => {
    it('should display budget statistics correctly', () => {
      const { getByText } = render(<BudgetDetailScreen budgetId="budget-1" />);
      
      expect(getByText('Total Planejado: R$ 5.000,00')).toBeTruthy();
      expect(getByText('Total Realizado: R$ 3.400,00')).toBeTruthy();
      expect(getByText('Diferença: R$ -1.600,00')).toBeTruthy();
    });

    it('should display budget performance correctly', () => {
      const { getByText } = render(<BudgetDetailScreen budgetId="budget-1" />);
      
      expect(getByText('Performance: 68%')).toBeTruthy();
    });
  });

  describe('error handling', () => {
    it('should display error message', () => {
      mockBudgetViewModel.error = 'Erro ao carregar orçamento';
      const { getByText } = render(<BudgetDetailScreen budgetId="budget-1" />);
      
      expect(getByText('Erro ao carregar orçamento')).toBeTruthy();
    });

    it('should handle retry button press', () => {
      mockBudgetViewModel.error = 'Erro ao carregar orçamento';
      const { getByText } = render(<BudgetDetailScreen budgetId="budget-1" />);
      
      fireEvent.press(getByText('Tentar Novamente'));
      
      expect(mockBudgetViewModel.getBudgetByIdSync).toHaveBeenCalledWith('budget-1');
    });

    it('should clear error when component unmounts', () => {
      const { unmount } = render(<BudgetDetailScreen budgetId="budget-1" />);
      
      unmount();
      
      expect(mockBudgetViewModel.clearError).toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('should have proper accessibility labels', () => {
      const { getByLabelText } = render(<BudgetDetailScreen budgetId="budget-1" />);
      
      expect(getByLabelText('Detalhes do orçamento')).toBeTruthy();
      expect(getByLabelText('Lista de itens do orçamento')).toBeTruthy();
    });

    it('should have accessible action buttons', () => {
      const { getByLabelText } = render(<BudgetDetailScreen budgetId="budget-1" />);
      
      expect(getByLabelText('Editar orçamento')).toBeTruthy();
      expect(getByLabelText('Excluir orçamento')).toBeTruthy();
      expect(getByLabelText('Adicionar item ao orçamento')).toBeTruthy();
    });

    it('should have accessible budget items', () => {
      const { getAllByLabelText } = render(<BudgetDetailScreen budgetId="budget-1" />);
      
      const budgetItems = getAllByLabelText(/Item do orçamento/);
      expect(budgetItems.length).toBeGreaterThan(0);
    });
  });
});
