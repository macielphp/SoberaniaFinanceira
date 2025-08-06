import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { OperationForm } from './OperationForm';

// Mock do adaptador de ViewModel
const mockCreateOperation = jest.fn();
const mockCreateDoubleOperation = jest.fn();
const mockUpdateOperation = jest.fn();
const mockUpdateOperationState = jest.fn();
const mockGetCategoryNames = jest.fn(() => ['Alimento-supermercado', 'Transporte']);
const mockGetCategoryNamesByType = jest.fn(() => ['Alimento-supermercado', 'Transporte']);
const mockGetAccountNames = jest.fn(() => ['Conta Corrente', 'Poupança']);

jest.mock('../../clean-architecture/presentation/ui-adapters/useOperationViewModelAdapter', () => () => ({
  createOperation: mockCreateOperation,
  createDoubleOperation: mockCreateDoubleOperation,
  updateOperation: mockUpdateOperation,
  updateOperationState: mockUpdateOperationState,
  getCategoryNames: mockGetCategoryNames,
  getCategoryNamesByType: mockGetCategoryNamesByType,
  getAccountNames: mockGetAccountNames,
  categories: [],
  accounts: [],
  operations: [],
  loading: false,
}));

describe('OperationForm (ViewModel Adapter)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve chamar createOperation do ViewModel ao submeter um novo lançamento', async () => {
    const { getByPlaceholderText, getByText } = render(
      <OperationForm onSuccess={jest.fn()} />
    );

    // Preencher campos mínimos
    fireEvent.changeText(getByPlaceholderText('Valor'), '123');
    fireEvent.changeText(getByPlaceholderText('Categoria'), 'Alimento-supermercado');
    fireEvent.changeText(getByPlaceholderText('Conta de origem'), 'Conta Corrente');
    fireEvent.press(getByText('Salvar'));

    await waitFor(() => {
      expect(mockCreateOperation).toHaveBeenCalled();
    });
  });
});