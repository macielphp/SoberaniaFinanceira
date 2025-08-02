// app\src\database\budget-items.ts
import * as SQLite from 'expo-sqlite';

// Type definitions
export interface BudgetItem {
    id: string;
    budget_id: string;
    category_name: string;
    planned_value: number;
    actual_value?: number; // Para orçamentos automáticos
    category_type: 'expense' | 'income';
    created_at: string;
}

export interface BudgetItemInput {
    category_name: string;
    planned_value: number;
    actual_value?: number;
    category_type: 'expense' | 'income';
}

// Abrindo ou criando banco
const db = SQLite.openDatabaseSync('finance.db');

// Criando a tabela de budget_items
export const createBudgetItemsTable = async () => {
    await db.execAsync(
        `CREATE TABLE IF NOT EXISTS budget_items (
            id TEXT PRIMARY KEY,
            budget_id TEXT NOT NULL,
            category_name TEXT NOT NULL,
            planned_value REAL NOT NULL,
            actual_value REAL,
            category_type TEXT NOT NULL CHECK(category_type IN ('expense', 'income')),
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            FOREIGN KEY (budget_id) REFERENCES budget(id) ON DELETE CASCADE
        )`
    );

    // Índices para budget_items
    await db.execAsync('CREATE INDEX IF NOT EXISTS idx_budget_items_budget_id ON budget_items (budget_id);');
    await db.execAsync('CREATE INDEX IF NOT EXISTS idx_budget_items_category ON budget_items (category_name);');
    await db.execAsync('CREATE INDEX IF NOT EXISTS idx_budget_items_type ON budget_items (category_type);');
};

// CRUD para budget_items
export const insertBudgetItem = async (budget_id: string, item: BudgetItemInput) => {
    console.log('[BudgetItem] Inserindo item:', { budget_id, ...item });
    try {
        const id = `item-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
        
        return await db.runAsync(
            `INSERT INTO budget_items (id, budget_id, category_name, planned_value, actual_value, category_type, created_at) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [id, budget_id, item.category_name.trim(), item.planned_value, item.actual_value || null, item.category_type, new Date().toISOString()]
        );
    } catch (err) {
        console.error('Erro ao inserir item de budget:', err);
        throw new Error('Falha ao salvar item de budget no banco de dados.');
    }
};

export const insertMultipleBudgetItems = async (budget_id: string, items: BudgetItemInput[]) => {
    try {
        const results = [];
        const seen = new Set();
        for (const item of items) {
            const key = item.category_name + '-' + item.category_type;
            if (seen.has(key)) {
                console.warn('[BudgetItem] Ignorando duplicidade ao inserir múltiplos itens:', key, 'budget_id:', budget_id);
                continue;
            }
            seen.add(key);
            const result = await insertBudgetItem(budget_id, item);
            results.push(result);
        }
        return results;
    } catch (err) {
        console.error('Erro ao inserir múltiplos itens de budget:', err);
        throw new Error('Falha ao salvar itens de budget no banco de dados.');
    }
};

export const updateBudgetItem = async (id: string, item: Partial<BudgetItemInput>) => {
    try {
        const updates = [];
        const values = [];
        
        if (item.category_name !== undefined) {
            updates.push('category_name = ?');
            values.push(item.category_name.trim());
        }
        if (item.planned_value !== undefined) {
            updates.push('planned_value = ?');
            values.push(item.planned_value);
        }
        if (item.actual_value !== undefined) {
            updates.push('actual_value = ?');
            values.push(item.actual_value);
        }
        if (item.category_type !== undefined) {
            updates.push('category_type = ?');
            values.push(item.category_type);
        }
        
        if (updates.length === 0) {
            throw new Error('Nenhum campo para atualizar.');
        }
        
        values.push(id);
        
        return await db.runAsync(
            `UPDATE budget_items SET ${updates.join(', ')} WHERE id = ?`,
            values
        );
    } catch (err) {
        console.error('Erro ao atualizar item de budget:', err);
        throw new Error('Falha ao atualizar item de budget no banco de dados.');
    }
};

