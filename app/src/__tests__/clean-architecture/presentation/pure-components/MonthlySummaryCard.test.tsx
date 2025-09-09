import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { MonthlySummaryCard } from '../../../../clean-architecture/presentation/pure-components/MonthlySummaryCard';
import { MonthlyFinanceSummary } from '../../../../clean-architecture/domain/entities/MonthlyFinanceSummary';
import { Money } from '../../../../clean-architecture/shared/utils/Money';

// Mock do Money
jest.mock('../../../../clean-architecture/shared/utils/Money', () => ({
  Money: jest.fn().mockImplementation((value: number) => ({
    value,
    format: () => {
      const formatted = value.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      return `R$ ${formatted}`;
    },
  })),
}));

describe('MonthlySummaryCard', () => {
  const mockSummary = new MonthlyFinanceSummary({
    id: '1',
    userId: 'user1',
    month: '2024-01',
    totalIncome: new Money(5000),
    totalExpense: new Money(3000),
    balance: new Money(2000),
    totalPlannedBudget: new Money(4000),
    totalActualBudget: new Money(3400),
    createdAt: new Date('2024-01-01'),
  });

  const defaultProps = {
    summary: mockSummary,
    onViewDetails: jest.fn(),
    onEdit: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render summary title correctly', () => {
      const { getByText } = render(
        <MonthlySummaryCard {...defaultProps} />
      );

      expect(getByText('Resumo Financeiro')).toBeTruthy();
    });

    it('should render month and year correctly', () => {
      const { getByText } = render(
        <MonthlySummaryCard {...defaultProps} />
      );

      expect(getByText('Janeiro 2024')).toBeTruthy();
    });

    it('should render income value correctly', () => {
      const { getByText } = render(
        <MonthlySummaryCard {...defaultProps} />
      );

      expect(getByText('R$ 5.000,00')).toBeTruthy();
    });

    it('should render expenses value correctly', () => {
      const { getByText } = render(
        <MonthlySummaryCard {...defaultProps} />
      );

      expect(getByText('R$ 3.000,00')).toBeTruthy();
    });

    it('should render savings value correctly', () => {
      const { getByText } = render(
        <MonthlySummaryCard {...defaultProps} />
      );

      expect(getByText('R$ 2.000,00')).toBeTruthy();
    });

    it('should render budget compliance percentage', () => {
      const { getByText } = render(
        <MonthlySummaryCard {...defaultProps} />
      );

      expect(getByText('85%')).toBeTruthy();
    });
  });

  describe('interactions', () => {
    it('should call onViewDetails when view details button is pressed', () => {
      const mockOnViewDetails = jest.fn();
      const { getByText } = render(
        <MonthlySummaryCard {...defaultProps} onViewDetails={mockOnViewDetails} />
      );

      const viewDetailsButton = getByText('Ver Detalhes');
      fireEvent.press(viewDetailsButton);

      expect(mockOnViewDetails).toHaveBeenCalledWith(mockSummary);
    });

    it('should call onEdit when edit button is pressed', () => {
      const mockOnEdit = jest.fn();
      const { getByText } = render(
        <MonthlySummaryCard {...defaultProps} onEdit={mockOnEdit} />
      );

      const editButton = getByText('Editar');
      fireEvent.press(editButton);

      expect(mockOnEdit).toHaveBeenCalledWith(mockSummary);
    });
  });

  describe('budget compliance indicators', () => {
    it('should show good compliance indicator for percentage >= 90', () => {
      const goodSummary = new MonthlyFinanceSummary({
        id: '1',
        userId: 'user1',
        month: '2024-01',
        totalIncome: new Money(5000),
        totalExpense: new Money(3000),
        balance: new Money(2000),
        totalPlannedBudget: new Money(4000),
        totalActualBudget: new Money(3800), // 95% adherence
        createdAt: new Date('2024-01-01'),
      });

      const { getByText } = render(
        <MonthlySummaryCard {...defaultProps} summary={goodSummary} />
      );

      expect(getByText('95%')).toBeTruthy();
    });

    it('should show warning compliance indicator for percentage < 90', () => {
      const warningSummary = new MonthlyFinanceSummary({
        id: '1',
        userId: 'user1',
        month: '2024-01',
        totalIncome: new Money(5000),
        totalExpense: new Money(3000),
        balance: new Money(2000),
        totalPlannedBudget: new Money(4000),
        totalActualBudget: new Money(3000), // 75% adherence
        createdAt: new Date('2024-01-01'),
      });

      const { getByText } = render(
        <MonthlySummaryCard {...defaultProps} summary={warningSummary} />
      );

      expect(getByText('75%')).toBeTruthy();
    });

    it('should show critical compliance indicator for percentage < 70', () => {
      const criticalSummary = new MonthlyFinanceSummary({
        id: '1',
        userId: 'user1',
        month: '2024-01',
        totalIncome: new Money(5000),
        totalExpense: new Money(3000),
        balance: new Money(2000),
        totalPlannedBudget: new Money(4000),
        totalActualBudget: new Money(2400), // 60% adherence
        createdAt: new Date('2024-01-01'),
      });

      const { getByText } = render(
        <MonthlySummaryCard {...defaultProps} summary={criticalSummary} />
      );

      expect(getByText('60%')).toBeTruthy();
    });
  });

  describe('loading state', () => {
    it('should show loading state when loading', () => {
      const { getByText } = render(
        <MonthlySummaryCard {...defaultProps} loading={true} />
      );

      expect(getByText('Carregando...')).toBeTruthy();
    });

    it('should not render buttons when loading', () => {
      const { queryByText } = render(
        <MonthlySummaryCard {...defaultProps} loading={true} />
      );

      expect(queryByText('Ver Detalhes')).toBeNull();
      expect(queryByText('Editar')).toBeNull();
    });
  });

  describe('error state', () => {
    it('should show error message when error occurs', () => {
      const errorMessage = 'Erro ao carregar resumo';
      const { getByText } = render(
        <MonthlySummaryCard {...defaultProps} error={errorMessage} />
      );

      expect(getByText(errorMessage)).toBeTruthy();
    });

    it('should not render buttons when error occurs', () => {
      const { queryByText } = render(
        <MonthlySummaryCard {...defaultProps} error="Erro de teste" />
      );

      expect(queryByText('Ver Detalhes')).toBeNull();
      expect(queryByText('Editar')).toBeNull();
    });
  });

  describe('accessibility', () => {
    it('should have proper accessibility labels', () => {
      const { getByTestId } = render(
        <MonthlySummaryCard {...defaultProps} />
      );

      const card = getByTestId('monthly-summary-card');
      expect(card).toBeTruthy();
    });

    it('should have accessible buttons', () => {
      const { getByText } = render(
        <MonthlySummaryCard {...defaultProps} />
      );

      const viewDetailsButton = getByText('Ver Detalhes');
      const editButton = getByText('Editar');
      
      expect(viewDetailsButton).toBeTruthy();
      expect(editButton).toBeTruthy();
    });
  });

  describe('month formatting', () => {
    it('should format different months correctly', () => {
      const decemberSummary = new MonthlyFinanceSummary({
        id: '1',
        userId: 'user1',
        month: '2024-12',
        totalIncome: new Money(5000),
        totalExpense: new Money(3000),
        balance: new Money(2000),
        totalPlannedBudget: new Money(4000),
        totalActualBudget: new Money(3400),
        createdAt: new Date('2024-01-01'),
      });

      const { getByText } = render(
        <MonthlySummaryCard {...defaultProps} summary={decemberSummary} />
      );

      expect(getByText('Dezembro 2024')).toBeTruthy();
    });

    it('should format February correctly', () => {
      const februarySummary = new MonthlyFinanceSummary({
        id: '1',
        userId: 'user1',
        month: '2024-02',
        totalIncome: new Money(5000),
        totalExpense: new Money(3000),
        balance: new Money(2000),
        totalPlannedBudget: new Money(4000),
        totalActualBudget: new Money(3400),
        createdAt: new Date('2024-01-01'),
      });

      const { getByText } = render(
        <MonthlySummaryCard {...defaultProps} summary={februarySummary} />
      );

      expect(getByText('Fevereiro 2024')).toBeTruthy();
    });
  });

  describe('financial calculations', () => {
    it('should calculate savings correctly', () => {
      const summaryWithCalculatedSavings = new MonthlyFinanceSummary({
        id: '1',
        userId: 'user1',
        month: '2024-01',
        totalIncome: new Money(4000),
        totalExpense: new Money(2500),
        balance: new Money(1500),
        totalPlannedBudget: new Money(4000),
        totalActualBudget: new Money(3400),
        createdAt: new Date('2024-01-01'),
      });

      const { getByText } = render(
        <MonthlySummaryCard {...defaultProps} summary={summaryWithCalculatedSavings} />
      );

      expect(getByText('R$ 4.000,00')).toBeTruthy();
      expect(getByText('R$ 2.500,00')).toBeTruthy();
      expect(getByText('R$ 1.500,00')).toBeTruthy();
    });

    it('should handle zero values correctly', () => {
      const zeroSummary = new MonthlyFinanceSummary({
        id: '1',
        userId: 'user1',
        month: '2024-01',
        totalIncome: new Money(0),
        totalExpense: new Money(0),
        balance: new Money(0),
        totalPlannedBudget: new Money(0),
        totalActualBudget: new Money(0),
        createdAt: new Date('2024-01-01'),
      });

      const { getAllByText, getByText } = render(
        <MonthlySummaryCard {...defaultProps} summary={zeroSummary} />
      );

      expect(getAllByText('R$ 0,00')).toHaveLength(3); // Income, Expense, Balance
      expect(getByText('0%')).toBeTruthy();
    });
  });

  describe('compliance status', () => {
    it('should show compliance status text', () => {
      const { getByText } = render(
        <MonthlySummaryCard {...defaultProps} />
      );

      expect(getByText('Cumprimento do Orçamento')).toBeTruthy();
    });

    it('should show different compliance statuses', () => {
      const excellentSummary = new MonthlyFinanceSummary({
        id: '1',
        userId: 'user1',
        month: '2024-01',
        totalIncome: new Money(5000),
        totalExpense: new Money(3000),
        balance: new Money(2000),
        totalPlannedBudget: new Money(4000),
        totalActualBudget: new Money(4000), // 100% adherence
        createdAt: new Date('2024-01-01'),
      });

      const { getByText } = render(
        <MonthlySummaryCard {...defaultProps} summary={excellentSummary} />
      );

      expect(getByText('100%')).toBeTruthy();
    });
  });
});
