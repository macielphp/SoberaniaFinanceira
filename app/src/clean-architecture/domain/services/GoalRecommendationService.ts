// Domain Service: GoalRecommendationService
// Responsável por gerar recomendações de metas baseadas no perfil financeiro

import { Goal } from '../entities/Goal';
import { Money } from '../../shared/utils/Money';

// Interfaces para o service
export interface FinancialProfile {
  monthlyIncome: Money;
  fixedExpenses: Money;
  availablePerMonth: Money;
  currentSavings: Money;
  age: number;
  riskTolerance: 'conservador' | 'moderado' | 'agressivo';
}

export interface GoalRecommendation {
  type: GoalTypeValue;
  targetValue: Money;
  priority: number;
  timeline: GoalTimeline;
  importance: 'alta' | 'média' | 'baixa';
  description: string;
}

export interface GoalTimeline {
  months: number;
  monthlyContribution: Money;
}

export interface GoalType {
  type: string;
  targetValue: Money;
  importance: 'alta' | 'média' | 'baixa';
}

export interface RecommendationFeasibility {
  isFeasible: boolean;
  confidence: number;
  reasons: string[];
}

export type GoalTypeValue = 
  | 'emergency_fund'
  | 'retirement'
  | 'house_purchase'
  | 'investment'
  | 'vacation'
  | 'education'
  | 'vehicle'
  | 'business';

export class GoalRecommendationService {
  /**
   * Gera recomendações de metas baseadas no perfil financeiro
   * @param financialProfile - Perfil financeiro do usuário
   * @param existingGoals - Metas existentes para evitar duplicatas
   * @returns Lista de recomendações
   */
  generateGoalRecommendations(financialProfile: FinancialProfile, existingGoals: Goal[]): GoalRecommendation[] {
    const recommendations: GoalRecommendation[] = [];
    const existingGoalTypes = existingGoals.map(goal => goal.type);

    // 1. Fundo de emergência (prioridade máxima se não existir)
    // Verifica se já existe uma meta de economia que pode ser considerada fundo de emergência
    const hasEmergencyFund = existingGoals.some(goal => 
      goal.type === 'economia' && 
      goal.description.toLowerCase().includes('emergência') ||
      goal.description.toLowerCase().includes('emergencia')
    );
    
    if (!hasEmergencyFund) {
      const emergencyFundValue = this.calculateEmergencyFundValue(financialProfile);
      const timeline = this.suggestGoalTimeline(emergencyFundValue, financialProfile.availablePerMonth, 'emergency_fund');
      
      recommendations.push({
        type: 'emergency_fund' as any,
        targetValue: emergencyFundValue,
        priority: 1,
        timeline,
        importance: 'alta',
        description: 'Fundo de emergência para 3-6 meses de despesas'
      });
    }

    // 2. Aposentadoria (para usuários com mais de 30 anos)
    if (financialProfile.age > 30 && !existingGoalTypes.includes('retirement' as any)) {
      const retirementValue = this.calculateRetirementValue(financialProfile);
      const timeline = this.suggestGoalTimeline(retirementValue, financialProfile.availablePerMonth, 'retirement');
      
      recommendations.push({
        type: 'retirement' as any,
        targetValue: retirementValue,
        priority: 2,
        timeline,
        importance: 'alta',
        description: 'Planejamento para aposentadoria'
      });
    }

    // 3. Investimentos (baseado no perfil de risco)
    if (!existingGoalTypes.includes('investment' as any)) {
      const investmentValue = this.calculateOptimalGoalValue(
        financialProfile.monthlyIncome, 
        24, 
        'investment', 
        financialProfile.riskTolerance
      );
      const timeline = this.suggestGoalTimeline(investmentValue, financialProfile.availablePerMonth, 'investment');
      
      recommendations.push({
        type: 'investment' as any,
        targetValue: investmentValue,
        priority: 3,
        timeline,
        importance: 'média',
        description: 'Portfólio de investimentos diversificado'
      });
    }

    // 4. Metas específicas baseadas na idade e renda
    if (financialProfile.age < 40 && !existingGoalTypes.includes('house_purchase' as any)) {
      const houseValue = this.calculateOptimalGoalValue(
        financialProfile.monthlyIncome, 
        60, 
        'house_purchase'
      );
      const timeline = this.suggestGoalTimeline(houseValue, financialProfile.availablePerMonth, 'house_purchase');
      
      recommendations.push({
        type: 'house_purchase' as any,
        targetValue: houseValue,
        priority: 4,
        timeline,
        importance: 'alta',
        description: 'Entrada para compra de imóvel'
      });
    }

    // 5. Metas de lazer (prioridade menor)
    if (!existingGoalTypes.includes('vacation' as any)) {
      const vacationValue = new Money(financialProfile.monthlyIncome.value * 0.5, 'BRL');
      const timeline = this.suggestGoalTimeline(vacationValue, financialProfile.availablePerMonth, 'vacation');
      
      recommendations.push({
        type: 'vacation' as any,
        targetValue: vacationValue,
        priority: 5,
        timeline,
        importance: 'baixa',
        description: 'Viagem de férias'
      });
    }

    return this.prioritizeGoals(recommendations, financialProfile.availablePerMonth);
  }

