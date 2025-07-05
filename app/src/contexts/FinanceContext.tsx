// app\src\contexts\FinanceContext.tsx
import React, { createContext, useContext, useCallback, useEffect, useState, useMemo } from 'react';
import { Operation } from '../services/FinanceService';
import { Category, Account } from '../database/Index';
import { FinanceService } from '../services/FinanceService';
import { 
  getAllOperations, 
  insertOperation, 
  updateOperation as updateOperationDB,
  deleteOperation, 
  setupDatabase,
  getAllCategories,
  getAllAccounts,
  insertCategory,
  insertAccount,
  updateCategory,
  updateAccount,
  deleteCategory,
  deleteAccount
} from '../database/Index';

// Interfaces para Financial Summary
interface MonthOption {
  label: string;
  value: string;
  year: number;
  month: number;
}

interface FinancialSummaryData {
  totalReceitas: number;
  totalDespesas: number;
  saldoLiquido: number;
  receitasPendentes: number;
  despesasPendentes: number;
  totalOperacoes: number;
  operacoesPendentes: number;
}

interface CategoryStats {
  category: string;
  receitas: number;
  despesas: number;
  total: number;
  operacoes: number;
}

interface FinanceContextType {
  // Estados
  operations: Operation[];
  categories: Category[];
  accounts: Account[];
  loading: boolean;
  error: string | null;
  
  // Financial Summary - Estados
  selectedPeriod: string;
  monthOptions: MonthOption[];
  financialSummary: FinancialSummaryData;
  filteredOperations: Operation[];
  
  // Operações
  createSimpleOperation: (operationData: Omit<Operation, 'id'>) => Promise<Operation>;
  createDoubleOperation: (operationData: Omit<Operation, 'id' | 'state'>) => Promise<Operation[]>;
  updateOperation: (operationData: Partial<Operation> & { id: string }) => Promise<Operation>;
  updateOperationState: (operation: Operation, newState: Operation['state']) => Promise<Operation>;
  removeOperation: (id: string) => Promise<void>;
  filterOperations: (filters: {
    nature?: Operation['nature'];
    state?: Operation['state'];
    category?: string;
    account?: string;
    startDate?: string;
    endDate?: string;
  }) => Operation[];
  
  // Categorias
  createCategory: (name: string) => Promise<boolean>;
  editCategory: (id: string, name: string) => Promise<boolean>;
  removeCategory: (id: string) => Promise<boolean>;
  getCategoryNames: () => string[];
  
  // Contas
  createAccount: (name: string) => Promise<boolean>;
  editAccount: (id: string, name: string) => Promise<boolean>;
  removeAccount: (id: string) => Promise<boolean>;
  getAccountNames: () => string[];
  
  // Financial Summary - Funções
  setSelectedPeriod: (period: string) => void;
  formatCurrency: (value: number) => string;
  getSelectedPeriodLabel: () => string;
  getCategoryStats: () => CategoryStats[];
  getDateRange: (periodValue: string) => { startDate?: string; endDate?: string };
  
  // Utilitários
  refreshAllData: () => Promise<void>;
  clearError: () => void;
}

