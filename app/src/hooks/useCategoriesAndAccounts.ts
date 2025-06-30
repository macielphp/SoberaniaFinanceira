// app\src\hooks\useCategoriesAndAccounts.ts
import { useState, useEffect } from 'react';
import { 
  Category, 
  Account,
  getAllCategories,
  getAllAccounts,
  insertCategory,
  insertAccount,
  updateCategory,
  updateAccount,
  deleteCategory,
  deleteAccount
} from '../database/Index';

export const useCategoriesAndAccounts = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar categorias
  const loadCategories = async () => {
    try {
      const data = await getAllCategories();
      setCategories(data);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar categorias');
      console.error(err);
    }
  };

  // Carregar contas
  const loadAccounts = async () => {
    try {
      const data = await getAllAccounts();
      setAccounts(data);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar contas');
      console.error(err);
    }
  };

  // Carregar ambos
  const loadAll = async () => {
    try {
      setLoading(true);
      await Promise.all([loadCategories(), loadAccounts()]);
    } catch (err) {
      setError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  // CRUD para Categorias
  const createCategory = async (name: string): Promise<boolean> => {
    try {
      if (!name.trim()) {
        throw new Error('Nome da categoria é obrigatório');
      }

      // Verificar se já existe
      const exists = categories.some(cat => 
        cat.name.toLowerCase().trim() === name.toLowerCase().trim()
      );
      
      if (exists) {
        throw new Error('Categoria já existe');
      }

      const newCategory = {
        name: name.trim(),
        isDefault: false,
        createdAt: new Date().toISOString()
      };

      await insertCategory(newCategory);
      await loadCategories();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar categoria');
      throw err;
    }
  };

  const editCategory = async (id: string, name: string): Promise<boolean> => {
    try {
      if (!name.trim()) {
        throw new Error('Nome da categoria é obrigatório');
      }
      const category = categories.find(cat => cat.id === id);
      if (!category) {
        throw new Error('Categoria não encontrada');
      }

      if (category.isDefault) {
        throw new Error('Não é possível editar categorias padrão do sistema');
      }

      // Verificar se já existe outra categoria com esse nome
      const exists = categories.some(cat => 
        cat.id !== id && 
        cat.name.toLowerCase().trim() === name.toLowerCase().trim()
      );
      
      if (exists) {
        throw new Error('Já existe uma categoria com esse nome');
      }

      const updatedCategory = {
        ...category,
        name: name.trim()
      };

      await updateCategory(updatedCategory);
      await loadCategories();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao editar categoria');
      throw err;
    }
  };

  const removeCategory = async (id: string): Promise<boolean> => {
    try {
      const category = categories.find(cat => cat.id === id);
      if (!category) {
        throw new Error('Categoria não encontrada');
      }

      if (category.isDefault) {
        throw new Error('Não é possível excluir categorias padrão do sistema');
      }

      await deleteCategory(id);
      await loadCategories();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir categoria');
      throw err;
    }
  };

  // CRUD para Contas
  const createAccount = async (name: string): Promise<boolean> => {
    try {
      if (!name.trim()) {
        throw new Error('Nome da conta é obrigatório');
      }

      // Verificar se já existe
      const exists = accounts.some(acc => 
        acc.name.toLowerCase().trim() === name.toLowerCase().trim()
      );
      
      if (exists) {
        throw new Error('Conta já existe');
      }

      const newAccount = {
        name: name.trim(),
        isDefault: false,
        createdAt: new Date().toISOString()
      };

      await insertAccount(newAccount);
      await loadAccounts();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta');
      throw err;
    }
  };

  const editAccount = async (id: string, name: string): Promise<boolean> => {
    try {
      if (!name.trim()) {
        throw new Error('Nome da conta é obrigatório');
      }

      const account = accounts.find(acc => acc.id === id);
      if (!account) {
        throw new Error('Conta não encontrada');
      }

      if (account.isDefault) {
        throw new Error('Não é possível editar contas padrão do sistema');
      }

      // Verificar se já existe outra conta com esse nome
      const exists = accounts.some(acc => 
        acc.id !== id && 
        acc.name.toLowerCase().trim() === name.toLowerCase().trim()
      );
      
      if (exists) {
        throw new Error('Já existe uma conta com esse nome');
      }

      const updatedAccount = {
        ...account,
        name: name.trim()
      };

      await updateAccount(updatedAccount);
      await loadAccounts();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao editar conta');
      throw err;
    }
  };

  const removeAccount = async (id: string): Promise<boolean> => {
    try {
      const account = accounts.find(acc => acc.id === id);
      if (!account) {
        throw new Error('Conta não encontrada');
      }

      if (account.isDefault) {
        throw new Error('Não é possível excluir contas padrão do sistema');
      }

      await deleteAccount(id);
      await loadAccounts();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir conta');
      throw err;
    }
  };

  // Obter nomes para usar nos selects
  const getCategoryNames = (): string[] => {
    return categories.map(cat => cat.name).sort();
  };

  const getAccountNames = (): string[] => {
    return accounts.map(acc => acc.name).sort();
  };

  // Inicializar dados
  useEffect(() => {
    loadAll();
  }, []);

  return {
    // Dados
    categories,
    accounts,
    loading,
    error,
    
    // Métodos de carregamento
    loadCategories,
    loadAccounts,
    loadAll,
    
    // CRUD Categorias
    createCategory,
    editCategory,
    removeCategory,
    
    // CRUD Contas
    createAccount,
    editAccount,
    removeAccount,
    
    // Helpers
    getCategoryNames,
    getAccountNames,
    
    // Limpar erro
    clearError: () => setError(null)
  };
};