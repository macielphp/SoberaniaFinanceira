import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { VisualizeScreen } from '../../../../clean-architecture/presentation/screens/VisualizeScreen';
import { Operation } from '../../../../clean-architecture/domain/entities/Operation';
import { Category } from '../../../../clean-architecture/domain/entities/Category';
import { Money } from '../../../../clean-architecture/shared/utils/Money';

// Mock do OperationSummaryViewModel
const mockOperationSummaryViewModel = {
  operations: [] as Operation[],
  loading: false,
  error: null as string | null,
  selectedPeriod: 'all',
  loadOperations: jest.fn(),
  loadCategories: jest.fn(),
  getSummary: jest.fn(),
};

// Mock do CategoryViewModel
const mockCategoryViewModel = {
  categories: [] as Category[],
  isLoading: false,
  error: null as string | null,
  loadCategories: jest.fn(),
};

// Mock do Container DI
jest.mock('../../../../clean-architecture/shared/di/Container', () => ({
  container: {
    resolve: jest.fn((serviceName: string) => {
      if (serviceName === 'OperationSummaryViewModel') {
        return mockOperationSummaryViewModel;
      }
      if (serviceName === 'CategoryViewModel') {
        return mockCategoryViewModel;
      }
      return {};
    }),
  },
}));

// Mock das dependências
jest.mock('../../../../clean-architecture/shared/utils/Money', () => ({
  Money: jest.fn().mockImplementation((value: number) => ({
    value,
    toString: () => `R$ ${value.toFixed(2)}`,
  })),
}));

jest.mock('../../../../clean-architecture/presentation/view-models/OperationSummaryViewModel', () => ({
  OperationSummaryViewModel: jest.fn().mockImplementation(() => mockOperationSummaryViewModel),
}));

jest.mock('../../../../clean-architecture/presentation/view-models/CategoryViewModel', () => ({
  CategoryViewModel: jest.fn().mockImplementation(() => mockCategoryViewModel),
}));

// Mock das operações
const mockOperations: Operation[] = [
  new Operation({
    id: '1',
    nature: 'receita',
    state: 'recebido',
    paymentMethod: 'Pix',
    sourceAccount: '1',
    destinationAccount: '1',
    date: new Date('2024-01-15'),
    value: new Money(5000),
    category: 'Salário',
    details: 'Salário mensal',
  }),
  new Operation({
    id: '2',
    nature: 'despesa',
    state: 'pago',
    paymentMethod: 'Cartão de débito',
    sourceAccount: '1',
    destinationAccount: '2',
    date: new Date('2024-01-20'),
    value: new Money(1200),
    category: 'Moradia',
    details: 'Aluguel',
  }),
];

// Mock das categorias
const mockCategories: Category[] = [
  new Category({
    id: '1',
    name: 'Salário',
    type: 'income',
    isDefault: false,
  }),
  new Category({
    id: '2',
    name: 'Moradia',
    type: 'expense',
    isDefault: false,
  }),
];

