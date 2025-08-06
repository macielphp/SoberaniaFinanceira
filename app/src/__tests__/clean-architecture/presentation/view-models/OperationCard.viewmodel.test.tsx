import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import OperationCard from '../../../components/OperationCard/OperationCard';
import { Operation } from '../../../clean-architecture/domain/entities/Operation';
import { Money } from '../../../clean-architecture/shared/utils/Money';
import { Account } from '../../../clean-architecture/domain/entities/Account';
import { Category } from '../../../clean-architecture/domain/entities/Category';

// Mock do useOperationViewModelAdapter
const mockOperation = new Operation({
  id: '1',
  description: 'Compra no Supermercado',
  amount: new Money(150.50),
  nature: 'despesa',
  state: 'pago',
  date: new Date('2024-01-15'),
  accountId: '1',
  categoryId: '1',
  receipt: null,
});

const mockAccount = new Account({
  id: '1',
  name: 'Conta Corrente',
  type: 'corrente',
  balance: new Money(1000),
  isDefault: false,
});

const mockCategory = new Category({
  id: '1',
  name: 'Alimentação',
  type: 'despesa',
  color: '#FF6B6B',
  icon: 'restaurant',
});

const mockUseOperationViewModelAdapter = {
  operations: [mockOperation],
  loading: false,
  error: null,
  createOperation: jest.fn(),
  updateOperation: jest.fn(),
  deleteOperation: jest.fn(),
  loadOperations: jest.fn(),
};

jest.mock('../../../clean-architecture/presentation/ui-adapters/useOperationViewModelAdapter', () => () => mockUseOperationViewModelAdapter);

// Mock do AccountService
jest.mock('../../../services/AccountService', () => ({
  AccountService: {
    formatCurrency: jest.fn((value) => `R$ ${value.toFixed(2)}`),
  },
}));

