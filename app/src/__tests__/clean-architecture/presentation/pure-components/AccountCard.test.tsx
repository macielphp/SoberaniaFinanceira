import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { AccountCard } from '../../../../clean-architecture/presentation/pure-components/AccountCard';
import { Account } from '../../../../clean-architecture/domain/entities/Account';
import { Money } from '../../../../clean-architecture/shared/utils/Money';

// Mock do StyleSheet para evitar problemas de ambiente
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    StyleSheet: {
      ...RN.StyleSheet,
      flatten: jest.fn((style) => style)
    }
  };
});

describe('AccountCard', () => {
  const mockAccount = new Account({
    id: 'account-1',
    name: 'Conta Corrente',
    type: 'corrente',
    balance: new Money(1500.50),
    isActive: true,
    createdAt: new Date('2024-01-01')
  });

  const mockHandlers = {
    onEdit: jest.fn(),
    onDelete: jest.fn(),
    onViewTransactions: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render account information correctly', () => {
      const { getByText } = render(
        <AccountCard 
          account={mockAccount} 
          {...mockHandlers}
        />
      );

      expect(getByText('Conta Corrente')).toBeTruthy();
      expect(getByText('Corrente')).toBeTruthy();
      expect(getByText(/R\$.*1\.500,50/)).toBeTruthy();
    });

    it('should render zero balance correctly', () => {
      const accountWithZeroBalance = new Account({
        id: mockAccount.id,
        name: mockAccount.name,
        type: mockAccount.type,
        balance: new Money(0),
        isActive: mockAccount.isActive,
        createdAt: mockAccount.createdAt
      });

      const { getByText } = render(
        <AccountCard 
          account={accountWithZeroBalance} 
          {...mockHandlers}
        />
      );

      expect(getByText(/R\$.*0,00/)).toBeTruthy();
    });
  });

  describe('actions', () => {
    it('should call onEdit when edit button is pressed', () => {
      const { getByText } = render(
        <AccountCard 
          account={mockAccount} 
          {...mockHandlers}
        />
      );

      const editButton = getByText('Editar');
      fireEvent.press(editButton);

      expect(mockHandlers.onEdit).toHaveBeenCalledWith(mockAccount);
      expect(mockHandlers.onEdit).toHaveBeenCalledTimes(1);
    });

    it('should call onDelete when delete button is pressed', () => {
      const { getByText } = render(
        <AccountCard 
          account={mockAccount} 
          {...mockHandlers}
        />
      );

      const deleteButton = getByText('Excluir');
      fireEvent.press(deleteButton);

      expect(mockHandlers.onDelete).toHaveBeenCalledWith(mockAccount.id);
      expect(mockHandlers.onDelete).toHaveBeenCalledTimes(1);
    });

    it('should call onViewTransactions when view transactions button is pressed', () => {
      const { getByText } = render(
        <AccountCard 
          account={mockAccount} 
          {...mockHandlers}
        />
      );

      const viewButton = getByText('Ver Transações');
      fireEvent.press(viewButton);

      expect(mockHandlers.onViewTransactions).toHaveBeenCalledWith(mockAccount.id);
      expect(mockHandlers.onViewTransactions).toHaveBeenCalledTimes(1);
    });
  });

  describe('account types', () => {
    it('should handle different account types correctly', () => {
      const accountTypes = [
        { type: 'poupanca' as const, expectedDisplay: 'Poupança' },
        { type: 'investimento' as const, expectedDisplay: 'Investimento' },
        { type: 'cartao_credito' as const, expectedDisplay: 'Cartão de Crédito' },
        { type: 'dinheiro' as const, expectedDisplay: 'Dinheiro' }
      ];

      accountTypes.forEach(({ type, expectedDisplay }) => {
        const accountWithType = new Account({
          id: mockAccount.id,
          name: mockAccount.name,
          type,
          balance: mockAccount.balance,
          isActive: mockAccount.isActive,
          createdAt: mockAccount.createdAt
        });

        const { getByText } = render(
          <AccountCard 
            account={accountWithType} 
            {...mockHandlers}
          />
        );

        expect(getByText(expectedDisplay)).toBeTruthy();
      });
    });
  });

  describe('disabled state', () => {
    it('should disable actions when disabled prop is true', () => {
      const { getByText } = render(
        <AccountCard 
          account={mockAccount} 
          {...mockHandlers}
          disabled={true}
        />
      );

      const editButton = getByText('Editar');
      const deleteButton = getByText('Excluir');
      const viewButton = getByText('Ver Transações');

      fireEvent.press(editButton);
      fireEvent.press(deleteButton);
      fireEvent.press(viewButton);

      expect(mockHandlers.onEdit).not.toHaveBeenCalled();
      expect(mockHandlers.onDelete).not.toHaveBeenCalled();
      expect(mockHandlers.onViewTransactions).not.toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle very large balance amounts', () => {
      const accountWithLargeBalance = new Account({
        id: mockAccount.id,
        name: mockAccount.name,
        type: mockAccount.type,
        balance: new Money(999999999.99),
        isActive: mockAccount.isActive,
        createdAt: mockAccount.createdAt
      });

      const { getByText } = render(
        <AccountCard 
          account={accountWithLargeBalance} 
          {...mockHandlers}
        />
      );

      expect(getByText(/R\$.*999\.999\.999,99/)).toBeTruthy();
    });

    it('should handle account names with special characters', () => {
      const accountWithSpecialName = new Account({
        id: mockAccount.id,
        name: 'Conta & Poupança (Especial) - 2024',
        type: mockAccount.type,
        balance: mockAccount.balance,
        isActive: mockAccount.isActive,
        createdAt: mockAccount.createdAt
      });

      const { getByText } = render(
        <AccountCard 
          account={accountWithSpecialName} 
          {...mockHandlers}
        />
      );

      expect(getByText('Conta & Poupança (Especial) - 2024')).toBeTruthy();
    });
  });
});