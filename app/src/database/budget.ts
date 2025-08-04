// app\src\database\budget.ts
import * as SQLite from 'expo-sqlite';
import { 
    insertBudgetItem, 
    insertMultipleBudgetItems, 
    getBudgetItemsByBudgetId, 
    deleteBudgetItemsByBudgetId,
    calculateBudgetTotals,
    BudgetItemInput 
} from './budget-items';
import { FinanceService } from '../services/FinanceService';

// Type definitions
export interface Budget {
    id: string;
    user_id: string;
    name: string;
    start_period: string;
    end_period: string;
    type: 'manual' | 'automatic';
    base_month?: string; // Apenas para orçamentos automáticos
    total_planned_value: number;
    total_actual_value?: number; // Para orçamentos automáticos
    created_at: string;
    updated_at: string;
}

export interface BudgetWithItems extends Budget {
    items: BudgetItemInput[];
}

export interface BudgetPerformance {
    budget_id: string;
    total_planned: number;
    total_actual: number;
    difference: number;
    percentage_used: number;
    percentage_saved: number;
    status: 'superávit' | 'déficit' | 'equilibrado';
    items_performance: BudgetItemPerformance[];
}

export interface BudgetItemPerformance {
    category_name: string;
    category_type: 'expense' | 'income';
    planned_value: number;
    actual_value: number;
    difference: number;
    percentage_used: number;
    status: 'superávit' | 'déficit' | 'equilibrado';
}

export interface BudgetCategoryPerformance {
    category_name: string;
    category_type: 'expense' | 'income';
    planned_value: number;
    actual_value: number;
    percentage_used: number;
    status: 'superávit' | 'déficit' | 'equilibrado';
}

export interface MonthlyBudgetBalance {
    month: string; // YYYY-MM
    total_income_planned: number;
    total_expense_planned: number;
    total_income_actual: number;
    total_expense_actual: number;
    balance: number;
    status: 'superávit' | 'déficit' | 'equilibrado';
    categories_performance: BudgetCategoryPerformance[];
}

// Abrindo ou criando banco
const db = SQLite.openDatabaseSync('finance.db');

// Criando a tabela de budget
export const createBudgetTable = async () => {
    await db.execAsync(
        `CREATE TABLE IF NOT EXISTS budget (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            name TEXT NOT NULL,
            start_period TEXT NOT NULL,
            end_period TEXT NOT NULL,
            type TEXT NOT NULL CHECK(type IN ('manual', 'automatic')),
            base_month TEXT,
            total_planned_value REAL NOT NULL,
            total_actual_value REAL,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            updated_at TEXT NOT NULL DEFAULT (datetime('now')),
            UNIQUE(user_id)
        )`
    );

    // Índices para budget
    await db.execAsync('CREATE INDEX IF NOT EXISTS idx_budget_user_id ON budget (user_id);');
    await db.execAsync('CREATE INDEX IF NOT EXISTS idx_budget_period ON budget (start_period, end_period);');
    await db.execAsync('CREATE INDEX IF NOT EXISTS idx_budget_type ON budget (type);');
    await db.execAsync('CREATE INDEX IF NOT EXISTS idx_budget_name ON budget (name);');
};

// CRUD para budget
export const insertBudget = async (budget: Omit<Budget, 'id' | 'created_at' | 'updated_at'>) => {
    try {
        console.log('💾 Iniciando inserção de orçamento...');
        console.log('📋 Dados do orçamento:', budget);
        
        const id = `budget-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
        const now = new Date().toISOString();
        
        console.log('🆔 ID gerado:', id);
        console.log('⏰ Timestamp:', now);
        
        // Primeiro, deletar qualquer budget existente para este usuário
        console.log('🗑️ Removendo orçamentos existentes para o usuário...');
        const deleteResult = await db.runAsync('DELETE FROM budget WHERE user_id = ?', [budget.user_id]);
        console.log('🗑️ Orçamentos removidos:', deleteResult.changes);
        
        const insertResult = await db.runAsync(
            `INSERT INTO budget (id, user_id, name, start_period, end_period, type, base_month, total_planned_value, total_actual_value, created_at, updated_at) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, budget.user_id, budget.name.trim(), budget.start_period, budget.end_period, budget.type, budget.base_month || null, budget.total_planned_value, budget.total_actual_value || null, now, now]
        );
        
        console.log('✅ Orçamento inserido com sucesso:', insertResult);
        return insertResult;
    } catch (err) {
        console.error('❌ Erro ao inserir budget:', err);
        throw new Error('Falha ao salvar budget no banco de dados.');
    }
};

