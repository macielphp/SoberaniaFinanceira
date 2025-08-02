import { getMonthlyFinanceSummaryByUserAndMonth } from '../database/monthly-finance-summary';

/**
 * Valida se é permitido registrar uma operação de despesa não orçada
 * Bloqueia se a soma das despesas variáveis usadas + valor da operação exceder o limite definido
 */
export async function canRegisterVariableExpense(user_id: string, month: string, valor_operacao: number): Promise<true | string> {
  const summary = await getMonthlyFinanceSummaryByUserAndMonth(user_id, month + '-01');
  if (!summary) return 'Resumo mensal não encontrado.';
  if (summary.variable_expense_used_value + valor_operacao > summary.variable_expense_max_value) {
    return `Limite de despesas variáveis excedido! (Limite: R$ ${summary.variable_expense_max_value.toFixed(2)})`;
  }
  return true;
}

/**
 * Valida se é permitido criar/editar uma meta com determinada contribuição mensal
 * Bloqueia se a contribuição for maior que o disponível no mês
 */
export async function canCreateOrEditGoal(user_id: string, month: string, monthly_contribution: number): Promise<true | string> {
  const summary = await getMonthlyFinanceSummaryByUserAndMonth(user_id, month + '-01');
  if (!summary) return 'Resumo mensal não encontrado.';
  if (monthly_contribution > summary.total_monthly_available) {
    return `Contribuição mensal maior que o disponível no mês! (Disponível: R$ ${summary.total_monthly_available.toFixed(2)})`;
  }
  return true;
}

/**
 * Política para alteração retroativa: por padrão, bloqueia alterações em meses anteriores ao atual
 */
export function isRetroactiveChangeAllowed(month: string): boolean {
  const [year, m] = month.split('-').map(Number);
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  return year > currentYear || (year === currentYear && m >= currentMonth);
}

// Outras funções utilitárias de validação podem ser adicionadas aqui 