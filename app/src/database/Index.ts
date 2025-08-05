// app\src\database\index.ts
// Arquivo principal que importa e exporta todas as funções do banco de dados

import * as SQLite from 'expo-sqlite';

// Abrindo ou criando banco
const db = SQLite.openDatabaseSync('finance.db');

import {
  createOperationsTable,
  insertOperation,
  updateOperation,
  deleteOperation,
  getAllOperations,
  getOperationsByDateRange,
  getOperationsByCategory,
  getOperationsByAccount,
  isCategoryUsedInOperations,
  isAccountUsedInOperations
} from './operations';

import {
  createCategoriesTable,
  insertDefaultCategories,
  insertCategory,
  updateCategory,
  deleteCategory,
  getAllCategories,
  getCategoriesByType,
  Category
} from './categories';

import {
  createAccountsTable,
  insertDefaultAccounts,
  insertAccount,
  updateAccount,
  deleteAccount,
  getAllAccounts,
  Account
} from './accounts';

import {
  createBudgetTable,
  insertBudget,
  updateBudget,
  updateBudgetWithItems,
  deleteBudget,
  getBudgetById,
  getActiveBudget,
  calculateBudgetPerformance,
  calculateMonthlyBudgetPerformance,
  createManualBudget,
  createAutomaticBudget,
  getHistoricalDataForAutomaticBudget,
  Budget,
  BudgetWithItems,
  BudgetPerformance,
  BudgetItemPerformance,
  MonthlyBudgetBalance,
  BudgetCategoryPerformance
} from './budget';

import {
  createBudgetItemsTable,
  insertBudgetItem,
  insertMultipleBudgetItems,
  updateBudgetItem,
  deleteBudgetItem,
  getBudgetItemById,
  getBudgetItemsByBudgetId,
  getBudgetItemsByCategoryType,
  deleteBudgetItemsByBudgetId,
  calculateBudgetTotals,
  BudgetItem,
  BudgetItemInput
} from './budget-items';

// Adicionar importação e exportação para goals
import {
  createGoalsTable,
  insertGoal,
  updateGoal,
  deleteGoal,
  getAllGoals,
  getGoalById,
  Goal,
  getGoalProgress,
  updateGoalsTableStructure
} from './goals';

import { createMonthlyFinanceSummaryTable } from './monthly-finance-summary';

// Exportações das operações
export {
  createOperationsTable,
  insertOperation,
  updateOperation,
  deleteOperation,
  getAllOperations,
  getOperationsByDateRange,
  getOperationsByCategory,
  getOperationsByAccount,
  isCategoryUsedInOperations,
  isAccountUsedInOperations
};

// Exportações das categorias
export {
  createCategoriesTable,
  insertDefaultCategories,
  insertCategory,
  updateCategory,
  deleteCategory,
  getAllCategories,
  getCategoriesByType,
  Category
};

// Exportações das contas
export {
  createAccountsTable,
  insertDefaultAccounts,
  insertAccount,
  updateAccount,
  deleteAccount,
  getAllAccounts,
  Account
};

// Exportações do budget
export {
  createBudgetTable,
  insertBudget,
  updateBudget,
  updateBudgetWithItems,
  deleteBudget,
  getBudgetById,
  getActiveBudget,
  calculateBudgetPerformance,
  calculateMonthlyBudgetPerformance,
  createManualBudget,
  createAutomaticBudget,
  getHistoricalDataForAutomaticBudget,
  Budget,
  BudgetWithItems,
  BudgetPerformance,
  BudgetItemPerformance,
  MonthlyBudgetBalance,
  BudgetCategoryPerformance
};

// Exportações do budget-items
export {
  createBudgetItemsTable,
  insertBudgetItem,
  insertMultipleBudgetItems,
  updateBudgetItem,
  deleteBudgetItem,
  getBudgetItemById,
  getBudgetItemsByBudgetId,
  getBudgetItemsByCategoryType,
  deleteBudgetItemsByBudgetId,
  calculateBudgetTotals,
  BudgetItem,
  BudgetItemInput
};

// Adicionar exportações para goals
export {
  createGoalsTable,
  insertGoal,
  updateGoal,
  deleteGoal,
  getAllGoals,
  getGoalById,
  Goal,
  getGoalProgress,
  updateGoalsTableStructure
};

