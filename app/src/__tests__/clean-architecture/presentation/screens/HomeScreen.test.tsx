import React from 'react';
import { render } from '@testing-library/react-native';
import { HomeScreen } from '../../../../clean-architecture/presentation/screens/HomeScreen';

// Mock do Ionicons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: ({ name, size, color, ...props }: any) => {
    const React = require('react');
    const { Text } = require('react-native');
    return <Text {...props}>{name}</Text>;
  }
}));

// Mock dos adapters
jest.mock('../../../../clean-architecture/presentation/ui-adapters/useAccountViewModelAdapter', () => ({
  useAccountViewModelAdapter: () => ({
    accounts: [],
    loading: false,
    error: null,
    loadAccounts: jest.fn(),
    getAccounts: jest.fn(),
    createAccount: jest.fn(),
    updateAccount: jest.fn(),
    deleteAccount: jest.fn(),
    setSelectedAccount: jest.fn(),
    clearError: jest.fn(),
  })
}));

jest.mock('../../../../clean-architecture/presentation/ui-adapters/useOperationViewModelAdapter', () => ({
  useOperationViewModelAdapter: () => ({
    operations: [],
    loading: false,
    error: null,
    loadOperations: jest.fn(),
    getOperations: jest.fn(),
    createOperation: jest.fn(),
    updateOperation: jest.fn(),
    deleteOperation: jest.fn(),
    clearError: jest.fn(),
  })
}));

// Mock do AccountCard
jest.mock('../../../../clean-architecture/presentation/pure-components/AccountCard', () => ({
  AccountCard: ({ account }: any) => {
    const React = require('react');
    const { View, Text } = require('react-native');
    return (
      <View testID="account-card">
        <Text>{account.name}</Text>
        <Text>R$ {account.balance.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>
      </View>
    );
  }
}));

describe('HomeScreen', () => {
  it('should render home screen correctly', () => {
    const { getByTestId } = render(<HomeScreen />);
    expect(getByTestId('home-screen')).toBeTruthy();
  });

  it('should display welcome title and subtitle', () => {
    const { getByText } = render(<HomeScreen />);
    
    expect(getByText('Bem-vindo!')).toBeTruthy();
    expect(getByText('Gerencie suas finanças de forma inteligente')).toBeTruthy();
  });

  it('should display alerts section', () => {
    const { getByText } = render(<HomeScreen />);
    
    expect(getByText('🔔 Alertas')).toBeTruthy();
  });

  it('should display accounts section', () => {
    const { getByText } = render(<HomeScreen />);
    
    expect(getByText('Minhas Contas')).toBeTruthy();
  });

  it('should display mock accounts when adapters return empty', () => {
    const { getByText } = render(<HomeScreen />);
    
    // Como os adapters retornam vazio, deve mostrar as contas mock
    expect(getByText('Conta Corrente')).toBeTruthy();
    expect(getByText('Poupança')).toBeTruthy();
  });

  it('should display placeholder section', () => {
    const { getByText } = render(<HomeScreen />);
    
    expect(getByText('Outros widgets da Home virão aqui')).toBeTruthy();
  });

  it('should display alert items', () => {
    const { getByText } = render(<HomeScreen />);
    
    expect(getByText('Saldo baixo')).toBeTruthy();
    expect(getByText('Conta Corrente está com saldo baixo')).toBeTruthy();
  });

  it('should display accounts count', () => {
    const { getByText } = render(<HomeScreen />);
    
    expect(getByText('2 contas')).toBeTruthy();
  });
});