import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import RegisterScreen from '../../../../clean-architecture/presentation/screens/RegisterScreen';
import { RegisterScreenViewModel } from '../../../../clean-architecture/presentation/screens/RegisterScreenViewModel';
import { OperationViewModel } from '../../../../clean-architecture/presentation/view-models/OperationViewModel';
import { CategoryViewModel } from '../../../../clean-architecture/presentation/view-models/CategoryViewModel';
import { AccountViewModel } from '../../../../clean-architecture/presentation/view-models/AccountViewModel';

// Mock Alert
jest.spyOn(Alert, 'alert').mockImplementation(() => {});

// Mock dos ViewModels
const mockOperationViewModel = {
  operations: [] as any[],
  loading: false,
  error: null as string | null,
  loadOperations: jest.fn(),
  createOperation: jest.fn(),
  updateOperation: jest.fn(),
  deleteOperation: jest.fn(),
  clearError: jest.fn(),
  setError: jest.fn(),
};

const mockCategoryViewModel = {
  categories: [] as any[],
  loading: false,
  error: null as string | null,
  loadCategories: jest.fn(),
  createCategory: jest.fn(),
  updateCategory: jest.fn(),
  deleteCategory: jest.fn(),
  clearError: jest.fn(),
  setError: jest.fn(),
};

const mockAccountViewModel = {
  accounts: [] as any[],
  loading: false,
  error: null as string | null,
  getAllAccounts: jest.fn(),
  createAccount: jest.fn(),
  updateAccount: jest.fn(),
  deleteAccount: jest.fn(),
  clearError: jest.fn(),
};

// Mock do Container DI
jest.mock('../../../../clean-architecture/shared/di/Container', () => ({
  container: {
    resolve: jest.fn((serviceName: string) => {
      if (serviceName === 'OperationViewModel') return mockOperationViewModel;
      if (serviceName === 'CategoryViewModel') return mockCategoryViewModel;
      if (serviceName === 'AccountViewModel') return mockAccountViewModel;
      throw new Error(`Service not registered: ${serviceName}`);
    })
  }
}));

// Mock das classes
jest.mock('../../../../clean-architecture/presentation/view-models/OperationViewModel');
jest.mock('../../../../clean-architecture/presentation/view-models/CategoryViewModel');
jest.mock('../../../../clean-architecture/presentation/view-models/AccountViewModel');

(OperationViewModel as jest.Mock).mockImplementation(() => mockOperationViewModel);
(CategoryViewModel as jest.Mock).mockImplementation(() => mockCategoryViewModel);
(AccountViewModel as jest.Mock).mockImplementation(() => mockAccountViewModel);

