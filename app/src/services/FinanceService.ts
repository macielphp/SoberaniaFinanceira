// app\src\services\FinanceService.ts
// Simple UUID generator without external dependencies
import { MonthlyFinanceSummary, insertMonthlyFinanceSummary, getMonthlyFinanceSummaryByUserAndMonth, updateMonthlyFinanceSummary as updateMonthlyFinanceSummaryDB } from '../database/monthly-finance-summary';
import { getAllOperations } from '../database/operations';
import { getAllGoals } from '../database/goals';
import { getActiveBudget, calculateMonthlyBudgetPerformance, getBudgetItemsByBudgetId } from '../database/budget';

const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Tipos básicos
export type Nature = 'despesa' | 'receita';

export type PaymentMethod = 
  | 'Cartão de débito'
  | 'Cartão de crédito'
  | 'Pix'
  | 'TED'
  | 'Estorno'
  | 'Transferência bancária';

export type State = 
  | 'receber'
  | 'recebido'
  | 'pagar'
  | 'pago'
  | 'transferir'
  | 'transferido';

export type Category =
  | 'Reparação'
  | 'Adiantamento-pessoal'
  | 'Movimentação interna'
  | 'Alimento-supermercado'
  | 'Aluguel'
  | 'Energia-elétrica'
  | 'Saneamento-básico'
  | 'Presente'
  | 'Doação'
  | 'Transporte-público'
  | 'Uber'
  | 'Combustível'
  | 'Salário-CLT'
  | 'PLR/Comissão'
  | 'Ajuda-custos-PJ'
  | 'Adiantamento-salário-CLT'
  | 'Vale-refeição'
  | 'Vale-alimentação'
  | 'Cashback'
  | 'Internet-e-plano-residência/móvel'
  | 'Lanche-rápido'
  | 'Vestuário'
  | 'Costura-roupa'
  | 'Curso-superior'
  | 'Curso-técnico'
  | 'Curso-profissionalizante'
  | 'Livro'
  | 'Dentista'
  | 'Remédio'
  | 'Oftalmologista'
  | 'Óculos-de-grau'
  | 'Suplemento-vitaminas'
  | 'Gás-cozinha'
  | 'Financiamento'
  | 'Consórcio'
  | 'Dívida'
  | 'Assinatura-digital-pessoal'
  | 'Assinatura-digital-profissional'
  | 'Acessório-celular';

// Interface principal
export interface Operation {
  id: string;
  user_id: string;
  nature: Nature;
  state: State;
  paymentMethod: PaymentMethod;
  sourceAccount: string;
  destinationAccount: string;
  date: string; // formato ISO 'YYYY-MM-DD'
  value: number;
  category: Category;
  details?: string;
  receipt?: Uint8Array | string;
  project?: string;
  goal_id?: string;
}

// Classe principal do serviço
export class FinanceService {
  // Cria uma operação simples
  createSimpleOperation(operation: Omit<Operation, 'id'>): Operation {
    return {
      id: generateUUID(),
      ...operation
    };
  }