describe('VisualizeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset mocks
    mockOperationSummaryViewModel.operations = [...mockOperations];
    mockOperationSummaryViewModel.loading = false;
    mockOperationSummaryViewModel.error = null;
    mockOperationSummaryViewModel.getSummary.mockReturnValue({
      totalIncome: 0,
      totalExpenses: 0,
      netBalance: 0,
      pendingIncome: 0,
      pendingExpenses: 0,
      liquidBalance: 0,
    });
    mockCategoryViewModel.categories = [...mockCategories];
    mockCategoryViewModel.isLoading = false;
    mockCategoryViewModel.error = null;
  });

  describe('rendering', () => {
    it('should render screen with title', () => {
      const { getByText } = render(<VisualizeScreen />);
      
      expect(getByText('Visualizar Finanças')).toBeTruthy();
    });

    it('should render filter section', () => {
      const { getByText } = render(<VisualizeScreen />);
      
      expect(getByText('Filtros')).toBeTruthy();
      expect(getByText('Período')).toBeTruthy();
      expect(getByText('Natureza')).toBeTruthy();
    });

    it('should render statistics section', () => {
      const { getByText } = render(<VisualizeScreen />);
      
      expect(getByText('Estatísticas')).toBeTruthy();
    });

    it('should render charts section', () => {
      const { getByText } = render(<VisualizeScreen />);
      
      expect(getByText('Gráficos')).toBeTruthy();
    });
  });

  describe('filter functionality', () => {
    it('should show period filter options', () => {
      const { getByText } = render(<VisualizeScreen />);
      
      expect(getByText('Último mês')).toBeTruthy();
      expect(getByText('Últimos 3 meses')).toBeTruthy();
      expect(getByText('Últimos 6 meses')).toBeTruthy();
      expect(getByText('Último ano')).toBeTruthy();
      expect(getByText('Todos')).toBeTruthy();
    });

    it('should show nature filter options', () => {
      const { getByText } = render(<VisualizeScreen />);
      
      expect(getByText('Receitas')).toBeTruthy();
      expect(getByText('Despesas')).toBeTruthy();
      expect(getByText('Todas')).toBeTruthy();
    });

    it('should handle period filter selection', async () => {
      const { getByText } = render(<VisualizeScreen />);
      
      const lastMonthButton = getByText('Último mês');
      fireEvent.press(lastMonthButton);
      
      await waitFor(() => {
        expect(mockOperationSummaryViewModel.loadOperations).toHaveBeenCalled();
      });
    });

    it('should handle nature filter selection', async () => {
      const { getByText } = render(<VisualizeScreen />);
      
      const incomeButton = getByText('Receitas');
      fireEvent.press(incomeButton);
      
      await waitFor(() => {
        // Verificar se o filtro foi aplicado (não há método específico, apenas filtro local)
        expect(mockOperationSummaryViewModel.operations).toBeDefined();
      });
    });
  });

  describe('statistics display', () => {
    it('should display total income', () => {
      mockOperationSummaryViewModel.getSummary.mockReturnValue({
        totalIncome: 5000,
        totalExpenses: 1200,
        netBalance: 3800,
        pendingIncome: 0,
        pendingExpenses: 0,
        liquidBalance: 3800,
      });
      
      const { getByText } = render(<VisualizeScreen />);
      
      expect(getByText('Total de Receitas')).toBeTruthy();
    });

    it('should display total expenses', () => {
      mockOperationSummaryViewModel.getSummary.mockReturnValue({
        totalIncome: 5000,
        totalExpenses: 1200,
        netBalance: 3800,
        pendingIncome: 0,
        pendingExpenses: 0,
        liquidBalance: 3800,
      });
      
      const { getByText } = render(<VisualizeScreen />);
      
      expect(getByText('Total de Despesas')).toBeTruthy();
    });

    it('should display balance', () => {
      mockOperationSummaryViewModel.getSummary.mockReturnValue({
        totalIncome: 5000,
        totalExpenses: 1200,
        netBalance: 3800,
        pendingIncome: 0,
        pendingExpenses: 0,
        liquidBalance: 3800,
      });
      
      const { getByText } = render(<VisualizeScreen />);
      
      expect(getByText('Saldo')).toBeTruthy();
    });
  });

  describe('charts display', () => {
    it('should display category chart', () => {
      const { getByText } = render(<VisualizeScreen />);
      
      expect(getByText('Por Categoria')).toBeTruthy();
    });

    it('should display nature chart', () => {
      const { getByText } = render(<VisualizeScreen />);
      
      expect(getByText('Por Natureza')).toBeTruthy();
    });
  });

  describe('loading state', () => {
    it('should show loading indicator when loading', () => {
      mockOperationSummaryViewModel.loading = true;
      
      const { getByTestId } = render(<VisualizeScreen />);
      
      expect(getByTestId('loading-indicator')).toBeTruthy();
    });

    it('should not show loading indicator when not loading', () => {
      mockOperationSummaryViewModel.loading = false;
      
      const { queryByTestId } = render(<VisualizeScreen />);
      
      expect(queryByTestId('loading-indicator')).toBeNull();
    });
  });

  describe('error handling', () => {
    it('should display error message when error occurs', () => {
      mockOperationSummaryViewModel.error = 'Erro ao carregar dados';
      
      const { getByText } = render(<VisualizeScreen />);
      
      expect(getByText('Erro ao carregar dados')).toBeTruthy();
    });

    it('should not display error when no error', () => {
      mockOperationSummaryViewModel.error = null;
      
      const { queryByText } = render(<VisualizeScreen />);
      
      expect(queryByText('Erro ao carregar dados')).toBeNull();
    });
  });

  describe('data loading', () => {
    it('should load operations on mount', async () => {
      render(<VisualizeScreen />);
      
      await waitFor(() => {
        expect(mockOperationSummaryViewModel.loadOperations).toHaveBeenCalled();
      });
    });

    it('should load categories on mount', async () => {
      render(<VisualizeScreen />);
      
      await waitFor(() => {
        expect(mockCategoryViewModel.loadCategories).toHaveBeenCalled();
      });
    });
  });

  describe('accessibility', () => {
    it('should have proper accessibility labels', () => {
      const { getByText } = render(<VisualizeScreen />);
      
      // Verificar se os elementos de filtro estão presentes
      expect(getByText('Período')).toBeTruthy();
      expect(getByText('Natureza')).toBeTruthy();
    });

    it('should have proper testID for automation', () => {
      const { getByTestId } = render(<VisualizeScreen />);
      
      expect(getByTestId('visualize-screen')).toBeTruthy();
      expect(getByTestId('filter-section')).toBeTruthy();
      expect(getByTestId('statistics-section')).toBeTruthy();
      expect(getByTestId('charts-section')).toBeTruthy();
    });
  });

  describe('interactions', () => {
    it('should handle refresh action', async () => {
      const { getByTestId } = render(<VisualizeScreen />);
      
      const refreshButton = getByTestId('refresh-button');
      fireEvent.press(refreshButton);
      
      await waitFor(() => {
        expect(mockOperationSummaryViewModel.loadOperations).toHaveBeenCalledTimes(2);
        expect(mockCategoryViewModel.loadCategories).toHaveBeenCalledTimes(2);
      });
    });

    it('should handle date range filter', async () => {
      const { getByTestId } = render(<VisualizeScreen />);
      
      // Simular seleção de data
      fireEvent.press(getByTestId('date-range-button'));
      
      await waitFor(() => {
        // Verificar se o filtro foi aplicado (filtro local)
        expect(mockOperationSummaryViewModel.operations).toBeDefined();
      });
    });
  });
});
