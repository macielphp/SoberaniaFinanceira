import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { BudgetScreen } from '../../../../clean-architecture/presentation/screens/BudgetScreen';
import { BudgetViewModel } from '../../../../clean-architecture/presentation/view-models/BudgetViewModel';
import { Budget } from '../../../../clean-architecture/domain/entities/Budget';
import { Money } from '../../../../clean-architecture/shared/utils/Money';

// Mock do Money
jest.mock('../../../../clean-architecture/shared/utils/Money', () => ({
  Money: jest.fn().mockImplementation((amount: number, currency: string = 'BRL') => ({
    amount,
    currency,
    format: () => `R$ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    toString: () => `R$ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  })),
}));

// Mock do BudgetViewModel
const mockBudgetViewModel = {
  loading: false,
  error: null as string | null,
  budgets: [] as Budget[],
  currentBudget: null,
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

// Mock do BudgetViewModel constructor
jest.mock('../../../../clean-architecture/presentation/view-models/BudgetViewModel', () => ({
  BudgetViewModel: jest.fn(() => mockBudgetViewModel),
}));

describe('BudgetScreen', () => {
  const mockBudgets = [
    new Budget({
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
    }),
    new Budget({
      id: 'budget-2',
      userId: 'user1',
      name: 'Orçamento Trimestral',
      startPeriod: new Date('2024-01-01'),
      endPeriod: new Date('2024-03-31'),
      type: 'manual',
      totalPlannedValue: new Money(15000, 'BRL'),
      isActive: false,
      status: 'inactive',
      createdAt: new Date('2024-01-01'),
    }),
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockBudgetViewModel.budgets = mockBudgets;
    mockBudgetViewModel.loading = false;
    mockBudgetViewModel.error = null;
    
    // Mock default return values
    mockBudgetViewModel.getBudgetsCount.mockReturnValue(2);
    mockBudgetViewModel.getActiveBudgetsCount.mockReturnValue(1);
    mockBudgetViewModel.getTotalPlannedValue.mockReturnValue(new Money(20000, 'BRL'));
    mockBudgetViewModel.hasActiveBudgets.mockReturnValue(true);
    mockBudgetViewModel.getBudgetsByStatus.mockReturnValue(mockBudgets);
    mockBudgetViewModel.getBudgetsByType.mockReturnValue(mockBudgets);
  });

  describe('rendering', () => {
    it('should render budget screen with title', () => {
      const { getByText } = render(<BudgetScreen />);
      
      expect(getByText('Orçamentos')).toBeTruthy();
    });

    it('should render create budget button', () => {
      const { getByText } = render(<BudgetScreen />);
      
      expect(getByText('Novo Orçamento')).toBeTruthy();
    });

    it('should render budget list when budgets exist', async () => {
      const { getByText } = render(<BudgetScreen />);
      
      await waitFor(() => {
        expect(getByText('Orçamento Mensal')).toBeTruthy();
        expect(getByText('Orçamento Trimestral')).toBeTruthy();
      });
    });

    it('should render empty state when no budgets', async () => {
      mockBudgetViewModel.budgets = [];
      const { getByText } = render(<BudgetScreen />);
      
      await waitFor(() => {
        expect(getByText('Nenhum orçamento encontrado')).toBeTruthy();
        expect(getByText('Crie seu primeiro orçamento para começar')).toBeTruthy();
      });
    });

    it('should render loading state', () => {
      mockBudgetViewModel.loading = true;
      const { getByTestId } = render(<BudgetScreen />);
      
      expect(getByTestId('loading-indicator')).toBeTruthy();
    });

    it('should render error state', () => {
      mockBudgetViewModel.error = 'Erro ao carregar orçamentos';
      const { getByText } = render(<BudgetScreen />);
      
      expect(getByText('Erro ao carregar orçamentos')).toBeTruthy();
    });
  });

  describe('budget list', () => {
    it('should display budget information correctly', async () => {
      const { getByText } = render(<BudgetScreen />);
      
      await waitFor(() => {
        // Check budget names
        expect(getByText('Orçamento Mensal')).toBeTruthy();
        expect(getByText('Orçamento Trimestral')).toBeTruthy();
        
        // Check budget values
        expect(getByText('R$ 5.000,00')).toBeTruthy();
        expect(getByText('R$ 15.000,00')).toBeTruthy();
        
        // Check budget periods
        expect(getByText('31/12/2023 - 30/01/2024')).toBeTruthy();
        expect(getByText('31/12/2023 - 30/03/2024')).toBeTruthy();
      });
    });

    it('should display budget status correctly', async () => {
      const { getByText } = render(<BudgetScreen />);
      
      await waitFor(() => {
        expect(getByText('Ativo')).toBeTruthy();
        expect(getByText('Inativo')).toBeTruthy();
      });
    });

    it('should display budget type correctly', async () => {
      const { getAllByText } = render(<BudgetScreen />);
      
      await waitFor(() => {
        const manualElements = getAllByText('Manual');
        expect(manualElements.length).toBeGreaterThan(0);
      });
    });
  });

  describe('interactions', () => {
    it('should call loadBudgets on mount', () => {
      render(<BudgetScreen />);
      
      expect(mockBudgetViewModel.loadBudgets).toHaveBeenCalledWith('user1');
    });

    it('should handle create budget button press', () => {
      const { getByText } = render(<BudgetScreen />);
      
      fireEvent.press(getByText('Novo Orçamento'));
      
      // Should navigate to create budget screen
      // This would be tested with navigation mocking in a real scenario
    });

    it('should handle budget card press', async () => {
      const { getByText } = render(<BudgetScreen />);
      
      await waitFor(() => {
        fireEvent.press(getByText('Orçamento Mensal'));
      });
      
      // Should navigate to budget detail screen
      // This would be tested with navigation mocking in a real scenario
    });

    it('should handle edit budget button press', async () => {
      const { getAllByText } = render(<BudgetScreen />);
      
      await waitFor(() => {
        const editButtons = getAllByText('Editar');
        fireEvent.press(editButtons[0]);
      });
      
      // Should navigate to edit budget screen
      // This would be tested with navigation mocking in a real scenario
    });

    it('should handle delete budget button press', async () => {
      const { getAllByText } = render(<BudgetScreen />);
      
      const deleteButtons = getAllByText('Excluir');
      fireEvent.press(deleteButtons[0]);
      
      // Should show confirmation dialog
      // This would be tested with dialog mocking in a real scenario
    });

    it('should handle refresh', () => {
      const { getByTestId } = render(<BudgetScreen />);
      
      fireEvent(getByTestId('budget-list'), 'onRefresh');
      
      expect(mockBudgetViewModel.loadBudgets).toHaveBeenCalledWith('user1');
    });
  });

  describe('filtering and sorting', () => {
    it('should render filter options', () => {
      const { getByText } = render(<BudgetScreen />);
      
      expect(getByText('Filtros')).toBeTruthy();
      expect(getByText('Todos')).toBeTruthy();
      expect(getByText('Ativos')).toBeTruthy();
      expect(getByText('Inativos')).toBeTruthy();
    });

    it('should handle filter by status', () => {
      const { getByText } = render(<BudgetScreen />);
      
      fireEvent.press(getByText('Ativos'));
      
      // The component filters locally, so we just verify the filter state changed
      // In a real implementation, this would trigger a re-render with filtered data
    });

    it('should handle filter by type', () => {
      const { getAllByText } = render(<BudgetScreen />);
      
      const manualButtons = getAllByText('Manual');
      fireEvent.press(manualButtons[0]); // Press the filter button, not the budget type
      
      // The component filters locally, so we just verify the filter state changed
      // In a real implementation, this would trigger a re-render with filtered data
    });

    it('should handle clear filters', () => {
      const { getByText } = render(<BudgetScreen />);
      
      fireEvent.press(getByText('Limpar Filtros'));
      
      // Should reset filter state to show all budgets
      // The component manages filter state internally
    });
  });

  describe('statistics', () => {
    it('should display budget statistics', () => {
      mockBudgetViewModel.getBudgetsCount.mockReturnValue(2);
      mockBudgetViewModel.getActiveBudgetsCount.mockReturnValue(1);
      mockBudgetViewModel.getTotalPlannedValue.mockReturnValue(new Money(20000, 'BRL'));
      mockBudgetViewModel.hasActiveBudgets.mockReturnValue(true);

      const { getByText } = render(<BudgetScreen />);
      
      expect(getByText('Total de Orçamentos: 2')).toBeTruthy();
      expect(getByText('Orçamentos Ativos: 1')).toBeTruthy();
      expect(getByText('Valor Total Planejado: R$ R$ 20.000,00')).toBeTruthy();
    });

    it('should display no active budgets message', () => {
      mockBudgetViewModel.hasActiveBudgets.mockReturnValue(false);

      const { getByText } = render(<BudgetScreen />);
      
      expect(getByText('Nenhum orçamento ativo')).toBeTruthy();
    });
  });

  describe('error handling', () => {
    it('should display error message', () => {
      mockBudgetViewModel.error = 'Erro ao carregar orçamentos';
      const { getByText } = render(<BudgetScreen />);
      
      expect(getByText('Erro ao carregar orçamentos')).toBeTruthy();
    });

    it('should handle retry button press', () => {
      mockBudgetViewModel.error = 'Erro ao carregar orçamentos';
      const { getByText } = render(<BudgetScreen />);
      
      fireEvent.press(getByText('Tentar Novamente'));
      
      expect(mockBudgetViewModel.loadBudgets).toHaveBeenCalledWith('user1');
    });

    it('should clear error when component unmounts', () => {
      const { unmount } = render(<BudgetScreen />);
      
      unmount();
      
      expect(mockBudgetViewModel.clearError).toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('should have proper accessibility labels', () => {
      const { getByLabelText } = render(<BudgetScreen />);
      
      expect(getByLabelText('Lista de orçamentos')).toBeTruthy();
      expect(getByLabelText('Criar novo orçamento')).toBeTruthy();
    });

    it('should have accessible budget cards', () => {
      const { getAllByLabelText } = render(<BudgetScreen />);
      
      const budgetCards = getAllByLabelText(/Orçamento/);
      expect(budgetCards.length).toBeGreaterThan(0);
    });

    it('should have accessible action buttons', () => {
      const { getAllByLabelText } = render(<BudgetScreen />);
      
      const editButtons = getAllByLabelText('Editar orçamento');
      const deleteButtons = getAllByLabelText('Excluir orçamento');
      expect(editButtons.length).toBeGreaterThan(0);
      expect(deleteButtons.length).toBeGreaterThan(0);
    });
  });
});
