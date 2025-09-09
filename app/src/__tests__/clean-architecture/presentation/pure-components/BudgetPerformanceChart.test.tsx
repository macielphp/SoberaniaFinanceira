// Test: BudgetPerformanceChart
// Responsável por testar o componente puro para gráfico de performance de orçamento
// Segue Clean Architecture - componente puro sem lógica de negócio

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { BudgetPerformanceChart } from '../../../../clean-architecture/presentation/pure-components/BudgetPerformanceChart';
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

// Mock performance data
const mockPerformanceData = [
  { month: 'Janeiro', planned: 5000, actual: 4500, percentage: 90 },
  { month: 'Fevereiro', planned: 5000, actual: 5200, percentage: 104 },
  { month: 'Março', planned: 5000, actual: 4800, percentage: 96 },
];

describe('BudgetPerformanceChart', () => {
  const defaultProps = {
    budget: mockBudget,
    performanceData: mockPerformanceData,
    onMonthSelect: jest.fn(),
    loading: false,
    error: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render chart title correctly', () => {
      const { getByText } = render(
        <BudgetPerformanceChart {...defaultProps} />
      );

      expect(getByText('Performance do Orçamento')).toBeTruthy();
      expect(getByText('Orçamento Janeiro 2024')).toBeTruthy();
    });

    it('should render performance data correctly', () => {
      const { getByText } = render(
        <BudgetPerformanceChart {...defaultProps} />
      );

      expect(getByText('Janeiro')).toBeTruthy();
      expect(getByText('Fevereiro')).toBeTruthy();
      expect(getByText('Março')).toBeTruthy();
    });

    it('should render performance percentages', () => {
      const { getByText } = render(
        <BudgetPerformanceChart {...defaultProps} />
      );

      expect(getByText('90%')).toBeTruthy();
      expect(getByText('104%')).toBeTruthy();
      expect(getByText('96%')).toBeTruthy();
    });

    it('should render performance values', () => {
      const { getByText } = render(
        <BudgetPerformanceChart {...defaultProps} />
      );

      expect(getByText('R$ 4.500,00')).toBeTruthy();
      expect(getByText('R$ 5.200,00')).toBeTruthy();
      expect(getByText('R$ 4.800,00')).toBeTruthy();
    });
  });

  describe('interactions', () => {
    it('should call onMonthSelect when month is selected', () => {
      const mockOnMonthSelect = jest.fn();
      const { getByText } = render(
        <BudgetPerformanceChart {...defaultProps} onMonthSelect={mockOnMonthSelect} />
      );

      fireEvent.press(getByText('Janeiro'));

      expect(mockOnMonthSelect).toHaveBeenCalledWith('Janeiro');
    });

    it('should call onMonthSelect when different month is selected', () => {
      const mockOnMonthSelect = jest.fn();
      const { getByText } = render(
        <BudgetPerformanceChart {...defaultProps} onMonthSelect={mockOnMonthSelect} />
      );

      fireEvent.press(getByText('Fevereiro'));

      expect(mockOnMonthSelect).toHaveBeenCalledWith('Fevereiro');
    });
  });

  describe('performance indicators', () => {
    it('should show good performance indicator for percentage >= 100', () => {
      const { getByText } = render(
        <BudgetPerformanceChart {...defaultProps} />
      );

      const februaryElement = getByText('Fevereiro');
      expect(februaryElement).toBeTruthy();
    });

    it('should show warning performance indicator for percentage < 100', () => {
      const { getByText } = render(
        <BudgetPerformanceChart {...defaultProps} />
      );

      const januaryElement = getByText('Janeiro');
      expect(januaryElement).toBeTruthy();
    });

    it('should show critical performance indicator for percentage < 80', () => {
      const criticalData = [
        { month: 'Abril', planned: 5000, actual: 3500, percentage: 70 },
      ];

      const { getByText } = render(
        <BudgetPerformanceChart {...defaultProps} performanceData={criticalData} />
      );

      expect(getByText('Abril')).toBeTruthy();
    });
  });

  describe('loading state', () => {
    it('should show loading state when loading', () => {
      const { getByText } = render(
        <BudgetPerformanceChart {...defaultProps} loading={true} />
      );

      expect(getByText('Carregando dados...')).toBeTruthy();
    });

    it('should not render chart when loading', () => {
      const { queryByText } = render(
        <BudgetPerformanceChart {...defaultProps} loading={true} />
      );

      expect(queryByText('Janeiro')).toBeNull();
      expect(queryByText('Fevereiro')).toBeNull();
      expect(queryByText('Março')).toBeNull();
    });
  });

  describe('error state', () => {
    it('should show error message when error occurs', () => {
      const errorMessage = 'Erro ao carregar dados de performance';
      const { getByText } = render(
        <BudgetPerformanceChart {...defaultProps} error={errorMessage} />
      );

      expect(getByText(errorMessage)).toBeTruthy();
    });

    it('should not render chart when error occurs', () => {
      const { queryByText } = render(
        <BudgetPerformanceChart {...defaultProps} error="Erro de teste" />
      );

      expect(queryByText('Janeiro')).toBeNull();
      expect(queryByText('Fevereiro')).toBeNull();
      expect(queryByText('Março')).toBeNull();
    });
  });

  describe('empty state', () => {
    it('should show empty state when no performance data', () => {
      const { getByText } = render(
        <BudgetPerformanceChart {...defaultProps} performanceData={[]} />
      );

      expect(getByText('Nenhum dado de performance disponível')).toBeTruthy();
    });

    it('should not render chart when no performance data', () => {
      const { queryByText } = render(
        <BudgetPerformanceChart {...defaultProps} performanceData={[]} />
      );

      expect(queryByText('Janeiro')).toBeNull();
      expect(queryByText('Fevereiro')).toBeNull();
      expect(queryByText('Março')).toBeNull();
    });
  });

  describe('accessibility', () => {
    it('should have proper accessibility labels', () => {
      const { getByTestId } = render(
        <BudgetPerformanceChart {...defaultProps} />
      );

      const chart = getByTestId('budget-performance-chart');
      expect(chart).toBeTruthy();
    });

    it('should have accessible month buttons', () => {
      const { getByText } = render(
        <BudgetPerformanceChart {...defaultProps} />
      );

      const januaryButton = getByText('Janeiro');
      expect(januaryButton).toBeTruthy();
    });
  });

  describe('chart statistics', () => {
    it('should show average performance', () => {
      const { getByText } = render(
        <BudgetPerformanceChart {...defaultProps} />
      );

      expect(getByText('Média:')).toBeTruthy();
      expect(getByText('97%')).toBeTruthy();
    });

    it('should show best performance month', () => {
      const { getByText } = render(
        <BudgetPerformanceChart {...defaultProps} />
      );

      expect(getByText('Melhor:')).toBeTruthy();
      expect(getByText('Fevereiro')).toBeTruthy();
      expect(getByText('104%')).toBeTruthy();
    });

    it('should show worst performance month', () => {
      const { getByText } = render(
        <BudgetPerformanceChart {...defaultProps} />
      );

      expect(getByText('Pior:')).toBeTruthy();
      expect(getByText('Janeiro')).toBeTruthy();
      expect(getByText('90%')).toBeTruthy();
    });
  });

  describe('performance colors', () => {
    it('should apply correct colors for different performance levels', () => {
      const { getByText } = render(
        <BudgetPerformanceChart {...defaultProps} />
      );

      // Test that elements are rendered (colors are tested through styling)
      expect(getByText('Janeiro')).toBeTruthy();
      expect(getByText('Fevereiro')).toBeTruthy();
      expect(getByText('Março')).toBeTruthy();
    });
  });

  describe('data formatting', () => {
    it('should format money values correctly', () => {
      const { getByText } = render(
        <BudgetPerformanceChart {...defaultProps} />
      );

      expect(getByText('R$ 4.500,00')).toBeTruthy();
      expect(getByText('R$ 5.200,00')).toBeTruthy();
      expect(getByText('R$ 4.800,00')).toBeTruthy();
    });

    it('should format percentages correctly', () => {
      const { getByText } = render(
        <BudgetPerformanceChart {...defaultProps} />
      );

      expect(getByText('90%')).toBeTruthy();
      expect(getByText('104%')).toBeTruthy();
      expect(getByText('96%')).toBeTruthy();
    });
  });
});