const FinanceContext = createContext<FinanceContextType | null>(null);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Estados centralizados
  const [operations, setOperations] = useState<Operation[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Financial Summary - Estados
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  
  const financeService = new FinanceService();

  // Financial Summary - Gerar opções de meses baseado nas operações existentes
  const monthOptions = useMemo((): MonthOption[] => {
    const months = new Set<string>();
    const options: MonthOption[] = [
      { label: 'Todos os períodos', value: 'all', year: 0, month: 0 }
    ];

    operations.forEach(op => {
      const date = new Date(op.date);
      const year = date.getFullYear();
      const month = date.getMonth();
      const monthKey = `${year}-${month.toString().padStart(2, '0')}`;
      months.add(monthKey);
    });

    // Converter para array e ordenar
    const sortedMonths = Array.from(months).sort().reverse();
    
    sortedMonths.forEach(monthKey => {
      const [yearStr, monthStr] = monthKey.split('-');
      const year = parseInt(yearStr);
      const month = parseInt(monthStr);
      
      const monthNames = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
      ];
      
      options.push({
        label: `${monthNames[month]} ${year}`,
        value: monthKey,
        year,
        month
      });
    });

    return options;
  }, [operations]);

  // Financial Summary - Calcular período baseado na seleção
  const getDateRange = useCallback((periodValue: string): { startDate?: string; endDate?: string } => {
    if (periodValue === 'all') {
      return {};
    }

    const [yearStr, monthStr] = periodValue.split('-');
    const year = parseInt(yearStr);
    const month = parseInt(monthStr);

    // Primeiro dia do mês
    const startDate = new Date(year, month, 1);
    // Último dia do mês
    const endDate = new Date(year, month + 1, 0);

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  }, []);

  // Financial Summary - Filtrar operações baseado no período selecionado
  const filteredOperations = useMemo(() => {
    const { startDate, endDate } = getDateRange(selectedPeriod);
    
    if (!startDate || !endDate) {
      return operations;
    }

    return operations.filter(op => {
      const opDate = new Date(op.date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Incluir o dia inteiro
      
      return opDate >= start && opDate <= end;
    });
  }, [operations, selectedPeriod, getDateRange]);

  // Financial Summary - Calcular resumo financeiro
  const financialSummary = useMemo((): FinancialSummaryData => {
    // Receitas realizadas (recebidas)
    const totalReceitas = filteredOperations
      .filter(op => op.nature === 'receita' && op.state === 'recebido')
      .reduce((total, op) => total + Math.abs(op.value), 0);

    // Despesas realizadas (pagas)
    const totalDespesas = filteredOperations
      .filter(op => op.nature === 'despesa' && op.state === 'pago')
      .reduce((total, op) => total + Math.abs(op.value), 0);

    // Saldo líquido
    const saldoLiquido = totalReceitas - totalDespesas;

    // Operações pendentes
    const operacoesPendentes = filteredOperations.filter(op => 
      ['receber', 'pagar', 'transferir'].includes(op.state)
    );

    // Receitas pendentes
    const receitasPendentes = operacoesPendentes
      .filter(op => op.nature === 'receita')
      .reduce((total, op) => total + Math.abs(op.value), 0);

    // Despesas pendentes
    const despesasPendentes = operacoesPendentes
      .filter(op => op.nature === 'despesa')
      .reduce((total, op) => total + Math.abs(op.value), 0);

    return {
      totalReceitas,
      totalDespesas,
      saldoLiquido,
      receitasPendentes,
      despesasPendentes,
      totalOperacoes: filteredOperations.length,
      operacoesPendentes: operacoesPendentes.length
    };
  }, [filteredOperations]);

  // Financial Summary - Função para formatar valor monetário
  const formatCurrency = useCallback((value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }, []);

  // Financial Summary - Função para obter o label do período selecionado
  const getSelectedPeriodLabel = useCallback((): string => {
    const option = monthOptions.find(opt => opt.value === selectedPeriod);
    return option?.label || 'Período não encontrado';
  }, [monthOptions, selectedPeriod]);

  // Financial Summary - Função para calcular estatísticas por categoria
  const getCategoryStats = useCallback((): CategoryStats[] => {
    const categoryStats = new Map<string, {
      receitas: number;
      despesas: number;
      total: number;
      operacoes: number;
    }>();

    filteredOperations
      .filter(op => ['recebido', 'pago'].includes(op.state))
      .forEach(op => {
        const category = op.category;
        const current = categoryStats.get(category) || {
          receitas: 0,
          despesas: 0,
          total: 0,
          operacoes: 0
        };

        if (op.nature === 'receita') {
          current.receitas += Math.abs(op.value);
        } else {
          current.despesas += Math.abs(op.value);
        }
        
        current.total += Math.abs(op.value);
        current.operacoes += 1;
        
        categoryStats.set(category, current);
      });

    // Converter para array e ordenar por total
    return Array.from(categoryStats.entries())
      .map(([category, stats]) => ({ category, ...stats }))
      .sort((a, b) => b.total - a.total);
  }, [filteredOperations]);

  // Função para carregar todos os dados
  const loadAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [operationsData, categoriesData, accountsData] = await Promise.all([
        getAllOperations(),
        getAllCategories(),
        getAllAccounts()
      ]);
      
      setOperations(operationsData);
      setCategories(categoriesData);
      setAccounts(accountsData);
    } catch (err) {
      setError('Erro ao carregar dados');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Função de refresh pública
  const refreshAllData = useCallback(async () => {
    await loadAllData();
  }, [loadAllData]);

  // Filtrar operações
  const filterOperations = useCallback(({
    nature, 
    state,
    category,
    account,
    startDate,
    endDate
  }: {
    nature?: Operation['nature'];
    state?: Operation['state'];
    category?: string;
    account?: string;
    startDate?: string;
    endDate?: string;
  }): Operation[] => {
    let filtered = [...operations];

    if (nature) {
      filtered = filtered.filter(op => op.nature === nature);
    }

    if (state) {
      filtered = filtered.filter(op => op.state === state); 
    }

    if (category) {
      filtered = filtered.filter(op => 
        op.category && op.category === category
      );
    }

    if (account) {
      filtered = filtered.filter(op =>
        op.sourceAccount === account || op.destinationAccount === account
      )
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      filtered = filtered.filter(op => {
        const opDate = new Date(op.date);
        return opDate >= start && opDate <= end;
      })
    }
    return filtered;
  }, [operations]);

  // OPERAÇÕES
  const createSimpleOperation = useCallback(async (operationData: Omit<Operation, 'id'>): Promise<Operation> => {
    try {
      const newOperation = financeService.createSimpleOperation(operationData);
      await insertOperation(newOperation);
      await loadAllData(); // Recarrega tudo
      return newOperation;
    } catch (err) {
      setError('Erro ao criar operação');
      throw err;
    }
  }, [financeService, loadAllData]);

  const createDoubleOperation = useCallback(async (operationData: Omit<Operation, 'id' | 'state'>): Promise<Operation[]> => {
    try {
      const newOperations = financeService.createDoubleOperation(operationData);
      await Promise.all(newOperations.map(op => insertOperation(op)));
      await loadAllData();
      return newOperations;
    } catch (err) {
      setError('Erro ao criar operação dupla');
      throw err;
    }
  }, [financeService, loadAllData]);

  const updateOperation = useCallback(async (operationData: Partial<Operation> & { id: string }): Promise<Operation> => {
    try {
      const currentOperation = operations.find(op => op.id === operationData.id);
      if (!currentOperation) {
        throw new Error('Operação não encontrada');
      }

      const updatedOperation: Operation = {
        ...currentOperation,
        ...operationData,
        id: operationData.id
      };

      await updateOperationDB(updatedOperation);
      await loadAllData();
      return updatedOperation;
    } catch (err) {
      setError('Erro ao atualizar operação');
      throw err;
    }
  }, [operations, loadAllData]);

  const updateOperationState = useCallback(async (operation: Operation, newState: Operation['state']): Promise<Operation> => {
    try {
      const updatedOperation = financeService.updateOperationState(operation, newState);
      await updateOperationDB(updatedOperation);
      await loadAllData();
      return updatedOperation;
    } catch (err) {
      setError('Erro ao atualizar estado da operação');
      throw err;
    }
  }, [financeService, loadAllData]);

  const removeOperation = useCallback(async (id: string): Promise<void> => {
    try {
      await deleteOperation(id);
      await loadAllData();
    } catch (err) {
      setError('Erro ao remover operação');
      throw err;
    }
  }, [loadAllData]);

  // CATEGORIAS
  const createCategory = useCallback(async (name: string): Promise<boolean> => {
    try {
      if (!name.trim()) {
        throw new Error('Nome da categoria é obrigatório');
      }

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
      await loadAllData();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar categoria');
      throw err;
    }
  }, [categories, loadAllData]);

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
      await loadAllData();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao editar categoria');
      throw err;
    }
  }, [categories, loadAllData]);

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
      await loadAllData();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir categoria');
      throw err;
    }
  }, [categories, loadAllData]);

  // CONTAS
  const createAccount = useCallback(async (name: string): Promise<boolean> => {
    try {
      if (!name.trim()) {
        throw new Error('Nome da conta é obrigatório');
      }

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
      await loadAllData();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta');
      throw err;
    }
  }, [accounts, loadAllData]);

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
      await loadAllData();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao editar conta');
      throw err;
    }
  }, [accounts, loadAllData]);

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
      await loadAllData();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir conta');
      throw err;
    }
  }, [accounts, loadAllData]);

  // HELPERS
  const getCategoryNames = useCallback((): string[] => {
    return categories.map(cat => cat.name).sort();
  }, [categories]);

  const getAccountNames = useCallback((): string[] => {
    return accounts.map(acc => acc.name).sort();
  }, [accounts]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Inicialização
  useEffect(() => {
    setupDatabase().then(() => loadAllData());
  }, [loadAllData]);

  const contextValue: FinanceContextType = {
    // Estados
    operations,
    categories,
    accounts,
    loading,
    error,
    
    // Financial Summary - Estados
    selectedPeriod,
    monthOptions,
    financialSummary,
    filteredOperations,
    
    // Operações
    createSimpleOperation,
    createDoubleOperation,
    updateOperation,
    updateOperationState,
    removeOperation,
    filterOperations,
    
    // Categorias
    createCategory,
    editCategory,
    removeCategory,
    getCategoryNames,
    
    // Contas
    createAccount,
    editAccount,
    removeAccount,
    getAccountNames,
    
    // Financial Summary - Funções
    setSelectedPeriod,
    formatCurrency,
    getSelectedPeriodLabel,
    getCategoryStats,
    getDateRange,
    
    // Utilitários
    refreshAllData,
    clearError
  };

  return (
    <FinanceContext.Provider value={contextValue}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance deve ser usado dentro de um FinanceProvider');
  }
  return context;
};