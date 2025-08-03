// app\src\contexts\FinanceContext.tsx
import React, { createContext, useContext, useCallback, useEffect, useState, useMemo } from 'react';
import { Operation } from '../services/FinanceService';
import { Category, Account } from '../database';
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
  deleteAccount,
  // Budget functions
  createManualBudget,
  createAutomaticBudget,
  getActiveBudget,
  getBudgetById,
  updateBudgetWithItems,
  deleteBudget,
  calculateBudgetPerformance,
  calculateMonthlyBudgetPerformance,
  getHistoricalDataForAutomaticBudget,
  Budget,
  BudgetPerformance,
  BudgetItemInput,
  MonthlyBudgetBalance,
  createGoalsTable,
  insertGoal,
  updateGoal as updateGoalDB,
  deleteGoal as deleteGoalDB,
  getAllGoals as getAllGoalsDB,
  getGoalById as getGoalByIdDB,
  Goal,
  getGoalProgress,
} from '../database';
import { createOrUpdateMonthlyFinanceSummary } from '../database/monthly-finance-summary';

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
  
  // Monthly Summary - Estados Globais
  includeVariableIncome: boolean;
  setIncludeVariableIncome: (value: boolean) => Promise<void>;
  
  // Budget - Estados
  activeBudget: Budget | null;
  budgetLoading: boolean;
  selectedBudgetMonth: string;
  monthlyBudgetPerformance: MonthlyBudgetBalance | null;
  
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
  createCategory: (name: string, type: 'income' | 'expense') => Promise<boolean>;
  editCategory: (id: string, name: string, type: 'income' | 'expense') => Promise<boolean>;
  removeCategory: (id: string) => Promise<boolean>;
  getCategoryNames: () => string[];
  getCategoryNamesByType: (type: 'income' | 'expense') => string[];
  
  // Contas
  createAccount: (account: Omit<Account, 'id'>) => Promise<boolean>;
  editAccount: (account: Account) => Promise<boolean>;
  removeAccount: (id: string) => Promise<boolean>;
  getAccountNames: () => string[];
  
  // Budget - Funções
  createManualBudget: (name: string, start_period: string, end_period: string, budget_items: BudgetItemInput[]) => Promise<Budget>;
  createAutomaticBudget: (name: string, start_period: string, end_period: string, base_month: string) => Promise<Budget>;
  updateBudget: (budget: Budget, budget_items: BudgetItemInput[]) => Promise<Budget>;
  deleteBudget: (id: string) => Promise<void>;
  getBudgetPerformance: (budget_id: string) => Promise<BudgetPerformance>;
  getHistoricalDataForBudget: (base_month: string) => Promise<{ category: string; nature: string; total_value: number }[]>;
  refreshActiveBudget: () => Promise<void>;
  loadMonthlyBudgetPerformance: (month: string) => Promise<void>;
  
  // Financial Summary - Funções
  setSelectedPeriod: (period: string) => void;
  formatCurrency: (value: number) => string;
  getSelectedPeriodLabel: () => string;
  getCategoryStats: () => CategoryStats[];
  getDateRange: (periodValue: string) => { startDate?: string; endDate?: string };
  
  // Utilitários
  refreshAllData: () => Promise<void>;
  clearError: () => void;
  goals: Goal[];
  createGoal: (goal: Omit<Goal, 'id' | 'created_at' | 'updated_at'>) => Promise<string>;
  updateGoal: (goal: Goal) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  getGoalById: (id: string, user_id: string) => Promise<Goal | null>;
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
  
  // Monthly Summary - Estados Globais
  const [includeVariableIncome, setIncludeVariableIncomeState] = useState<boolean>(false);
  
  // Budget - Estados
  const [activeBudget, setActiveBudget] = useState<Budget | null>(null);
  const [budgetLoading, setBudgetLoading] = useState(false);
  const [selectedBudgetMonth, setSelectedBudgetMonth] = useState<string>('');
  const [monthlyBudgetPerformance, setMonthlyBudgetPerformance] = useState<MonthlyBudgetBalance | null>(null);
  
  const [goals, setGoals] = useState<Goal[]>([]);
  
  // Monthly Summary - Funções
  const setIncludeVariableIncome = useCallback(async (value: boolean) => {
    try {
      console.log(`[FinanceContext] Atualizando includeVariableIncome para: ${value}`);
      
      // 1. Atualizar estado local
      setIncludeVariableIncomeState(value);
      
      // 2. Atualizar no banco para o mês atual (se houver resumo)
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
      const { updateIncludeVariableIncome } = await import('../database/monthly-finance-summary');
      
      try {
        await updateIncludeVariableIncome('user-1', currentMonth + '-01', value);
        console.log(`[FinanceContext] Switch salvo no banco para mês ${currentMonth}`);
      } catch (dbError) {
        console.warn(`[FinanceContext] Não foi possível salvar no banco:`, dbError);
        // Não falhar se não houver resumo mensal ainda
      }
      
    } catch (error) {
      console.error('[FinanceContext] Erro ao atualizar includeVariableIncome:', error);
      setError('Erro ao atualizar configuração de receitas variáveis');
    }
  }, []);

  const financeService = new FinanceService();

  // BUDGET FUNCTIONS
  const refreshActiveBudget = useCallback(async () => {
    try {
      setBudgetLoading(true);
      const budget = await getActiveBudget('user-1'); // TODO: Get real user ID
      setActiveBudget(budget);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar orçamento ativo');
    } finally {
      setBudgetLoading(false);
    }
  }, []);

  const loadMonthlyBudgetPerformance = useCallback(async (month: string) => {
    try {
      setBudgetLoading(true);
      const performance = await calculateMonthlyBudgetPerformance('user-1', month);
      setMonthlyBudgetPerformance(performance);
      setSelectedBudgetMonth(month);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar desempenho mensal');
    } finally {
      setBudgetLoading(false);
    }
  }, []);

  // Financial Summary - Gerar opções de meses baseado nas operações existentes
  const monthOptions = useMemo((): MonthOption[] => {
    console.log('\n🔍 DEBUG monthOptions:');
    console.log(`  Total de operações: ${operations.length}`);
    
    const months = new Set<string>();
    const options: MonthOption[] = [
      { label: 'Todos os períodos', value: 'all', year: 0, month: 0 }
    ];

    operations.forEach((op, index) => {
      // Usar parsing manual para evitar problemas de fuso horário
      const [yearStr, monthStr, dayStr] = op.date.split('-');
      const year = parseInt(yearStr);
      const month = parseInt(monthStr); // Já é 1-12
      const monthKey = `${year}-${monthStr}`; // Usar monthStr diretamente
      
      console.log(`  Operação ${index + 1}: ${op.date} -> year=${year}, month=${month}, monthKey="${monthKey}"`);
      months.add(monthKey);
    });

    // Converter para array e ordenar
    const sortedMonths = Array.from(months).sort().reverse();
    console.log(`  Meses únicos encontrados: ${sortedMonths.join(', ')}`);
    
    sortedMonths.forEach(monthKey => {
      const [yearStr, monthStr] = monthKey.split('-');
      const year = parseInt(yearStr);
      const month = parseInt(monthStr);
      
      const monthNames = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
      ];
      
      const option = {
        label: `${monthNames[month - 1]} ${year}`, // Adjust month index for monthNames
        value: monthKey,
        year,
        month
      };
      
      options.push(option);
      console.log(`  Opção gerada: "${option.label}" -> value="${option.value}", year=${option.year}, month=${option.month}`);
    });

    console.log(`  Total de opções: ${options.length}`);
    console.log('🔍 FIM DEBUG monthOptions\n');
    return options;
  }, [operations]);

  // Financial Summary - Calcular período baseado na seleção
  const getDateRange = useCallback((periodValue: string): { startDate?: string; endDate?: string } => {
    if (periodValue === 'all') {
      console.log('📅 getDateRange: periodValue="all" - retornando objeto vazio');
      return {};
    }

    const [yearStr, monthStr] = periodValue.split('-');
    const year = parseInt(yearStr);
    const month = parseInt(monthStr);

    console.log(`\n🔍 DEBUG getDateRange:`);
    console.log(`  periodValue: "${periodValue}"`);
    console.log(`  yearStr: "${yearStr}" -> year: ${year}`);
    console.log(`  monthStr: "${monthStr}" -> month: ${month}`);

    // Converter de mês 1-12 para índice 0-11 para o construtor Date
    const monthIndex = month - 1;
    
    // Primeiro dia do mês
    const startDate = new Date(year, monthIndex, 1);
    // Último dia do mês
    const endDate = new Date(year, monthIndex + 1, 0);

    console.log(`  monthIndex: ${monthIndex} (para Date constructor)`);
    console.log(`  startDate (new Date(${year}, ${monthIndex}, 1)): ${startDate.toISOString()}`);
    console.log(`  endDate (new Date(${year}, ${monthIndex + 1}, 0)): ${endDate.toISOString()}`);

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    console.log(`  startDateStr: "${startDateStr}"`);
    console.log(`  endDateStr: "${endDateStr}"`);

    const result = {
      startDate: startDateStr,
      endDate: endDateStr
    };

    console.log(`  RESULTADO: ${startDateStr} até ${endDateStr}`);
    console.log('🔍 FIM DEBUG getDateRange\n');

    return result;
  }, []);

  // Financial Summary - Filtrar operações baseado no período selecionado
  const filteredOperations = useMemo(() => {
    console.log(`\n🔍 DEBUG filteredOperations:`);
    console.log(`  selectedPeriod: "${selectedPeriod}"`);
    console.log(`  total operations: ${operations.length}`);

    // Se for 'all', retorna todas as operações
    if (selectedPeriod === 'all') {
      console.log(`  selectedPeriod é "all" - retornando todas as ${operations.length} operações`);
      return operations;
    }

    const { startDate, endDate } = getDateRange(selectedPeriod);
    
    if (!startDate || !endDate) {
      console.log(`  startDate ou endDate vazios - retornando todas as ${operations.length} operações`);
      return operations;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Incluir o dia inteiro

    console.log(`  Filtrando operações:`);
    console.log(`    startDate: "${startDate}" -> ${start.toISOString()}`);
    console.log(`    endDate: "${endDate}" -> ${end.toISOString()}`);

    const filtered = operations.filter(op => {
      const opDate = new Date(op.date);
      const isInRange = opDate >= start && opDate <= end;
      
      console.log(`    Operação: ${op.date} (${op.category})`);
      console.log(`      opDate: ${opDate.toISOString()}`);
      console.log(`      start: ${start.toISOString()}`);
      console.log(`      end: ${end.toISOString()}`);
      console.log(`      opDate >= start: ${opDate >= start}`);
      console.log(`      opDate <= end: ${opDate <= end}`);
      console.log(`      isInRange: ${isInRange}`);
      
      return isInRange;
    });

    console.log(`  RESULTADO: ${filtered.length} operações filtradas de ${operations.length} total`);
    console.log('🔍 FIM DEBUG filteredOperations\n');
    return filtered;
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
      console.log('🔄 Iniciando carregamento de dados...');
      setLoading(true);
      setError(null);
      
      console.log('📊 Carregando operações, categorias e contas...');
      const [operationsData, categoriesData, accountsData, goalsData] = await Promise.all([
        getAllOperations(),
        getAllCategories(),
        getAllAccounts(),
        getAllGoalsDB('user-1')
      ]);
      
      console.log(`✅ Dados carregados: ${operationsData.length} operações, ${categoriesData.length} categorias, ${accountsData.length} contas`);
      
      setOperations(operationsData);
      setCategories(categoriesData);
      setAccounts(accountsData);
      setGoals(goalsData);
      
      // Load budgets (sem dependência circular)
      try {
        console.log('💰 Carregando orçamento ativo...');
        const budget = await getActiveBudget('user-1');
        setActiveBudget(budget);
        console.log('✅ Orçamento carregado:', budget ? 'encontrado' : 'não encontrado');
      } catch (budgetErr) {
        console.error('❌ Erro ao carregar orçamento:', budgetErr);
        // Não falhar o carregamento principal por causa do orçamento
      }
      
      // Carregar estado do switch de receitas variáveis
      try {
        console.log('🔄 Carregando estado do switch de receitas variáveis...');
        const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
        const { getMonthlyFinanceSummaryByUserAndMonth } = await import('../database/monthly-finance-summary');
        const monthlySummary = await getMonthlyFinanceSummaryByUserAndMonth('user-1', currentMonth + '-01');
        
        if (monthlySummary && monthlySummary.includeVariableIncome !== undefined) {
          // Ler o valor salvo no banco
          setIncludeVariableIncomeState(monthlySummary.includeVariableIncome);
          console.log(`✅ Estado do switch carregado do banco: ${monthlySummary.includeVariableIncome}`);
        } else {
          // Usar padrão se não houver valor salvo
          setIncludeVariableIncomeState(false);
          console.log('ℹ️ Nenhum valor salvo encontrado, usando padrão: false');
        }
      } catch (switchErr) {
        console.warn('⚠️ Erro ao carregar estado do switch:', switchErr);
        // Não falhar o carregamento principal
      }
      
      console.log('🎉 Carregamento de dados concluído!');
    } catch (err) {
      console.error('❌ Erro ao carregar dados:', err);
      setError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, []); // Remover dependência circular

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
      filtered = filtered.filter(op => {
        return op.date >= startDate && op.date <= endDate;
      });
    }
    return filtered;
  }, [operations]);

  // OPERAÇÕES
  const createSimpleOperation = useCallback(async (operationData: Omit<Operation, 'id'>): Promise<Operation> => {
    try {
      const newOperation = financeService.createSimpleOperation(operationData);
      await insertOperation(newOperation);
      
      // Criar/atualizar resumo mensal automaticamente
      const operationMonth = newOperation.date.substring(0, 7); // YYYY-MM
      console.log(`[createSimpleOperation] Criando resumo para mês: ${operationMonth}`);
      console.log(`[createSimpleOperation] Operações disponíveis:`, operations.length);
      console.log(`[createSimpleOperation] Nova operação:`, {
        nature: newOperation.nature,
        value: newOperation.value,
        state: newOperation.state,
        date: newOperation.date
      });
      
      // Passar apenas as operações do mês correto
      const monthOperations = [...operations, newOperation].filter(op => {
        const opMonth = op.date.substring(0, 7);
        return opMonth === operationMonth;
      });
      
      console.log(`[createSimpleOperation] Operações do mês ${operationMonth}:`, monthOperations.length);
      await createOrUpdateMonthlyFinanceSummary('user-1', operationMonth, monthOperations, includeVariableIncome);
      
      await loadAllData(); // Recarrega tudo
      return newOperation;
    } catch (err) {
      setError('Erro ao criar operação');
      throw err;
    }
  }, [financeService, loadAllData, operations, includeVariableIncome]);

  const createDoubleOperation = useCallback(async (operationData: Omit<Operation, 'id' | 'state'>): Promise<Operation[]> => {
    try {
      const newOperations = financeService.createDoubleOperation(operationData);
      await Promise.all(newOperations.map(op => insertOperation(op)));
      
      // Criar/atualizar resumo mensal automaticamente
      const operationMonth = newOperations[0].date.substring(0, 7); // YYYY-MM
      
      // Passar apenas as operações do mês correto
      const monthOperations = [...operations, ...newOperations].filter(op => {
        const opMonth = op.date.substring(0, 7);
        return opMonth === operationMonth;
      });
      
      console.log(`[createDoubleOperation] Operações do mês ${operationMonth}:`, monthOperations.length);
      await createOrUpdateMonthlyFinanceSummary('user-1', operationMonth, monthOperations, includeVariableIncome);
      
      await loadAllData();
      return newOperations;
    } catch (err) {
      setError('Erro ao criar operação dupla');
      throw err;
    }
  }, [financeService, loadAllData, operations, includeVariableIncome]);

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
  const createCategory = useCallback(async (name: string, type: 'income' | 'expense'): Promise<boolean> => {
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
        type,
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

  const editCategory = useCallback(async (id: string, name: string, type: 'income' | 'expense'): Promise<boolean> => {
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
        name: name.trim(),
        type
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
  const createAccount = useCallback(async (account: Omit<Account, 'id'>): Promise<boolean> => {
    try {
      if (!account.name.trim()) {
        throw new Error('Nome da conta é obrigatório');
      }
      const exists = accounts.some(acc => 
        acc.name.toLowerCase().trim() === account.name.toLowerCase().trim()
      );
      if (exists) {
        throw new Error('Conta já existe');
      }
      await insertAccount({ ...account, name: account.name.trim() });
      await loadAllData();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta');
      throw err;
    }
  }, [accounts, loadAllData]);

  const editAccount = useCallback(async (account: Account): Promise<boolean> => {
    try {
      if (!account.name.trim()) {
        throw new Error('Nome da conta é obrigatório');
      }
      const acc = accounts.find(acc => acc.id === account.id);
      if (!acc) {
        throw new Error('Conta não encontrada');
      }
      // Permitir editar contas padrão próprias (como Carteira-física), mas não externas
      if (acc.isDefault && acc.type === 'externa') {
        throw new Error('Não é possível editar contas externas padrão do sistema');
      }
      const exists = accounts.some(acc => 
        acc.id !== account.id && acc.name.toLowerCase().trim() === account.name.toLowerCase().trim()
      );
      if (exists) {
        throw new Error('Já existe uma conta com esse nome');
      }
      await updateAccount({ ...account, name: account.name.trim() });
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

  const getCategoryNamesByType = useCallback((type: 'income' | 'expense'): string[] => {
    return categories
      .filter(cat => cat.type === type)
      .map(cat => cat.name)
      .sort();
  }, [categories]);

  // BUDGET FUNCTIONS
  const createManualBudgetContext = useCallback(async (
    name: string, 
    start_period: string, 
    end_period: string, 
    budget_items: BudgetItemInput[]
  ): Promise<Budget> => {
    try {
      setBudgetLoading(true);
      const budget = await createManualBudget('user-1', name, start_period, end_period, budget_items);
      await refreshActiveBudget();
      return budget;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar orçamento manual');
      throw err;
    } finally {
      setBudgetLoading(false);
    }
  }, [refreshActiveBudget]);

  const createAutomaticBudgetContext = useCallback(async (
    name: string, 
    start_period: string, 
    end_period: string, 
    base_month: string
  ): Promise<Budget> => {
    try {
      setBudgetLoading(true);
      const budget = await createAutomaticBudget('user-1', name, start_period, end_period, base_month);
      await refreshActiveBudget();
      return budget;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar orçamento automático');
      throw err;
    } finally {
      setBudgetLoading(false);
    }
  }, [refreshActiveBudget]);

  const updateBudget = useCallback(async (budget: Budget, budget_items: BudgetItemInput[]): Promise<Budget> => {
    try {
      setBudgetLoading(true);
      const updatedBudget = await updateBudgetWithItems(budget, budget_items);
      await refreshActiveBudget();
      return updatedBudget;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar orçamento');
      throw err;
    } finally {
      setBudgetLoading(false);
    }
  }, [refreshActiveBudget]);

  const deleteBudget = useCallback(async (id: string): Promise<void> => {
    try {
      setBudgetLoading(true);
      await deleteBudget(id);
      await refreshActiveBudget();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir orçamento');
      throw err;
    } finally {
      setBudgetLoading(false);
    }
  }, [refreshActiveBudget]);

  const getBudgetPerformance = useCallback(async (budget_id: string): Promise<BudgetPerformance> => {
    try {
      return await calculateBudgetPerformance(budget_id, 'user-1'); // TODO: Get real user ID
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao calcular performance do orçamento');
      throw err;
    }
  }, []);

  const getHistoricalDataForBudget = useCallback(async (base_month: string) => {
    try {
      return await getHistoricalDataForAutomaticBudget('user-1', base_month); // TODO: Get real user ID
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar dados históricos');
      throw err;
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Funções de metas (goals)
  const createGoal = useCallback(async (goal: Omit<Goal, 'id' | 'created_at' | 'updated_at'>) => {
    console.log('🔍 DEBUG createGoal (context):', goal);
    try {
      const id = await insertGoal(goal);
      console.log('  Meta inserida com sucesso, ID:', id);
      
      // Atualizar resumo mensal após criar meta
      const goalMonth = goal.start_date.substring(0, 7); // YYYY-MM
      console.log(`  Atualizando resumo mensal para mês: ${goalMonth}`);
      await createOrUpdateMonthlyFinanceSummary('user-1', goalMonth, operations, includeVariableIncome);
      
      await loadAllData();
      console.log('  Dados recarregados');
      return id;
    } catch (error) {
      console.error('  Erro em createGoal (context):', error);
      throw error;
    }
  }, [loadAllData, operations, includeVariableIncome]);

  const updateGoal = useCallback(async (goal: Goal) => {
    await updateGoalDB(goal);
    
    // Atualizar resumo mensal após editar meta
    const goalMonth = goal.start_date.substring(0, 7); // YYYY-MM
    console.log(`  Atualizando resumo mensal para mês: ${goalMonth}`);
    await createOrUpdateMonthlyFinanceSummary('user-1', goalMonth, operations, includeVariableIncome);
    
    await loadAllData();
  }, [loadAllData, operations, includeVariableIncome]);

  const deleteGoal = useCallback(async (id: string) => {
    // Buscar a meta antes de deletar para obter o mês
    const goal = await getGoalByIdDB(id, 'user-1');
    await deleteGoalDB(id, 'user-1');
    
    // Atualizar resumo mensal após deletar meta
    if (goal) {
      const goalMonth = goal.start_date.substring(0, 7); // YYYY-MM
      console.log(`  Atualizando resumo mensal para mês: ${goalMonth}`);
      await createOrUpdateMonthlyFinanceSummary('user-1', goalMonth, operations, includeVariableIncome);
    }
    
    await loadAllGoals();
  }, [operations, includeVariableIncome]);

  const getGoalById = useCallback(async (id: string, user_id: string) => {
    return await getGoalByIdDB(id, user_id);
  }, []);

  const loadAllGoals = useCallback(async () => {
    // TODO: trocar user_id fixo por dinâmico
    const allGoals = await getAllGoalsDB('user-1');
    setGoals(allGoals);
  }, []);

  // Atualiza o progresso/status de todas as metas
  const updateAllGoalsProgress = useCallback(async () => {
    const allGoals = await getAllGoalsDB('user-1');
    for (const goal of allGoals) {
      const progress = await getGoalProgress(goal.id, goal.type);
      let newStatus: Goal['status'] = 'active';
      if (progress >= goal.target_value) {
        newStatus = 'completed';
      }
      if (goal.status !== newStatus) {
        await updateGoalDB({ ...goal, status: newStatus });
      }
      console.log(`🟢 updateAllGoalsProgress: goal_id=${goal.id}, progresso=${progress}, status=${newStatus}`);
    }
    await loadAllGoals();
  }, [loadAllGoals]);

  // Inicialização
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('🚀 Iniciando aplicação...');
        await setupDatabase();
        console.log('✅ Banco configurado, carregando dados...');
        await loadAllData();
        console.log('✅ Aplicação inicializada com sucesso!');
      } catch (err) {
        console.error('❌ Erro na inicialização:', err);
        setError('Erro ao inicializar aplicação');
      }
    };
    
    initializeApp();
  }, []); // Remover dependência circular

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
    
    // Monthly Summary - Estados Globais
    includeVariableIncome,
    setIncludeVariableIncome,
    
    // Budget - Estados
    activeBudget,
    budgetLoading,
    selectedBudgetMonth,
    monthlyBudgetPerformance,
    
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
    getCategoryNamesByType,
    
    // Contas
    createAccount,
    editAccount,
    removeAccount,
    getAccountNames,
    
    // Budget - Funções
    createManualBudget: createManualBudgetContext,
    createAutomaticBudget: createAutomaticBudgetContext,
    updateBudget,
    deleteBudget,
    getBudgetPerformance,
    getHistoricalDataForBudget,
    refreshActiveBudget,
    loadMonthlyBudgetPerformance,
    
    // Financial Summary - Funções
    setSelectedPeriod,
    formatCurrency,
    getSelectedPeriodLabel,
    getCategoryStats,
    getDateRange,
    
    // Utilitários
    refreshAllData,
    clearError,
    goals,
    createGoal,
    updateGoal,
    deleteGoal,
    getGoalById,
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