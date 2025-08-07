import { useCallback, useEffect, useState } from 'react';
import { OperationViewModel } from '../view-models/OperationViewModel';
import { Operation, OperationProps } from '../../domain/entities/Operation';
import { Category } from '../../domain/entities/Category';
import { Account } from '../../domain/entities/Account';
import { container } from '../../shared/di/Container';

export function useOperationViewModelAdapter() {
  const [operations, setOperations] = useState<Operation[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const viewModel = container.resolve<OperationViewModel>('OperationViewModel');
  const categoryRepository = container.resolve<any>('CategoryRepository');
  const accountRepository = container.resolve<any>('AccountRepository');

  const loadOperations = useCallback(async () => {
    setLoading(true);
    try {
      await viewModel.loadOperations();
      setOperations([...viewModel.operations]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar operações');
    } finally {
      setLoading(false);
    }
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

  const updateOperation = async (operationId: string, operationProps: Partial<OperationProps>) => {
    setLoading(true);
    await viewModel.updateOperation(operationId, operationProps);
    setOperations([...viewModel.operations]);
    setLoading(false);
  };

  const updateOperationState = async (operation: any, newState: string) => {
    setLoading(true);
    const updatedProps: Partial<OperationProps> = {
      state: newState as any,
    };
    await viewModel.updateOperation(operation.id, updatedProps);
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
    error,
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