export const deleteBudgetItem = async (id: string) => {
    try {
        const result = await db.runAsync('DELETE FROM budget_items WHERE id = ?', [id]);
        
        if (result.changes === 0) {
            throw new Error('Item de budget não encontrado.');
        }
        
        return result;
    } catch (err) {
        console.error('Erro ao deletar item de budget:', err);
        throw err;
    }
};

export const getBudgetItemById = async (id: string): Promise<BudgetItem | null> => {
    try {
        const result = await db.getAllAsync<BudgetItem>(
            'SELECT * FROM budget_items WHERE id = ?',
            [id]
        );
        
        if (result.length === 0) {
            return null;
        }
        
        return {
            ...result[0],
            planned_value: Number(result[0].planned_value),
            actual_value: result[0].actual_value ? Number(result[0].actual_value) : undefined,
        };
    } catch (err) {
        console.error('Erro ao buscar item de budget por ID:', err);
        throw new Error('Falha ao buscar item de budget do banco de dados.');
    }
};

export const getBudgetItemsByBudgetId = async (budget_id: string): Promise<BudgetItem[]> => {
    const result = await db.getAllAsync(
        `SELECT * FROM budget_items WHERE budget_id = '${budget_id}' ORDER BY created_at ASC;`
    );
    const items = result as BudgetItem[];
    // Remover duplicatas: só retorna o primeiro de cada par (category_name, category_type)
    const uniqueMap = new Map();
    for (const item of items) {
        const key = item.category_name + '-' + item.category_type;
        if (!uniqueMap.has(key)) {
            uniqueMap.set(key, item);
        } else {
            console.warn('[BudgetItem] Ignorando duplicata ao retornar itens:', key, 'budget_id:', budget_id);
        }
    }
    return Array.from(uniqueMap.values());
};

export const getBudgetItemsByCategoryType = async (budget_id: string, category_type: 'expense' | 'income'): Promise<BudgetItem[]> => {
    try {
        const result = await db.getAllAsync<any>(
            'SELECT * FROM budget_items WHERE budget_id = ? AND category_type = ? ORDER BY category_name ASC',
            [budget_id, category_type]
        );
        
        return result.map(item => ({
            ...item,
            planned_value: Number(item.planned_value),
            actual_value: item.actual_value ? Number(item.actual_value) : undefined,
        }));
    } catch (err) {
        console.error('Erro ao buscar itens de budget por tipo:', err);
        throw new Error('Falha ao buscar itens de budget por tipo.');
    }
};

// Função para deletar todos os itens de um budget
export const deleteBudgetItemsByBudgetId = async (budget_id: string) => {
    try {
        return await db.runAsync('DELETE FROM budget_items WHERE budget_id = ?', [budget_id]);
    } catch (err) {
        console.error('Erro ao deletar itens de budget:', err);
        throw new Error('Falha ao deletar itens de budget do banco de dados.');
    }
};

// Função para calcular totais de um budget
export const calculateBudgetTotals = async (budget_id: string) => {
    try {
        const result = await db.getAllAsync<any>(
            `SELECT 
                category_type,
                SUM(planned_value) as total_planned,
                SUM(COALESCE(actual_value, 0)) as total_actual
             FROM budget_items 
             WHERE budget_id = ?
             GROUP BY category_type`,
            [budget_id]
        );
        
        const totals = {
            expenses: { planned: 0, actual: 0 },
            income: { planned: 0, actual: 0 }
        };
        
        result.forEach(row => {
            if (row.category_type === 'expense') {
                totals.expenses.planned = Number(row.total_planned);
                totals.expenses.actual = Number(row.total_actual);
            } else if (row.category_type === 'income') {
                totals.income.planned = Number(row.total_planned);
                totals.income.actual = Number(row.total_actual);
            }
        });
        
        return totals;
    } catch (err) {
        console.error('Erro ao calcular totais do budget:', err);
        throw new Error('Falha ao calcular totais do budget.');
    }
}; 