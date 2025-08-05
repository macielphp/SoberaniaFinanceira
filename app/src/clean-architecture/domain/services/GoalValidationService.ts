// Domain Service: GoalValidationService
// Responsável por validações de negócio específicas para metas

import { Goal } from '../entities/Goal';
import { Money } from '../../shared/utils/Money';

// Interfaces para resultados de validação
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ConflictValidationResult {
  hasConflicts: boolean;
  conflicts: string[];
}

export interface ValidationSummary {
  isValid: boolean;
  totalErrors: number;
  totalWarnings: number;
  feasibilityScore: number;
  recommendations: string[];
}

export class GoalValidationService {
  /**
   * Valida a viabilidade financeira de uma meta
   * @param goal - A meta a ser validada
   * @returns Resultado da validação
   */
  validateGoalFeasibility(goal: Goal): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Verifica se a contribuição mensal não excede o disponível
    if (goal.monthlyContribution.value > goal.availablePerMonth.value) {
      errors.push(`Contribuição mensal (${goal.monthlyContribution.value}) excede o disponível por mês (${goal.availablePerMonth.value})`);
    }

    // Verifica se o total de contribuições é suficiente
    const totalContribution = goal.monthlyContribution.value * goal.numParcela;
    if (totalContribution < goal.targetValue.value) {
      errors.push(`Total de contribuições (${totalContribution}) é insuficiente para atingir a meta (${goal.targetValue.value})`);
    }

    // Verifica se o prazo é adequado para o valor da meta
    const monthsDiff = this.calculateMonthsDifference(goal.startDate, goal.endDate);
    const monthlyRequired = goal.targetValue.value / monthsDiff;
    
    if (goal.targetValue.value > 50000 && monthsDiff < 12) {
      warnings.push('Prazo muito curto para uma meta de alto valor. Considere estender o prazo.');
    }

