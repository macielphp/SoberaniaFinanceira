import { useEffect, useState, useCallback } from 'react';
import { OperationViewModel } from '../view-models/OperationViewModel';
import { OperationProps } from '../../domain/entities/Operation';
import { SQLiteOperationRepository } from '../../../clean-architecture/data/repositories/SQLiteOperationRepository';
import { SQLiteCategoryRepository } from '../../../clean-architecture/data/repositories/SQLiteCategoryRepository';
import { SQLiteAccountRepository } from '../../../clean-architecture/data/repositories/SQLiteAccountRepository';
import { Category } from '../../domain/entities/Category';
import { Account } from '../../domain/entities/Account';

// TODO: Substituir por DI real
const operationRepository = new SQLiteOperationRepository();
const categoryRepository = new SQLiteCategoryRepository();
const accountRepository = new SQLiteAccountRepository();

export function useOperationViewModelAdapter() {
  const [viewModel] = useState(() => new OperationViewModel(operationRepository));
  const [operations, setOperations] = useState(viewModel.operations);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);

  const loadOperations = useCallback(async () => {
    setLoading(true);
    await viewModel.loadOperations();
    setOperations([...viewModel.operations]);
    setLoading(false);
  }, [viewModel]);

  const loadCategories = useCallback(async () => {
    const categoriesData = await categoryRepository.findAll();
    setCategories(categoriesData);
  }, []);

  const loadAccounts = useCallback(async () => {
    const accountsData = await accountRepository.findAll();
    setAccounts(accountsData);
  }, []);

  useEffect(() => {
    loadOperations();
    loadCategories();
    loadAccounts();
  }, [loadOperations, loadCategories, loadAccounts]);

  const createOperation = async (props: OperationProps) => {
    setLoading(true);
    await viewModel.createOperation(props);
    setOperations([...viewModel.operations]);
    setLoading(false);
  };

  const createDoubleOperation = async (props: Omit<OperationProps, 'id' | 'state'>) => {
    setLoading(true);
    // Criar duas operações: uma pendente e uma completa
    const pendingProps: OperationProps = {
      ...props,
      id: `pending-${Date.now()}`,
      state: props.nature === 'receita' ? 'receber' : 'pagar',
    };
    const completedProps: OperationProps = {
      ...props,
      id: `completed-${Date.now()}`,
      state: props.nature === 'receita' ? 'recebido' : 'pago',
    };
    
    await viewModel.createOperation(pendingProps);
    await viewModel.createOperation(completedProps);
    setOperations([...viewModel.operations]);
    setLoading(false);
  };

  const updateOperation = async (props: OperationProps) => {
    setLoading(true);
    await viewModel.updateOperation(props);
    setOperations([...viewModel.operations]);
    setLoading(false);
  };

  const updateOperationState = async (operation: any, newState: string) => {
    setLoading(true);
    const updatedProps: OperationProps = {
      ...operation,
      state: newState as any,
    };
    await viewModel.updateOperation(updatedProps);
    setOperations([...viewModel.operations]);
    setLoading(false);
  };

  const deleteOperation = async (id: string) => {
    setLoading(true);
    await viewModel.deleteOperation(id);
    setOperations([...viewModel.operations]);
    setLoading(false);
  };

  const getCategoryNames = useCallback(() => {
    return categories.map(cat => cat.name);
  }, [categories]);

  const getCategoryNamesByType = useCallback((type: 'income' | 'expense') => {
    return categories
      .filter(cat => cat.type === type)
      .map(cat => cat.name);
  }, [categories]);

  const getAccountNames = useCallback(() => {
    return accounts.map(acc => acc.name);
  }, [accounts]);

  return {
    operations,
    categories,
    accounts,
    loading,
    createOperation,
    createDoubleOperation,
    updateOperation,
    updateOperationState,
    deleteOperation,
    loadOperations,
    getCategoryNames,
    getCategoryNamesByType,
    getAccountNames,
  };
}