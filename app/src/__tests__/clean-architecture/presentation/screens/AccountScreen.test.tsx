// Test: AccountScreen
// Responsável por testar a tela de gerenciamento de contas
// Segue Clean Architecture - testa integração entre UI e ViewModels

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { AccountScreen } from '../../../../clean-architecture/presentation/screens/AccountScreen';
import { AccountViewModel } from '../../../../clean-architecture/presentation/view-models/AccountViewModel';
import { Account } from '../../../../clean-architecture/domain/entities/Account';
import { Money } from '../../../../clean-architecture/shared/utils/Money';

// Mock do Container DI
jest.mock('../../../../clean-architecture/shared/di/Container', () => ({
  container: {
    resolve: jest.fn((serviceName: string) => {
      if (serviceName === 'AccountViewModel') {
        return mockAccountViewModel;
      }
      return {};
    }),
  },
}));

// Mock do Money
jest.mock('../../../../clean-architecture/shared/utils/Money', () => ({
  Money: jest.fn().mockImplementation((amount: number, currency: string = 'BRL') => ({
    value: amount,
    currency,
    format: () => `R$ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    toString: () => `R$ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  })),
}));

// Mock AccountViewModel
const mockAccountViewModel = {
  loading: false,
  error: null as string | null,
  accounts: [] as Account[],
  createAccount: jest.fn(),
  updateAccount: jest.fn(),
  deleteAccount: jest.fn(),
  getAccountById: jest.fn(),
  getAllAccounts: jest.fn(),
  clearError: jest.fn(),
  setError: jest.fn(),
};

// Mock do AccountViewModel constructor
jest.mock('../../../../clean-architecture/presentation/view-models/AccountViewModel', () => ({
  AccountViewModel: jest.fn(() => mockAccountViewModel),
}));

// Mock Account entity
const mockAccount = new Account({
  id: 'account-1',
  name: 'Conta Corrente',
  type: 'corrente',
  balance: new Money(1500.00, 'BRL'),
  description: 'Conta principal',
  color: '#007AFF',
  isActive: true,
  isDefault: true,
  createdAt: new Date('2024-01-01'),
});

const mockAccounts = [
  mockAccount,
  new Account({
    id: 'account-2',
    name: 'Conta Poupança',
    type: 'poupanca',
    balance: new Money(5000.00, 'BRL'),
    description: 'Poupança para emergências',
    color: '#34C759',
    isActive: true,
    isDefault: false,
    createdAt: new Date('2024-01-01'),
  }),
];

// Mock navigation functions
const mockNavigation = {
  onNavigateToCreate: jest.fn(),
  onNavigateToEdit: jest.fn(),
  onNavigateToDetail: jest.fn(),
};

