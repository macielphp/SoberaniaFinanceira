// Test: BudgetForm
// Responsável por testar o componente puro para formulário de orçamento
// Segue Clean Architecture - componente puro sem lógica de negócio

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { BudgetForm } from '../../../../clean-architecture/presentation/pure-components/BudgetForm';
import { Budget } from '../../../../clean-architecture/domain/entities/Budget';
import { Money } from '../../../../clean-architecture/shared/utils/Money';

// Mock Budget entity
const mockBudget = new Budget({
  id: 'budget-1',
  userId: 'user-1',
  name: 'Orçamento Janeiro 2024',
  startPeriod: new Date('2024-01-01'),
  endPeriod: new Date('2024-01-31'),
  type: 'manual',
  totalPlannedValue: new Money(5000.00, 'BRL'),
  createdAt: new Date('2024-01-01'),
});

describe('BudgetForm', () => {
  const defaultProps = {
    onSubmit: jest.fn(),
    onCancel: jest.fn(),
    loading: false,
    error: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render form fields correctly', () => {
      const { getByPlaceholderText, getByText } = render(
        <BudgetForm {...defaultProps} />
      );

      expect(getByPlaceholderText('Nome do orçamento')).toBeTruthy();
      expect(getByPlaceholderText('Valor planejado')).toBeTruthy();
      expect(getByPlaceholderText('Data de início')).toBeTruthy();
      expect(getByPlaceholderText('Data de fim')).toBeTruthy();
      expect(getByText('Salvar')).toBeTruthy();
      expect(getByText('Cancelar')).toBeTruthy();
    });

    it('should render with initial values when editing', () => {
      const { getByDisplayValue } = render(
        <BudgetForm {...defaultProps} initialData={mockBudget} />
      );

      expect(getByDisplayValue('Orçamento Janeiro 2024')).toBeTruthy();
      expect(getByDisplayValue('5000')).toBeTruthy();
    });

    it('should show loading state', () => {
      const { getByText } = render(
        <BudgetForm {...defaultProps} loading={true} />
      );

      expect(getByText('Salvando...')).toBeTruthy();
    });

    it('should show error message', () => {
      const errorMessage = 'Erro ao salvar orçamento';
      const { getByText } = render(
        <BudgetForm {...defaultProps} error={errorMessage} />
      );

      expect(getByText(errorMessage)).toBeTruthy();
    });
  });

  describe('form interaction', () => {
    it('should update form fields when user types', () => {
      const { getByPlaceholderText } = render(
        <BudgetForm {...defaultProps} />
      );

      const nameInput = getByPlaceholderText('Nome do orçamento');
      const valueInput = getByPlaceholderText('Valor planejado');

      fireEvent.changeText(nameInput, 'Novo Orçamento');
      fireEvent.changeText(valueInput, '3000');

      expect(nameInput.props.value).toBe('Novo Orçamento');
      expect(valueInput.props.value).toBe('3000');
    });

    it('should call onSubmit with form data when form is submitted', async () => {
      const mockOnSubmit = jest.fn();
      const { getByPlaceholderText, getByText } = render(
        <BudgetForm {...defaultProps} onSubmit={mockOnSubmit} />
      );

      const nameInput = getByPlaceholderText('Nome do orçamento');
      const valueInput = getByPlaceholderText('Valor planejado');
      const startDateInput = getByPlaceholderText('Data de início');
      const endDateInput = getByPlaceholderText('Data de fim');

      fireEvent.changeText(nameInput, 'Orçamento Teste');
      fireEvent.changeText(valueInput, '4000');
      fireEvent.changeText(startDateInput, '2024-03-01');
      fireEvent.changeText(endDateInput, '2024-03-31');

      fireEvent.press(getByText('Salvar'));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          name: 'Orçamento Teste',
          totalPlannedValue: 4000,
          startPeriod: '2024-03-01',
          endPeriod: '2024-03-31',
        });
      });
    });

    it('should call onCancel when cancel button is pressed', () => {
      const mockOnCancel = jest.fn();
      const { getByText } = render(
        <BudgetForm {...defaultProps} onCancel={mockOnCancel} />
      );

      fireEvent.press(getByText('Cancelar'));

      expect(mockOnCancel).toHaveBeenCalled();
    });
  });

  describe('validation', () => {
    it('should show validation error for empty name', async () => {
      const { getByText, getByPlaceholderText } = render(
        <BudgetForm {...defaultProps} />
      );

      const valueInput = getByPlaceholderText('Valor planejado');
      fireEvent.changeText(valueInput, '1000');

      fireEvent.press(getByText('Salvar'));

      await waitFor(() => {
        expect(getByText('Nome é obrigatório')).toBeTruthy();
      });
    });

    it('should show validation error for empty value', async () => {
      const { getByText, getByPlaceholderText } = render(
        <BudgetForm {...defaultProps} />
      );

      const nameInput = getByPlaceholderText('Nome do orçamento');
      fireEvent.changeText(nameInput, 'Orçamento Teste');

      fireEvent.press(getByText('Salvar'));

      await waitFor(() => {
        expect(getByText('Valor é obrigatório')).toBeTruthy();
      });
    });

    it('should show validation error for invalid value', async () => {
      const { getByText, getByPlaceholderText } = render(
        <BudgetForm {...defaultProps} />
      );

      const nameInput = getByPlaceholderText('Nome do orçamento');
      const valueInput = getByPlaceholderText('Valor planejado');

      fireEvent.changeText(nameInput, 'Orçamento Teste');
      fireEvent.changeText(valueInput, '-100');

      fireEvent.press(getByText('Salvar'));

      await waitFor(() => {
        expect(getByText('Valor deve ser maior que zero')).toBeTruthy();
      });
    });

    it('should show validation error for invalid date range', async () => {
      const { getByText, getByPlaceholderText } = render(
        <BudgetForm {...defaultProps} />
      );

      const nameInput = getByPlaceholderText('Nome do orçamento');
      const valueInput = getByPlaceholderText('Valor planejado');
      const startDateInput = getByPlaceholderText('Data de início');
      const endDateInput = getByPlaceholderText('Data de fim');

      fireEvent.changeText(nameInput, 'Orçamento Teste');
      fireEvent.changeText(valueInput, '1000');
      fireEvent.changeText(startDateInput, '2024-03-31');
      fireEvent.changeText(endDateInput, '2024-03-01');

      fireEvent.press(getByText('Salvar'));

      await waitFor(() => {
        expect(getByText('Data de fim deve ser posterior à data de início')).toBeTruthy();
      });
    });
  });

  describe('accessibility', () => {
    it('should have proper accessibility labels', () => {
      const { getByLabelText } = render(
        <BudgetForm {...defaultProps} />
      );

      expect(getByLabelText('Nome do orçamento')).toBeTruthy();
      expect(getByLabelText('Valor planejado')).toBeTruthy();
      expect(getByLabelText('Data de início')).toBeTruthy();
      expect(getByLabelText('Data de fim')).toBeTruthy();
    });

    it('should be accessible when loading', () => {
      const { getByLabelText } = render(
        <BudgetForm {...defaultProps} loading={true} />
      );

      const saveButton = getByLabelText('Salvando');
      expect(saveButton.props.accessibilityState?.disabled).toBe(true);
    });
  });

  describe('form reset', () => {
    it('should reset form when component is re-rendered without initialData', () => {
      const { getByPlaceholderText, rerender } = render(
        <BudgetForm {...defaultProps} initialData={mockBudget} />
      );

      const nameInput = getByPlaceholderText('Nome do orçamento');
      expect(nameInput.props.value).toBe('Orçamento Janeiro 2024');

      // Re-render without initialData
      rerender(<BudgetForm {...defaultProps} />);

      expect(nameInput.props.value).toBe('');
    });
  });
});
