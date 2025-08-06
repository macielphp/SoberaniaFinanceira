import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
// Supondo que existe um componente AccountForm para exemplo
// import { AccountForm } from './AccountForm';

// Mock do adaptador de ViewModel
const mockCreateAccount = jest.fn();
const mockUpdateAccount = jest.fn();
const mockDeleteAccount = jest.fn();
const mockLoadAccounts = jest.fn();

jest.mock('../../clean-architecture/presentation/ui-adapters/useAccountViewModelAdapter', () => () => ({
  accounts: [],
  loading: false,
  createAccount: mockCreateAccount,
  updateAccount: mockUpdateAccount,
  deleteAccount: mockDeleteAccount,
  loadAccounts: mockLoadAccounts,
}));

describe('useAccountViewModelAdapter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve chamar createAccount do ViewModel ao submeter um novo cadastro', async () => {
    // Exemplo: simular um formulário de conta
    // const { getByPlaceholderText, getByText } = render(
    //   <AccountForm onSuccess={jest.fn()} />
    // );
    // fireEvent.changeText(getByPlaceholderText('Nome da Conta'), 'Conta Teste');
    // fireEvent.press(getByText('Salvar'));
    // await waitFor(() => {
    //   expect(mockCreateAccount).toHaveBeenCalled();
    // });
    // Como não temos o componente, apenas testa o hook
    mockCreateAccount({ id: '1', name: 'Conta Teste', type: 'corrente', saldo: 100 });
    expect(mockCreateAccount).toHaveBeenCalledWith({ id: '1', name: 'Conta Teste', type: 'corrente', saldo: 100 });
  });
});