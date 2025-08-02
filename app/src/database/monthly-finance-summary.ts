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
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
};

// Função para inserir um resumo mensal
export const insertMonthlyFinanceSummary = async (summary: MonthlyFinanceSummary) => {
  await db.execAsync(
    `INSERT INTO monthly_finance_summary (
      id, user_id, start_month, end_month, total_monthly_income, total_monthly_expense, variable_expense_max_value, variable_expense_used_value, total_monthly_available, sum_monthly_contribution, created_at, updated_at
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

// Função para buscar resumo mensal por usuário e mês
export const getMonthlyFinanceSummaryByUserAndMonth = async (user_id: string, start_month: string): Promise<MonthlyFinanceSummary | null> => {
  const result = await db.getAllAsync(
    `SELECT * FROM monthly_finance_summary WHERE user_id = '${user_id}' AND start_month = '${start_month}' LIMIT 1;`
  );
  if (result.length > 0) {
    return result[0] as MonthlyFinanceSummary;
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