// Função para limpar todos os dados da database
export const clearAllData = async () => {
  try {
    console.log('🗑️ Iniciando limpeza de todos os dados...');
    
    // Limpar todas as tabelas na ordem correta (respeitando foreign keys)
    await db.runAsync('DELETE FROM operations');
    console.log('✅ Operações apagadas');
    
    await db.runAsync('DELETE FROM budget_items');
    console.log('✅ Itens de orçamento apagados');
    
    await db.runAsync('DELETE FROM budget');
    console.log('✅ Orçamentos apagados');
    
    await db.runAsync('DELETE FROM monthly_finance_summary');
    console.log('✅ Resumos mensais apagados');
    
    await db.runAsync('DELETE FROM goal');
    console.log('✅ Metas apagadas');
    
    await db.runAsync('DELETE FROM categories');
    console.log('✅ Categorias apagadas');
    
    await db.runAsync('DELETE FROM accounts');
    console.log('✅ Contas apagadas');
    
    // Tentar resetar os contadores de ID (opcional, pode não existir)
    try {
      await db.runAsync('DELETE FROM sqlite_sequence');
      console.log('✅ Contadores de ID resetados');
    } catch (sequenceError) {
      console.log('ℹ️ Tabela sqlite_sequence não existe, pulando reset de contadores');
    }
    
    console.log('🎉 Todos os dados foram apagados com sucesso!');
    
    // Recriar dados padrão após a limpeza
    console.log('📝 Recriando dados padrão...');
    await insertDefaultCategories();
    console.log('✅ Categorias padrão recriadas');
    await insertDefaultAccounts();
    console.log('✅ Contas padrão recriadas');
    
    console.log('🎉 Limpeza concluída e dados padrão restaurados!');
  } catch (error) {
    console.error('❌ Erro ao limpar dados:', error);
    throw error;
  }
};

// Função principal para configurar o banco de dados
export const setupDatabase = async () => {
  try {
    console.log('🗄️ Iniciando configuração do banco de dados...');
    
    // Verificar se as tabelas já existem
    const tablesCheck = await db.getAllAsync<any>(
      "SELECT name FROM sqlite_master WHERE type='table' AND name IN ('operations', 'categories', 'accounts', 'budget', 'budget_items')"
    );
    
    const existingTables = tablesCheck.map(row => row.name);
    console.log('📋 Tabelas existentes:', existingTables);
    
    // Criar tabelas que não existem
    console.log('📋 Criando tabelas...');
    if (!existingTables.includes('operations')) {
      await createOperationsTable();
      console.log('✅ Tabela operations criada');
    }
    
    if (!existingTables.includes('categories')) {
      await createCategoriesTable();
      console.log('✅ Tabela categories criada');
    }
    
    if (!existingTables.includes('accounts')) {
      await createAccountsTable();
      console.log('✅ Tabela accounts criada');
    }
    
    if (!existingTables.includes('budget')) {
      await createBudgetTable();
      console.log('✅ Tabela budget criada');
    }
    
    if (!existingTables.includes('budget_items')) {
      await createBudgetItemsTable();
      console.log('✅ Tabela budget_items criada');
    }

    if (!existingTables.includes('goal')) {
      await createGoalsTable();
      console.log('✅ Tabela goal criada');
    } else {
      // Se a tabela já existe, verificar se precisa de atualização
      try {
        const { updateGoalsTableStructure } = await import('./goals');
        await updateGoalsTableStructure();
        console.log('✅ Estrutura da tabela goal verificada/atualizada');
      } catch (error) {
        console.log('⚠️ Erro ao verificar estrutura da tabela goal:', error);
      }
    }

    if (!existingTables.includes('monthly_finance_summary')) {
      await createMonthlyFinanceSummaryTable();
      console.log('✅ Tabela monthly_finance_summary criada');
    }
    
    console.log('✅ Todas as tabelas verificadas/criadas');

    // Inserir dados padrão apenas se as tabelas estiverem vazias
    console.log('📝 Verificando dados padrão...');
    
    const categoriesCount = await db.getAllAsync<any>('SELECT COUNT(*) as count FROM categories');
    if (categoriesCount[0].count === 0) {
      console.log('📝 Inserindo categorias padrão...');
      await insertDefaultCategories();
      console.log('✅ Categorias padrão inseridas');
    } else {
      console.log('⏭️ Categorias já existem, pulando inserção');
    }
    
    const accountsCount = await db.getAllAsync<any>('SELECT COUNT(*) as count FROM accounts');
    if (accountsCount[0].count === 0) {
      console.log('📝 Inserindo contas padrão...');
      await insertDefaultAccounts();
      console.log('✅ Contas padrão inseridas');
    } else {
      console.log('⏭️ Contas já existem, pulando inserção');
    }
    
    console.log('🎉 Banco de dados configurado com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao configurar banco de dados:', error);
    throw error;
  }
}; 