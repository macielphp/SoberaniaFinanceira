import { useState, useEffect, useCallback } from 'react';
import { AccountViewModel, CreateAccountData, UpdateAccountData } from '../view-models/AccountViewModel';
import { Account } from '../../domain/entities/Account';
import { SQLiteAccountRepository } from '../../data/repositories/SQLiteAccountRepository';

export interface UseAccountAdapterResult {
  // State
  loading: boolean;
  error: string | null;
  accounts: Account[];
  
  // Actions
  createAccount: (data: CreateAccountData) => Promise<Account>;
  updateAccount: (id: string, data: UpdateAccountData) => Promise<Account>;
  deleteAccount: (id: string) => Promise<boolean>;
  getAccountById: (id: string) => Promise<Account | null>;
  refresh: () => Promise<void>;
  

  
  // Error handling
  clearError: () => void;
  setError: (error: string) => void;
}

export function useAccountAdapter(): UseAccountAdapterResult {
  // Initialize ViewModel
  const [viewModel] = useState(() => {
    const repository = new SQLiteAccountRepository();
    return new AccountViewModel(repository);
  });

  // Local state to trigger re-renders
  const [, setUpdateCounter] = useState(0);
  const forceUpdate = useCallback(() => setUpdateCounter(prev => prev + 1), []);

  // Load accounts on mount
  useEffect(() => {
    const loadAccounts = async () => {
      try {
        await viewModel.getAllAccounts();
        forceUpdate();
      } catch (error) {
        // Error is handled by the ViewModel
        forceUpdate();
      }
    };

    loadAccounts();
  }, [viewModel, forceUpdate]);

  // Account actions
  const createAccount = useCallback(async (data: CreateAccountData): Promise<Account> => {
    try {
      const result = await viewModel.createAccount(data);
      forceUpdate();
      return result;
    } catch (error) {
      forceUpdate();
      throw error;
    }
  }, [viewModel, forceUpdate]);

  const updateAccount = useCallback(async (id: string, data: UpdateAccountData): Promise<Account> => {
    try {
      const result = await viewModel.updateAccount(id, data);
      forceUpdate();
      return result;
    } catch (error) {
      forceUpdate();
      throw error;
    }
  }, [viewModel, forceUpdate]);

  const deleteAccount = useCallback(async (id: string): Promise<boolean> => {
    try {
      const result = await viewModel.deleteAccount(id);
      forceUpdate();
      return result;
    } catch (error) {
      forceUpdate();
      throw error;
    }
  }, [viewModel, forceUpdate]);

  const getAccountById = useCallback(async (id: string): Promise<Account | null> => {
    try {
      return await viewModel.getAccountById(id);
    } catch (error) {
      forceUpdate();
      throw error;
    }
  }, [viewModel, forceUpdate]);

  const refresh = useCallback(async (): Promise<void> => {
    try {
      await viewModel.getAllAccounts();
      forceUpdate();
    } catch (error) {
      forceUpdate();
      throw error;
    }
  }, [viewModel, forceUpdate]);



  // Error handling
  const clearError = useCallback(() => {
    viewModel.clearError();
    forceUpdate();
  }, [viewModel, forceUpdate]);

  const setError = useCallback((error: string) => {
    viewModel.setError(error);
    forceUpdate();
  }, [viewModel, forceUpdate]);

  return {
    // State from ViewModel
    loading: viewModel.loading,
    error: viewModel.error,
    accounts: viewModel.accounts,
    
    // Actions
    createAccount,
    updateAccount,
    deleteAccount,
    getAccountById,
    refresh,

    
    // Error handling
    clearError,
    setError,
  };
}