export const updateBudget = async (budget: Budget) => {
    try {
        const now = new Date().toISOString();
        
        return await db.runAsync(
            `UPDATE budget SET 
                name = ?, 
                start_period = ?, 
                end_period = ?, 
                type = ?,
                base_month = ?,
                total_planned_value = ?, 
                total_actual_value = ?,
                updated_at = ?
             WHERE id = ? AND user_id = ?`,
            [budget.name.trim(), budget.start_period, budget.end_period, budget.type, budget.base_month || null, budget.total_planned_value, budget.total_actual_value || null, now, budget.id, budget.user_id]
        );
    } catch (err) {
        console.error('Erro ao atualizar budget:', err);
        throw new Error('Falha ao atualizar budget no banco de dados.');
    }
};

// Função para atualizar orçamento e seus itens
export const updateBudgetWithItems = async (budget: Budget, budget_items: BudgetItemInput[]): Promise<Budget> => {
    try {
        console.log('🔄 Iniciando atualização de orçamento com itens...');
        console.log('📊 Orçamento:', budget);
        console.log('📦 Itens:', budget_items);
        
        // Calcular o valor total planejado
        const total_planned_value = budget_items.reduce((sum, item) => sum + item.planned_value, 0);
        
        // Atualizar o orçamento com o novo valor total
        const updatedBudget = {
            ...budget,
            total_planned_value
        };
        
        // Atualizar o orçamento
        await updateBudget(updatedBudget);
        
        // Deletar itens existentes
        await deleteBudgetItemsByBudgetId(budget.id);
        
        // Inserir novos itens
        if (budget_items.length > 0) {
            await insertMultipleBudgetItems(budget.id, budget_items);
        }
        
        console.log('✅ Orçamento e itens atualizados com sucesso!');
        
        // Retornar o orçamento atualizado
        return {
            ...updatedBudget,
            total_planned_value
        };
    } catch (err) {
        console.error('❌ Erro ao atualizar orçamento com itens:', err);
        throw new Error('Falha ao atualizar orçamento e itens no banco de dados.');
    }
};

export const deleteBudget = async (id: string, user_id: string) => {
    try {
        // Primeiro deletar os itens do budget
        await deleteBudgetItemsByBudgetId(id);
        
        // Depois deletar o budget
        const result = await db.runAsync('DELETE FROM budget WHERE id = ? AND user_id = ?', [id, user_id]);
        
        if (result.changes === 0) {
            throw new Error('Budget não encontrado ou não pertence ao usuário.');
        }
        
        return result;
    } catch (err) {
        console.error('Erro ao deletar budget:', err);
        throw err;
    }
};

export const getBudgetById = async (id: string, user_id: string): Promise<Budget | null> => {
    try {
        const result = await db.getAllAsync<Budget>(
            'SELECT * FROM budget WHERE id = ? AND user_id = ?',
            [id, user_id]
        );
        
        if (result.length === 0) {
            return null;
        }
        
        return {
            ...result[0],
            total_planned_value: Number(result[0].total_planned_value),
            total_actual_value: result[0].total_actual_value ? Number(result[0].total_actual_value) : undefined,
        };
    } catch (err) {
        console.error('Erro ao buscar budget por ID:', err);
        throw new Error('Falha ao buscar budget do banco de dados.');
    }
};