  // Cria uma operação dupla (movimentação interna, adiantamento, reparação)
  createDoubleOperation({
    user_id,
    nature,
    paymentMethod,
    sourceAccount,
    destinationAccount,
    date,
    value,
    category,
    details,
    receipt,
    project
  }: Omit<Operation, 'id' | 'state'>): Operation[] {
    const baseId = generateUUID();
    const userId = user_id || 'user-1'; // Default user ID

    // Configurações baseadas na categoria
    let firstOperation: Operation;
    let secondOperation: Operation | undefined;

    switch (category) {
      case 'Movimentação interna':
        // Caso 2: Movimentação interna entre contas próprias
        firstOperation = {
          id: `${baseId}-1`,
          user_id: userId,
          nature: 'despesa',
          state: 'transferir',
          paymentMethod,
          sourceAccount,
          destinationAccount,
          date,
          value: -Math.abs(value),
          category,
          details,
          receipt,
          project
        };

        secondOperation = {
          id: `${baseId}-2`,
          user_id: userId,
          nature: 'receita',
          state: 'receber',
          paymentMethod,
          sourceAccount,
          destinationAccount,
          date,
          value: Math.abs(value),
          category,
          details,
          receipt,
          project
        };
        break;

      case 'Adiantamento-pessoal':
        // Caso 4: Adiantamento
        firstOperation = {
          id: `${baseId}-1`,
          user_id: userId,
          nature,
          state: nature === 'despesa' ? 'pagar' : 'recebido',
          paymentMethod,
          sourceAccount,
          destinationAccount,
          date,
          value: nature === 'despesa' ? -Math.abs(value) : value,
          category,
          details,
          receipt,
          project
        };

        secondOperation = {
          id: `${baseId}-2`,
          user_id: userId,
          nature: nature === 'despesa' ? 'receita' : 'despesa',
          state: nature === 'despesa' ? 'receber' : 'pagar',
          paymentMethod,
          sourceAccount: destinationAccount,
          destinationAccount: sourceAccount,
          date,
          value: nature === 'despesa' ? Math.abs(value) : -value,
          category,
          details,
          receipt,
          project
        };
        break;

      case 'Reparação':
        // Caso 5: Reparação
        firstOperation = {
          id: `${baseId}-1`,
          user_id: userId,
          nature,
          state: nature === 'despesa' ? 'pagar' : 'recebido',
          paymentMethod,
          sourceAccount,
          destinationAccount,
          date,
          value: nature === 'despesa' ? -Math.abs(value) : value,
          category,
          details,
          receipt,
          project
        };

        // Segunda operação só existe quando recebemos a reparação
        if (nature === 'receita') {
          secondOperation = {
            id: `${baseId}-2`,
            user_id: userId,
            nature: 'despesa',
            state: 'pagar',
            paymentMethod,
            sourceAccount: destinationAccount,
            destinationAccount: '', // será preenchido quando for comprar o item
            date,
            value: -Math.abs(value),
            category,
            details: `Compra para reposição - ${details}`,
            receipt,
            project
          };
        }
        break;
      default:
        throw new Error('Categoria não suporta operação dupla');
    }

    return secondOperation ? [firstOperation, secondOperation] : [firstOperation];
  }

  // Atualiza o estado de uma operação
  updateOperationState(operation: Operation, newState: State): Operation {
    // Validações de mudança de estado
    const validStateTransitions: Record<State, State[]> = {
      'receber': ['recebido'],
      'recebido': [],
      'pagar': ['pago'],
      'pago': [],
      'transferir': ['transferido'],
      'transferido': []
    };

    // Verifica se a transição é válida
    if (!validStateTransitions[operation.state].includes(newState)) {
      throw new Error(`Transição de estado inválida: ${operation.state} -> ${newState}`);
    }

    return {
      ...operation,
      state: newState
    };
  }

  // Calcula o saldo de uma conta
  calculateBalance(operations: Operation[], account: string): number {
    return operations
      .filter(op => {
        // Só considera operações concluídas
        const isCompleted = ['recebido', 'pago', 'transferido'].includes(op.state);
        // Verifica se a operação afeta esta conta
        const affectsAccount = op.sourceAccount === account || op.destinationAccount === account;
        return isCompleted && affectsAccount;
      })
      .reduce((balance, op) => {
        if (op.sourceAccount === account) {
          // Saída de dinheiro da conta
          return balance + (op.value < 0 ? op.value : -op.value);
        } else {
          // Entrada de dinheiro na conta
          return balance + Math.abs(op.value);
        }
      }, 0);
  }