  /**
   * Sugere timeline para uma meta baseada no valor e renda disponível
   * @param goalValue - Valor da meta
   * @param availablePerMonth - Renda disponível por mês
   * @param goalType - Tipo da meta
   * @returns Timeline sugerida
   */
  suggestGoalTimeline(goalValue: Money, availablePerMonth: Money, goalType: GoalTypeValue): GoalTimeline {
    let months: number;
    let monthlyContribution: Money;

    switch (goalType) {
      case 'emergency_fund':
        // Fundo de emergência: máximo 12 meses
        months = Math.min(12, Math.ceil(goalValue.value / availablePerMonth.value));
        break;
      
      case 'retirement':
        // Aposentadoria: longo prazo (10-30 anos)
        months = Math.max(120, Math.ceil(goalValue.value / availablePerMonth.value));
        break;
      
      case 'house_purchase':
        // Compra de casa: 3-10 anos
        months = Math.max(36, Math.min(120, Math.ceil(goalValue.value / availablePerMonth.value)));
        break;
      
      case 'investment':
        // Investimentos: médio prazo (2-5 anos)
        months = Math.max(24, Math.min(60, Math.ceil(goalValue.value / availablePerMonth.value)));
        break;
      
      default:
        // Outras metas: 6-24 meses
        months = Math.max(6, Math.min(24, Math.ceil(goalValue.value / availablePerMonth.value)));
    }

    monthlyContribution = new Money(Math.ceil(goalValue.value / months), 'BRL');
    
    // Garante que a contribuição não exceda o disponível
    if (monthlyContribution.value > availablePerMonth.value) {
      monthlyContribution = new Money(availablePerMonth.value, 'BRL');
      months = Math.ceil(goalValue.value / monthlyContribution.value);
    }

    return { months, monthlyContribution };
  }

  /**
   * Calcula valor ótimo para uma meta baseado na renda e timeline
   * @param monthlyIncome - Renda mensal
   * @param timeline - Timeline em meses
   * @param goalType - Tipo da meta
   * @param riskTolerance - Tolerância ao risco
   * @returns Valor ótimo
   */
  calculateOptimalGoalValue(
    monthlyIncome: Money, 
    timeline: number, 
    goalType: GoalTypeValue,
    riskTolerance: 'conservador' | 'moderado' | 'agressivo' = 'moderado'
  ): Money {
    let percentage: number;

    switch (goalType) {
      case 'emergency_fund':
        percentage = 0.15; // 15% da renda
        break;
      
      case 'retirement':
        percentage = riskTolerance === 'conservador' ? 0.20 : 0.15; // 15-20% da renda
        break;
      
      case 'house_purchase':
        percentage = 0.25; // 25% da renda
        break;
      
      case 'investment':
        percentage = riskTolerance === 'agressivo' ? 0.30 : 0.20; // 20-30% da renda
        break;
      
      default:
        percentage = 0.10; // 10% da renda
    }

    const monthlyContribution = monthlyIncome.value * percentage;
    const totalValue = monthlyContribution * timeline;
    
    return new Money(Math.round(totalValue), 'BRL');
  }

