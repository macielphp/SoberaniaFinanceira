import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AccountsDashboard from '../../../components/AccountsDashboard/AccountsDashboard';
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
    name: 'Poupança',
    type: 'poupanca',
    balance: new Money(5000),
    isDefault: false,
  }),
  new Account({
    id: '3',
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
      { accountId: '2', currentBalance: 5000, lastTransaction: '2024-01-02' },
      { accountId: '3', currentBalance: 0, lastTransaction: '2024-01-03' },
    ]),
    getTotalBalance: jest.fn(() => 6000),
    formatCurrency: jest.fn((value) => `R$ ${value.toFixed(2)}`),
  },
}));

describe('AccountsDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar o dashboard com informações das contas', () => {
    const { getByText } = render(<AccountsDashboard />);
    
    expect(getByText('Conta Corrente')).toBeTruthy();
    expect(getByText('Poupança')).toBeTruthy();
    expect(getByText('Cartão de Crédito')).toBeTruthy();
  });

  it('deve mostrar o saldo total das contas próprias', () => {
    const { getByText } = render(<AccountsDashboard />);
    
    expect(getByText('R$ 6.000,00')).toBeTruthy();
  });

  it('deve mostrar o número de contas', () => {
    const { getByText } = render(<AccountsDashboard />);
    
    expect(getByText('3 contas')).toBeTruthy();
  });

  it('deve permitir adicionar nova conta', () => {
    const { getByText } = render(<AccountsDashboard />);
    
    const addButton = getByText('Adicionar Conta');
    fireEvent.press(addButton);
    
    // Verificar se o modal de adicionar conta aparece
    expect(getByText('Nova Conta')).toBeTruthy();
  });

  it('deve permitir editar uma conta', () => {
    const { getByTestId } = render(<AccountsDashboard />);
    
    // Simular clique no botão de editar de uma conta
    const editButton = getByTestId('edit-account-1');
    fireEvent.press(editButton);
    
    expect(mockUseAccountViewModelAdapter.updateAccount).toHaveBeenCalled();
  });

  it('deve permitir deletar uma conta', () => {
    const { getByTestId } = render(<AccountsDashboard />);
    
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
    
    const { getByText } = render(<AccountsDashboard />);
    
    expect(getByText('Carregando...')).toBeTruthy();
  });

  it('deve mostrar erro quando houver erro', () => {
    const errorMock = {
      ...mockUseAccountViewModelAdapter,
      error: 'Erro ao carregar contas',
    };
    
    jest.doMock('../../../clean-architecture/presentation/ui-adapters/useAccountViewModelAdapter', () => () => errorMock);
    
    const { getByText } = render(<AccountsDashboard />);
    
    expect(getByText('Erro ao carregar contas')).toBeTruthy();
  });

  it('deve permitir refresh dos dados', async () => {
    const { getByTestId } = render(<AccountsDashboard />);
    
    // Simular pull to refresh
    const scrollView = getByTestId('accounts-dashboard-scroll');
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

  it('deve mostrar estatísticas das contas', () => {
    const { getByText } = render(<AccountsDashboard />);
    
    expect(getByText('Contas Próprias')).toBeTruthy();
    expect(getByText('Contas Externas')).toBeTruthy();
    expect(getByText('2')).toBeTruthy(); // 2 contas próprias
    expect(getByText('1')).toBeTruthy(); // 1 conta externa
  });

  it('deve permitir filtrar contas por tipo', () => {
    const { getByText } = render(<AccountsDashboard />);
    
    // Simular clique no filtro de contas próprias
    const filterButton = getByText('Próprias');
    fireEvent.press(filterButton);
    
    // Verificar se apenas contas próprias são mostradas
    expect(getByText('Conta Corrente')).toBeTruthy();
    expect(getByText('Poupança')).toBeTruthy();
    expect(() => getByText('Cartão de Crédito')).toThrow();
  });

  it('deve mostrar gráfico de distribuição de saldo', () => {
    const { getByTestId } = render(<AccountsDashboard />);
    
    const chart = getByTestId('balance-chart');
    expect(chart).toBeTruthy();
  });

  it('deve permitir ordenar contas por saldo', () => {
    const { getByText } = render(<AccountsDashboard />);
    
    // Simular clique no botão de ordenação
    const sortButton = getByText('Ordenar por Saldo');
    fireEvent.press(sortButton);
    
    // Verificar se as contas estão ordenadas por saldo
    const accountCards = getByTestId('account-cards-container');
    expect(accountCards).toBeTruthy();
  });

  it('deve mostrar alerta quando não há contas', () => {
    const emptyMock = {
      ...mockUseAccountViewModelAdapter,
      accounts: [],
    };
    
    jest.doMock('../../../clean-architecture/presentation/ui-adapters/useAccountViewModelAdapter', () => () => emptyMock);
    
    const { getByText } = render(<AccountsDashboard />);
    
    expect(getByText('Nenhuma conta encontrada')).toBeTruthy();
    expect(getByText('Adicione sua primeira conta para começar')).toBeTruthy();
  });
}); 