// Função para obter o orçamento ativo do usuário (apenas um por usuário)
export const getActiveBudget = async (user_id: string): Promise<Budget | null> => {
    try {
        console.log('🔍 Buscando orçamento ativo para usuário:', user_id);
        
        // Primeiro, vamos verificar se a tabela budget existe e tem dados
        const tableCheck = await db.getAllAsync<any>('SELECT name FROM sqlite_master WHERE type="table" AND name="budget"');
        console.log('📋 Tabela budget existe:', tableCheck.length > 0);
        
        if (tableCheck.length > 0) {
            const budgetCount = await db.getAllAsync<any>('SELECT COUNT(*) as count FROM budget');
            console.log('📊 Total de orçamentos na tabela:', budgetCount[0]?.count || 0);
            
            const allBudgets = await db.getAllAsync<any>('SELECT * FROM budget');
            console.log('📋 Todos os orçamentos:', allBudgets);
        }
        
        const result = await db.getAllAsync<any>(
            'SELECT * FROM budget WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
            [user_id]
        );
        
        console.log('🔍 Resultado da busca por orçamento ativo:', result);
        
        if (result.length === 0) {
            console.log('❌ Nenhum orçamento ativo encontrado');
            return null;
        }
        
        const budget = {
            ...result[0],
            total_planned_value: Number(result[0].total_planned_value),
            total_actual_value: result[0].total_actual_value ? Number(result[0].total_actual_value) : undefined,
        };
        
        console.log('✅ Orçamento ativo encontrado:', budget);
        return budget;
    } catch (err) {
        console.error('❌ Erro ao buscar budget ativo:', err);
        throw new Error('Falha ao buscar budget ativo do banco de dados.');
    }
};

