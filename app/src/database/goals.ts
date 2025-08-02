import { db } from './db';
import { getAllOperations } from './operations';

export interface Goal {
  id: string;
  user_id: string;
  description: string;
  type: 'economia' | 'compra';
  target_value: number;
  start_date: string;
  end_date: string;
  monthly_income: number;
  fixed_expenses: number;
  available_per_month: number;
  importance: string;
  priority: number;
  strategy?: string;
  monthly_contribution: number;
  num_parcela: number; // Novo campo: número de parcelas
  status?: 'active' | 'completed' | 'paused' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export const createGoalsTable = async () => {
  console.log('🔍 DEBUG createGoalsTable - Criando tabela goal...');
  try {
    await db.execAsync(
      `CREATE TABLE IF NOT EXISTS goal (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        description TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('economia', 'compra')),
        target_value REAL NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        monthly_income REAL NOT NULL,
        fixed_expenses REAL NOT NULL,
        available_per_month REAL NOT NULL,
        importance TEXT NOT NULL,
        priority INTEGER CHECK(priority >= 1 AND priority <= 5),
        strategy TEXT,
        monthly_contribution REAL NOT NULL,
        num_parcela INTEGER NOT NULL,
        status TEXT DEFAULT 'active' CHECK(status IN ('active', 'completed', 'paused', 'cancelled')),
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`
    );
    console.log('  Tabela goal criada/verificada com sucesso');
    
    // Verificar se a coluna num_parcela existe, se não, adicionar
    try {
      await db.execAsync('ALTER TABLE goal ADD COLUMN num_parcela INTEGER NOT NULL DEFAULT 1');
      console.log('  Coluna num_parcela adicionada com sucesso');
    } catch (alterError: any) {
      // Se der erro "duplicate column name", significa que a coluna já existe
      if (alterError.message && alterError.message.includes('duplicate column name')) {
        console.log('  Coluna num_parcela já existe');
      } else {
        console.log('  Erro ao adicionar coluna num_parcela (pode já existir):', alterError.message);
      }
    }
    
    await db.execAsync('CREATE INDEX IF NOT EXISTS idx_goal_user_id ON goal (user_id);');
    await db.execAsync('CREATE INDEX IF NOT EXISTS idx_goal_type ON goal (type);');
    console.log('  Índices criados/verificados com sucesso');
  } catch (error) {
    console.error('  Erro ao criar tabela goal:', error);
    throw error;
  }
};

export const insertGoal = async (goal: Omit<Goal, 'id' | 'created_at' | 'updated_at'>) => {
  console.log('🔍 DEBUG insertGoal (database):', goal);
  const id = `goal-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  const now = new Date().toISOString();
  
  const params = [
    id,
    goal.user_id,
    goal.description,
    goal.type,
    goal.target_value,
    goal.start_date,
    goal.end_date,
    goal.monthly_income,
    goal.fixed_expenses,
    goal.available_per_month,
    goal.importance,
    goal.priority,
    goal.strategy || null,
    goal.monthly_contribution,
    goal.num_parcela,
    goal.status || 'active',
    now,
    now
  ];
  
  console.log('  Parâmetros para INSERT:', params);
  
  try {
    await db.runAsync(
      `INSERT INTO goal (
        id, user_id, description, type, target_value, start_date, end_date, monthly_income, fixed_expenses, available_per_month, importance, priority, strategy, monthly_contribution, num_parcela, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      params
    );
    console.log('  INSERT executado com sucesso');
    return id;
  } catch (error) {
    console.error('  Erro no INSERT:', error);
    throw error;
  }
};

export const updateGoal = async (goal: Goal) => {
  const now = new Date().toISOString();
  await db.runAsync(
    `UPDATE goal SET
      description = ?,
      type = ?,
      target_value = ?,
      start_date = ?,
      end_date = ?,
      monthly_income = ?,
      fixed_expenses = ?,
      available_per_month = ?,
      importance = ?,
      priority = ?,
      strategy = ?,
      monthly_contribution = ?,
      num_parcela = ?,
      status = ?,
      updated_at = ?
    WHERE id = ? AND user_id = ?`,
    [
      goal.description,
      goal.type,
      goal.target_value,
      goal.start_date,
      goal.end_date,
      goal.monthly_income,
      goal.fixed_expenses,
      goal.available_per_month,
      goal.importance,
      goal.priority,
      goal.strategy || null,
      goal.monthly_contribution,
      goal.num_parcela,
      goal.status || 'active',
      now,
      goal.id,
      goal.user_id
    ]
  );
};

export const deleteGoal = async (id: string, user_id: string) => {
  await db.runAsync('DELETE FROM goal WHERE id = ? AND user_id = ?', [id, user_id]);
};

export const getAllGoals = async (user_id: string): Promise<Goal[]> => {
  const result = await db.getAllAsync<any>('SELECT * FROM goal WHERE user_id = ? ORDER BY created_at DESC', [user_id]);
  return result.map((item: any) => ({
    ...item,
    target_value: Number(item.target_value),
    monthly_income: Number(item.monthly_income),
    fixed_expenses: Number(item.fixed_expenses),
    available_per_month: Number(item.available_per_month),
    priority: Number(item.priority),
    monthly_contribution: Number(item.monthly_contribution),
  }));
};

export const getGoalById = async (id: string, user_id: string): Promise<Goal | null> => {
  const result = await db.getAllAsync<any>('SELECT * FROM goal WHERE id = ? AND user_id = ?', [id, user_id]);
  if (result.length === 0) return null;
  const item = result[0];
  return {
    ...item,
    target_value: Number(item.target_value),
    monthly_income: Number(item.monthly_income),
    fixed_expenses: Number(item.fixed_expenses),
    available_per_month: Number(item.available_per_month),
    priority: Number(item.priority),
    monthly_contribution: Number(item.monthly_contribution),
  };
};

// Função para calcular o progresso real da meta
export const getGoalProgress = async (goal_id: string, type: 'economia' | 'compra'): Promise<number> => {
  const allOps = await getAllOperations();
  if (!goal_id) return 0;
  const filtered = allOps
    .filter(op => op.goal_id === goal_id && (
      (type === 'economia' && op.nature === 'receita') ||
      (type === 'compra' && op.nature === 'despesa')
    ));
  const sum = filtered.reduce((sum, op) => sum + Number(op.value), 0);
  console.log(`🔍 getGoalProgress para goal_id=${goal_id}, type=${type}`);
  console.log('  Operações filtradas:', filtered.map(op => ({ id: op.id, value: op.value, nature: op.nature, goal_id: op.goal_id })));
  console.log('  Progresso calculado:', sum);
  return sum;
};

// Função para forçar a atualização da estrutura da tabela goal
export const updateGoalsTableStructure = async () => {
  console.log('🔍 DEBUG updateGoalsTableStructure - Atualizando estrutura da tabela goal...');
  try {
    // Verificar se a coluna num_parcela existe
    const columns = await db.getAllAsync<any>("PRAGMA table_info(goal)");
    const hasNumParcela = columns.some((col: any) => col.name === 'num_parcela');
    
    console.log('  Colunas existentes:', columns.map((col: any) => col.name));
    
    if (!hasNumParcela) {
      console.log('  Coluna num_parcela não encontrada, adicionando...');
      await db.execAsync('ALTER TABLE goal ADD COLUMN num_parcela INTEGER NOT NULL DEFAULT 1');
      console.log('  Coluna num_parcela adicionada com sucesso');
    } else {
      console.log('  Coluna num_parcela já existe');
    }
  } catch (error) {
    console.error('  Erro ao atualizar estrutura da tabela goal:', error);
    throw error;
  }
}; 