    if (monthlyRequired > goal.availablePerMonth.value * 0.8) {
      warnings.push('Meta pode ser muito agressiva para sua capacidade financeira atual.');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Valida conflitos entre metas existentes e uma nova meta
   * @param newGoal - A nova meta a ser validada
   * @param existingGoals - Lista de metas existentes
   * @returns Resultado da validação de conflitos
   */
  validateGoalConflicts(newGoal: Goal, existingGoals: Goal[]): ConflictValidationResult {
    const conflicts: string[] = [];
    const activeGoals = existingGoals.filter(goal => goal.status === 'active');

    // Calcula total de contribuições mensais
    const totalMonthlyContribution = activeGoals.reduce((total, goal) => {
      return total + goal.monthlyContribution.value;
    }, 0) + newGoal.monthlyContribution.value;

    // Verifica se excede o disponível por mês
    if (totalMonthlyContribution > newGoal.availablePerMonth.value) {
      conflicts.push(`Total de contribuições mensais (${totalMonthlyContribution}) excede o disponível por mês (${newGoal.availablePerMonth.value})`);
    }

    // Verifica se há metas com o mesmo tipo e período sobreposto
    const overlappingGoals = activeGoals.filter(goal => {
      return goal.type === newGoal.type && 
             this.hasDateOverlap(goal, newGoal);
    });

    if (overlappingGoals.length > 0) {
      conflicts.push(`Existe outra meta do tipo "${newGoal.type}" no mesmo período`);
    }

    return {
      hasConflicts: conflicts.length > 0,
      conflicts
    };
  }

  /**
   * Valida a timeline de uma meta
   * @param goal - A meta a ser validada
   * @returns Resultado da validação
   */
  validateGoalTimeline(goal: Goal): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Verifica se a data de término é posterior à data de início
    if (goal.endDate <= goal.startDate) {
      errors.push('Data de término deve ser posterior à data de início');
    }

    // Verifica se o prazo é adequado para o valor da meta
    const monthsDiff = this.calculateMonthsDifference(goal.startDate, goal.endDate);
    const monthlyRequired = goal.targetValue.value / monthsDiff;

    // Só gera erro se o monthly required for muito maior que o disponível
    if (monthlyRequired > goal.availablePerMonth.value * 1.5) {
      errors.push('Prazo muito curto para o valor da meta. Considere estender o prazo ou reduzir o valor');
    }

    // Verifica se o prazo é muito longo
    if (monthsDiff > 60) { // 5 anos
      warnings.push('Prazo muito longo pode afetar a motivação. Considere metas intermediárias.');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Valida a prioridade de uma meta
   * @param goal - A meta a ser validada
   * @returns Resultado da validação
   */
  validateGoalPriority(goal: Goal): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Verifica se a prioridade está no range válido
    if (goal.priority < 1 || goal.priority > 5) {
      errors.push('Prioridade deve estar entre 1 e 5');
    }

    // Verifica se a prioridade é adequada para a importância
    if (goal.importance === 'alta' && goal.priority > 2) {
      warnings.push('Meta de alta importância deveria ter prioridade 1 ou 2');
    }

    if (goal.importance === 'baixa' && goal.priority <= 2) {
      warnings.push('Meta de baixa importância não deveria ter prioridade alta');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Valida prioridades de múltiplas metas
   * @param goals - Lista de metas a serem validadas
   * @returns Resultado da validação
   */
  validateGoalPriorities(goals: Goal[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const priorities = goals.map(goal => goal.priority);
    const duplicatePriorities = priorities.filter((priority, index) => 
      priorities.indexOf(priority) !== index
    );

    if (duplicatePriorities.length > 0) {
      const uniqueDuplicates = [...new Set(duplicatePriorities)];
      errors.push(`Prioridades duplicadas encontradas: ${uniqueDuplicates.join(', ')}`);
    }

    // Verifica se há gaps nas prioridades
    const sortedPriorities = [...priorities].sort((a, b) => a - b);
    const expectedPriorities = Array.from({ length: goals.length }, (_, i) => i + 1);
    
    const hasGaps = sortedPriorities.some((priority, index) => priority !== expectedPriorities[index]);
    if (hasGaps) {
      warnings.push('Há gaps nas prioridades. Considere reordenar as metas.');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Retorna um resumo completo da validação de uma meta
   * @param goal - A meta a ser analisada
   * @returns Resumo da validação
   */
  getValidationSummary(goal: Goal): ValidationSummary {
    const feasibilityResult = this.validateGoalFeasibility(goal);
    const timelineResult = this.validateGoalTimeline(goal);
    const priorityResult = this.validateGoalPriority(goal);

    const allErrors = [
      ...feasibilityResult.errors,
      ...timelineResult.errors,
      ...priorityResult.errors
    ];

    const allWarnings = [
      ...feasibilityResult.warnings,
      ...timelineResult.warnings,
      ...priorityResult.warnings
    ];

    const isOverallValid = allErrors.length === 0;

    // Calcula score de viabilidade (0-100)
    let feasibilityScore = 100;
    
    if (goal.monthlyContribution.value > goal.availablePerMonth.value) {
      feasibilityScore -= 30;
    }
    
    if (goal.monthlyContribution.value * goal.numParcela < goal.targetValue.value) {
      feasibilityScore -= 25;
    }

    const monthsDiff = this.calculateMonthsDifference(goal.startDate, goal.endDate);
    const monthlyRequired = goal.targetValue.value / monthsDiff;
    
    if (monthlyRequired > goal.availablePerMonth.value * 0.8) {
      feasibilityScore -= 15;
    }

    if (goal.priority < 1 || goal.priority > 5) {
      feasibilityScore -= 10;
    }

    feasibilityScore = Math.max(0, feasibilityScore);

    // Gera recomendações
    const recommendations: string[] = [];
    
    if (isOverallValid && feasibilityScore < 80) {
      recommendations.push('Meta viável, mas considere ajustes para melhorar a probabilidade de sucesso');
    }

    if (isOverallValid && goal.monthlyContribution.value > goal.availablePerMonth.value * 0.9) {
      recommendations.push('Considere reduzir a contribuição mensal para ter uma margem de segurança');
    }

    if (isOverallValid && monthsDiff > 36) {
      recommendations.push('Para metas de longo prazo, considere criar metas intermediárias');
    }

    return {
      isValid: isOverallValid,
      totalErrors: allErrors.length,
      totalWarnings: allWarnings.length,
      feasibilityScore,
      recommendations
    };
  }

  /**
   * Calcula a diferença em meses entre duas datas
   * @param startDate - Data de início
   * @param endDate - Data de término
   * @returns Número de meses
   */
  private calculateMonthsDifference(startDate: Date, endDate: Date): number {
    const monthsDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                      (endDate.getMonth() - startDate.getMonth());
    return Math.max(1, monthsDiff);
  }

  /**
   * Verifica se duas metas têm períodos sobrepostos
   * @param goal1 - Primeira meta
   * @param goal2 - Segunda meta
   * @returns true se há sobreposição
   */
  private hasDateOverlap(goal1: Goal, goal2: Goal): boolean {
    return goal1.startDate <= goal2.endDate && goal2.startDate <= goal1.endDate;
  }
} 