// Função para calcular o desempenho do orçamento por mês/ano específico
export const calculateMonthlyBudgetPerformance = async (
    user_id: string, 
    month: string // Formato: YYYY-MM
): Promise<MonthlyBudgetBalance | null> => {
    try {
        console.log('📊 Calculando desempenho mensal para:', month);
        console.log('👤 User ID:', user_id);
        
        // Buscar o orçamento ativo
        const budget = await getActiveBudget(user_id);
        if (!budget) {
            console.log('❌ Nenhum orçamento ativo encontrado');
            return null;
        }
        
        console.log('✅ Orçamento ativo encontrado:', budget.id);

        // Buscar os itens do orçamento
        const budgetItems = await getBudgetItemsByBudgetId(budget.id);
        console.log('📋 Itens do orçamento:', budgetItems);
        
        // Buscar operações do mês específico
        const startDate = `${month}-01`;
        const endDate = `${month}-31`; // Será ajustado para o último dia do mês
        
        console.log('📅 Buscando operações entre:', startDate, 'e', endDate);
        
        const operations = await db.getAllAsync<any>(
            `SELECT o.*, o.category as category_name
            FROM operations o
            WHERE o.user_id = ?
            AND o.date >= ?
            AND o.date <= ?
            AND o.state IN ('pago', 'recebido')`,
            [user_id, startDate, endDate]
        );
        
        console.log('📊 Operações encontradas:', operations.length);
        console.log('📋 Detalhes das operações:', operations);

        // Calcular totais planejados
        const totalIncomePlanned = budgetItems
            .filter(item => item.category_type === 'income')
            .reduce((sum, item) => sum + item.planned_value, 0);
            
        const totalExpensePlanned = budgetItems
            .filter(item => item.category_type === 'expense')
            .reduce((sum, item) => sum + item.planned_value, 0);
            
        console.log('💰 Receitas planejadas:', totalIncomePlanned);
        console.log('💸 Despesas planejadas:', totalExpensePlanned);

        // Usar o serviço centralizado para calcular receitas e despesas reais
        console.log('📊 Usando serviço centralizado para calcular totais reais');
        
        // Buscar TODAS as operações do usuário para o serviço centralizado
        const allOperations = await db.getAllAsync<any>(
            `SELECT o.*, o.category as category_name
            FROM operations o
            WHERE o.user_id = ?
            AND o.state IN ('pago', 'recebido')`,
            [user_id]
        );
        
        const financeService = new FinanceService();
        const realValues = financeService.getRealIncomeAndExpenses(allOperations, startDate, endDate);
        
        const totalIncomeActual = realValues.totalReceitas;
        const totalExpenseActual = realValues.totalDespesas;
        
        console.log('📊 Resultado do serviço centralizado:', {
            totalReceitas: realValues.totalReceitas,
            totalDespesas: realValues.totalDespesas,
            receitasCount: realValues.receitas.length,
            despesasCount: realValues.despesas.length
        });
            
        console.log('💰 Receitas reais:', totalIncomeActual);
        console.log('💸 Despesas reais:', totalExpenseActual);

        // Calcular balanço
        const balance = totalIncomeActual - totalExpenseActual;
        console.log('💳 Balanço:', balance);
        
        // Determinar status
        let status: 'superávit' | 'déficit' | 'equilibrado';
        if (balance > 0) {
            status = 'superávit';
        } else if (balance < 0) {
            status = 'déficit';
        } else {
            status = 'equilibrado';
        }
        
        console.log('📈 Status:', status);

        // Calcular desempenho por categoria
        const categoriesPerformance: BudgetCategoryPerformance[] = [];
        
        for (const budgetItem of budgetItems) {
            const categoryOperations = operations.filter(op => 
                op.category_name === budgetItem.category_name && 
                op.nature === (budgetItem.category_type === 'income' ? 'receita' : 'despesa')
            );
            
            const actualValue = categoryOperations.reduce((sum, op) => sum + Number(op.value), 0);
            const percentageUsed = budgetItem.planned_value > 0 ? (actualValue / budgetItem.planned_value) * 100 : 0;
            
            let itemStatus: 'superávit' | 'déficit' | 'equilibrado';
            if (budgetItem.category_type === 'income') {
                if (actualValue > budgetItem.planned_value) {
                    itemStatus = 'superávit';
                } else if (actualValue < budgetItem.planned_value) {
                    itemStatus = 'déficit';
                } else {
                    itemStatus = 'equilibrado';
                }
            } else {
                if (actualValue < budgetItem.planned_value) {
                    itemStatus = 'superávit';
                } else if (actualValue > budgetItem.planned_value) {
                    itemStatus = 'déficit';
                } else {
                    itemStatus = 'equilibrado';
                }
            }
            
            categoriesPerformance.push({
                category_name: budgetItem.category_name,
                category_type: budgetItem.category_type,
                planned_value: budgetItem.planned_value,
                actual_value: actualValue,
                percentage_used: percentageUsed,
                status: itemStatus
            });
        }
        
        console.log('📊 Desempenho por categoria:', categoriesPerformance);

        const result = {
            month,
            total_income_planned: totalIncomePlanned,
            total_expense_planned: totalExpensePlanned,
            total_income_actual: totalIncomeActual,
            total_expense_actual: totalExpenseActual,
            balance,
            status,
            categories_performance: categoriesPerformance
        };
        
        console.log('🎉 Resultado final do desempenho:', result);
        return result;
    } catch (err) {
        console.error('❌ Erro ao calcular desempenho mensal do orçamento:', err);
        throw new Error('Falha ao calcular desempenho mensal do orçamento.');
    }
};

