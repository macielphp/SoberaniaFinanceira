import { getMonthlyFinanceSummaryByUserAndMonth } from '../database/monthly-finance-summary';
import { updateMonthlyFinanceSummary as updateMonthlyFinanceSummaryService } from '../services/FinanceService';
import { Goal } from '../database/goals';

export interface GoalStrategy {
  suggestedMonths: number;
  monthlyContribution: number;
  isFeasible: boolean;
  message: string;
}

/**
 * Calcula a estratégia sugerida para uma meta baseada no valor disponível
 */
export function calculateGoalStrategy(
  targetValue: number,
  availablePerMonth: number
): GoalStrategy {
  // Estratégia padrão: usar 100% do valor disponível
  const suggestedMonths = Math.ceil(targetValue / availablePerMonth);
  const monthlyContribution = targetValue / suggestedMonths;
  
  // Verifica se é viável
  const isFeasible = monthlyContribution <= availablePerMonth;
  
  let message = '';
  if (isFeasible) {
    message = `${suggestedMonths}x de ${monthlyContribution.toFixed(2)} = ${targetValue.toFixed(2)} -> ${suggestedMonths} ${suggestedMonths === 1 ? 'mês' : 'meses'} de contribuição`;
  } else {
    message = `Valor por parcela (${monthlyContribution.toFixed(2)}) maior que o disponível (${availablePerMonth.toFixed(2)})`;
  }
  
  return {
    suggestedMonths,
    monthlyContribution,
    isFeasible,
    message
  };
}

/**
 * Valida se uma meta pode ser criada com base no número de parcelas escolhido
 */
export function validateGoalParcels(
  targetValue: number,
  numParcels: number,
  availablePerMonth: number
): { isValid: boolean; message: string; monthlyContribution: number } {
  if (numParcels <= 0) {
    return {
      isValid: false,
      message: 'Número de parcelas deve ser maior que zero',
      monthlyContribution: 0
    };
  }
  
  const monthlyContribution = targetValue / numParcels;
  
  if (monthlyContribution > availablePerMonth) {
    return {
      isValid: false,
      message: `Valor por parcela (${monthlyContribution.toFixed(2)}) maior que o disponível (${availablePerMonth.toFixed(2)})`,
      monthlyContribution
    };
  }
  
  return {
    isValid: true,
    message: `Contribuição mensal: ${monthlyContribution.toFixed(2)}`,
    monthlyContribution
  };
}

/**
 * Verifica se o usuário pode criar metas (deve ter orçamento ativo)
 */
export async function canCreateGoal(userId: string, month: string): Promise<{ canCreate: boolean; message: string }> {
  try {
    console.log('🔍 DEBUG canCreateGoal:', { userId, month });
    const summary = await getMonthlyFinanceSummaryByUserAndMonth(userId, month + '-01');
    console.log('  summary encontrado:', summary);
    
    if (!summary) {
      console.log('  Retornando: não pode criar (sem summary)');
      return {
        canCreate: false,
        message: 'Você precisa criar um orçamento antes de definir metas'
      };
    }
    
    console.log('  Retornando: pode criar');
    return {
      canCreate: true,
      message: ''
    };
  } catch (error) {
    console.error('  Erro em canCreateGoal:', error);
    return {
      canCreate: false,
      message: 'Erro ao verificar permissão para criar metas'
    };
  }
}

/**
 * Atualiza o resumo mensal após criar/editar uma meta
 */
export async function updateMonthlySummaryAfterGoal(
  userId: string,
  month: string,
  goal: Goal
): Promise<void> {
  try {
    // Atualiza o resumo mensal para refletir a nova contribuição
    await updateMonthlyFinanceSummaryService(userId, month);
  } catch (error) {
    console.error('Erro ao atualizar resumo mensal após meta:', error);
    throw error;
  }
}

/**
 * Calcula a data de fim da meta baseada na data de início e número de parcelas
 */
export function calculateGoalEndDate(startDate: string, numParcels: number): string {
  const start = new Date(startDate);
  const end = new Date(start);
  end.setMonth(end.getMonth() + numParcels - 1); // -1 porque a primeira parcela é no mês de início
  
  // Ajusta para o último dia do mês
  end.setMonth(end.getMonth() + 1, 0);
  
  return end.toISOString().split('T')[0];
}

/**
 * Formata valores monetários para exibição
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
} 