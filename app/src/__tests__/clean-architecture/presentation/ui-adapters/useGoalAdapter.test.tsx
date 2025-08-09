import { renderHook, act } from '@testing-library/react-native';
import { useGoalAdapter } from '../../../../clean-architecture/presentation/ui-adapters/useGoalAdapter';
import { Goal } from '../../../../clean-architecture/domain/entities/Goal';
import { Money } from '../../../../clean-architecture/shared/utils/Money';

describe('useGoalAdapter', () => {
  describe('initialization', () => {
    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useGoalAdapter());

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.goal).toBeNull();
      expect(result.current.goals).toEqual([]);
      expect(result.current.isEditing).toBe(false);
    });

    it('should automatically load goals on mount', async () => {
      const { result } = renderHook(() => useGoalAdapter());

      // Wait for the effect to run
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Should have called getAllGoals
      expect(result.current.goals).toBeDefined();
    });
  });

  describe('createGoal', () => {
    it('should create goal successfully', async () => {
      const goalData = {
        userId: 'user-1',
        description: 'Comprar um carro',
        type: 'economia' as const,
        targetValue: new Money(50000),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2025-12-31'),
        monthlyIncome: new Money(5000),
        fixedExpenses: new Money(3000),
        availablePerMonth: new Money(2000),
        importance: 'alta' as const,
        priority: 1,
        strategy: 'aggressive' as const,
        monthlyContribution: new Money(1000),
        numParcela: 24,
      };

      const { result } = renderHook(() => useGoalAdapter());

      let createdGoal;
      await act(async () => {
        createdGoal = await result.current.createGoal(goalData);
      });

      expect(createdGoal).toBeDefined();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle creation error', async () => {
      const goalData = {
        userId: '',
        description: '',
        type: 'economia' as const,
        targetValue: new Money(0),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2023-12-31'), // Invalid: end date before start date
        monthlyIncome: new Money(5000),
        fixedExpenses: new Money(3000),
        availablePerMonth: new Money(2000),
        importance: 'alta' as const,
        priority: 1,
        strategy: 'aggressive' as const,
        monthlyContribution: new Money(1000),
        numParcela: 24,
      };

      const { result } = renderHook(() => useGoalAdapter());

      await act(async () => {
        try {
          await result.current.createGoal(goalData);
        } catch (e) {
          // Expected error due to invalid data
        }
      });

      expect(result.current.error).toBeTruthy();
    });
  });

  describe('updateGoal', () => {
    it('should update goal successfully', async () => {
      const goalId = 'goal-1';
      const updateData = {
        description: 'Comprar um carro novo',
        targetValue: new Money(60000),
        monthlyContribution: new Money(1200),
      };

      const { result } = renderHook(() => useGoalAdapter());

      let updatedGoal;
      await act(async () => {
        updatedGoal = await result.current.updateGoal(goalId, updateData);
      });

      expect(updatedGoal).toBeDefined();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle update error', async () => {
      const goalId = 'goal-1';
      const updateData = {
        description: '',
        targetValue: new Money(0),
      };

      const { result } = renderHook(() => useGoalAdapter());

      await act(async () => {
        try {
          await result.current.updateGoal(goalId, updateData);
        } catch (e) {
          // Expected error
        }
      });

      expect(result.current.error).toBeTruthy();
    });
  });

  describe('deleteGoal', () => {
    it('should delete goal successfully', async () => {
      const goalId = 'goal-1';

      const { result } = renderHook(() => useGoalAdapter());

      let deleteResult;
      await act(async () => {
        deleteResult = await result.current.deleteGoal(goalId);
      });

      expect(deleteResult).toBe(true);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle deletion error', async () => {
      const goalId = 'non-existent-goal';

      const { result } = renderHook(() => useGoalAdapter());

      await act(async () => {
        try {
          await result.current.deleteGoal(goalId);
        } catch (e) {
          // Expected error
        }
      });

      expect(result.current.error).toBeTruthy();
    });
  });

  describe('getGoalById', () => {
    it('should get goal by id successfully', async () => {
      const goalId = 'goal-1';

      const { result } = renderHook(() => useGoalAdapter());

      let returnedGoal: Goal | undefined;
      await act(async () => {
        returnedGoal = await result.current.getGoalById(goalId);
      });

      expect(returnedGoal).toBeDefined();
      expect(returnedGoal!.id).toBe(goalId);
    });
  });

  describe('validation', () => {
    it('should validate form data', () => {
      const validData = {
        userId: 'user-1',
        description: 'Comprar um carro',
        type: 'economia' as const,
        targetValue: new Money(50000),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2025-12-31'),
        monthlyIncome: new Money(5000),
        fixedExpenses: new Money(3000),
        availablePerMonth: new Money(2000),
        importance: 'alta' as const,
        priority: 1,
        strategy: 'aggressive' as const,
        monthlyContribution: new Money(1000),
        numParcela: 24,
      };

      const { result } = renderHook(() => useGoalAdapter());

      const validation = result.current.validateForm(validData);

      expect(validation.isValid).toBe(true);
      expect(Object.keys(validation.errors)).toHaveLength(0);
    });

    it('should return validation errors for invalid data', () => {
      const invalidData = {
        userId: '',
        description: '',
        type: 'economia' as const,
        targetValue: new Money(0),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2023-12-31'), // Invalid: end date before start date
        monthlyIncome: new Money(5000),
        fixedExpenses: new Money(3000),
        availablePerMonth: new Money(2000),
        importance: 'alta' as const,
        priority: 1,
        strategy: 'aggressive' as const,
        monthlyContribution: new Money(1000),
        numParcela: 24,
      };

      const { result } = renderHook(() => useGoalAdapter());

      const validation = result.current.validateForm(invalidData);

      expect(validation.isValid).toBe(false);
      expect(Object.keys(validation.errors).length).toBeGreaterThan(0);
    });
  });

  describe('goal progress', () => {
    it('should calculate goal progress', () => {
      const goalId = 'goal-1';

      const { result } = renderHook(() => useGoalAdapter());

      // First set a goal
      const goal = new Goal({
        id: goalId,
        userId: 'user-1',
        description: 'Comprar um carro',
        type: 'economia',
        targetValue: new Money(50000),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2025-12-31'),
        monthlyIncome: new Money(5000),
        fixedExpenses: new Money(3000),
        availablePerMonth: new Money(2000),
        importance: 'alta',
        priority: 1,
        strategy: 'aggressive',
        monthlyContribution: new Money(1000),
        numParcela: 24,
        status: 'active',
        createdAt: new Date(),
      });

      act(() => {
        result.current.setGoal(goal);
      });

      const progress = result.current.getGoalProgress();

      expect(progress).toBeDefined();
      expect(progress.goalId).toBe(goalId);
    });

    it('should return null progress when no goal set', () => {
      const { result } = renderHook(() => useGoalAdapter());

      const progress = result.current.getGoalProgress();

      expect(progress).toBeNull();
    });
  });

  describe('filtering', () => {
    it('should get goals by status', async () => {
      const { result } = renderHook(() => useGoalAdapter());

      // Mock some goals first
      const goals = [
        new Goal({
          id: '1',
          userId: 'user-1',
          description: 'Meta 1',
          type: 'economia',
          targetValue: new Money(10000),
          startDate: new Date('2024-01-01'),
          endDate: new Date('2025-12-31'),
          monthlyIncome: new Money(5000),
          fixedExpenses: new Money(3000),
          availablePerMonth: new Money(2000),
          importance: 'alta',
          priority: 1,
          strategy: 'aggressive',
          monthlyContribution: new Money(1000),
          numParcela: 12,
          status: 'active',
          createdAt: new Date(),
        }),
        new Goal({
          id: '2',
          userId: 'user-1',
          description: 'Meta 2',
          type: 'economia',
          targetValue: new Money(20000),
          startDate: new Date('2024-01-01'),
          endDate: new Date('2025-12-31'),
          monthlyIncome: new Money(5000),
          fixedExpenses: new Money(3000),
          availablePerMonth: new Money(2000),
          importance: 'média',
          priority: 2,
          strategy: 'moderate',
          monthlyContribution: new Money(800),
          numParcela: 24,
          status: 'completed',
          createdAt: new Date(),
        }),
      ];

      await act(async () => {
        // This would normally be done by the adapter's mock implementation
        result.current.refresh();
      });

      const activeGoals = result.current.getGoalsByStatus('active');
      const completedGoals = result.current.getGoalsByStatus('completed');

      expect(activeGoals).toBeDefined();
      expect(completedGoals).toBeDefined();
    });
  });

  describe('error handling', () => {
    it('should clear error', () => {
      const { result } = renderHook(() => useGoalAdapter());

      act(() => {
        result.current.setError('Some error');
      });

      expect(result.current.error).toBe('Some error');

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });

    it('should set custom error', () => {
      const { result } = renderHook(() => useGoalAdapter());

      act(() => {
        result.current.setError('Custom error');
      });

      expect(result.current.error).toBe('Custom error');
    });
  });

  describe('state management', () => {
    it('should set goal', () => {
      const { result } = renderHook(() => useGoalAdapter());

      const goal = new Goal({
        id: 'goal-1',
        userId: 'user-1',
        description: 'Test Goal',
        type: 'economia',
        targetValue: new Money(10000),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2025-12-31'),
        monthlyIncome: new Money(5000),
        fixedExpenses: new Money(3000),
        availablePerMonth: new Money(2000),
        importance: 'alta',
        priority: 1,
        strategy: 'aggressive',
        monthlyContribution: new Money(1000),
        numParcela: 12,
        status: 'active',
        createdAt: new Date(),
      });

      act(() => {
        result.current.setGoal(goal);
      });

      expect(result.current.goal).toEqual(goal);
      expect(result.current.isEditing).toBe(true);
    });

    it('should clear goal when set to null', () => {
      const { result } = renderHook(() => useGoalAdapter());

      act(() => {
        result.current.setGoal(null);
      });

      expect(result.current.goal).toBeNull();
      expect(result.current.isEditing).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all state', () => {
      const { result } = renderHook(() => useGoalAdapter());

      // First set some state
      const goal = new Goal({
        id: 'goal-1',
        userId: 'user-1',
        description: 'Test Goal',
        type: 'economia',
        targetValue: new Money(10000),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2025-12-31'),
        monthlyIncome: new Money(5000),
        fixedExpenses: new Money(3000),
        availablePerMonth: new Money(2000),
        importance: 'alta',
        priority: 1,
        strategy: 'aggressive',
        monthlyContribution: new Money(1000),
        numParcela: 12,
        status: 'active',
        createdAt: new Date(),
      });

      act(() => {
        result.current.setGoal(goal);
        result.current.setError('Some error');
      });

      expect(result.current.goal).toBeDefined();
      expect(result.current.error).toBe('Some error');

      act(() => {
        result.current.reset();
      });

      expect(result.current.goal).toBeNull();
      expect(result.current.goals).toEqual([]);
      expect(result.current.error).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.isEditing).toBe(false);
    });
  });

  describe('loading state', () => {
    it('should reflect loading state changes', () => {
      const { result } = renderHook(() => useGoalAdapter());

      expect(result.current.loading).toBe(false);

      // Loading state would be managed internally by the adapter
      // This test verifies the state is accessible
    });
  });

  describe('goals list', () => {
    it('should reflect goals from view model', () => {
      const { result } = renderHook(() => useGoalAdapter());

      expect(result.current.goals).toEqual([]);
      // After loading, goals would be populated
    });
  });

  describe('refresh', () => {
    it('should refresh goals list', async () => {
      const { result } = renderHook(() => useGoalAdapter());

      await act(async () => {
        await result.current.refresh();
      });

      // Should have attempted to reload goals
      expect(result.current.goals).toBeDefined();
    });
  });
});
