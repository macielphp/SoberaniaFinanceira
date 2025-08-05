// Tests for GoalRecommendationService
import { GoalRecommendationService } from '../../../../clean-architecture/domain/services/GoalRecommendationService';
import { Goal } from '../../../../clean-architecture/domain/entities/Goal';
import { Money } from '../../../../clean-architecture/shared/utils/Money';

describe('GoalRecommendationService', () => {
  let service: GoalRecommendationService;

  beforeEach(() => {
    service = new GoalRecommendationService();
  });

  describe('generateGoalRecommendations', () => {
    it('should generate recommendations based on financial profile', () => {
      const financialProfile = {
        monthlyIncome: new Money(8000, 'BRL'),
        fixedExpenses: new Money(3000, 'BRL'),
        availablePerMonth: new Money(2000, 'BRL'),
        currentSavings: new Money(15000, 'BRL'),
        age: 30,
        riskTolerance: 'moderado' as const
      };

      const existingGoals: Goal[] = [];

      const recommendations = service.generateGoalRecommendations(financialProfile, existingGoals);

      expect(recommendations).toBeDefined();
      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations[0]).toHaveProperty('type');
      expect(recommendations[0]).toHaveProperty('targetValue');
      expect(recommendations[0]).toHaveProperty('priority');
      expect(recommendations[0]).toHaveProperty('timeline');
    });

    it('should prioritize emergency fund for users without savings', () => {
      const financialProfile = {
        monthlyIncome: new Money(5000, 'BRL'),
        fixedExpenses: new Money(2500, 'BRL'),
        availablePerMonth: new Money(1000, 'BRL'),
        currentSavings: new Money(0, 'BRL'),
        age: 25,
        riskTolerance: 'conservador' as const
      };

      const existingGoals: Goal[] = [];

      const recommendations = service.generateGoalRecommendations(financialProfile, existingGoals);

      const emergencyFundGoal = recommendations.find(rec => rec.type === 'emergency_fund' as any);
      expect(emergencyFundGoal).toBeDefined();
      expect(emergencyFundGoal!.priority).toBe(1);
      expect(emergencyFundGoal!.targetValue.value).toBe(15000); // 3 meses de despesas
    });

    it('should suggest retirement planning for users over 35', () => {
      const financialProfile = {
        monthlyIncome: new Money(10000, 'BRL'),
        fixedExpenses: new Money(4000, 'BRL'),
        availablePerMonth: new Money(3000, 'BRL'),
        currentSavings: new Money(50000, 'BRL'),
        age: 38,
        riskTolerance: 'moderado' as const
      };

      const existingGoals: Goal[] = [];

      const recommendations = service.generateGoalRecommendations(financialProfile, existingGoals);

      const retirementGoal = recommendations.find(rec => rec.type === 'retirement' as any);
      expect(retirementGoal).toBeDefined();
      expect(retirementGoal!.priority).toBeLessThanOrEqual(3);
    });

    it('should avoid duplicate recommendations for existing goals', () => {
      const financialProfile = {
        monthlyIncome: new Money(8000, 'BRL'),
        fixedExpenses: new Money(3000, 'BRL'),
        availablePerMonth: new Money(2000, 'BRL'),
        currentSavings: new Money(20000, 'BRL'),
        age: 30,
        riskTolerance: 'moderado' as const
      };

      const existingGoals = [
        new Goal({
          id: 'goal-1',
          description: 'Fundo de emergência',
          type: 'economia' as any,
          targetValue: new Money(15000, 'BRL'),
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31'),
          monthlyIncome: new Money(8000, 'BRL'),
          fixedExpenses: new Money(3000, 'BRL'),
          availablePerMonth: new Money(2000, 'BRL'),
          importance: 'alta' as any,
          priority: 1,
          monthlyContribution: new Money(1250, 'BRL'),
          numParcela: 12,
          status: 'active' as any,
          userId: 'user1'
        })
      ];

      const recommendations = service.generateGoalRecommendations(financialProfile, existingGoals);

      const emergencyFundRecommendation = recommendations.find(rec => rec.type === 'emergency_fund' as any);
      expect(emergencyFundRecommendation).toBeUndefined();
    });
  });

  describe('suggestGoalTimeline', () => {
    it('should suggest appropriate timeline based on goal value and available income', () => {
      const goalValue = new Money(50000, 'BRL');
      const availablePerMonth = new Money(2000, 'BRL');
      const goalType = 'house_purchase' as const;

      const timeline = service.suggestGoalTimeline(goalValue, availablePerMonth, goalType);

      expect(timeline).toBeDefined();
      expect(timeline.months).toBeGreaterThan(0);
      expect(timeline.monthlyContribution.value).toBeLessThanOrEqual(availablePerMonth.value);
    });

    it('should suggest longer timeline for high-value goals', () => {
      const goalValue = new Money(200000, 'BRL');
      const availablePerMonth = new Money(3000, 'BRL');
      const goalType = 'house_purchase' as const;

      const timeline = service.suggestGoalTimeline(goalValue, availablePerMonth, goalType);

      expect(timeline.months).toBeGreaterThan(24); // Pelo menos 2 anos
    });

    it('should suggest shorter timeline for emergency fund', () => {
      const goalValue = new Money(15000, 'BRL');
      const availablePerMonth = new Money(2000, 'BRL');
      const goalType = 'emergency_fund' as const;

      const timeline = service.suggestGoalTimeline(goalValue, availablePerMonth, goalType);

      expect(timeline.months).toBeLessThanOrEqual(12); // Máximo 1 ano
    });
  });

  describe('calculateOptimalGoalValue', () => {
    it('should calculate optimal goal value based on income and timeline', () => {
      const monthlyIncome = new Money(8000, 'BRL');
      const timeline = 24; // 2 anos
      const goalType = 'investment' as const;

      const optimalValue = service.calculateOptimalGoalValue(monthlyIncome, timeline, goalType);

      expect(optimalValue.value).toBeGreaterThan(0);
      expect(optimalValue.currency).toBe('BRL');
    });

    it('should consider risk tolerance in calculation', () => {
      const monthlyIncome = new Money(8000, 'BRL');
      const timeline = 12;
      const goalType = 'investment' as const;

      const conservativeValue = service.calculateOptimalGoalValue(monthlyIncome, timeline, goalType, 'conservador');
      const aggressiveValue = service.calculateOptimalGoalValue(monthlyIncome, timeline, goalType, 'agressivo');

      expect(conservativeValue.value).toBeLessThan(aggressiveValue.value);
    });
  });

  describe('prioritizeGoals', () => {
    it('should prioritize goals based on importance and financial situation', () => {
      const goals = [
        {
          type: 'emergency_fund' as const,
          targetValue: new Money(15000, 'BRL'),
          priority: 1,
          timeline: { months: 12, monthlyContribution: new Money(1250, 'BRL') },
          importance: 'alta' as const,
          description: 'Fundo de emergência'
        },
        {
          type: 'vacation' as const,
          targetValue: new Money(10000, 'BRL'),
          priority: 3,
          timeline: { months: 10, monthlyContribution: new Money(1000, 'BRL') },
          importance: 'baixa' as const,
          description: 'Viagem de férias'
        },
        {
          type: 'investment' as const,
          targetValue: new Money(50000, 'BRL'),
          priority: 2,
          timeline: { months: 24, monthlyContribution: new Money(2083, 'BRL') },
          importance: 'média' as const,
          description: 'Portfólio de investimentos'
        }
      ];

      const prioritizedGoals = service.prioritizeGoals(goals);

      expect(prioritizedGoals[0].type).toBe('emergency_fund');
      expect(prioritizedGoals[0].priority).toBe(1);
    });

    it('should consider financial capacity in prioritization', () => {
      const goals = [
        {
          type: 'house_purchase' as const,
          targetValue: new Money(200000, 'BRL'),
          priority: 1,
          timeline: { months: 60, monthlyContribution: new Money(3333, 'BRL') },
          importance: 'alta' as const,
          description: 'Entrada para compra de imóvel'
        },
        {
          type: 'emergency_fund' as const,
          targetValue: new Money(15000, 'BRL'),
          priority: 2,
          timeline: { months: 12, monthlyContribution: new Money(1250, 'BRL') },
          importance: 'alta' as const,
          description: 'Fundo de emergência'
        }
      ];

      const availablePerMonth = new Money(2000, 'BRL');
      const prioritizedGoals = service.prioritizeGoals(goals, availablePerMonth);

      // Emergency fund should be prioritized over house purchase when income is limited
      expect(prioritizedGoals[0].type).toBe('emergency_fund');
    });
  });

  describe('validateRecommendationFeasibility', () => {
    it('should validate if a recommendation is feasible', () => {
      const recommendation = {
        type: 'house_purchase' as const,
        targetValue: new Money(200000, 'BRL'),
        priority: 1,
        timeline: { months: 60, monthlyContribution: new Money(3333, 'BRL') },
        importance: 'alta' as const,
        description: 'Entrada para compra de imóvel'
      };

      const financialProfile = {
        monthlyIncome: new Money(10000, 'BRL'),
        fixedExpenses: new Money(4000, 'BRL'),
        availablePerMonth: new Money(3000, 'BRL'),
        currentSavings: new Money(50000, 'BRL'),
        age: 30,
        riskTolerance: 'moderado' as const
      };

      const feasibility = service.validateRecommendationFeasibility(recommendation, financialProfile);

      expect(feasibility.isFeasible).toBeDefined();
      expect(feasibility.confidence).toBeGreaterThan(0);
      expect(feasibility.confidence).toBeLessThanOrEqual(100);
    });

    it('should mark recommendation as infeasible when monthly contribution exceeds available', () => {
      const recommendation = {
        type: 'house_purchase' as const,
        targetValue: new Money(500000, 'BRL'),
        priority: 1,
        timeline: { months: 24, monthlyContribution: new Money(20833, 'BRL') },
        importance: 'alta' as const,
        description: 'Entrada para compra de imóvel'
      };

      const financialProfile = {
        monthlyIncome: new Money(8000, 'BRL'),
        fixedExpenses: new Money(3000, 'BRL'),
        availablePerMonth: new Money(2000, 'BRL'),
        currentSavings: new Money(10000, 'BRL'),
        age: 30,
        riskTolerance: 'moderado' as const
      };

      const feasibility = service.validateRecommendationFeasibility(recommendation, financialProfile);

      expect(feasibility.isFeasible).toBe(false);
      expect(feasibility.confidence).toBeLessThan(50);
    });
  });
}); 