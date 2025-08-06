import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { AccountForm } from '../../../components/AccountForm/AccountForm';
import { Account } from '../../../database/accounts';

// Mock do useAccountViewModelAdapter
const mockUseAccountViewModelAdapter = {
  accounts: [],
  loading: false,
  error: null,
  createAccount: jest.fn(),
  updateAccount: jest.fn(),
  deleteAccount: jest.fn(),
  loadAccounts: jest.fn(),
};

jest.mock('../../../clean-architecture/presentation/ui-adapters/useAccountViewModelAdapter', () => () => mockUseAccountViewModelAdapter);

// Mock do useFinance (para compatibilidade durante a transição)
jest.mock('../../../contexts/FinanceContext', () => ({
  useFinance: () => ({
    accounts: [],
    operations: [],
    createAccount: jest.fn(),
    editAccount: jest.fn(),
  }),
}));

describe('AccountForm', () => {
  const mockAccount: Account = {
    id: '1',
    name: 'Conta Teste',
    type: 'propria',
    saldo: 1000,
    isDefault: false,
    createdAt: '2024-01-01T00:00:00.000Z',
  };

  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar o formulário de criação de conta', () => {
    const { getByText } = render(
      <AccountForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );
    
    expect(getByText('Nova Conta')).toBeTruthy();
    expect(getByText('Tipo da Conta')).toBeTruthy();
  });

  it('deve renderizar o formulário de edição de conta', () => {
    const { getByText } = render(
      <AccountForm 
        account={mockAccount} 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel}
        isEditing={true}
      />
    );
    
    expect(getByText('Editar Conta')).toBeTruthy();
  });

  it('deve validar campos obrigatórios', async () => {
    const { getByText } = render(
      <AccountForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );
    
    // Tentar salvar sem preencher campos
    const saveButton = getByText('Salvar');
    fireEvent.press(saveButton);
    
    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  it('deve criar uma nova conta com dados válidos', async () => {
    mockOnSubmit.mockResolvedValue(true);
    
    const { getByText, getByDisplayValue } = render(
      <AccountForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );
    
    // Preencher nome
    const nameInput = getByDisplayValue('');
    fireEvent.changeText(nameInput, 'Nova Conta');
    
    // Preencher saldo
    const balanceInput = getByDisplayValue('');
    fireEvent.changeText(balanceInput, '1500');
    
    // Salvar
    const saveButton = getByText('Salvar');
    fireEvent.press(saveButton);
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith('Nova Conta', 'propria', 1500);
    });
  });

  it('deve atualizar uma conta existente', async () => {
    mockOnSubmit.mockResolvedValue(true);
    
    const { getByText } = render(
      <AccountForm 
        account={mockAccount} 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel}
        isEditing={true}
      />
    );
    
    // Salvar
    const saveButton = getByText('Salvar');
    fireEvent.press(saveButton);
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith('Conta Teste', 'propria', 1000);
    });
  });

  it('deve permitir cancelar a operação', () => {
    const { getByText } = render(
      <AccountForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );
    
    const cancelButton = getByText('Cancelar');
    fireEvent.press(cancelButton);
    
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('deve validar saldo inicial como número', async () => {
    const { getByText, getByDisplayValue } = render(
      <AccountForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );
    
    // Preencher nome
    const nameInput = getByDisplayValue('');
    fireEvent.changeText(nameInput, 'Conta Teste');
    
    // Preencher saldo inválido
    const balanceInput = getByDisplayValue('');
    fireEvent.changeText(balanceInput, 'abc');
    
    // Tentar salvar
    const saveButton = getByText('Salvar');
    fireEvent.press(saveButton);
    
    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  it('deve permitir selecionar tipo de conta própria', () => {
    const { getByText } = render(
      <AccountForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );
    
    expect(getByText('Própria')).toBeTruthy();
    expect(getByText('Externa')).toBeTruthy();
  });

  it('deve mostrar loading durante o salvamento', async () => {
    mockOnSubmit.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(true), 100)));
    
    const { getByText, getByDisplayValue } = render(
      <AccountForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );
    
    // Preencher dados
    const nameInput = getByDisplayValue('');
    fireEvent.changeText(nameInput, 'Conta Teste');
    
    // Salvar
    const saveButton = getByText('Salvar');
    fireEvent.press(saveButton);
    
    // Verificar se está em loading
    expect(getByText('Salvando...')).toBeTruthy();
  });

  it('deve lidar com erro durante salvamento', async () => {
    mockOnSubmit.mockRejectedValue(new Error('Erro ao salvar'));
    
    const { getByText, getByDisplayValue } = render(
      <AccountForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );
    
    // Preencher dados
    const nameInput = getByDisplayValue('');
    fireEvent.changeText(nameInput, 'Conta Teste');
    
    // Salvar
    const saveButton = getByText('Salvar');
    fireEvent.press(saveButton);
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });
}); 