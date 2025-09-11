// Test: GoalScreen
// Responsável por testar a tela de gerenciamento de metas
// Segue Clean Architecture - testa integração entre UI e ViewModels

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { GoalScreen } from '../../../../clean-architecture/presentation/screens/GoalScreen';
import { GoalViewModel } from '../../../../clean-architecture/presentation/view-models/GoalViewModel';
import { Goal } from '../../../../clean-architecture/domain/entities/Goal';
import { Money } from '../../../../clean-architecture/shared/utils/Money';

// Mock do Money
jest.mock('../../../../clean-architecture/shared/utils/Money', () => ({
  Money: jest.fn().mockImplementation((amount: number, currency: string = 'BRL') => ({
    value: amount,
    currency,
    format: () => `R$ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    toString: () => `R$ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  })),
}));

// Mock GoalViewModel
const mockGoalViewModel = {
  loading: false,
  error: null as string | null,
  goals: [] as Goal[],
  createGoal: jest.fn(),
  updateGoal: jest.fn(),
  deleteGoal: jest.fn(),
  getGoalById: jest.fn(),
  getAllGoals: jest.fn(),
  clearError: jest.fn(),
  setError: jest.fn(),
};

// Mock do GoalViewModel constructor
jest.mock('../../../../clean-architecture/presentation/view-models/GoalViewModel', () => ({
  GoalViewModel: jest.fn(() => mockGoalViewModel),
}));

// Mock Goal entity
const mockGoal = new Goal({
  id: 'goal-1',
  userId: 'user-1',
  description: 'Comprar um carro',
  type: 'compra',
  targetValue: new Money(50000.00, 'BRL'),
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-12-31'),
  monthlyIncome: new Money(5000.00, 'BRL'),
  fixedExpenses: new Money(3000.00, 'BRL'),
  availablePerMonth: new Money(2000.00, 'BRL'),
  importance: 'alta',
  priority: 1,
  strategy: 'Economizar mensalmente',
  monthlyContribution: new Money(1500.00, 'BRL'),
  numParcela: 12,
  status: 'active',
  createdAt: new Date('2024-01-01'),
});

const mockGoals = [
  mockGoal,
  new Goal({
    id: 'goal-2',
    userId: 'user-1',
    description: 'Viagem para Europa',
    type: 'economia',
    targetValue: new Money(15000.00, 'BRL'),
    startDate: new Date('2024-02-01'),
    endDate: new Date('2024-08-31'),
    monthlyIncome: new Money(5000.00, 'BRL'),
    fixedExpenses: new Money(3000.00, 'BRL'),
    availablePerMonth: new Money(2000.00, 'BRL'),
    importance: 'média',
    priority: 2,
    strategy: 'Guardar dinheiro extra',
    monthlyContribution: new Money(500.00, 'BRL'),
    numParcela: 6,
    status: 'active',
    createdAt: new Date('2024-02-01'),
  }),
];

// Mock navigation functions
const mockNavigation = {
  onNavigateToCreate: jest.fn(),
  onNavigateToEdit: jest.fn(),
  onNavigateToDetail: jest.fn(),
};

