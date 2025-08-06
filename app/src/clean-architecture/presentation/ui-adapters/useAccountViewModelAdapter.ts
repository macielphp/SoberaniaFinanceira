import { useEffect, useState, useCallback } from 'react';
import { AccountViewModel } from '../view-models/AccountViewModel';
import { AccountProps } from '../../domain/entities/Account';
import { SQLiteAccountRepository } from '../../../clean-architecture/data/repositories/SQLiteAccountRepository';

// TODO: Substituir por DI real
const accountRepository = new SQLiteAccountRepository();

export function useAccountViewModelAdapter() {
  const [viewModel] = useState(() => new AccountViewModel(accountRepository));
  const [accounts, setAccounts] = useState(viewModel.accounts);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAccounts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await viewModel.loadAccounts();
      setAccounts([...viewModel.accounts]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar contas');
    } finally {
      setLoading(false);
    }
  }, [viewModel]);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  const createAccount = async (props: AccountProps) => {
    setLoading(true);
    setError(null);
    try {
      await viewModel.createAccount(props);
      setAccounts([...viewModel.accounts]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateAccount = async (props: AccountProps) => {
    setLoading(true);
    setError(null);
    try {
      await viewModel.updateAccount(props);
      setAccounts([...viewModel.accounts]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar conta');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await viewModel.deleteAccount(id);
      setAccounts([...viewModel.accounts]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar conta');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    accounts,
    loading,
    error,
    createAccount,
    updateAccount,
    deleteAccount,
    loadAccounts,
  };
}