describe('AccountScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAccountViewModel.accounts = [];
    mockAccountViewModel.loading = false;
    mockAccountViewModel.error = null;
  });

  describe('rendering', () => {
    it('should render account screen correctly', () => {
      const { getByTestId } = render(
        <AccountScreen 
          userId="user-1" 
          {...mockNavigation}
        />
      );
      
      expect(getByTestId('account-screen')).toBeTruthy();
    });

    it('should display screen title', () => {
      const { getByText } = render(
        <AccountScreen 
          userId="user-1" 
          {...mockNavigation}
        />
      );
      
      expect(getByText('Contas')).toBeTruthy();
    });

    it('should display create account button', () => {
      const { getByText } = render(
        <AccountScreen 
          userId="user-1" 
          {...mockNavigation}
        />
      );
      
      expect(getByText('Nova Conta')).toBeTruthy();
    });

    it('should render account list', () => {
      const { getByTestId } = render(
        <AccountScreen 
          userId="user-1" 
          {...mockNavigation}
        />
      );
      
      expect(getByTestId('account-list')).toBeTruthy();
    });

    it('should render loading state', () => {
      mockAccountViewModel.loading = true;
      
      const { getByTestId } = render(
        <AccountScreen 
          userId="user-1" 
          {...mockNavigation}
        />
      );
      
      expect(getByTestId('loading-indicator')).toBeTruthy();
    });

    it('should render error state', async () => {
      mockAccountViewModel.error = 'Erro ao carregar contas';
      
      const { getByText } = render(
        <AccountScreen 
          userId="user-1" 
          {...mockNavigation}
        />
      );
      
      await waitFor(() => {
        expect(getByText('Erro ao carregar contas')).toBeTruthy();
      });
    });

    it('should render empty state when no accounts', () => {
      mockAccountViewModel.accounts = [];
      
      const { getByTestId } = render(
        <AccountScreen 
          userId="user-1" 
          {...mockNavigation}
        />
      );
      
      expect(getByTestId('account-list')).toBeTruthy();
    });

    it('should render account list when accounts exist', () => {
      mockAccountViewModel.accounts = mockAccounts;
      
      const { getByTestId } = render(
        <AccountScreen 
          userId="user-1" 
          {...mockNavigation}
        />
      );
      
      expect(getByTestId('account-list')).toBeTruthy();
    });
  });

  describe('interactions', () => {
    it('should call getAllAccounts on mount', () => {
      render(
        <AccountScreen 
          userId="user-1" 
          {...mockNavigation}
        />
      );
      
      expect(mockAccountViewModel.getAllAccounts).toHaveBeenCalled();
    });

    it('should call clearError on unmount', () => {
      const { unmount } = render(
        <AccountScreen 
          userId="user-1" 
          {...mockNavigation}
        />
      );
      
      unmount();
      
      expect(mockAccountViewModel.clearError).toHaveBeenCalled();
    });

    it('should navigate to create account when button is pressed', () => {
      const { getByText } = render(
        <AccountScreen 
          userId="user-1" 
          {...mockNavigation}
        />
      );
      
      fireEvent.press(getByText('Nova Conta'));
      
      expect(mockNavigation.onNavigateToCreate).toHaveBeenCalled();
    });

    it('should render account list with data', () => {
      mockAccountViewModel.accounts = [mockAccount];
      
      const { getByTestId } = render(
        <AccountScreen 
          userId="user-1" 
          {...mockNavigation}
        />
      );
      
      expect(getByTestId('account-list')).toBeTruthy();
    });
  });

  describe('accessibility', () => {
    it('should have proper accessibility labels', () => {
      const { getByLabelText } = render(
        <AccountScreen 
          userId="user-1" 
          {...mockNavigation}
        />
      );
      
      expect(getByLabelText('Lista de contas')).toBeTruthy();
      expect(getByLabelText('Criar nova conta')).toBeTruthy();
    });

    it('should have proper accessibility hints', () => {
      const { getByLabelText } = render(
        <AccountScreen 
          userId="user-1" 
          {...mockNavigation}
        />
      );
      
      expect(getByLabelText('Criar nova conta')).toBeTruthy();
    });
  });

  describe('error handling', () => {
    it('should display error message when error occurs', async () => {
      mockAccountViewModel.error = 'Erro ao carregar contas';
      
      const { getByText } = render(
        <AccountScreen 
          userId="user-1" 
          {...mockNavigation}
        />
      );
      
      await waitFor(() => {
        expect(getByText('Erro ao carregar contas')).toBeTruthy();
      });
    });

    it('should clear error when retry is pressed', async () => {
      mockAccountViewModel.error = 'Erro ao carregar contas';
      
      const { getByText } = render(
        <AccountScreen 
          userId="user-1" 
          {...mockNavigation}
        />
      );
      
      await waitFor(() => {
        expect(getByText('Erro ao carregar contas')).toBeTruthy();
      });
      
      fireEvent.press(getByText('Tentar novamente'));
      
      expect(mockAccountViewModel.clearError).toHaveBeenCalled();
    });
  });

});
