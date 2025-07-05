// app\src\hooks\useCategoriesAndAccounts.ts
import { useState, useEffect, useCallback } from 'react';
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
  const loadCategories = useCallback(async () => {
    try {
      const data = await getAllCategories();
      setCategories(data);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar categorias');
      console.error(err);
    }
  }, []);

  // Carregar contas
  const loadAccounts = useCallback(async () => {
    try {
      const data = await getAllAccounts();
      setAccounts(data);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar contas');
      console.error(err);
    }
  }, []);

  // Carregar ambos
  const loadAll = useCallback(async () => {
    try {
      setLoading(true);
      await Promise.all([loadCategories(), loadAccounts()]);
    } catch (err) {
      setError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, [loadCategories, loadAccounts]);

  // CRUD para Categorias
  const createCategory = useCallback(async (name: string): Promise<boolean> => {
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
      await loadCategories(); // Recarrega imediatamente
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar categoria');
      throw err;
    }
  }, [categories, loadCategories]);

  const editCategory = useCallback(async (id: string, name: string): Promise<boolean> => {
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
      await loadCategories(); // Recarrega imediatamente
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao editar categoria');
      throw err;
    }
  }, [categories, loadCategories]);

  const removeCategory = useCallback(async (id: string): Promise<boolean> => {
    try {
      const category = categories.find(cat => cat.id === id);
      if (!category) {
        throw new Error('Categoria não encontrada');
      }

      if (category.isDefault) {
        throw new Error('Não é possível excluir categorias padrão do sistema');
      }

      await deleteCategory(id);
      await loadCategories(); // Recarrega imediatamente
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir categoria');
      throw err;
    }
  }, [categories, loadCategories]);

  // CRUD para Contas
  const createAccount = useCallback(async (name: string): Promise<boolean> => {
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
      await loadAccounts(); // Recarrega imediatamente
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta');
      throw err;
    }
  }, [accounts, loadAccounts]);

  const editAccount = useCallback(async (id: string, name: string): Promise<boolean> => {
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
      await loadAccounts(); // Recarrega imediatamente
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao editar conta');
      throw err;
    }
  }, [accounts, loadAccounts]);

  const removeAccount = useCallback(async (id: string): Promise<boolean> => {
    try {
      const account = accounts.find(acc => acc.id === id);
      if (!account) {
        throw new Error('Conta não encontrada');
      }

      if (account.isDefault) {
        throw new Error('Não é possível excluir contas padrão do sistema');
      }

      await deleteAccount(id);
      await loadAccounts(); // Recarrega imediatamente
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir conta');
      throw err;
    }
  }, [accounts, loadAccounts]);

  // Obter nomes para usar nos selects - memo para performance
  const getCategoryNames = useCallback((): string[] => {
    return categories.map(cat => cat.name).sort();
  }, [categories]);

  const getAccountNames = useCallback((): string[] => {
    return accounts.map(acc => acc.name).sort();
  }, [accounts]);

  // Inicializar dados
  useEffect(() => {
    loadAll();
  }, [loadAll]);

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