// Função para criar orçamento manual
export const createManualBudget = async (
    user_id: string,
    name: string,
    start_period: string,
    end_period: string,
    budget_items: BudgetItemInput[]
): Promise<Budget> => {
    try {
        console.log('📝 Iniciando criação de orçamento manual...');
        console.log('👤 User ID:', user_id);
        console.log('📋 Nome:', name);
        console.log('📅 Período:', start_period, 'a', end_period);
        console.log('📊 Itens do orçamento:', budget_items);
        
        // Validações
        if (budget_items.length === 0) {
            throw new Error('Pelo menos um item deve ser incluído no orçamento.');
        }

        const expenseItems = budget_items.filter(item => item.category_type === 'expense');
        const incomeItems = budget_items.filter(item => item.category_type === 'income');

        console.log('💰 Itens de despesa:', expenseItems.length);
        console.log('💵 Itens de receita:', incomeItems.length);

        if (expenseItems.length === 0) {
            throw new Error('Pelo menos uma categoria de despesa deve ser incluída.');
        }

        if (incomeItems.length === 0) {
            throw new Error('Pelo menos uma categoria de receita deve ser incluída.');
        }

        // Validar valores
        for (const item of budget_items) {
            if (item.planned_value <= 0) {
                throw new Error(`Valor para categoria "${item.category_name}" deve ser maior que zero.`);
            }
        }

        // Calcular totais
        const total_planned_value = budget_items.reduce((sum, item) => sum + item.planned_value, 0);
        console.log('💲 Valor total planejado:', total_planned_value);

        // Criar budget
        const budgetData = {
            user_id,
            name,
            start_period,
            end_period,
            type: 'manual' as const,
            total_planned_value,
        };

        console.log('💾 Salvando orçamento no banco...');
        const result = await insertBudget(budgetData);
        console.log('✅ Orçamento salvo:', result);
        
        // Buscar o orçamento recém-criado para obter o ID correto
        const createdBudget = await getActiveBudget(user_id);
        if (!createdBudget) {
            throw new Error('Erro ao recuperar orçamento criado');
        }
        
        const budget_id = createdBudget.id;
        console.log('🆔 ID do orçamento recuperado:', budget_id);

        // Remover itens antigos antes de inserir novos
        await deleteBudgetItemsByBudgetId(budget_id);

        // Inserir itens
        console.log('📋 Salvando itens do orçamento...');
        await insertMultipleBudgetItems(budget_id, budget_items);
        console.log('✅ Itens do orçamento salvos');

        const finalBudget = {
            ...createdBudget,
        };
        
        console.log('🎉 Orçamento manual criado com sucesso:', finalBudget);
        return finalBudget;
    } catch (err) {
        console.error('❌ Erro ao criar orçamento manual:', err);
        throw err;
    }
};

// Função para criar orçamento automático
export const createAutomaticBudget = async (
    user_id: string,
    name: string,
    start_period: string,
    end_period: string,
    base_month: string // Formato: YYYY-MM
): Promise<Budget> => {
    try {
        // Calcular período do mês base
        const [year, month] = base_month.split('-');
        const start_date = `${year}-${month}-01`;
        const end_date = `${year}-${month}-31`; // Simplificado, ideal seria calcular o último dia do mês

        // Buscar operações do mês base
        const operations = await db.getAllAsync<any>(
            `SELECT 
                category,
                nature,
                SUM(ABS(value)) as total_value
             FROM operations 
             WHERE user_id = ?
             AND date BETWEEN ? AND ?
             AND state IN ('pago', 'recebido')
             GROUP BY category, nature
             ORDER BY nature DESC, total_value DESC`,
            [user_id, start_date, end_date]
        );

        if (operations.length === 0) {
            throw new Error('Não há dados suficientes no mês base para criar um orçamento automático.');
        }

        // Converter operações em itens de budget
        const budget_items: BudgetItemInput[] = operations.map(op => ({
            category_name: op.category,
            planned_value: Number(op.total_value),
            actual_value: Number(op.total_value),
            category_type: op.nature === 'despesa' ? 'expense' : 'income'
        }));

        // Calcular totais
        const total_planned_value = budget_items.reduce((sum, item) => sum + item.planned_value, 0);
        const total_actual_value = budget_items.reduce((sum, item) => sum + (item.actual_value || 0), 0);

        // Criar budget
        const budgetData = {
            user_id,
            name,
            start_period,
            end_period,
            type: 'automatic' as const,
            base_month,
            total_planned_value,
            total_actual_value,
        };

        const result = await insertBudget(budgetData);
        // Buscar o orçamento recém-criado para obter o ID correto
        const createdBudget = await getActiveBudget(user_id);
        if (!createdBudget) {
            throw new Error('Erro ao recuperar orçamento criado');
        }
        const budget_id = createdBudget.id;
        // Remover itens antigos antes de inserir novos
        await deleteBudgetItemsByBudgetId(budget_id);
        // Inserir itens
        await insertMultipleBudgetItems(budget_id, budget_items);
        return {
            ...createdBudget,
        };
    } catch (err) {
        console.error('Erro ao criar orçamento automático:', err);
        throw err;
    }
};