  // Método adicional: Obter operações por período
  getOperationsByPeriod(operations: Operation[], startDate: string, endDate: string): Operation[] {
    return operations.filter(op => {
      const opDate = new Date(op.date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return opDate >= start && opDate <= end;
    });
  }

  // Método adicional: Obter operações por categoria
  getOperationsByCategory(operations: Operation[], category: Category): Operation[] {
    return operations.filter(op => op.category === category);
  }

  // Método adicional: Obter operações por estado
  getOperationsByState(operations: Operation[], state: State): Operation[] {
    return operations.filter(op => op.state === state);
  }

  // Método adicional: Calcular total de receitas em um período
  getTotalReceitas(operations: Operation[], startDate?: string, endDate?: string): number {
    let filteredOps = operations.filter(op => 
      op.nature === 'receita' && ['recebido'].includes(op.state)
    );

    if (startDate && endDate) {
      filteredOps = this.getOperationsByPeriod(filteredOps, startDate, endDate);
    }

    return filteredOps.reduce((total, op) => total + Math.abs(op.value), 0);
  }

  // Método adicional: Calcular total de despesas em um período
  getTotalDespesas(operations: Operation[], startDate?: string, endDate?: string): number {
    let filteredOps = operations.filter(op => 
      op.nature === 'despesa' && ['pago'].includes(op.state)
    );

    if (startDate && endDate) {
      filteredOps = this.getOperationsByPeriod(filteredOps, startDate, endDate);
    }

    return filteredOps.reduce((total, op) => total + Math.abs(op.value), 0);
  }

  // Método adicional: Obter resumo financeiro
  getFinancialSummary(operations: Operation[], startDate?: string, endDate?: string) {
    const totalReceitas = this.getTotalReceitas(operations, startDate, endDate);
    const totalDespesas = this.getTotalDespesas(operations, startDate, endDate);
    const saldoLiquido = totalReceitas - totalDespesas;

    const operacoesPendentes = operations.filter(op => 
      ['receber', 'pagar', 'transferir'].includes(op.state)
    );

    const receitasPendentes = operacoesPendentes
      .filter(op => op.nature === 'receita')
      .reduce((total, op) => total + Math.abs(op.value), 0);

    const despesasPendentes = operacoesPendentes
      .filter(op => op.nature === 'despesa')
      .reduce((total, op) => total + Math.abs(op.value), 0);

    return {
      totalReceitas,
      totalDespesas,
      saldoLiquido,
      receitasPendentes,
      despesasPendentes,
      totalOperacoes: operations.length,
      operacoesPendentes: operacoesPendentes.length
    };
  }

  // Método adicional: Validar operação antes de criar
  validateOperation(operation: Omit<Operation, 'id'>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validações básicas
    if (!operation.sourceAccount.trim()) {
      errors.push('Conta de origem é obrigatória');
    }

    if (!operation.destinationAccount.trim() && operation.category !== 'Movimentação interna') {
      errors.push('Conta de destino é obrigatória');
    }

    if (operation.value <= 0) {
      errors.push('Valor deve ser maior que zero');
    }

    if (!operation.date.trim()) {
      errors.push('Data é obrigatória');
    }

    // Validar formato da data
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (operation.date && !dateRegex.test(operation.date)) {
      errors.push('Data deve estar no formato YYYY-MM-DD');
    }

    // Validar se a data não é futura (opcional, dependendo da regra de negócio)
    if (operation.date) {
      const opDate = new Date(operation.date);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // Fim do dia atual
      
      if (opDate > today) { 
        // Permitir datas futuras apenas para operações 'receber' e 'pagar'
        if (!['receber', 'pagar'].includes(operation.state)) {
          errors.push('Data não pode ser futura para operações já concluídas');
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
/**
 * Gera um UUID v4 simples (compatível com React Native)
 */
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Serviço para atualizar/calcular os campos da tabela intermediária mensal (monthly_finance_summary)
 * Sempre que houver alteração relevante (orçamento, operação, meta), chame esta função.
 */
export async function updateMonthlyFinanceSummary(
  user_id: string,
  month: string, // formato YYYY-MM
  options?: {
    includeVariableIncome?: boolean; // switch de receitas variáveis
    variable_expense_max_value?: number; // novo valor definido pelo usuário
  }
): Promise<MonthlyFinanceSummary> {
  if (!user_id) {
    throw new Error('user_id não pode ser vazio ao criar resumo mensal.');
  }
  if (!/^[0-9]{4}-[0-9]{2}$/.test(month)) {
    throw new Error('Mês inválido para resumo mensal: ' + month);
  }
  // Log detalhado de entrada
  console.log('[MonthlyFinanceSummary] update: user_id=', user_id, 'month=', month, 'options=', options);

  // 1. Buscar orçamento do mês
  const budget = await getActiveBudget(user_id);
  const perf = budget ? await calculateMonthlyBudgetPerformance(user_id, month) : null;
  const budgetItems = budget ? await getBudgetItemsByBudgetId(budget.id) : [];

  // 2. Calcular campos principais
  const total_monthly_income = await calculateTotalMonthlyIncome(user_id, month, options?.includeVariableIncome ?? false);
  const total_monthly_expense = await calculateTotalMonthlyExpense(user_id, month);
  
  // 3. Buscar se já existe resumo para pegar o limite salvo
  const start_month = month + '-01';
  let existingSummary = await getMonthlyFinanceSummaryByUserAndMonth(user_id, start_month);
  
  // Usar o valor salvo se existir, senão usar o valor passado nas options ou o padrão
  const variable_expense_max_value = options?.variable_expense_max_value ?? 
    (existingSummary?.variable_expense_max_value ?? 300);
  
  const variable_expense_used_value = await calculateVariableExpenseUsedValue(user_id, month, budgetItems);
  const sum_monthly_contribution = await calculateSumMonthlyContribution(user_id, month);

  // 3. Calcular valor disponível
  const total_monthly_available = calculateTotalMonthlyAvailable(
    total_monthly_income,
    total_monthly_expense,
    existingSummary?.variable_expense_max_value ?? variable_expense_max_value,
    sum_monthly_contribution
  );

  // 4. Datas do mês
  const end_month = month + '-' + String(new Date(Number(month.split('-')[0]), Number(month.split('-')[1]), 0).getDate()).padStart(2, '0');
  const now = new Date().toISOString();

  // 5. Buscar se já existe resumo
  let summary = await getMonthlyFinanceSummaryByUserAndMonth(user_id, start_month);
  if (!summary) {
    summary = {
      id: uuidv4(),
      user_id,
      start_month,
      end_month,
      total_monthly_income,
      total_monthly_expense,
      variable_expense_max_value,
      variable_expense_used_value,
      total_monthly_available,
      sum_monthly_contribution,
      includeVariableIncome: options?.includeVariableIncome ?? false,
      created_at: now,
      updated_at: now,
    };
    try {
      await insertMonthlyFinanceSummary(summary);
      console.log('[MonthlyFinanceSummary] Inserido:', summary);
    } catch (err) {
      console.error('[MonthlyFinanceSummary] Erro ao inserir summary:', err, summary);
      throw err;
    }
  } else {
    summary = {
      ...summary,
      total_monthly_income,
      total_monthly_expense,
      // Manter o valor salvo do limite, não sobrescrever
      variable_expense_max_value: summary.variable_expense_max_value,
      variable_expense_used_value,
      total_monthly_available,
      sum_monthly_contribution,
      // Atualizar o switch se fornecido, senão manter o valor salvo
      includeVariableIncome: options?.includeVariableIncome ?? summary.includeVariableIncome,
      updated_at: now,
    };
    try {
      await updateMonthlyFinanceSummaryDB(summary);
      console.log('[MonthlyFinanceSummary] Atualizado:', summary);
    } catch (err) {
      console.error('[MonthlyFinanceSummary] Erro ao atualizar summary:', err, summary);
      throw err;
    }
  }
  return summary;
}

/**
 * Atualiza apenas o limite de despesas variáveis e recalcula o valor disponível
 */
export async function updateVariableExpenseLimit(
  user_id: string,
  month: string,
  newLimit: number
): Promise<MonthlyFinanceSummary> {
  console.log(`[updateVariableExpenseLimit] user_id=${user_id}, month=${month}, newLimit=${newLimit}`);
  
  try {
    const start_month = month + '-01';
    
    // 1. Buscar resumo atual
    const existingSummary = await getMonthlyFinanceSummaryByUserAndMonth(user_id, start_month);
    if (!existingSummary) {
      throw new Error('Resumo mensal não encontrado. Crie um resumo primeiro.');
    }
    
    // 2. Recalcular valor disponível com o novo limite
    const total_monthly_available = calculateTotalMonthlyAvailable(
      existingSummary.total_monthly_income,
      existingSummary.total_monthly_expense,
      newLimit,
      existingSummary.sum_monthly_contribution
    );
    
    // 3. Atualizar apenas o limite e o valor disponível
    const updatedSummary = {
      ...existingSummary,
      variable_expense_max_value: newLimit,
      total_monthly_available,
      updated_at: new Date().toISOString()
    };
    
    // 4. Salvar no banco
    await updateMonthlyFinanceSummaryDB(updatedSummary);
    
    console.log(`[updateVariableExpenseLimit] Limite atualizado: ${newLimit}, novo disponível: ${total_monthly_available}`);
    return updatedSummary;
    
  } catch (error) {
    console.error('[updateVariableExpenseLimit] Erro:', error);
    throw error;
  }
}

/**
 * Calcula o total de receitas do mês (planejadas + variáveis, se ativado)
 */
export async function calculateTotalMonthlyIncome(user_id: string, month: string, includeVariableIncome: boolean): Promise<number> {
  console.log(`[calculateTotalMonthlyIncome] user_id=${user_id}, month=${month}, includeVariableIncome=${includeVariableIncome}`);
  
  try {
    // 1. Buscar orçamento ativo
    const budget = await getActiveBudget(user_id);
    if (!budget) {
      console.log('  Nenhum orçamento ativo encontrado');
      return 0;
    }

    // 2. Buscar itens do orçamento (receitas planejadas)
    const budgetItems = await getBudgetItemsByBudgetId(budget.id);
    const plannedIncome = budgetItems
      .filter(item => item.category_type === 'income')
      .reduce((sum, item) => sum + (item.planned_value || 0), 0);
    
    console.log(`  Receitas planejadas: ${plannedIncome}`);

    // 3. Se includeVariableIncome = true, buscar receitas variáveis (operações reais não orçadas)
    let variableIncome = 0;
    if (includeVariableIncome) {
      const { getAllOperations } = await import('../database/operations');
      const allOperations = await getAllOperations();
      
      // Filtrar operações do mês que são receitas
      const monthStart = month + '-01';
      const monthEnd = month + '-' + String(new Date(Number(month.split('-')[0]), Number(month.split('-')[1]), 0).getDate()).padStart(2, '0');
      
      const monthOperations = allOperations.filter(op => 
        op.user_id === user_id &&
        op.nature === 'receita' &&
        op.date >= monthStart &&
        op.date <= monthEnd
      );
      
      // Filtrar apenas receitas que NÃO estão no orçamento (receitas variáveis)
      const budgetedIncomeCategories = budgetItems
        .filter(item => item.category_type === 'income')
        .map(item => item.category_name);
      
      const variableOperations = monthOperations.filter(op => 
        !budgetedIncomeCategories.includes(op.category)
      );
      
      variableIncome = variableOperations.reduce((sum, op) => sum + op.value, 0);
      console.log(`  Categorias de receita orçadas: ${budgetedIncomeCategories.join(', ')}`);
      console.log(`  Receitas variáveis (operações não orçadas): ${variableIncome}`);
      console.log(`  Operações variáveis encontradas:`, variableOperations.map(op => ({ category: op.category, value: op.value })));
    } else {
      console.log(`  Switch OFF: Incluindo apenas receitas planejadas (orçadas)`);
    }

    const totalIncome = plannedIncome + variableIncome;
    console.log(`  Total de receitas: ${totalIncome} (planejadas: ${plannedIncome} + variáveis: ${variableIncome})`);
    return totalIncome;
    
  } catch (error) {
    console.error('  Erro ao calcular receitas mensais:', error);
    return 0;
  }
}

/**
 * Calcula o total de despesas do mês (planejadas + excesso em categorias orçadas)
 */
export async function calculateTotalMonthlyExpense(user_id: string, month: string): Promise<number> {
  console.log(`[calculateTotalMonthlyExpense] user_id=${user_id}, month=${month}`);
  
  try {
    // 1. Buscar orçamento ativo
    const budget = await getActiveBudget(user_id);
    if (!budget) {
      console.log('  Nenhum orçamento ativo encontrado');
      return 0;
    }

    // 2. Buscar itens do orçamento (despesas planejadas)
    const budgetItems = await getBudgetItemsByBudgetId(budget.id);
    const plannedExpenses = budgetItems
      .filter(item => item.category_type === 'expense')
      .reduce((sum, item) => sum + (item.planned_value || 0), 0);
    
    console.log(`  Despesas planejadas: ${plannedExpenses}`);

    // 3. Buscar operações reais do mês
    const { getAllOperations } = await import('../database/operations');
    const allOperations = await getAllOperations();
    
    // Filtrar operações do mês que são despesas
    const monthStart = month + '-01';
    const monthEnd = month + '-' + String(new Date(Number(month.split('-')[0]), Number(month.split('-')[1]), 0).getDate()).padStart(2, '0');
    
    const monthOperations = allOperations.filter(op => 
      op.user_id === user_id &&
      op.nature === 'despesa' &&
      op.date >= monthStart &&
      op.date <= monthEnd
    );
    
    // 4. Identificar categorias orçadas
    const budgetedCategories = budgetItems
      .filter(item => item.category_type === 'expense')
      .map(item => item.category_name);
    
    console.log(`  Categorias orçadas: ${budgetedCategories.join(', ')}`);
    
    // 5. Calcular excesso em categorias orçadas
    let excessInBudgetedCategories = 0;
    const budgetedOperations = monthOperations.filter(op => budgetedCategories.includes(op.category));
    
    for (const budgetItem of budgetItems.filter(item => item.category_type === 'expense')) {
      const plannedValue = budgetItem.planned_value || 0;
      const actualValue = budgetedOperations
        .filter(op => op.category === budgetItem.category_name)
        .reduce((sum, op) => sum + op.value, 0);
      
      if (actualValue > plannedValue) {
        const excess = actualValue - plannedValue;
        excessInBudgetedCategories += excess;
        console.log(`  Excesso em ${budgetItem.category_name}: ${excess} (planejado: ${plannedValue}, real: ${actualValue})`);
      }
    }
    
    // 6. Total = despesas planejadas + excesso em categorias orçadas
    const totalExpenses = plannedExpenses + excessInBudgetedCategories;
    console.log(`  Total de despesas: ${totalExpenses} (planejadas: ${plannedExpenses} + excesso: ${excessInBudgetedCategories})`);
    return totalExpenses;
    
  } catch (error) {
    console.error('  Erro ao calcular despesas mensais:', error);
    return 0;
  }
}

/**
 * Calcula o total de despesas variáveis usadas (categorias não orçadas)
 */
export async function calculateVariableExpenseUsedValue(user_id: string, month: string, budgetItems: any[]): Promise<number> {
  console.log(`[calculateVariableExpenseUsedValue] user_id=${user_id}, month=${month}, budgetItems=${budgetItems.length}`);
  
  try {
    // 1. Buscar operações do mês
    const { getAllOperations } = await import('../database/operations');
    const allOperations = await getAllOperations();
    
    // Filtrar operações do mês que são despesas
    const monthStart = month + '-01';
    const monthEnd = month + '-' + String(new Date(Number(month.split('-')[0]), Number(month.split('-')[1]), 0).getDate()).padStart(2, '0');
    
    const monthOperations = allOperations.filter(op => 
      op.user_id === user_id &&
      op.nature === 'despesa' &&
      op.date >= monthStart &&
      op.date <= monthEnd
    );
    
    // 2. Identificar categorias orçadas (do orçamento)
    const budgetedCategories = budgetItems
      .filter(item => item.category_type === 'expense')
      .map(item => item.category_name);
    
    console.log(`  Categorias orçadas: ${budgetedCategories.join(', ')}`);
    
    // 3. Calcular despesas variáveis (categorias não orçadas)
    const variableExpenses = monthOperations
      .filter(op => !budgetedCategories.includes(op.category))
      .reduce((sum, op) => sum + op.value, 0);
    
    console.log(`  Despesas variáveis (categorias não orçadas): ${variableExpenses}`);
    return variableExpenses;
    
  } catch (error) {
    console.error('  Erro ao calcular despesas variáveis:', error);
    return 0;
  }
}

/**
 * Soma das contribuições mensais para metas ativas no mês
 */
export async function calculateSumMonthlyContribution(user_id: string, month: string): Promise<number> {
  console.log(`[calculateSumMonthlyContribution] user_id=${user_id}, month=${month}`);
  
  try {
    // 1. Buscar todas as metas ativas do usuário
    const { getAllGoals } = await import('../database/goals');
    const allGoals = await getAllGoals(user_id);
    
    // 2. Filtrar metas ativas que estão no período do mês
    const monthStart = month + '-01';
    const monthEnd = month + '-' + String(new Date(Number(month.split('-')[0]), Number(month.split('-')[1]), 0).getDate()).padStart(2, '0');
    
    console.log(`  Período do mês: ${monthStart} a ${monthEnd}`);
    console.log(`  Total de metas encontradas: ${allGoals.length}`);
    console.log(`  Metas encontradas:`, allGoals.map(goal => ({
      id: goal.id,
      description: goal.description,
      status: goal.status,
      start_date: goal.start_date,
      end_date: goal.end_date,
      monthly_contribution: goal.monthly_contribution
    })));
    
    const activeGoals = allGoals.filter(goal => {
      const isActive = goal.status === 'active';
      const isInPeriod = goal.start_date <= monthEnd && goal.end_date >= monthStart;
      
      console.log(`  Meta ${goal.description}: status=${goal.status}, start=${goal.start_date}, end=${goal.end_date}, ativa=${isActive}, noPeríodo=${isInPeriod}`);
      
      return isActive && isInPeriod;
    });
    
    // 3. Somar as contribuições mensais
    const totalContribution = activeGoals.reduce((sum, goal) => sum + goal.monthly_contribution, 0);
    
    console.log(`  Metas ativas no mês: ${activeGoals.length}`);
    console.log(`  Total de contribuições mensais: ${totalContribution}`);
    return totalContribution;
    
  } catch (error) {
    console.error('  Erro ao calcular contribuições mensais:', error);
    return 0;
  }
}

/**
 * Calcula o valor disponível no mês
 */
export function calculateTotalMonthlyAvailable(
  total_monthly_income: number,
  total_monthly_expense: number,
  variable_expense_max_value: number,
  sum_monthly_contribution: number
): number {
  // Fórmula: Receita - Despesa - Reserva para despesas variáveis - Contribuições para metas
  const available = total_monthly_income - total_monthly_expense - variable_expense_max_value - sum_monthly_contribution;
  
  console.log(`[calculateTotalMonthlyAvailable] Cálculo:`);
  console.log(`  Receita: ${total_monthly_income}`);
  console.log(`  Despesa: ${total_monthly_expense}`);
  console.log(`  Reserva despesas variáveis: ${variable_expense_max_value}`);
  console.log(`  Contribuições metas: ${sum_monthly_contribution}`);
  console.log(`  Disponível: ${available}`);
  
  return available;
}
// --- FIM: Funções de resumo financeiro mensal migradas ---