  /**
   * Prioriza metas baseado na importância e capacidade financeira
   * @param goals - Lista de metas
   * @param availablePerMonth - Renda disponível
   * @returns Metas priorizadas
   */
  prioritizeGoals(goals: GoalRecommendation[], availablePerMonth?: Money): GoalRecommendation[] {
    return goals.sort((a, b) => {
      // Se há limitação de renda, prioriza metas menores
      if (availablePerMonth) {
        const aFeasibility = a.timeline.monthlyContribution.value <= availablePerMonth.value;
        const bFeasibility = b.timeline.monthlyContribution.value <= availablePerMonth.value;
        
        if (aFeasibility && !bFeasibility) return -1;
        if (!aFeasibility && bFeasibility) return 1;
      }

      // Primeiro por importância
      const importanceOrder = { 'alta': 3, 'média': 2, 'baixa': 1 };
      const importanceDiff = importanceOrder[b.importance] - importanceOrder[a.importance];
      
      if (importanceDiff !== 0) return importanceDiff;

      // Depois por prioridade
      return a.priority - b.priority;
    });
  }

  /**
   * Valida se uma recomendação é viável
   * @param recommendation - Recomendação a ser validada
   * @param financialProfile - Perfil financeiro
   * @returns Resultado da validação
   */
  validateRecommendationFeasibility(
    recommendation: GoalRecommendation, 
    financialProfile: FinancialProfile
  ): RecommendationFeasibility {
    const reasons: string[] = [];
    let confidence = 100;

    // Verifica se a contribuição mensal é viável
    if (recommendation.timeline.monthlyContribution.value > financialProfile.availablePerMonth.value) {
      reasons.push('Contribuição mensal excede a renda disponível');
      confidence -= 50;
    }

    // Verifica se o valor total é realista
    if (recommendation.targetValue.value > financialProfile.monthlyIncome.value * 100) {
      reasons.push('Valor da meta muito alto em relação à renda');
      confidence -= 30;
    }

    // Verifica se o prazo é adequado
    if (recommendation.timeline.months > 120) { // Mais de 10 anos
      reasons.push('Prazo muito longo pode afetar a motivação');
      confidence -= 20;
    }

    // Verifica se há sobreposição com metas existentes
    if (recommendation.timeline.monthlyContribution.value > financialProfile.availablePerMonth.value * 0.8) {
      reasons.push('Pouca margem para outras metas');
      confidence -= 10;
    }

    return {
      isFeasible: confidence >= 60,
      confidence: Math.max(0, confidence),
      reasons
    };
  }

  /**
   * Calcula valor do fundo de emergência baseado nas despesas
   * @param financialProfile - Perfil financeiro
   * @returns Valor recomendado
   */
  private calculateEmergencyFundValue(financialProfile: FinancialProfile): Money {
    const monthlyExpenses = financialProfile.fixedExpenses.value;
    const emergencyMonths = financialProfile.currentSavings.value === 0 ? 6 : 3;
    return new Money(monthlyExpenses * emergencyMonths, 'BRL');
  }

  /**
   * Calcula valor para aposentadoria baseado na idade e renda
   * @param financialProfile - Perfil financeiro
   * @returns Valor recomendado
   */
  private calculateRetirementValue(financialProfile: FinancialProfile): Money {
    const yearsToRetirement = Math.max(65 - financialProfile.age, 20);
    const monthlyContribution = financialProfile.monthlyIncome.value * 0.15;
    const totalValue = monthlyContribution * 12 * yearsToRetirement;
    return new Money(Math.round(totalValue), 'BRL');
  }
} 