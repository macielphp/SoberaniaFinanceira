// Tests for GoalValidationService
import { GoalValidationService } from '../../../../clean-architecture/domain/services/GoalValidationService';
import { Goal } from '../../../../clean-architecture/domain/entities/Goal';
import { Money } from '../../../../clean-architecture/shared/utils/Money';

describe('GoalValidationService', () => {
  let service: GoalValidationService;

  beforeEach(() => {
    service = new GoalValidationService();
  });

  describe('validateGoalFeasibility', () => {
    it('should return valid when goal is financially feasible', () => {
      const goal = new Goal({
        id: 'goal-1',
        description: 'Comprar casa',
        type: 'economia' as any,
        targetValue: new Money(36000, 'BRL'), // 24 * 1500 = 36000
        startDate: new Date('2024-01-01'),
        endDate: new Date('2025-12-31'),
        monthlyIncome: new Money(8000, 'BRL'),
        fixedExpenses: new Money(3000, 'BRL'),
        availablePerMonth: new Money(2000, 'BRL'),
        importance: 'alta' as any,
        priority: 1,
        monthlyContribution: new Money(1500, 'BRL'),
        numParcela: 24,
        status: 'active' as any,
        userId: 'user1'
      });

      const result = service.validateGoalFeasibility(goal);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });

    it('should return invalid when monthly contribution exceeds available per month', () => {
      const goal = new Goal({
        id: 'goal-1',
        description: 'Comprar casa',
        type: 'economia' as any,
        targetValue: new Money(100000, 'BRL'),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2025-12-31'),
        monthlyIncome: new Money(8000, 'BRL'),
        fixedExpenses: new Money(3000, 'BRL'),
        availablePerMonth: new Money(1000, 'BRL'),
        importance: 'alta' as any,
        priority: 1,
        monthlyContribution: new Money(1500, 'BRL'),
        numParcela: 24,
        status: 'active' as any,
        userId: 'user1'
      });

      const result = service.validateGoalFeasibility(goal);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Contribuição mensal (1500) excede o disponível por mês (1000)');
    });

    it('should return invalid when total contribution is insufficient', () => {
      const goal = new Goal({
        id: 'goal-1',
        description: 'Comprar casa',
        type: 'economia' as any,
        targetValue: new Money(100000, 'BRL'),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2025-12-31'),
        monthlyIncome: new Money(8000, 'BRL'),
        fixedExpenses: new Money(3000, 'BRL'),
        availablePerMonth: new Money(2000, 'BRL'),
        importance: 'alta' as any,
        priority: 1,
        monthlyContribution: new Money(1000, 'BRL'),
        numParcela: 12,
        status: 'active' as any,
        userId: 'user1'
      });

      const result = service.validateGoalFeasibility(goal);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Total de contribuições (12000) é insuficiente para atingir a meta (100000)');
    });

    it('should return warning when goal deadline is too short', () => {
      const goal = new Goal({
        id: 'goal-1',
        description: 'Comprar casa',
        type: 'economia' as any,
        targetValue: new Money(60000, 'BRL'), // Meta de alto valor
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-06-30'), // Apenas 6 meses
        monthlyIncome: new Money(15000, 'BRL'),
        fixedExpenses: new Money(3000, 'BRL'),
        availablePerMonth: new Money(12000, 'BRL'), // Aumentado para acomodar a contribuição
        importance: 'alta' as any,
        priority: 1,
        monthlyContribution: new Money(10000, 'BRL'), // Contribuição alta para atingir a meta
        numParcela: 6,
        status: 'active' as any,
        userId: 'user1'
      });

      const result = service.validateGoalFeasibility(goal);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Prazo muito curto para uma meta de alto valor. Considere estender o prazo.');
    });
  });

  describe('validateGoalConflicts', () => {
    it('should detect conflicts when multiple goals exceed available budget', () => {
      const existingGoals = [
        new Goal({
          id: 'goal-1',
          description: 'Comprar casa',
          type: 'economia' as any,
          targetValue: new Money(100000, 'BRL'),
          startDate: new Date('2024-01-01'),
          endDate: new Date('2025-12-31'),
          monthlyIncome: new Money(8000, 'BRL'),
          fixedExpenses: new Money(3000, 'BRL'),
          availablePerMonth: new Money(2000, 'BRL'),
          importance: 'alta' as any,
          priority: 1,
          monthlyContribution: new Money(1500, 'BRL'),
          numParcela: 24,
          status: 'active' as any,
          userId: 'user1'
        })
      ];

      const newGoal = new Goal({
        id: 'goal-2',
        description: 'Viagem para Europa',
        type: 'compra' as any,
        targetValue: new Money(50000, 'BRL'),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        monthlyIncome: new Money(8000, 'BRL'),
        fixedExpenses: new Money(3000, 'BRL'),
        availablePerMonth: new Money(2000, 'BRL'),
        importance: 'média' as any,
        priority: 2,
        monthlyContribution: new Money(1000, 'BRL'),
        numParcela: 12,
        status: 'active' as any,
        userId: 'user1'
      });

      const result = service.validateGoalConflicts(newGoal, existingGoals);

      expect(result.hasConflicts).toBe(true);
      expect(result.conflicts).toContain('Total de contribuições mensais (2500) excede o disponível por mês (2000)');
    });

    it('should not detect conflicts when goals are within budget', () => {
      const existingGoals = [
        new Goal({
          id: 'goal-1',
          description: 'Comprar casa',
          type: 'economia' as any,
          targetValue: new Money(100000, 'BRL'),
          startDate: new Date('2024-01-01'),
          endDate: new Date('2025-12-31'),
          monthlyIncome: new Money(8000, 'BRL'),
          fixedExpenses: new Money(3000, 'BRL'),
          availablePerMonth: new Money(2000, 'BRL'),
          importance: 'alta' as any,
          priority: 1,
          monthlyContribution: new Money(1000, 'BRL'),
          numParcela: 24,
          status: 'active' as any,
          userId: 'user1'
        })
      ];

      const newGoal = new Goal({
        id: 'goal-2',
        description: 'Viagem para Europa',
        type: 'compra' as any,
        targetValue: new Money(50000, 'BRL'),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        monthlyIncome: new Money(8000, 'BRL'),
        fixedExpenses: new Money(3000, 'BRL'),
        availablePerMonth: new Money(2000, 'BRL'),
        importance: 'média' as any,
        priority: 2,
        monthlyContribution: new Money(800, 'BRL'),
        numParcela: 12,
        status: 'active' as any,
        userId: 'user1'
      });

      const result = service.validateGoalConflicts(newGoal, existingGoals);

      expect(result.hasConflicts).toBe(false);
      expect(result.conflicts).toHaveLength(0);
    });
  });

  describe('validateGoalTimeline', () => {
    it('should return valid when goal timeline is reasonable', () => {
      const goal = new Goal({
        id: 'goal-1',
        description: 'Comprar casa',
        type: 'economia' as any,
        targetValue: new Money(36000, 'BRL'), // 24 * 1500 = 36000
        startDate: new Date('2024-01-01'),
        endDate: new Date('2025-12-31'),
        monthlyIncome: new Money(8000, 'BRL'),
        fixedExpenses: new Money(3000, 'BRL'),
        availablePerMonth: new Money(2000, 'BRL'),
        importance: 'alta' as any,
        priority: 1,
        monthlyContribution: new Money(1500, 'BRL'),
        numParcela: 24,
        status: 'active' as any,
        userId: 'user1'
      });

      const result = service.validateGoalTimeline(goal);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return invalid when end date is before start date', () => {
      // Como a entidade Goal valida as datas na construção, vamos testar diretamente o método privado
      // através de uma meta válida e depois ajustar as datas
      const goal = new Goal({
        id: 'goal-1',
        description: 'Comprar casa',
        type: 'economia' as any,
        targetValue: new Money(100000, 'BRL'),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2025-12-31'),
        monthlyIncome: new Money(8000, 'BRL'),
        fixedExpenses: new Money(3000, 'BRL'),
        availablePerMonth: new Money(2000, 'BRL'),
        importance: 'alta' as any,
        priority: 1,
        monthlyContribution: new Money(1500, 'BRL'),
        numParcela: 24,
        status: 'active' as any,
        userId: 'user1'
      });

      // Simula uma data de término anterior à data de início
      const goalWithInvalidDates = {
        ...goal,
        startDate: new Date('2025-01-01'),
        endDate: new Date('2024-12-31'),
        targetValue: goal.targetValue,
        availablePerMonth: goal.availablePerMonth
      };

      const result = service.validateGoalTimeline(goalWithInvalidDates as any);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Data de término deve ser posterior à data de início');
    });

    it('should return invalid when timeline is too short for the goal value', () => {
      const goal = new Goal({
        id: 'goal-1',
        description: 'Comprar casa',
        type: 'economia' as any,
        targetValue: new Money(100000, 'BRL'),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-03-31'), // Apenas 3 meses
        monthlyIncome: new Money(8000, 'BRL'),
        fixedExpenses: new Money(3000, 'BRL'),
        availablePerMonth: new Money(2000, 'BRL'),
        importance: 'alta' as any,
        priority: 1,
        monthlyContribution: new Money(1500, 'BRL'),
        numParcela: 3,
        status: 'active' as any,
        userId: 'user1'
      });

      const result = service.validateGoalTimeline(goal);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Prazo muito curto para o valor da meta. Considere estender o prazo ou reduzir o valor');
    });
  });

  describe('validateGoalPriority', () => {
    it('should return valid when priority is within valid range', () => {
      const goal = new Goal({
        id: 'goal-1',
        description: 'Comprar casa',
        type: 'economia' as any,
        targetValue: new Money(100000, 'BRL'),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2025-12-31'),
        monthlyIncome: new Money(8000, 'BRL'),
        fixedExpenses: new Money(3000, 'BRL'),
        availablePerMonth: new Money(2000, 'BRL'),
        importance: 'alta' as any,
        priority: 3,
        monthlyContribution: new Money(1500, 'BRL'),
        numParcela: 24,
        status: 'active' as any,
        userId: 'user1'
      });

      const result = service.validateGoalPriority(goal);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return invalid when priority is out of range', () => {
      const goal = new Goal({
        id: 'goal-1',
        description: 'Comprar casa',
        type: 'economia' as any,
        targetValue: new Money(100000, 'BRL'),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2025-12-31'),
        monthlyIncome: new Money(8000, 'BRL'),
        fixedExpenses: new Money(3000, 'BRL'),
        availablePerMonth: new Money(2000, 'BRL'),
        importance: 'alta' as any,
        priority: 1,
        monthlyContribution: new Money(1500, 'BRL'),
        numParcela: 24,
        status: 'active' as any,
        userId: 'user1'
      });

      // Simula uma prioridade inválida
      const goalWithInvalidPriority = {
        ...goal,
        priority: 7
      };

      const result = service.validateGoalPriority(goalWithInvalidPriority as any);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Prioridade deve estar entre 1 e 5');
    });

    it('should detect duplicate priorities when validating multiple goals', () => {
      const goals = [
        new Goal({
          id: 'goal-1',
          description: 'Comprar casa',
          type: 'economia' as any,
          targetValue: new Money(100000, 'BRL'),
          startDate: new Date('2024-01-01'),
          endDate: new Date('2025-12-31'),
          monthlyIncome: new Money(8000, 'BRL'),
          fixedExpenses: new Money(3000, 'BRL'),
          availablePerMonth: new Money(2000, 'BRL'),
          importance: 'alta' as any,
          priority: 1,
          monthlyContribution: new Money(1500, 'BRL'),
          numParcela: 24,
          status: 'active' as any,
          userId: 'user1'
        }),
        new Goal({
          id: 'goal-2',
          description: 'Viagem para Europa',
          type: 'compra' as any,
          targetValue: new Money(50000, 'BRL'),
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31'),
          monthlyIncome: new Money(8000, 'BRL'),
          fixedExpenses: new Money(3000, 'BRL'),
          availablePerMonth: new Money(2000, 'BRL'),
          importance: 'média' as any,
          priority: 1, // Duplicate priority
          monthlyContribution: new Money(1000, 'BRL'),
          numParcela: 12,
          status: 'active' as any,
          userId: 'user1'
        })
      ];

      const result = service.validateGoalPriorities(goals);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Prioridades duplicadas encontradas: 1');
    });
  });

  describe('getValidationSummary', () => {
    it('should return comprehensive validation summary', () => {
      const goal = new Goal({
        id: 'goal-1',
        description: 'Comprar casa',
        type: 'economia' as any,
        targetValue: new Money(36000, 'BRL'), // 24 * 1500 = 36000
        startDate: new Date('2024-01-01'),
        endDate: new Date('2025-12-31'),
        monthlyIncome: new Money(8000, 'BRL'),
        fixedExpenses: new Money(3000, 'BRL'),
        availablePerMonth: new Money(2000, 'BRL'),
        importance: 'alta' as any,
        priority: 1,
        monthlyContribution: new Money(1500, 'BRL'),
        numParcela: 24,
        status: 'active' as any,
        userId: 'user1'
      });

      const summary = service.getValidationSummary(goal);

      expect(summary.isValid).toBe(true);
      expect(summary.totalErrors).toBe(0);
      expect(summary.totalWarnings).toBe(0);
      expect(summary.feasibilityScore).toBeGreaterThan(0);
      expect(summary.recommendations).toBeDefined();
    });

    it('should return validation summary with errors for invalid goal', () => {
      const goal = new Goal({
        id: 'goal-1',
        description: 'Comprar casa',
        type: 'economia' as any,
        targetValue: new Money(100000, 'BRL'),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2025-12-31'),
        monthlyIncome: new Money(8000, 'BRL'),
        fixedExpenses: new Money(3000, 'BRL'),
        availablePerMonth: new Money(1000, 'BRL'),
        importance: 'alta' as any,
        priority: 1,
        monthlyContribution: new Money(1500, 'BRL'),
        numParcela: 24,
        status: 'active' as any,
        userId: 'user1'
      });

      const summary = service.getValidationSummary(goal);

      expect(summary.isValid).toBe(false);
      expect(summary.totalErrors).toBeGreaterThan(0);
      expect(summary.feasibilityScore).toBeLessThan(100);
      expect(summary.recommendations).toHaveLength(0);
    });
  });
}); 