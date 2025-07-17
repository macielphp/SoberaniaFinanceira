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

// Função para resetar completamente o banco de dados
export const resetDatabase = async () => {
  try {
    console.log('🔥 Iniciando reset completo do banco de dados...');
    
    // Drop de todas as tabelas existentes
    console.log('🗑️ Removendo tabelas existentes...');
    await db.execAsync('DROP TABLE IF EXISTS operations');
    await db.execAsync('DROP TABLE IF EXISTS categories');
    await db.execAsync('DROP TABLE IF EXISTS accounts');
    await db.execAsync('DROP TABLE IF EXISTS budget');
    await db.execAsync('DROP TABLE IF EXISTS budget_items');
    
    console.log('✅ Tabelas removidas com sucesso');
  } catch (error) {
    console.error('❌ Erro durante reset do banco:', error);
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