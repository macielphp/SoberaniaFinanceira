import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import AccountCard from '../../../components/AccountCard/AccountCard';
import { Account } from '../../../clean-architecture/domain/entities/Account';
import { Money } from '../../../clean-architecture/shared/utils/Money';

// Mock do AccountService
jest.mock('../../../services/AccountService', () => ({
  AccountService: {
    formatCurrency: jest.fn((value) => `R$ ${value.toFixed(2)}`),
  },
}));

describe('AccountCard', () => {
  const mockAccount = new Account({
    id: '1',
    name: 'Conta Teste',
    type: 'corrente',
    balance: new Money(1000),
    isDefault: false,
  });

  const mockProps = {
    account: mockAccount,
    currentBalance: 1000,
    monthlyVariation: 500,
    lastTransaction: '2024-01-01',
    creditLimit: 5000,
    usageFrequency: 3,
    onEdit: jest.fn(),
    onDelete: jest.fn(),
    onPress: jest.fn(),
    showActions: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar informações básicas da conta', () => {
    const { getByText } = render(<AccountCard {...mockProps} />);
    
    expect(getByText('Conta Teste')).toBeTruthy();
    expect(getByText('Própria')).toBeTruthy();
  });

  it('deve chamar onPress quando o card for pressionado', () => {
    const { getByText } = render(<AccountCard {...mockProps} />);
    
    fireEvent.press(getByText('Conta Teste'));
    
    expect(mockProps.onPress).toHaveBeenCalledWith(mockAccount);
  });

  it('deve chamar onEdit quando o botão de editar for pressionado', () => {
    const { getByTestId } = render(<AccountCard {...mockProps} />);
    
    // Simular clique no botão de editar (precisamos adicionar testID)
    const editButton = getByTestId('edit-button');
    fireEvent.press(editButton);
    
    expect(mockProps.onEdit).toHaveBeenCalledWith(mockAccount);
  });

  it('deve chamar onDelete quando o botão de deletar for pressionado', () => {
    const { getByTestId } = render(<AccountCard {...mockProps} />);
    
    // Simular clique no botão de deletar (precisamos adicionar testID)
    const deleteButton = getByTestId('delete-button');
    fireEvent.press(deleteButton);
    
    expect(mockProps.onDelete).toHaveBeenCalledWith(mockAccount);
  });

  it('deve mostrar saldo para contas próprias', () => {
    const { getByText } = render(<AccountCard {...mockProps} />);
    
    expect(getByText('Saldo Atual')).toBeTruthy();
    expect(getByText('R$ 1.000,00')).toBeTruthy();
  });

  it('deve mostrar variação mensal quando disponível', () => {
    const { getByText } = render(<AccountCard {...mockProps} />);
    
    expect(getByText('+R$ 500,00 este mês')).toBeTruthy();
  });

  it('deve mostrar badge de conta padrão quando isDefault for true', () => {
    const defaultAccount = new Account({
      id: '2',
      name: 'Conta Padrão',
      type: 'corrente',
      balance: new Money(0),
      isDefault: true,
    });

    const { getByText } = render(
      <AccountCard {...mockProps} account={defaultAccount} />
    );
    
    expect(getByText('Padrão')).toBeTruthy();
  });

  it('deve mostrar informações de conta externa quando type for externa', () => {
    const externalAccount = new Account({
      id: '3',
      name: 'Conta Externa',
      type: 'cartao_credito',
      balance: new Money(0),
      isDefault: false,
    });

    const { getByText } = render(
      <AccountCard {...mockProps} account={externalAccount} />
    );
    
    expect(getByText('Conta externa')).toBeTruthy();
    expect(getByText('Usada 3x este mês')).toBeTruthy();
  });

  it('deve desabilitar ações para contas padrão', () => {
    const defaultAccount = new Account({
      id: '2',
      name: 'Conta Padrão',
      type: 'corrente',
      balance: new Money(0),
      isDefault: true,
    });

    const { getByTestId } = render(
      <AccountCard {...mockProps} account={defaultAccount} />
    );
    
    const editButton = getByTestId('edit-button');
    const deleteButton = getByTestId('delete-button');
    
    expect(editButton.props.disabled).toBe(true);
    expect(deleteButton.props.disabled).toBe(true);
  });
}); 