describe('GoalScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGoalViewModel.goals = [];
    mockGoalViewModel.loading = false;
    mockGoalViewModel.error = null;
  });

  describe('rendering', () => {
    it('should render goal screen correctly', () => {
      const { getByTestId } = render(
        <GoalScreen 
          userId="user-1" 
          {...mockNavigation}
        />
      );
      
      expect(getByTestId('goal-screen')).toBeTruthy();
    });

    it('should display screen title', () => {
      const { getByText } = render(
        <GoalScreen 
          userId="user-1" 
          {...mockNavigation}
        />
      );
      
      expect(getByText('Metas')).toBeTruthy();
    });

    it('should display create goal button', () => {
      const { getByText } = render(
        <GoalScreen 
          userId="user-1" 
          {...mockNavigation}
        />
      );
      
      expect(getByText('Nova Meta')).toBeTruthy();
    });

    it('should render goal list', () => {
      const { getByTestId } = render(
        <GoalScreen 
          userId="user-1" 
          {...mockNavigation}
        />
      );
      
      expect(getByTestId('goal-list')).toBeTruthy();
    });

    it('should render loading state', () => {
      mockGoalViewModel.loading = true;
      
      const { getByTestId } = render(
        <GoalScreen 
          userId="user-1" 
          {...mockNavigation}
        />
      );
      
      expect(getByTestId('loading-indicator')).toBeTruthy();
    });

    it('should render error state', async () => {
      mockGoalViewModel.error = 'Erro ao carregar metas';
      
      const { getByText } = render(
        <GoalScreen 
          userId="user-1" 
          {...mockNavigation}
        />
      );
      
      await waitFor(() => {
        expect(getByText('Erro ao carregar metas')).toBeTruthy();
      });
    });

    it('should render empty state when no goals', () => {
      mockGoalViewModel.goals = [];
      
      const { getByTestId } = render(
        <GoalScreen 
          userId="user-1" 
          {...mockNavigation}
        />
      );
      
      expect(getByTestId('goal-list')).toBeTruthy();
    });

    it('should render goal list when goals exist', () => {
      mockGoalViewModel.goals = mockGoals;
      
      const { getByTestId } = render(
        <GoalScreen 
          userId="user-1" 
          {...mockNavigation}
        />
      );
      
      expect(getByTestId('goal-list')).toBeTruthy();
    });
  });

  describe('interactions', () => {
    it('should call getAllGoals on mount', () => {
      render(
        <GoalScreen 
          userId="user-1" 
          {...mockNavigation}
        />
      );
      
      expect(mockGoalViewModel.getAllGoals).toHaveBeenCalled();
    });

    it('should call clearError on unmount', () => {
      const { unmount } = render(
        <GoalScreen 
          userId="user-1" 
          {...mockNavigation}
        />
      );
      
      unmount();
      
      expect(mockGoalViewModel.clearError).toHaveBeenCalled();
    });

    it('should navigate to create goal when button is pressed', () => {
      const { getByText } = render(
        <GoalScreen 
          userId="user-1" 
          {...mockNavigation}
        />
      );
      
      fireEvent.press(getByText('Nova Meta'));
      
      expect(mockNavigation.onNavigateToCreate).toHaveBeenCalled();
    });

    it('should render goal list with data', () => {
      mockGoalViewModel.goals = [mockGoal];
      
      const { getByTestId } = render(
        <GoalScreen 
          userId="user-1" 
          {...mockNavigation}
        />
      );
      
      expect(getByTestId('goal-list')).toBeTruthy();
    });
  });

  describe('accessibility', () => {
    it('should have proper accessibility labels', () => {
      const { getByLabelText } = render(
        <GoalScreen 
          userId="user-1" 
          {...mockNavigation}
        />
      );
      
      expect(getByLabelText('Lista de metas')).toBeTruthy();
      expect(getByLabelText('Criar nova meta')).toBeTruthy();
    });

    it('should have proper accessibility hints', () => {
      const { getByLabelText } = render(
        <GoalScreen 
          userId="user-1" 
          {...mockNavigation}
        />
      );
      
      expect(getByLabelText('Criar nova meta')).toBeTruthy();
    });
  });

  describe('error handling', () => {
    it('should display error message when error occurs', async () => {
      mockGoalViewModel.error = 'Erro ao carregar metas';
      
      const { getByText } = render(
        <GoalScreen 
          userId="user-1" 
          {...mockNavigation}
        />
      );
      
      await waitFor(() => {
        expect(getByText('Erro ao carregar metas')).toBeTruthy();
      });
    });

    it('should clear error when retry is pressed', async () => {
      mockGoalViewModel.error = 'Erro ao carregar metas';
      
      const { getByText } = render(
        <GoalScreen 
          userId="user-1" 
          {...mockNavigation}
        />
      );
      
      await waitFor(() => {
        expect(getByText('Erro ao carregar metas')).toBeTruthy();
      });
      
      fireEvent.press(getByText('Tentar novamente'));
      
      expect(mockGoalViewModel.clearError).toHaveBeenCalled();
    });
  });
});
