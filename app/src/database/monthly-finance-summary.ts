import { db } from './db';

export interface MonthlyFinanceSummary {
  id: string;
  user_id: string;
  start_month: string; // formato YYYY-MM-DD
  end_month: string;   // formato YYYY-MM-DD
  total_monthly_income: number;
  total_monthly_expense: number;
  variable_expense_max_value: number;
  variable_expense_used_value: number;
  total_monthly_available: number;
  sum_monthly_contribution: number;
  includeVariableIncome: boolean; // Novo campo para o switch
  created_at: string;
  updated_at: string;
}

export const createMonthlyFinanceSummaryTable = async () => {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS monthly_finance_summary (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      start_month TEXT NOT NULL,
      end_month TEXT NOT NULL,
      total_monthly_income REAL NOT NULL,
      total_monthly_expense REAL NOT NULL,
      variable_expense_max_value REAL NOT NULL,
      variable_expense_used_value REAL NOT NULL,
      total_monthly_available REAL NOT NULL,
      sum_monthly_contribution REAL NOT NULL,
      includeVariableIncome INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
  
  // Migração: adicionar coluna includeVariableIncome se não existir
  try {
    await db.execAsync(`
      ALTER TABLE monthly_finance_summary 
      ADD COLUMN includeVariableIncome INTEGER DEFAULT 0;
    `);
    console.log('✅ Migração: coluna includeVariableIncome adicionada');
  } catch (error) {
    // Coluna já existe, ignorar erro
    console.log('ℹ️ Coluna includeVariableIncome já existe');
  }
};

// Função para inserir um resumo mensal
export const insertMonthlyFinanceSummary = async (summary: MonthlyFinanceSummary) => {
  await db.execAsync(
    `INSERT INTO monthly_finance_summary (
      id, user_id, start_month, end_month, total_monthly_income, total_monthly_expense, variable_expense_max_value, variable_expense_used_value, total_monthly_available, sum_monthly_contribution, includeVariableIncome, created_at, updated_at
    ) VALUES (
      '${summary.id}',
      '${summary.user_id}',
      '${summary.start_month}',
      '${summary.end_month}',
      ${summary.total_monthly_income},
      ${summary.total_monthly_expense},
      ${summary.variable_expense_max_value},
      ${summary.variable_expense_used_value},
      ${summary.total_monthly_available},
      ${summary.sum_monthly_contribution},
      ${summary.includeVariableIncome ? 1 : 0},
      '${summary.created_at}',
      '${summary.updated_at}'
    );`
  );
};

// Função para atualizar um resumo mensal
export const updateMonthlyFinanceSummary = async (summary: MonthlyFinanceSummary) => {
  await db.execAsync(
    `UPDATE monthly_finance_summary SET
      total_monthly_income = ${summary.total_monthly_income},
      total_monthly_expense = ${summary.total_monthly_expense},
      variable_expense_max_value = ${summary.variable_expense_max_value},
      variable_expense_used_value = ${summary.variable_expense_used_value},
      total_monthly_available = ${summary.total_monthly_available},
      sum_monthly_contribution = ${summary.sum_monthly_contribution},
      includeVariableIncome = ${summary.includeVariableIncome ? 1 : 0},
      updated_at = '${summary.updated_at}'
    WHERE id = '${summary.id}';`
  );
};

// Função para atualizar apenas o limite de despesas variáveis
export const updateVariableExpenseLimit = async (user_id: string, start_month: string, newLimit: number): Promise<void> => {
  await db.execAsync(
    `UPDATE monthly_finance_summary SET
      variable_expense_max_value = ${newLimit},
      updated_at = '${new Date().toISOString()}'
    WHERE user_id = '${user_id}' AND start_month = '${start_month}';`
  );
};

// Função para atualizar apenas o switch de receitas variáveis
export const updateIncludeVariableIncome = async (user_id: string, start_month: string, includeVariableIncome: boolean): Promise<void> => {
  await db.execAsync(
    `UPDATE monthly_finance_summary SET
      includeVariableIncome = ${includeVariableIncome ? 1 : 0},
      updated_at = '${new Date().toISOString()}'
    WHERE user_id = '${user_id}' AND start_month = '${start_month}';`
  );
};

// Função para buscar resumo mensal por usuário e mês
export const getMonthlyFinanceSummaryByUserAndMonth = async (user_id: string, start_month: string): Promise<MonthlyFinanceSummary | null> => {
  const result = await db.getAllAsync(
    `SELECT * FROM monthly_finance_summary WHERE user_id = '${user_id}' AND start_month = '${start_month}' LIMIT 1;`
  );
  if (result.length > 0) {
    const rawData = result[0] as any;
    // Converter INTEGER para boolean
    return {
      ...rawData,
      includeVariableIncome: Boolean(rawData.includeVariableIncome)
    } as MonthlyFinanceSummary;
  }
  return null;
};

// Função para deletar resumo mensal
export const deleteMonthlyFinanceSummary = async (id: string) => {
  await db.execAsync(`DELETE FROM monthly_finance_summary WHERE id = '${id}';`);
};

// Buscar todos os resumos de um usuário
export const getAllMonthlyFinanceSummariesByUser = async (user_id: string): Promise<MonthlyFinanceSummary[]> => {
  const result = await db.getAllAsync(
    `SELECT * FROM monthly_finance_summary WHERE user_id = '${user_id}' ORDER BY start_month DESC;`
  );
  return result as MonthlyFinanceSummary[];
};

// Buscar resumos por período (range de meses)
export const getMonthlyFinanceSummariesByPeriod = async (
  user_id: string,
  start_month: string,
  end_month: string
): Promise<MonthlyFinanceSummary[]> => {
  const result = await db.getAllAsync(
    `SELECT * FROM monthly_finance_summary WHERE user_id = '${user_id}' AND start_month >= '${start_month}' AND end_month <= '${end_month}' ORDER BY start_month ASC;`
  );
  return result as MonthlyFinanceSummary[];
};

// Listar todos os resumos existentes (admin/debug)
export const getAllMonthlyFinanceSummaries = async (): Promise<MonthlyFinanceSummary[]> => {
  const result = await db.getAllAsync(
    `SELECT * FROM monthly_finance_summary ORDER BY start_month DESC;`
  );
  return result as MonthlyFinanceSummary[];
};

// Função para criar ou atualizar automaticamente o resumo mensal
export const createOrUpdateMonthlyFinanceSummary = async (
  user_id: string, 
  month: string, 
  operations: any[], 
  includeVariableIncome: boolean = false
): Promise<MonthlyFinanceSummary> => {
  const start_month = `${month}-01`;
  const end_month = `${month}-31`;
  
  // Calcular totais das operações
  console.log(`[createOrUpdateMonthlyFinanceSummary] Filtrando operações para mês: ${month}`);
  console.log(`[createOrUpdateMonthlyFinanceSummary] Total de operações recebidas:`, operations.length);
  
  // Por enquanto, vamos incluir todas as operações do mês para debug
  const monthOperations = operations.filter(op => {
    // Extrair mês diretamente da string de data (formato YYYY-MM-DD)
    const opMonth = op.date.substring(0, 7); // YYYY-MM
    const isCorrectMonth = opMonth === month;
    
    console.log(`[createOrUpdateMonthlyFinanceSummary] Operação:`, {
      date: op.date,
      opMonth,
      targetMonth: month,
      isCorrectMonth,
      state: op.state,
      included: isCorrectMonth
    });
    
    return isCorrectMonth; // Remover filtro de estado temporariamente
  });
  
  console.log(`[createOrUpdateMonthlyFinanceSummary] Operações do mês ${month}:`, monthOperations.length);
  console.log(`[createOrUpdateMonthlyFinanceSummary] Operações:`, monthOperations.map(op => ({
    nature: op.nature,
    value: op.value,
    state: op.state,
    category: op.category
  })));
  
  // Separar operações por natureza
  const receitas = monthOperations.filter(op => op.nature === 'receita');
  const despesas = monthOperations.filter(op => op.nature === 'despesa');
  
  console.log(`[createOrUpdateMonthlyFinanceSummary] Receitas encontradas:`, receitas.length);
  console.log(`[createOrUpdateMonthlyFinanceSummary] Despesas encontradas:`, despesas.length);
  
  // Calcular receita total baseada no switch de receitas variáveis
  let total_monthly_income = 0;
  
  if (includeVariableIncome) {
    // Se o switch está ativado, incluir todas as receitas (fixas + variáveis)
    total_monthly_income = receitas.reduce((sum, op) => sum + Math.abs(op.value), 0);
    console.log(`[createOrUpdateMonthlyFinanceSummary] Switch ativado - incluindo todas as receitas: ${total_monthly_income}`);
  } else {
    // Se o switch está desativado, incluir apenas receitas fixas (que estão no orçamento)
    // Por enquanto, vamos incluir todas as receitas até implementar a lógica completa
    total_monthly_income = receitas.reduce((sum, op) => sum + Math.abs(op.value), 0);
    console.log(`[createOrUpdateMonthlyFinanceSummary] Switch desativado - incluindo todas as receitas: ${total_monthly_income}`);
  }
    
  const total_monthly_expense = despesas.reduce((sum, op) => sum + Math.abs(op.value), 0);
    
  console.log(`[createOrUpdateMonthlyFinanceSummary] Receita total: ${total_monthly_income}, Despesa total: ${total_monthly_expense}`);
  
  // Calcular contribuições mensais das metas
  const { calculateSumMonthlyContribution } = await import('../services/FinanceService');
  const sum_monthly_contribution = await calculateSumMonthlyContribution(user_id, month);
  console.log(`[createOrUpdateMonthlyFinanceSummary] Contribuições mensais das metas: ${sum_monthly_contribution}`);
  
  // Buscar resumo existente
  const existingSummary = await getMonthlyFinanceSummaryByUserAndMonth(user_id, start_month);
  
  if (existingSummary) {
    // Atualizar resumo existente
    const updatedSummary: MonthlyFinanceSummary = {
      ...existingSummary,
      total_monthly_income,
      total_monthly_expense,
      sum_monthly_contribution,
      includeVariableIncome,
      updated_at: new Date().toISOString()
    };
    
    // Recalcular valor disponível
    updatedSummary.total_monthly_available = 
      total_monthly_income - total_monthly_expense - updatedSummary.variable_expense_max_value - sum_monthly_contribution;
    
    await updateMonthlyFinanceSummary(updatedSummary);
    return updatedSummary;
  } else {
    // Criar novo resumo
    const newSummary: MonthlyFinanceSummary = {
      id: `summary-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      user_id,
      start_month,
      end_month,
      total_monthly_income,
      total_monthly_expense,
      variable_expense_max_value: 300, // Valor padrão
      variable_expense_used_value: 0,
      total_monthly_available: total_monthly_income - total_monthly_expense - 300 - sum_monthly_contribution,
      sum_monthly_contribution,
      includeVariableIncome,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    await insertMonthlyFinanceSummary(newSummary);
    return newSummary;
  }
}; 