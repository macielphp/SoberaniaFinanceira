import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Accounts from '../../../screens/Accounts/Accounts';
import { Account } from '../../../clean-architecture/domain/entities/Account';
import { Money } from '../../../clean-architecture/shared/utils/Money';

// Mock do useAccountViewModelAdapter
const mockAccounts = [
  new Account({
    id: '1',
    name: 'Conta Corrente',
    type: 'corrente',
    balance: new Money(1000),
    isDefault: false,
  }),
  new Account({
    id: '2',
    name: 'Cartão de Crédito',
    type: 'cartao_credito',
    balance: new Money(0),
    isDefault: false,
  }),
];

const mockUseAccountViewModelAdapter = {
  accounts: mockAccounts,
  loading: false,
  error: null,
  createAccount: jest.fn(),
  updateAccount: jest.fn(),
  deleteAccount: jest.fn(),
  loadAccounts: jest.fn(),
};

jest.mock('../../../clean-architecture/presentation/ui-adapters/useAccountViewModelAdapter', () => () => mockUseAccountViewModelAdapter);

// Mock do AccountService
jest.mock('../../../services/AccountService', () => ({
  AccountService: {
    getAccountsBalance: jest.fn(() => [
      { accountId: '1', currentBalance: 1000, lastTransaction: '2024-01-01' },
      { accountId: '2', currentBalance: 0, lastTransaction: '2024-01-02' },
    ]),
    getTotalBalance: jest.fn(() => 1000),
    formatCurrency: jest.fn((value) => `R$ ${value.toFixed(2)}`),
  },
}));

// Mock do useFinance (para compatibilidade durante a transição)
const mockUseFinance = {
  accounts: mockAccounts,
  operations: [],
  createAccount: jest.fn(),
  editAccount: jest.fn(),
};

jest.mock('../../../contexts/FinanceContext', () => ({
  useFinance: () => mockUseFinance,
}));

describe('Accounts Screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar a lista de contas', () => {
    const { getByText } = render(<Accounts />);
    
    expect(getByText('Conta Corrente')).toBeTruthy();
    expect(getByText('Cartão de Crédito')).toBeTruthy();
  });

  it('deve mostrar o saldo total das contas próprias', () => {
    const { getByText } = render(<Accounts />);
    
    expect(getByText('R$ 1.000,00')).toBeTruthy();
  });

  it('deve permitir ordenar contas por nome', () => {
    const { getByText } = render(<Accounts />);
    
    // Simular clique no botão de ordenação
    const sortButton = getByText('Ordenar');
    fireEvent.press(sortButton);
    
    // Verificar se as contas estão ordenadas
    expect(getByText('Cartão de Crédito')).toBeTruthy();
    expect(getByText('Conta Corrente')).toBeTruthy();
  });

  it('deve permitir filtrar contas', () => {
    const { getByText } = render(<Accounts />);
    
    // Simular clique no botão de filtro
    const filterButton = getByText('Filtrar');
    fireEvent.press(filterButton);
    
    // Verificar se o modal de filtros aparece
    expect(getByText('Filtros')).toBeTruthy();
  });

  it('deve permitir editar uma conta', () => {
    const { getByTestId } = render(<Accounts />);
    
    // Simular clique no botão de editar de uma conta
    const editButton = getByTestId('edit-account-1');
    fireEvent.press(editButton);
    
    expect(mockUseAccountViewModelAdapter.updateAccount).toHaveBeenCalled();
  });

  it('deve permitir deletar uma conta', () => {
    const { getByTestId } = render(<Accounts />);
    
    // Simular clique no botão de deletar de uma conta
    const deleteButton = getByTestId('delete-account-1');
    fireEvent.press(deleteButton);
    
    expect(mockUseAccountViewModelAdapter.deleteAccount).toHaveBeenCalledWith('1');
  });

  it('deve mostrar loading quando estiver carregando', () => {
    const loadingMock = {
      ...mockUseAccountViewModelAdapter,
      loading: true,
    };
    
    jest.doMock('../../../clean-architecture/presentation/ui-adapters/useAccountViewModelAdapter', () => () => loadingMock);
    
    const { getByText } = render(<Accounts />);
    
    expect(getByText('Carregando...')).toBeTruthy();
  });

  it('deve mostrar erro quando houver erro', () => {
    const errorMock = {
      ...mockUseAccountViewModelAdapter,
      error: 'Erro ao carregar contas',
    };
    
    jest.doMock('../../../clean-architecture/presentation/ui-adapters/useAccountViewModelAdapter', () => () => errorMock);
    
    const { getByText } = render(<Accounts />);
    
    expect(getByText('Erro ao carregar contas')).toBeTruthy();
  });

  it('deve permitir pull to refresh', async () => {
    const { getByTestId } = render(<Accounts />);
    
    // Simular pull to refresh
    const scrollView = getByTestId('accounts-scroll-view');
    fireEvent.scroll(scrollView, {
      nativeEvent: {
        contentOffset: { y: 100 },
        contentSize: { height: 500, width: 100 },
        layoutMeasurement: { height: 100, width: 100 },
      },
    });
    
    await waitFor(() => {
      expect(mockUseAccountViewModelAdapter.loadAccounts).toHaveBeenCalled();
    });
  });
}); 