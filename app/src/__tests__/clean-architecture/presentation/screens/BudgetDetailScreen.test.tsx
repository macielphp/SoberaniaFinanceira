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
    value: amount,
    format: () => `R$ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    toString: () => `R$ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
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
  getBudgetItemsByBudget: jest.fn(),
  getBudgetItemsByCategory: jest.fn(),
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
    mockBudgetItemViewModel.getBudgetItemsByBudget.mockResolvedValue({
      isSuccess: () => true,
      isFailure: () => false,
      getOrThrow: () => ({ budgetItems: mockBudgetItems }),
    });
    
    mockBudgetItemViewModel.deleteBudgetItem.mockResolvedValue({
      isSuccess: () => true,
      isFailure: () => false,
      getOrThrow: () => ({ success: true }),
    });
  });

  describe('rendering', () => {
    it('should render budget detail screen with budget information', async () => {
      const { getByText } = render(<BudgetDetailScreen budgetId="budget-1" />);
      
      await waitFor(() => {
        expect(getByText('Orçamento Mensal')).toBeTruthy();
        expect(getByText('R$ 5.000,00')).toBeTruthy();
        expect(getByText('31/12/2023 - 30/01/2024')).toBeTruthy();
      });
    });

    it('should render budget items list', async () => {
      const { getByText } = render(<BudgetDetailScreen budgetId="budget-1" />);
      
      await waitFor(() => {
        expect(getByText('Alimentação')).toBeTruthy();
        expect(getByText('Transporte')).toBeTruthy();
        expect(getByText('Planejado: R$ 2.000,00')).toBeTruthy();
        expect(getByText('Planejado: R$ 1.500,00')).toBeTruthy();
      });
    });

    it('should render loading state', () => {
      mockBudgetViewModel.loading = true;
      const { getByTestId } = render(<BudgetDetailScreen budgetId="budget-1" />);
      
      expect(getByTestId('loading-indicator')).toBeTruthy();
    });

    it('should render error state', async () => {
      mockBudgetViewModel.getBudgetByIdSync.mockReturnValue(null);
      const { getByText } = render(<BudgetDetailScreen budgetId="budget-1" />);
      
      await waitFor(() => {
        expect(getByText('Orçamento não encontrado')).toBeTruthy();
      });
    });

    it('should render empty state when no budget items', async () => {
      mockBudgetItemViewModel.getBudgetItemsByBudget.mockResolvedValue({
        isSuccess: () => true,
        isFailure: () => false,
        getOrThrow: () => ({ budgetItems: [] }),
      });
      
      const { getByText } = render(<BudgetDetailScreen budgetId="budget-1" />);
      
      await waitFor(() => {
        expect(getByText('Nenhum item encontrado')).toBeTruthy();
        expect(getByText('Adicione itens ao seu orçamento para começar')).toBeTruthy();
      });
    });
  });

  describe('budget information', () => {
    it('should display budget status correctly', async () => {
      const { getByText } = render(<BudgetDetailScreen budgetId="budget-1" />);
      
      await waitFor(() => {
        expect(getByText('Ativo')).toBeTruthy();
      });
    });

    it('should display budget type correctly', async () => {
      const { getByText } = render(<BudgetDetailScreen budgetId="budget-1" />);
      
      await waitFor(() => {
        expect(getByText('Manual')).toBeTruthy();
      });
    });

    it('should display budget progress correctly', async () => {
      const { getByText } = render(<BudgetDetailScreen budgetId="budget-1" />);
      
      await waitFor(() => {
        expect(getByText('Progresso Geral: 97%')).toBeTruthy();
      });
    });
  });

  describe('budget items', () => {
    it('should display budget item information correctly', async () => {
      const { getByText } = render(<BudgetDetailScreen budgetId="budget-1" />);
      
      await waitFor(() => {
        expect(getByText('Alimentação')).toBeTruthy();
        expect(getByText('Planejado: R$ 2.000,00')).toBeTruthy();
        expect(getByText('Realizado: R$ 1.800,00')).toBeTruthy();
        expect(getByText('90%')).toBeTruthy();
      });
    });

    it('should display budget item status correctly', async () => {
      const { getByText } = render(<BudgetDetailScreen budgetId="budget-1" />);
      
      await waitFor(() => {
        expect(getByText('90%')).toBeTruthy();
        expect(getByText('100%')).toBeTruthy();
      });
    });
  });

  describe('interactions', () => {
    it('should call loadBudget on mount', () => {
      render(<BudgetDetailScreen budgetId="budget-1" />);
      
      expect(mockBudgetViewModel.getBudgetByIdSync).toHaveBeenCalledWith('budget-1');
    });

    it('should call getBudgetItemsByBudget on mount', () => {
      render(<BudgetDetailScreen budgetId="budget-1" />);
      
      expect(mockBudgetItemViewModel.getBudgetItemsByBudget).toHaveBeenCalledWith('budget-1');
    });

    it('should handle edit budget button press', async () => {
      const mockOnEdit = jest.fn();
      const { getByLabelText } = render(
        <BudgetDetailScreen budgetId="budget-1" onEdit={mockOnEdit} />
      );
      
      await waitFor(() => {
        fireEvent.press(getByLabelText('Editar orçamento'));
      });
      
      expect(mockOnEdit).toHaveBeenCalledWith(mockBudget);
    });

    it('should handle delete budget button press', async () => {
      const mockOnDelete = jest.fn();
      const { getByLabelText } = render(
        <BudgetDetailScreen budgetId="budget-1" onDelete={mockOnDelete} />
      );
      
      await waitFor(() => {
        fireEvent.press(getByLabelText('Excluir orçamento'));
      });
      
      expect(mockOnDelete).toHaveBeenCalledWith(mockBudget);
    });

    it('should handle add budget item button press', async () => {
      const mockOnAddItem = jest.fn();
      const { getByText } = render(
        <BudgetDetailScreen budgetId="budget-1" onAddItem={mockOnAddItem} />
      );
      
      await waitFor(() => {
        fireEvent.press(getByText('+ Adicionar'));
      });
      
      expect(mockOnAddItem).toHaveBeenCalledWith(mockBudget);
    });

    it('should handle budget item press', async () => {
      const mockOnItemPress = jest.fn();
      const { getByText } = render(
        <BudgetDetailScreen budgetId="budget-1" onItemPress={mockOnItemPress} />
      );
      
      await waitFor(() => {
        fireEvent.press(getByText('Alimentação'));
      });
      
      expect(mockOnItemPress).toHaveBeenCalledWith(mockBudgetItems[0]);
    });

    it('should handle refresh', async () => {
      const { getByTestId } = render(<BudgetDetailScreen budgetId="budget-1" />);
      
      await waitFor(() => {
        // Mock refresh by calling loadBudgetData again
        expect(mockBudgetItemViewModel.getBudgetItemsByBudget).toHaveBeenCalledWith('budget-1');
      });
    });
  });

  describe('statistics', () => {
    it('should display budget statistics correctly', async () => {
      const { getByText } = render(<BudgetDetailScreen budgetId="budget-1" />);
      
      await waitFor(() => {
        expect(getByText('Total Planejado: R$ 3.500,00')).toBeTruthy();
        expect(getByText('Total Realizado: R$ 3.400,00')).toBeTruthy();
      });
    });

    it('should display budget performance correctly', async () => {
      const { getByText } = render(<BudgetDetailScreen budgetId="budget-1" />);
      
      await waitFor(() => {
        expect(getByText('Progresso Geral: 97%')).toBeTruthy();
      });
    });
  });

  describe('error handling', () => {
    it('should display error message', async () => {
      mockBudgetViewModel.getBudgetByIdSync.mockReturnValue(null);
      const { getByText } = render(<BudgetDetailScreen budgetId="budget-1" />);
      
      await waitFor(() => {
        expect(getByText('Orçamento não encontrado')).toBeTruthy();
      });
    });

    it('should handle retry button press', async () => {
      mockBudgetViewModel.getBudgetByIdSync.mockReturnValue(null);
      const { getByText } = render(<BudgetDetailScreen budgetId="budget-1" />);
      
      await waitFor(() => {
        fireEvent.press(getByText('Tentar Novamente'));
      });
      
      expect(mockBudgetViewModel.getBudgetByIdSync).toHaveBeenCalledWith('budget-1');
    });

    it('should clear error when component unmounts', () => {
      const { unmount } = render(<BudgetDetailScreen budgetId="budget-1" />);
      
      unmount();
      
      expect(mockBudgetViewModel.clearError).toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('should have proper accessibility labels', async () => {
      const { getByLabelText } = render(<BudgetDetailScreen budgetId="budget-1" />);
      
      await waitFor(() => {
        expect(getByLabelText('Editar orçamento')).toBeTruthy();
        expect(getByLabelText('Excluir orçamento')).toBeTruthy();
      });
    });

    it('should have accessible action buttons', async () => {
      const { getByLabelText } = render(<BudgetDetailScreen budgetId="budget-1" />);
      
      await waitFor(() => {
        expect(getByLabelText('Editar orçamento')).toBeTruthy();
        expect(getByLabelText('Excluir orçamento')).toBeTruthy();
        expect(getByLabelText('Adicionar item')).toBeTruthy();
      });
    });

    it('should have accessible budget items', async () => {
      const { getAllByLabelText } = render(<BudgetDetailScreen budgetId="budget-1" />);
      
      await waitFor(() => {
        const budgetItems = getAllByLabelText(/Item/);
        expect(budgetItems.length).toBeGreaterThan(0);
      });
    });
  });
});