// Função para buscar dados históricos para orçamento automático
export const getHistoricalDataForAutomaticBudget = async (
    user_id: string,
    base_month: string
): Promise<{ category: string; nature: string; total_value: number }[]> => {
    try {
        const [year, month] = base_month.split('-');
        const start_date = `${year}-${month}-01`;
        const end_date = `${year}-${month}-31`;

        const result = await db.getAllAsync<any>(
            `SELECT 
                category,
                nature,
                SUM(ABS(value)) as total_value
             FROM operations 
             WHERE user_id = ?
             AND date BETWEEN ? AND ?
             AND state IN ('pago', 'recebido')
             GROUP BY category, nature
             ORDER BY nature DESC, total_value DESC`,
            [user_id, start_date, end_date]
        );

        return result.map(item => ({
            category: item.category,
            nature: item.nature,
            total_value: Number(item.total_value)
        }));
    } catch (err) {
        console.error('Erro ao buscar dados históricos:', err);
        throw new Error('Falha ao buscar dados históricos para orçamento automático.');
    }
};

// Função para calcular performance do budget
export const calculateBudgetPerformance = async (budget_id: string, user_id: string): Promise<BudgetPerformance> => {
    try {
        // Buscar o budget
        const budget = await getBudgetById(budget_id, user_id);
        if (!budget) {
            throw new Error('Budget não encontrado.');
        }

        // Buscar itens do budget
        const budget_items = await getBudgetItemsByBudgetId(budget_id);

        // Buscar operações reais no período do budget
        const operations = await db.getAllAsync<any>(
            `SELECT 
                category,
                nature,
                SUM(ABS(value)) as total_value
             FROM operations 
             WHERE user_id = ?
             AND date BETWEEN ? AND ?
             AND state IN ('pago', 'recebido')
             GROUP BY category, nature`,
            [user_id, budget.start_period, budget.end_period]
        );

        // Calcular performance por item
        const items_performance: BudgetItemPerformance[] = budget_items.map(item => {
            const operation = operations.find(op => 
                op.category === item.category_name && 
                op.nature === (item.category_type === 'expense' ? 'despesa' : 'receita')
            );

            const actual_value = operation ? Number(operation.total_value) : 0;
            const difference = item.planned_value - actual_value;
            const percentage_used = item.planned_value > 0 ? (actual_value / item.planned_value) * 100 : 0;
            
            let status: 'superávit' | 'déficit' | 'equilibrado';
            if (item.category_type === 'expense') {
                status = difference > 0 ? 'superávit' : difference < 0 ? 'déficit' : 'equilibrado';
            } else {
                status = difference < 0 ? 'superávit' : difference > 0 ? 'déficit' : 'equilibrado';
            }

            return {
                category_name: item.category_name,
                category_type: item.category_type,
                planned_value: item.planned_value,
                actual_value,
                difference,
                percentage_used,
                status
            };
        });

        // Calcular totais
        const total_planned = budget_items.reduce((sum, item) => sum + item.planned_value, 0);
        const total_actual = items_performance.reduce((sum, item) => sum + item.actual_value, 0);
        const difference = total_planned - total_actual;
        const percentage_used = total_planned > 0 ? (total_actual / total_planned) * 100 : 0;
        const percentage_saved = total_planned > 0 ? (difference / total_planned) * 100 : 0;

        // Determinar status geral (baseado em despesas)
        const expense_items = items_performance.filter(item => item.category_type === 'expense');
        const expense_planned = expense_items.reduce((sum, item) => sum + item.planned_value, 0);
        const expense_actual = expense_items.reduce((sum, item) => sum + item.actual_value, 0);
        const expense_difference = expense_planned - expense_actual;

        let status: 'superávit' | 'déficit' | 'equilibrado';
        status = expense_difference > 0 ? 'superávit' : expense_difference < 0 ? 'déficit' : 'equilibrado';

        return {
            budget_id,
            total_planned,
            total_actual,
            difference,
            percentage_used,
            percentage_saved,
            status,
            items_performance
        };
    } catch (err) {
        console.error('Erro ao calcular performance do budget:', err);
        throw new Error('Falha ao calcular performance do budget.');
    }
}; 

export { getBudgetItemsByBudgetId }; 