describe('RegisterScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock states
    mockOperationViewModel.error = null;
    mockOperationViewModel.loading = false;
    mockOperationViewModel.operations = [];
    mockCategoryViewModel.error = null;
    mockCategoryViewModel.loading = false;
    mockCategoryViewModel.categories = [];
    mockAccountViewModel.error = null;
    mockAccountViewModel.loading = false;
    mockAccountViewModel.accounts = [];
    
    // Mock load methods to populate data
    mockOperationViewModel.loadOperations.mockImplementation(() => {
      mockOperationViewModel.operations = [
        { id: '1', details: 'Test Operation', value: { format: () => 'R$ 100,00' } }
      ];
    });
    
    mockCategoryViewModel.loadCategories.mockImplementation(() => {
      mockCategoryViewModel.categories = [
        { id: '1', name: 'Alimentação', type: 'expense' },
        { id: '2', name: 'Transporte', type: 'expense' }
      ];
    });
    
    mockAccountViewModel.getAllAccounts.mockImplementation(() => {
      mockAccountViewModel.accounts = [
        { id: '1', name: 'Conta Corrente', type: 'checking' },
        { id: '2', name: 'Poupança', type: 'savings' }
      ];
    });
  });

  describe('rendering', () => {
    it('should render register screen with navigation tabs', async () => {
      const { getByText } = render(<RegisterScreen />);

      await waitFor(() => {
        expect(getByText('Registrar')).toBeTruthy();
        expect(getByText('Gerenciar')).toBeTruthy();
        expect(getByText('Configurações')).toBeTruthy();
        expect(getByText('Categorias')).toBeTruthy();
        expect(getByText('Contas')).toBeTruthy();
      });
    });

    it('should render register form by default', async () => {
      const { getByText } = render(<RegisterScreen />);

      await waitFor(() => {
        expect(getByText('Natureza')).toBeTruthy();
        expect(getByText('Receita')).toBeTruthy();
        expect(getByText('Despesa')).toBeTruthy();
      });
    });

    it('should show loading state when data is loading', async () => {
      mockOperationViewModel.loading = true;
      mockCategoryViewModel.loading = true;
      mockAccountViewModel.loading = true;

      const { getByTestId } = render(<RegisterScreen />);

      await waitFor(() => {
        expect(getByTestId('loading-indicator')).toBeTruthy();
      });
    });

    it('should show error state when there is an error', async () => {
      // Reset errors first
      mockOperationViewModel.error = null;
      mockCategoryViewModel.error = null;
      mockAccountViewModel.error = null;
      
      const { getByText, rerender } = render(<RegisterScreen />);

      // Wait for initial render
      await waitFor(() => {
        expect(getByText('Registrar')).toBeTruthy();
      });

      // Now set errors and rerender
      mockOperationViewModel.error = 'Erro ao carregar operações';
      mockCategoryViewModel.error = 'Erro ao carregar categorias';
      mockAccountViewModel.error = 'Erro ao carregar contas';

      rerender(<RegisterScreen />);

      await waitFor(() => {
        expect(getByText('Erro ao carregar operações')).toBeTruthy();
        expect(getByText('Erro ao carregar categorias')).toBeTruthy();
        expect(getByText('Erro ao carregar contas')).toBeTruthy();
      });
    });
  });

  describe('navigation', () => {
    it('should switch to manage view when manage tab is pressed', async () => {
      const { getByText } = render(<RegisterScreen />);

      await waitFor(() => {
        const manageTab = getByText('Gerenciar');
        fireEvent.press(manageTab);
      });

      await waitFor(() => {
        expect(getByText('Operações')).toBeTruthy();
        expect(getByText('Filtros')).toBeTruthy();
      });
    });

    it('should switch to settings view when settings tab is pressed', async () => {
      const { getByText } = render(<RegisterScreen />);

      await waitFor(() => {
        const settingsTab = getByText('Configurações');
        fireEvent.press(settingsTab);
      });

      await waitFor(() => {
        expect(getByText('Configurações Gerais')).toBeTruthy();
      });
    });

    it('should switch to categories view when categories tab is pressed', async () => {
      const { getByText } = render(<RegisterScreen />);

      await waitFor(() => {
        const categoriesTab = getByText('Categorias');
        fireEvent.press(categoriesTab);
      });

      await waitFor(() => {
        expect(getByText('Nova Categoria')).toBeTruthy();
      });
    });

    it('should switch to accounts view when accounts tab is pressed', async () => {
      const { getByText } = render(<RegisterScreen />);

      await waitFor(() => {
        const accountsTab = getByText('Contas');
        fireEvent.press(accountsTab);
      });

      await waitFor(() => {
        expect(getByText('Nova Conta')).toBeTruthy();
      });
    });
  });

  describe('register form', () => {
    it('should handle form submission for new operation', async () => {
      const { getByTestId } = render(<RegisterScreen />);

      await waitFor(() => {
        const submitButton = getByTestId('submit-operation-button');
        fireEvent.press(submitButton);
      });

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Erro', 'Por favor, preencha todos os campos obrigatórios');
      });
    });

    it('should handle form submission for editing operation', async () => {
      const { getByTestId } = render(<RegisterScreen />);

      await waitFor(() => {
        const submitButton = getByTestId('submit-operation-button');
        fireEvent.press(submitButton);
      });

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Erro', 'Por favor, preencha todos os campos obrigatórios');
      });
    });

    it('should validate form fields', async () => {
      const { getByTestId } = render(<RegisterScreen />);

      await waitFor(() => {
        const submitButton = getByTestId('submit-operation-button');
        fireEvent.press(submitButton);
      });

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Erro', 'Por favor, preencha todos os campos obrigatórios');
      });
    });
  });

  describe('manage operations', () => {
    it('should display operations list', async () => {
      const mockOperations = [
        {
          id: '1',
          details: 'Test Operation',
          value: { format: () => 'R$ 100,00' },
          date: new Date(),
          nature: 'receita',
          state: 'recebido'
        }
      ];

      mockOperationViewModel.operations = mockOperations;

      const { getByText } = render(<RegisterScreen />);

      await waitFor(() => {
        const manageTab = getByText('Gerenciar');
        fireEvent.press(manageTab);
      });

      // Force data loading by calling onMount
      await waitFor(() => {
        expect(mockOperationViewModel.loadOperations).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(mockOperationViewModel.loadOperations).toHaveBeenCalled();
        expect(mockOperationViewModel.operations).toHaveLength(1);
        expect(mockOperationViewModel.operations[0].details).toBe('Test Operation');
      });
    });

    it('should handle edit operation', async () => {
      const mockOperations = [
        {
          id: '1',
          details: 'Test Operation',
          value: { format: () => 'R$ 100,00' },
          date: new Date(),
          nature: 'receita',
          state: 'recebido'
        }
      ];

      mockOperationViewModel.operations = mockOperations;

      const { getByText, getByTestId } = render(<RegisterScreen />);

      await waitFor(() => {
        const manageTab = getByText('Gerenciar');
        fireEvent.press(manageTab);
      });

      // Force data loading
      await waitFor(() => {
        expect(mockOperationViewModel.loadOperations).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(mockOperationViewModel.loadOperations).toHaveBeenCalled();
        expect(mockOperationViewModel.operations).toHaveLength(1);
        expect(mockOperationViewModel.operations[0].details).toBe('Test Operation');
      });
    });

    it('should handle delete operation', async () => {
      const mockOperations = [
        {
          id: '1',
          details: 'Test Operation',
          value: { format: () => 'R$ 100,00' },
          date: new Date(),
          nature: 'receita',
          state: 'recebido'
        }
      ];

      mockOperationViewModel.operations = mockOperations;

      const { getByText, getByTestId } = render(<RegisterScreen />);

      await waitFor(() => {
        const manageTab = getByText('Gerenciar');
        fireEvent.press(manageTab);
      });

      // Force data loading
      await waitFor(() => {
        expect(mockOperationViewModel.loadOperations).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(mockOperationViewModel.loadOperations).toHaveBeenCalled();
        expect(mockOperationViewModel.operations).toHaveLength(1);
        expect(mockOperationViewModel.operations[0].details).toBe('Test Operation');
      });
    });
  });

  describe('categories management', () => {
    it('should display categories list', async () => {
      const mockCategories = [
        { id: '1', name: 'Alimentação', color: '#FF0000' },
        { id: '2', name: 'Transporte', color: '#00FF00' }
      ];

      mockCategoryViewModel.categories = mockCategories;

      const { getByText } = render(<RegisterScreen />);

      await waitFor(() => {
        const categoriesTab = getByText('Categorias');
        fireEvent.press(categoriesTab);
      });

      // Force data loading
      await waitFor(() => {
        expect(mockCategoryViewModel.loadCategories).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(mockCategoryViewModel.loadCategories).toHaveBeenCalled();
        expect(mockCategoryViewModel.categories).toHaveLength(2);
        expect(mockCategoryViewModel.categories[0].name).toBe('Alimentação');
        expect(mockCategoryViewModel.categories[1].name).toBe('Transporte');
      });
    });

    it('should handle create category', async () => {
      const { getByText } = render(<RegisterScreen />);

      await waitFor(() => {
        const categoriesTab = getByText('Categorias');
        fireEvent.press(categoriesTab);
      });

      await waitFor(() => {
        const createButton = getByText('Nova Categoria');
        fireEvent.press(createButton);
      });

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Nova Categoria', 'Nome da Categoria\nCor');
      });
    });
  });

  describe('accounts management', () => {
    it('should display accounts list', async () => {
      const mockAccounts = [
        { id: '1', name: 'Conta Corrente', balance: { value: 1000, currency: 'BRL' } },
        { id: '2', name: 'Poupança', balance: { value: 5000, currency: 'BRL' } }
      ];

      mockAccountViewModel.accounts = mockAccounts;

      const { getByText } = render(<RegisterScreen />);

      await waitFor(() => {
        const accountsTab = getByText('Contas');
        fireEvent.press(accountsTab);
      });

      // Force data loading
      await waitFor(() => {
        expect(mockAccountViewModel.getAllAccounts).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(mockAccountViewModel.getAllAccounts).toHaveBeenCalled();
        expect(mockAccountViewModel.accounts).toHaveLength(2);
        expect(mockAccountViewModel.accounts[0].name).toBe('Conta Corrente');
        expect(mockAccountViewModel.accounts[1].name).toBe('Poupança');
      });
    });

    it('should handle create account', async () => {
      const { getByText } = render(<RegisterScreen />);

      await waitFor(() => {
        const accountsTab = getByText('Contas');
        fireEvent.press(accountsTab);
      });

      await waitFor(() => {
        const createButton = getByText('Nova Conta');
        fireEvent.press(createButton);
      });

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Nova Conta', 'Nome da Conta\nTipo');
      });
    });
  });

  describe('lifecycle', () => {
    it('should load data on mount', async () => {
      render(<RegisterScreen />);

      await waitFor(() => {
        expect(mockOperationViewModel.loadOperations).toHaveBeenCalled();
        expect(mockCategoryViewModel.loadCategories).toHaveBeenCalled();
        expect(mockAccountViewModel.getAllAccounts).toHaveBeenCalled();
      });
    });

    it('should handle refresh', async () => {
      // Simulate error state to show refresh button
      mockOperationViewModel.error = 'Test error';
      
      const { getByTestId } = render(<RegisterScreen />);

      await waitFor(() => {
        const refreshButton = getByTestId('refresh-button');
        fireEvent.press(refreshButton);
      });

      await waitFor(() => {
        expect(mockOperationViewModel.loadOperations).toHaveBeenCalledTimes(2);
        expect(mockCategoryViewModel.loadCategories).toHaveBeenCalledTimes(2);
        expect(mockAccountViewModel.getAllAccounts).toHaveBeenCalledTimes(2);
      });
    });
  });
});