describe('OperationCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar informações básicas da operação', () => {
    const { getByText } = render(
      <OperationCard 
        operation={mockOperation}
        account={mockAccount}
        category={mockCategory}
      />
    );
    
    expect(getByText('Compra no Supermercado')).toBeTruthy();
    expect(getByText('R$ 150,50')).toBeTruthy();
    expect(getByText('Alimentação')).toBeTruthy();
    expect(getByText('Conta Corrente')).toBeTruthy();
  });

  it('deve mostrar status da operação', () => {
    const { getByText } = render(
      <OperationCard 
        operation={mockOperation}
        account={mockAccount}
        category={mockCategory}
      />
    );
    
    expect(getByText('Pago')).toBeTruthy();
  });

  it('deve mostrar data formatada', () => {
    const { getByText } = render(
      <OperationCard 
        operation={mockOperation}
        account={mockAccount}
        category={mockCategory}
      />
    );
    
    expect(getByText('15/01/2024')).toBeTruthy();
  });

  it('deve permitir editar operação', () => {
    const mockOnEdit = jest.fn();
    const { getByTestId } = render(
      <OperationCard 
        operation={mockOperation}
        account={mockAccount}
        category={mockCategory}
        onEdit={mockOnEdit}
      />
    );
    
    const editButton = getByTestId('edit-operation-1');
    fireEvent.press(editButton);
    
    expect(mockOnEdit).toHaveBeenCalledWith(mockOperation);
  });

  it('deve permitir deletar operação', () => {
    const mockOnDelete = jest.fn();
    const { getByTestId } = render(
      <OperationCard 
        operation={mockOperation}
        account={mockAccount}
        category={mockCategory}
        onDelete={mockOnDelete}
      />
    );
    
    const deleteButton = getByTestId('delete-operation-1');
    fireEvent.press(deleteButton);
    
    expect(mockOnDelete).toHaveBeenCalledWith(mockOperation);
  });

  it('deve mostrar cor da categoria', () => {
    const { getByTestId } = render(
      <OperationCard 
        operation={mockOperation}
        account={mockAccount}
        category={mockCategory}
      />
    );
    
    const categoryIndicator = getByTestId('category-indicator-1');
    expect(categoryIndicator).toBeTruthy();
  });

  it('deve mostrar ícone da categoria', () => {
    const { getByTestId } = render(
      <OperationCard 
        operation={mockOperation}
        account={mockAccount}
        category={mockCategory}
      />
    );
    
    const categoryIcon = getByTestId('category-icon-1');
    expect(categoryIcon).toBeTruthy();
  });

  it('deve mostrar operação como receita', () => {
    const receitaOperation = new Operation({
      id: '2',
      description: 'Salário',
      amount: new Money(3000),
      nature: 'receita',
      state: 'recebido',
      date: new Date('2024-01-20'),
      accountId: '1',
      categoryId: '2',
      receipt: null,
    });

    const { getByText } = render(
      <OperationCard 
        operation={receitaOperation}
        account={mockAccount}
        category={mockCategory}
      />
    );
    
    expect(getByText('Recebido')).toBeTruthy();
  });

  it('deve mostrar operação pendente', () => {
    const pendingOperation = new Operation({
      id: '3',
      description: 'Conta de Luz',
      amount: new Money(200),
      nature: 'despesa',
      state: 'pagar',
      date: new Date('2024-01-25'),
      accountId: '1',
      categoryId: '3',
      receipt: null,
    });

    const { getByText } = render(
      <OperationCard 
        operation={pendingOperation}
        account={mockAccount}
        category={mockCategory}
      />
    );
    
    expect(getByText('Pendente')).toBeTruthy();
  });

  it('deve permitir marcar como pago/recebido', () => {
    const mockOnToggleStatus = jest.fn();
    const { getByTestId } = render(
      <OperationCard 
        operation={mockOperation}
        account={mockAccount}
        category={mockCategory}
        onToggleStatus={mockOnToggleStatus}
      />
    );
    
    const toggleButton = getByTestId('toggle-status-1');
    fireEvent.press(toggleButton);
    
    expect(mockOnToggleStatus).toHaveBeenCalledWith(mockOperation);
  });

  it('deve mostrar comprovante quando disponível', () => {
    const operationWithReceipt = new Operation({
      id: '4',
      description: 'Compra com Comprovante',
      amount: new Money(100),
      nature: 'despesa',
      state: 'pago',
      date: new Date('2024-01-10'),
      accountId: '1',
      categoryId: '1',
      receipt: new Blob(['receipt data'], { type: 'image/jpeg' }),
    });

    const { getByTestId } = render(
      <OperationCard 
        operation={operationWithReceipt}
        account={mockAccount}
        category={mockCategory}
      />
    );
    
    const receiptIcon = getByTestId('receipt-icon-4');
    expect(receiptIcon).toBeTruthy();
  });

  it('deve permitir visualizar detalhes', () => {
    const mockOnPress = jest.fn();
    const { getByTestId } = render(
      <OperationCard 
        operation={mockOperation}
        account={mockAccount}
        category={mockCategory}
        onPress={mockOnPress}
      />
    );
    
    const card = getByTestId('operation-card-1');
    fireEvent.press(card);
    
    expect(mockOnPress).toHaveBeenCalledWith(mockOperation);
  });

  it('deve mostrar loading quando estiver processando', () => {
    const { getByText } = render(
      <OperationCard 
        operation={mockOperation}
        account={mockAccount}
        category={mockCategory}
        loading={true}
      />
    );
    
    expect(getByText('Processando...')).toBeTruthy();
  });

  it('deve desabilitar ações quando loading', () => {
    const mockOnEdit = jest.fn();
    const { getByTestId } = render(
      <OperationCard 
        operation={mockOperation}
        account={mockAccount}
        category={mockCategory}
        onEdit={mockOnEdit}
        loading={true}
      />
    );
    
    const editButton = getByTestId('edit-operation-1');
    fireEvent.press(editButton);
    
    expect(mockOnEdit).not.toHaveBeenCalled();
  });

  it('deve mostrar operação sem categoria', () => {
    const { getByText } = render(
      <OperationCard 
        operation={mockOperation}
        account={mockAccount}
        category={null}
      />
    );
    
    expect(getByText('Sem categoria')).toBeTruthy();
  });

  it('deve mostrar operação sem conta', () => {
    const { getByText } = render(
      <OperationCard 
        operation={mockOperation}
        account={null}
        category={mockCategory}
      />
    );
    
    expect(getByText('Conta não encontrada')).toBeTruthy();
  });
}); 