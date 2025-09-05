// Test: BudgetCard
// Responsável por testar o componente puro para card de orçamento
// Segue Clean Architecture - componente puro sem lógica de negócio

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { BudgetCard } from '../../../../clean-architecture/presentation/pure-components/BudgetCard';
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

const mockBudgetWithItems = new Budget({
  id: 'budget-2',
  userId: 'user-1',
  name: 'Orçamento Fevereiro 2024',
  startPeriod: new Date('2024-02-01'),
  endPeriod: new Date('2024-02-29'),
  type: 'manual',
  totalPlannedValue: new Money(4500.00, 'BRL'),
  createdAt: new Date('2024-02-01'),
});

describe('BudgetCard', () => {
  const defaultProps = {
    budget: mockBudget,
    onEdit: jest.fn(),
    onDelete: jest.fn(),
    onViewDetails: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render budget information correctly', () => {
      const { getByText } = render(
        <BudgetCard {...defaultProps} />
      );

      expect(getByText('Orçamento Janeiro 2024')).toBeTruthy();
      expect(getByText('R$ 5.000,00')).toBeTruthy();
      expect(getByText('31/12/2023 - 30/01/2024')).toBeTruthy();
    });

    it('should render budget type correctly', () => {
      const { getByText } = render(
        <BudgetCard {...defaultProps} />
      );

      expect(getByText('Manual')).toBeTruthy();
    });

    it('should render action buttons', () => {
      const { getByText } = render(
        <BudgetCard {...defaultProps} />
      );

      expect(getByText('Editar')).toBeTruthy();
      expect(getByText('Excluir')).toBeTruthy();
      expect(getByText('Ver Detalhes')).toBeTruthy();
    });

    it('should render budget status', () => {
      const { getByText } = render(
        <BudgetCard {...defaultProps} />
      );

      expect(getByText('Ativo')).toBeTruthy();
    });
  });

  describe('interactions', () => {
    it('should call onEdit when edit button is pressed', () => {
      const mockOnEdit = jest.fn();
      const { getByText } = render(
        <BudgetCard {...defaultProps} onEdit={mockOnEdit} />
      );

      fireEvent.press(getByText('Editar'));

      expect(mockOnEdit).toHaveBeenCalledWith(mockBudget);
    });

    it('should call onDelete when delete button is pressed', () => {
      const mockOnDelete = jest.fn();
      const { getByText } = render(
        <BudgetCard {...defaultProps} onDelete={mockOnDelete} />
      );

      fireEvent.press(getByText('Excluir'));

      expect(mockOnDelete).toHaveBeenCalledWith(mockBudget);
    });

    it('should call onViewDetails when view details button is pressed', () => {
      const mockOnViewDetails = jest.fn();
      const { getByText } = render(
        <BudgetCard {...defaultProps} onViewDetails={mockOnViewDetails} />
      );

      fireEvent.press(getByText('Ver Detalhes'));

      expect(mockOnViewDetails).toHaveBeenCalledWith(mockBudget);
    });

    it('should call onEdit when card is pressed', () => {
      const mockOnEdit = jest.fn();
      const { getByTestId } = render(
        <BudgetCard {...defaultProps} onEdit={mockOnEdit} />
      );

      fireEvent.press(getByTestId('budget-card'));

      expect(mockOnEdit).toHaveBeenCalledWith(mockBudget);
    });
  });

  describe('budget status', () => {
    it('should show active status for active budget', () => {
      const { getByText } = render(
        <BudgetCard {...defaultProps} />
      );

      expect(getByText('Ativo')).toBeTruthy();
    });

    it('should show inactive status for inactive budget', () => {
      const inactiveBudget = new Budget({
        id: mockBudget.id,
        userId: mockBudget.userId,
        name: mockBudget.name,
        startPeriod: mockBudget.startPeriod,
        endPeriod: mockBudget.endPeriod,
        type: mockBudget.type,
        totalPlannedValue: mockBudget.totalPlannedValue,
        isActive: false,
        status: 'inactive',
        createdAt: mockBudget.createdAt,
      });

      const { getByText } = render(
        <BudgetCard {...defaultProps} budget={inactiveBudget} />
      );

      expect(getByText('Inativo')).toBeTruthy();
    });
  });

  describe('date formatting', () => {
    it('should format dates correctly', () => {
      const { getByText } = render(
        <BudgetCard {...defaultProps} />
      );

      expect(getByText('31/12/2023 - 30/01/2024')).toBeTruthy();
    });

    it('should handle different date ranges', () => {
      const budgetWithDifferentDates = new Budget({
        id: mockBudget.id,
        userId: mockBudget.userId,
        name: mockBudget.name,
        startPeriod: new Date('2024-03-15'),
        endPeriod: new Date('2024-04-15'),
        type: mockBudget.type,
        totalPlannedValue: mockBudget.totalPlannedValue,
        isActive: mockBudget.isActive,
        status: mockBudget.status,
        createdAt: mockBudget.createdAt,
      });

      const { getByText } = render(
        <BudgetCard {...defaultProps} budget={budgetWithDifferentDates} />
      );

      expect(getByText('14/03/2024 - 14/04/2024')).toBeTruthy();
    });
  });

  describe('money formatting', () => {
    it('should format money correctly', () => {
      const { getByText } = render(
        <BudgetCard {...defaultProps} />
      );

      expect(getByText('R$ 5.000,00')).toBeTruthy();
    });

    it('should handle different money values', () => {
      const budgetWithDifferentValue = new Budget({
        id: mockBudget.id,
        userId: mockBudget.userId,
        name: mockBudget.name,
        startPeriod: mockBudget.startPeriod,
        endPeriod: mockBudget.endPeriod,
        type: mockBudget.type,
        totalPlannedValue: new Money(1234.56, 'BRL'),
        isActive: mockBudget.isActive,
        status: mockBudget.status,
        createdAt: mockBudget.createdAt,
      });

      const { getByText } = render(
        <BudgetCard {...defaultProps} budget={budgetWithDifferentValue} />
      );

      expect(getByText('R$ 1.234,56')).toBeTruthy();
    });
  });

  describe('accessibility', () => {
    it('should have proper accessibility labels', () => {
      const { getByTestId } = render(
        <BudgetCard {...defaultProps} />
      );

      const card = getByTestId('budget-card');
      expect(card.props.accessibilityLabel).toContain('Orçamento Janeiro 2024');
      expect(card.props.accessibilityHint).toContain('Toque para editar');
    });

    it('should have accessible buttons', () => {
      const { getByText } = render(
        <BudgetCard {...defaultProps} />
      );

      const editButton = getByText('Editar');
      const deleteButton = getByText('Excluir');
      const detailsButton = getByText('Ver Detalhes');

      expect(editButton.props.accessibilityLabel).toBe('Editar orçamento');
      expect(deleteButton.props.accessibilityLabel).toBe('Excluir orçamento');
      expect(detailsButton.props.accessibilityLabel).toBe('Ver detalhes do orçamento');
    });
  });

  describe('loading state', () => {
    it('should show loading state when loading', () => {
      const { getByText } = render(
        <BudgetCard {...defaultProps} loading={true} />
      );

      expect(getByText('Carregando...')).toBeTruthy();
    });

    it('should not render buttons when loading', () => {
      const { queryByText } = render(
        <BudgetCard {...defaultProps} loading={true} />
      );

      expect(queryByText('Editar')).toBeNull();
      expect(queryByText('Excluir')).toBeNull();
      expect(queryByText('Ver Detalhes')).toBeNull();
    });
  });

  describe('error state', () => {
    it('should show error message when error occurs', () => {
      const errorMessage = 'Erro ao carregar orçamento';
      const { getByText } = render(
        <BudgetCard {...defaultProps} error={errorMessage} />
      );

      expect(getByText(errorMessage)).toBeTruthy();
    });
  });

  describe('budget type display', () => {
    it('should display manual budget type', () => {
      const { getByText } = render(
        <BudgetCard {...defaultProps} />
      );

      expect(getByText('Manual')).toBeTruthy();
    });
  });
});
