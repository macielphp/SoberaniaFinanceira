import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Dimensions } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import Layout from '../../components/Layout/Layout';
import GlobalStyles from '../../styles/Styles';
import { colors, spacing, typography } from '../../styles/themes';
import { useFinance } from '../../contexts/FinanceContext';
import { BudgetItemInput, getBudgetItemsByBudgetId } from '../../database';
import PeriodFilter from '../../components/Filters/PeriodFilter'
import { Goal } from '../../database/goals';
import { getGoalProgress } from '../../database/goals';
import { listOperationsWithGoalId } from '../../database/operations';
import MonthlySummaryPanel from '../../components/MonthlySummary/MonthlySummaryPanel';
import { canRegisterVariableExpense, canCreateOrEditGoal } from '../../services/ValidationService';
import { 
  calculateGoalStrategy, 
  validateGoalParcels, 
  canCreateGoal, 
  calculateGoalEndDate,
  formatCurrency as formatCurrencyGoal 
} from '../../services/GoalService';
import { getMonthlyFinanceSummaryByUserAndMonth } from '../../database/monthly-finance-summary';

type ViewMode = 'budget' | 'goal' | 'projection';

interface BudgetFormData {
  name: string;
  start_period: string;
  end_period: string;
  budget_type: 'manual' | 'automatic';
  base_month?: string;
  budget_items: BudgetItemInput[];
}

// Componente para listar os itens do orçamento
const BudgetItemsList: React.FC<{ budgetId: string }> = ({ budgetId }) => {
  const [budgetItems, setBudgetItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { getCategoryNames, getCategoryNamesByType } = useFinance();

  useEffect(() => {
    const loadBudgetItems = async () => {
      try {
        const items = await getBudgetItemsByBudgetId(budgetId);
        setBudgetItems(items);
      } catch (error) {
        console.error('Erro ao carregar itens do orçamento:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBudgetItems();
  }, [budgetId]);

  if (loading) {
    return (
      <View style={styles.budgetItemsLoading}>
        <ActivityIndicator size="small" color={colors.primary[500]} />
        <Text style={styles.budgetItemsLoadingText}>Carregando categorias...</Text>
      </View>
    );
  }

  if (budgetItems.length === 0) {
    return (
      <View style={styles.budgetItemsEmpty}>
        <Text style={styles.budgetItemsEmptyText}>Nenhuma categoria encontrada</Text>
      </View>
    );
  }

  const expenseItems = budgetItems.filter(item => item.category_type === 'expense');
  const incomeItems = budgetItems.filter(item => item.category_type === 'income');

  // Obter categorias orçadas
  const budgetedCategories = budgetItems.map(item => item.category_name);

  // Separar categorias não orçadas por tipo
  const nonBudgetedExpenseCategories = getCategoryNamesByType('expense').filter(category => 
    !budgetedCategories.includes(category)
  );
  const nonBudgetedIncomeCategories = getCategoryNamesByType('income').filter(category => 
    !budgetedCategories.includes(category)
  );

  return (
    <View style={styles.budgetItemsContent}>
      {/* Categorias Orçadas */}      
      {expenseItems.length > 0 && (
        <View style={styles.budgetItemsSection}>
          <Text style={styles.budgetItemsSubSectionTitle}>Despesas</Text>
          {expenseItems.map((item, index) => (
            <View key={index} style={styles.budgetItem}>
              <Text style={styles.budgetItemName}>{item.category_name}</Text>
              <Text style={styles.budgetItemValue}>
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(item.planned_value)}
              </Text>
            </View>
          ))}
        </View>
      )}
      
      {incomeItems.length > 0 && (
        <View style={styles.budgetItemsSection}>
          <Text style={styles.budgetItemsSubSectionTitle}>Receitas</Text>
          {incomeItems.map((item, index) => (
            <View key={index} style={styles.budgetItem}>
              <Text style={styles.budgetItemName}>{item.category_name}</Text>
              <Text style={styles.budgetItemValue}>
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(item.planned_value)}
              </Text>
            </View>
          ))}
        </View>
      )}

    </View>
  );
};

export default function Plan() {
  const [currentView, setCurrentView] = useState<ViewMode>('budget');
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [budgetFormData, setBudgetFormData] = useState<BudgetFormData>({
    name: '',
    start_period: '',
    end_period: '',
    budget_type: 'manual',
    budget_items: []
  });
  
  const { 
    activeBudget, 
    budgetLoading,
    selectedBudgetMonth,
    monthlyBudgetPerformance,
    createManualBudget, 
    createAutomaticBudget,
    updateBudget,
    getHistoricalDataForBudget,
    getCategoryNames,
    getCategoryNamesByType,
    formatCurrency,
    refreshActiveBudget,
    loadMonthlyBudgetPerformance,
    error,
    clearError,
    goals,
    createGoal,
    deleteGoal,
    updateGoal,
  } = useFinance();

  const categoryNames = getCategoryNames();

  // Form states for manual budget
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categoryValues, setCategoryValues] = useState<{[key: string]: string}>({});
  const [incomeCategories, setIncomeCategories] = useState<string[]>([]);
  const [incomeValues, setIncomeValues] = useState<{[key: string]: string}>({});

  // Form states for automatic budget
  const [availableMonths, setAvailableMonths] = useState<{label: string, value: string}[]>([]);
  const [historicalData, setHistoricalData] = useState<{category: string, nature: string, total_value: number}[]>([]);

  // Filter states
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');

  // DateTimePicker states
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  // Estado para edição de orçamento
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);

  // Adicionar estado para controlar o modal do mês base
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showGoalForm, setShowGoalForm] = useState(false);

  const [goalForm, setGoalForm] = useState({
    description: '',
    type: 'economia' as 'economia' | 'compra',
    target_value: '',
    start_date: '',
    end_date: '',
    monthly_income: '',
    fixed_expenses: '',
    available_per_month: '',
    importance: '',
    priority: '3',
    strategy: '',
    monthly_contribution: '',
    num_parcela: '',
  });
  const [goalFormError, setGoalFormError] = useState<string | null>(null);
  const [goalLoading, setGoalLoading] = useState(false);
  const [canCreateGoalState, setCanCreateGoalState] = useState<{ canCreate: boolean; message: string }>({ canCreate: false, message: '' });
  const [monthlySummary, setMonthlySummary] = useState<any>(null);
  const [goalStrategy, setGoalStrategy] = useState<any>(null);
  const [parcelValidation, setParcelValidation] = useState<any>(null);

  const handleGoalFormChange = (field: string, value: string) => {
    console.log('🔍 DEBUG handleGoalFormChange:', field, value);
    setGoalForm({ ...goalForm, [field]: value });
    
    // Recalcular estratégia quando target_value ou available_per_month mudar
    if (field === 'target_value' || field === 'available_per_month') {
      const targetValue = field === 'target_value' ? Number(value) : Number(goalForm.target_value);
      const availablePerMonth = field === 'available_per_month' ? Number(value) : Number(goalForm.available_per_month);
      
      console.log('  Calculando estratégia:', { targetValue, availablePerMonth });
      
      if (targetValue > 0 && availablePerMonth > 0) {
        const strategy = calculateGoalStrategy(targetValue, availablePerMonth);
        console.log('  Estratégia calculada:', strategy);
        setGoalStrategy(strategy);
      }
    }
    
    // Validar parcelas quando num_parcela ou target_value mudar
    if (field === 'num_parcela' || field === 'target_value') {
      const targetValue = field === 'target_value' ? Number(value) : Number(goalForm.target_value);
      const numParcels = field === 'num_parcela' ? Number(value) : Number(goalForm.num_parcela);
      const availablePerMonth = Number(goalForm.available_per_month);
      
      console.log('  Validando parcelas:', { targetValue, numParcels, availablePerMonth });
      
      if (targetValue > 0 && numParcels > 0 && availablePerMonth > 0) {
        const validation = validateGoalParcels(targetValue, numParcels, availablePerMonth);
        console.log('  Validação de parcelas:', validation);
        setParcelValidation(validation);
      }
    }
  };

  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  // Carregar dados da tabela intermediária quando abrir formulário de metas
  useEffect(() => {
    const loadMonthlySummaryForGoal = async () => {
      if (showGoalForm && !editingGoal) {
        try {
          const currentMonth = `${selectedYear}-${selectedMonth}`;
          console.log('🔍 DEBUG loadMonthlySummaryForGoal:');
          console.log('  currentMonth:', currentMonth);
          console.log('  selectedYear:', selectedYear);
          console.log('  selectedMonth:', selectedMonth);
          
          const canCreate = await canCreateGoal('user-1', currentMonth);
          console.log('  canCreate:', canCreate);
          setCanCreateGoalState(canCreate);
          
          if (canCreate.canCreate) {
            const summary = await getMonthlyFinanceSummaryByUserAndMonth('user-1', currentMonth + '-01');
            console.log('  summary encontrado:', summary);
            if (summary) {
              setMonthlySummary(summary);
              // Preencher campos com valores da tabela intermediária
              const updatedForm = {
                monthly_income: summary.total_monthly_income.toString(),
                fixed_expenses: summary.total_monthly_expense.toString(),
                available_per_month: summary.total_monthly_available.toString(),
              };
              console.log('  campos a serem preenchidos:', updatedForm);
              setGoalForm(prev => ({
                ...prev,
                ...updatedForm,
              }));
            } else {
              console.log('  Nenhum summary encontrado para o mês:', currentMonth + '-01');
            }
          } else {
            console.log('  Não pode criar meta:', canCreate.message);
          }
        } catch (error) {
          console.error('Erro ao carregar resumo mensal:', error);
        }
      }
    };
    
    loadMonthlySummaryForGoal();
  }, [showGoalForm, editingGoal, selectedYear, selectedMonth]);

  // Atualizar formulário ao editar meta
  useEffect(() => {
    if (editingGoal) {
      setGoalForm({
        description: editingGoal.description,
        type: editingGoal.type,
        target_value: editingGoal.target_value.toString(),
        start_date: editingGoal.start_date,
        end_date: editingGoal.end_date,
        monthly_income: editingGoal.monthly_income.toString(),
        fixed_expenses: editingGoal.fixed_expenses.toString(),
        available_per_month: editingGoal.available_per_month.toString(),
        importance: editingGoal.importance,
        priority: editingGoal.priority.toString(),
        strategy: editingGoal.strategy || '',
        monthly_contribution: editingGoal.monthly_contribution.toString(),
        num_parcela: editingGoal.num_parcela.toString(),
      });
      setShowGoalForm(true);
    }
  }, [editingGoal]);

  const handleGoalFormSubmit = async () => {
    console.log('🔍 DEBUG handleGoalFormSubmit - Iniciando...');
    setGoalFormError(null);
    
    // Verificar se pode criar meta
    if (!canCreateGoalState.canCreate) {
      console.log('  Não pode criar meta:', canCreateGoalState.message);
      return setGoalFormError(canCreateGoalState.message);
    }
    
    // Validação básica
    if (!goalForm.description.trim()) return setGoalFormError('Descrição é obrigatória');
    if (!goalForm.target_value || isNaN(Number(goalForm.target_value)) || Number(goalForm.target_value) <= 0) return setGoalFormError('Valor alvo inválido');
    if (!goalForm.start_date) return setGoalFormError('Data de início é obrigatória');
    if (!goalForm.importance.trim()) return setGoalFormError('Importância é obrigatória');
    if (!goalForm.priority || isNaN(Number(goalForm.priority)) || Number(goalForm.priority) < 1 || Number(goalForm.priority) > 5) return setGoalFormError('Prioridade deve ser de 1 a 5');
    if (!goalForm.num_parcela || isNaN(Number(goalForm.num_parcela)) || Number(goalForm.num_parcela) <= 0) return setGoalFormError('Número de parcelas deve ser maior que zero');
    
    // Validar parcelas
    const targetValue = Number(goalForm.target_value);
    const numParcels = Number(goalForm.num_parcela);
    const availablePerMonth = Number(goalForm.available_per_month);
    
    console.log('  Dados para validação:', { targetValue, numParcels, availablePerMonth });
    
    const validation = validateGoalParcels(targetValue, numParcels, availablePerMonth);
    if (!validation.isValid) {
      console.log('  Validação de parcelas falhou:', validation.message);
      return setGoalFormError(validation.message);
    }
    
    // Calcular data de fim baseada no número de parcelas
    const endDate = calculateGoalEndDate(goalForm.start_date, numParcels);
    console.log('  Data de fim calculada:', endDate);
    
    setGoalLoading(true);
    try {
      if (editingGoal) {
        await updateGoal({
          ...editingGoal,
          description: goalForm.description.trim(),
          type: goalForm.type,
          target_value: Number(goalForm.target_value),
          start_date: goalForm.start_date,
          end_date: goalForm.end_date,
          monthly_income: Number(goalForm.monthly_income),
          fixed_expenses: Number(goalForm.fixed_expenses),
          available_per_month: Number(goalForm.available_per_month),
          importance: goalForm.importance.trim(),
          priority: Number(goalForm.priority),
          strategy: goalForm.strategy.trim(),
          monthly_contribution: Number(goalForm.monthly_contribution),
        });
      } else {
        const goalData = {
          user_id: 'user-1',
          description: goalForm.description.trim(),
          type: goalForm.type,
          target_value: Number(goalForm.target_value),
          start_date: goalForm.start_date,
          end_date: endDate,
          monthly_income: Number(goalForm.monthly_income),
          fixed_expenses: Number(goalForm.fixed_expenses),
          available_per_month: Number(goalForm.available_per_month),
          importance: goalForm.importance.trim(),
          priority: Number(goalForm.priority),
          strategy: goalStrategy?.message || '',
          monthly_contribution: validation.monthlyContribution,
          num_parcela: Number(goalForm.num_parcela),
          status: 'active' as const,
        };
        
        console.log('  Dados da meta a serem salvos:', goalData);
        const goalId = await createGoal(goalData);
        console.log('  Meta criada com sucesso, ID:', goalId);
      }
      setShowGoalForm(false);
      setEditingGoal(null);
      setGoalForm({
        description: '',
        type: 'economia',
        target_value: '',
        start_date: '',
        end_date: '',
        monthly_income: '',
        fixed_expenses: '',
        available_per_month: '',
        importance: '',
        priority: '3',
        strategy: '',
        monthly_contribution: '',
        num_parcela: '',
      });
    } catch (err) {
      console.error('🔍 ERRO ao salvar meta:', err);
      console.error('  Stack trace:', err instanceof Error ? err.stack : 'Não disponível');
      setGoalFormError(`Erro ao salvar meta: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
    } finally {
      setGoalLoading(false);
    }
  };

  const [goalProgressMap, setGoalProgressMap] = useState<{ [goalId: string]: number }>({});
  const [deletingGoal, setDeletingGoal] = useState<Goal | null>(null);

  // Carregar progresso real das metas
  useEffect(() => {
    const loadProgress = async () => {
      const map: { [goalId: string]: number } = {};
      for (const goal of goals) {
        map[goal.id] = await getGoalProgress(goal.id, goal.type);
      }
      setGoalProgressMap(map);
    };
    if (goals.length > 0) loadProgress();
  }, [goals]);

  useEffect(() => {
    // Generate available months for automatic budget (last 6 months)
    const months = [];
    const currentDate = new Date();
    for (let i = 0; i < 6; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      months.push({ label: monthName, value: monthKey });
    }
    setAvailableMonths(months);

    // Set current month/year as default
    const now = new Date();
    const currentMonth = (now.getMonth() + 1).toString().padStart(2, '0');
    const currentYear = now.getFullYear().toString();
    setSelectedMonth(currentMonth);
    setSelectedYear(currentYear);

    // Load initial data
    refreshActiveBudget();
  }, []);

  useEffect(() => {
    if (selectedMonth && selectedYear && activeBudget) {
      const monthKey = `${selectedYear}-${selectedMonth}`;
      loadMonthlyBudgetPerformance(monthKey);
    }
  }, [selectedMonth, selectedYear, activeBudget]);

  const resetBudgetForm = () => {
    setBudgetFormData({
      name: '',
      start_period: '',
      end_period: '',
      budget_type: 'manual',
      budget_items: []
    });
    setSelectedCategories([]);
    setCategoryValues({});
    setIncomeCategories([]);
    setIncomeValues({});
    setHistoricalData([]);
  };

  const handleEditBudget = () => {
    console.log('✏️ Iniciando edição de orçamento...');
    console.log('📊 Orçamento ativo:', activeBudget);
    
    if (!activeBudget) {
      console.error('❌ Nenhum orçamento ativo encontrado');
      return;
    }
    
    setIsEditingBudget(true);
    setEditingBudgetId(activeBudget.id);
    
    const formData = {
      name: activeBudget.name,
      start_period: activeBudget.start_period,
      end_period: activeBudget.end_period,
      budget_type: activeBudget.type,
      base_month: activeBudget.base_month,
      budget_items: []
    };
    
    console.log('📋 Dados do formulário preenchidos:', formData);
    setBudgetFormData(formData);
    setShowBudgetForm(true);
    
    // Carregar itens do orçamento para edição manual
    if (activeBudget.type === 'manual') {
      console.log('💰 Carregando itens do orçamento manual...');
      getBudgetItemsByBudgetId(activeBudget.id).then(items => {
        console.log('📦 Itens carregados:', items);
        
        const expenseItems = items.filter(i => i.category_type === 'expense');
        const incomeItems = items.filter(i => i.category_type === 'income');
        
        console.log('💸 Itens de despesa encontrados:', expenseItems);
        console.log('💵 Itens de receita encontrados:', incomeItems);
        
        setSelectedCategories(expenseItems.map(i => i.category_name));
        setCategoryValues(Object.fromEntries(expenseItems.map(i => [i.category_name, i.planned_value.toString()])));
        setIncomeCategories(incomeItems.map(i => i.category_name));
        setIncomeValues(Object.fromEntries(incomeItems.map(i => [i.category_name, i.planned_value.toString()])));
        
        console.log('✅ Itens do orçamento carregados com sucesso');
      }).catch(err => {
        console.error('❌ Erro ao carregar itens do orçamento:', err);
      });
    } else if (activeBudget.type === 'automatic') {
      console.log('🤖 Orçamento automático - não há itens para carregar');
      setHistoricalData([]);
    }
    
    console.log('✅ Edição de orçamento iniciada com sucesso');
  };

  const handleCreateBudget = async () => {
    try {
      console.log('🔄 Iniciando salvamento de orçamento...');
      console.log('📋 Modo de edição:', isEditingBudget);
      console.log('🆔 ID do orçamento em edição:', editingBudgetId);
      console.log('📊 Dados do formulário:', budgetFormData);

      if (!budgetFormData.name.trim()) {
        Alert.alert('Erro', 'Nome do orçamento é obrigatório');
        return;
      }

      if (!budgetFormData.start_period || !budgetFormData.end_period) {
        Alert.alert('Erro', 'Período é obrigatório');
        return;
      }

      if (budgetFormData.budget_type === 'manual') {
        console.log('💰 Processando orçamento MANUAL...');
        
        // Validate manual budget
        const expenseItems = selectedCategories.map(cat => ({
          category_name: cat,
          planned_value: parseFloat(categoryValues[cat] || '0'),
          category_type: 'expense' as const
        })).filter(item => item.planned_value > 0);

        const incomeItems = incomeCategories.map(cat => ({
          category_name: cat,
          planned_value: parseFloat(incomeValues[cat] || '0'),
          category_type: 'income' as const
        })).filter(item => item.planned_value > 0);

        console.log('💸 Itens de despesa:', expenseItems);
        console.log('💵 Itens de receita:', incomeItems);

        if (expenseItems.length === 0) {
          Alert.alert('Erro', 'Pelo menos uma categoria de despesa deve ser selecionada');
          return;
        }

        if (incomeItems.length === 0) {
          Alert.alert('Erro', 'Pelo menos uma categoria de receita deve ser selecionada');
          return;
        }

        const budget_items = [...expenseItems, ...incomeItems];
        console.log('📦 Todos os itens do orçamento:', budget_items);
        
        if (isEditingBudget && editingBudgetId && activeBudget) {
          console.log('✏️ Modo EDICIÃO - Orçamento manual');
          console.log('📊 Orçamento ativo:', activeBudget);
          
          const updatedBudget = {
            ...activeBudget,
            ...budgetFormData,
            id: editingBudgetId
          };
          console.log('🔄 Orçamento atualizado para salvar:', updatedBudget);
          
          await updateBudget(updatedBudget, budget_items);
          console.log('✅ Orçamento manual atualizado com sucesso!');
        } else {
          console.log('🆕 Modo CRIAÇÃO - Orçamento manual');
          await createManualBudget(
            budgetFormData.name,
            budgetFormData.start_period,
            budgetFormData.end_period,
            budget_items
          );
          console.log('✅ Orçamento manual criado com sucesso!');
        }
      } else {
        console.log('🤖 Processando orçamento AUTOMÁTICO...');
        
        // Automatic budget
        if (!budgetFormData.base_month) {
          Alert.alert('Erro', 'Mês base é obrigatório para orçamento automático');
          return;
        }
        
        if (isEditingBudget && editingBudgetId && activeBudget) {
          console.log('✏️ Modo EDICIÃO - Orçamento automático');
          console.log('📊 Orçamento ativo:', activeBudget);
          
          const updatedBudget = {
            ...activeBudget,
            ...budgetFormData,
            id: editingBudgetId
          };
          console.log('🔄 Orçamento atualizado para salvar:', updatedBudget);
          
          await updateBudget(updatedBudget, []);
          console.log('✅ Orçamento automático atualizado com sucesso!');
        } else {
          console.log('🆕 Modo CRIAÇÃO - Orçamento automático');
          await createAutomaticBudget(
            budgetFormData.name,
            budgetFormData.start_period,
            budgetFormData.end_period,
            budgetFormData.base_month
          );
          console.log('✅ Orçamento automático criado com sucesso!');
        }
      }

      Alert.alert('Sucesso', isEditingBudget ? 'Orçamento atualizado com sucesso!' : 'Orçamento criado com sucesso!');
      setShowBudgetForm(false);
      resetBudgetForm();
      setIsEditingBudget(false);
      setEditingBudgetId(null);
      console.log('🎉 Processo finalizado com sucesso!');
    } catch (err) {
      console.error('❌ ERRO durante salvamento do orçamento:', err);
      console.error('📋 Detalhes do erro:', {
        message: err instanceof Error ? err.message : 'Erro desconhecido',
        stack: err instanceof Error ? err.stack : undefined,
        isEditingBudget,
        editingBudgetId,
        budgetFormData,
        activeBudget: activeBudget ? { id: activeBudget.id, name: activeBudget.name, type: activeBudget.type } : null
      });
      
      Alert.alert('Erro', error || 'Erro ao salvar orçamento');
      clearError();
    }
  };

  const handleLoadHistoricalData = async (base_month: string) => {
    try {
      const data = await getHistoricalDataForBudget(base_month);
      setHistoricalData(data);
    } catch (err) {
      Alert.alert('Erro', 'Erro ao carregar dados históricos');
    }
  };

  const getStatusColor = (status: 'superávit' | 'déficit' | 'equilibrado') => {
    switch (status) {
      case 'superávit':
        return colors.success[500];
      case 'déficit':
        return colors.error[500];
      case 'equilibrado':
        return colors.warning[500];
      default:
        return colors.gray[500];
    }
  };

  const getStatusText = (status: 'superávit' | 'déficit' | 'equilibrado') => {
    switch (status) {
      case 'superávit':
        return 'Superávit';
      case 'déficit':
        return 'Déficit';
      case 'equilibrado':
        return 'Equilibrado';
      default:
        return 'N/A';
    }
  };

  const renderBudgetView = () => (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Orçamento</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowBudgetForm(true)}
        >
          <Ionicons name="add" size={24} color={colors.text.inverse} />
        </TouchableOpacity>
      </View>

      {/* Current Budget */}
      {activeBudget && (
        <View style={styles.currentBudgetCard}>
          <View style={styles.budgetHeader}>
            <Text style={styles.cardTitle}>Orçamento Ativo</Text>
            <TouchableOpacity
              style={styles.editButton}
              onPress={handleEditBudget}
            >
              <Ionicons name="create-outline" size={20} color={colors.primary[500]} />
            </TouchableOpacity>
          </View>
          <Text style={styles.budgetName}>{activeBudget.name}</Text>
          <Text style={styles.budgetPeriod}>
            {new Date(activeBudget.start_period).toLocaleDateString('pt-BR')} - {new Date(activeBudget.end_period).toLocaleDateString('pt-BR')}
          </Text>
          <Text style={styles.budgetType}>
            Tipo: {activeBudget.type === 'manual' ? 'Manual' : 'Automático'}
          </Text>
          <Text style={styles.budgetValue}>
             Orçamento: {formatCurrency(activeBudget.total_planned_value)}
          </Text>
          
          {/* Budget Items */}
          <View style={styles.budgetItemsContainer}>
            <Text style={styles.budgetItemsTitle}>Categorias do Orçamento</Text>
            {activeBudget && (
              <BudgetItemsList budgetId={activeBudget.id} />
            )}
          </View>
        </View>
      )}

      {/* Monthly Summary Panel */}
      <MonthlySummaryPanel
        userId="user-1"
        month={`${selectedYear}-${selectedMonth}`}
      />

      {/* Month/Year Filter */}
      {activeBudget && (
        <PeriodFilter
          onPeriodChange={(period) => {
            setSelectedMonth(period.split('-')[1]);
            setSelectedYear(period.split('-')[0]);
          }}
          selectedPeriod={`${selectedYear}-${selectedMonth}`}
          availablePeriods={availableMonths}
        />
      )}



      {/* Monthly Performance */}
      {monthlyBudgetPerformance && (
        <View style={styles.performanceContainer}>
          <Text style={styles.performanceTitle}>Desempenho do Mês</Text>
          
          {/* Balance Summary */}
          <View style={styles.balanceCard}>
            <Text style={styles.balanceTitle}>Balanço Geral</Text>
            <View style={styles.balanceRow}>
              <Text style={styles.balanceLabel}>Receitas Planejadas:</Text>
              <Text style={styles.balanceValue}>{formatCurrency(monthlyBudgetPerformance.total_income_planned)}</Text>
            </View>
            <View style={styles.balanceRow}>
              <Text style={styles.balanceLabel}>Receitas Reais:</Text>
              <Text style={styles.balanceValue}>{formatCurrency(monthlyBudgetPerformance.total_income_actual)}</Text>
            </View>
            <View style={styles.balanceRow}>
              <Text style={styles.balanceLabel}>Despesas Planejadas:</Text>
              <Text style={styles.balanceValue}>{formatCurrency(monthlyBudgetPerformance.total_expense_planned)}</Text>
            </View>
            <View style={styles.balanceRow}>
              <Text style={styles.balanceLabel}>Despesas Reais:</Text>
              <Text style={styles.balanceValue}>{formatCurrency(monthlyBudgetPerformance.total_expense_actual)}</Text>
            </View>
            <View style={[styles.balanceRow, styles.balanceTotal]}>
              <Text style={styles.balanceLabel}>Balanço:</Text>
              <Text style={[styles.balanceValue, { color: getStatusColor(monthlyBudgetPerformance.status) }]}>
                {formatCurrency(monthlyBudgetPerformance.balance)} ({getStatusText(monthlyBudgetPerformance.status)})
              </Text>
                    </View>
                  </View>

          {/* Categories Performance */}
          <Text style={styles.categoriesTitle}>Categorias</Text>
          {monthlyBudgetPerformance.categories_performance.map((category, index) => (
            <View key={index} style={styles.categoryCard}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryName}>{category.category_name}</Text>
                <Text style={[styles.categoryStatus, { color: getStatusColor(category.status) }]}>
                  {getStatusText(category.status)}
                      </Text>
                    </View>
              
              {/* Progress Bar */}
              <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                      { 
                        width: `${Math.min(category.percentage_used, 100)}%`,
                        backgroundColor: category.percentage_used > 100 ? colors.error[500] : colors.primary[500]
                      }
                        ]}
                      />
                    </View>
                <Text style={styles.progressText}>
                  R$0 - R${formatCurrency(category.planned_value)}
                </Text>
                  </View>

              <View style={styles.categoryDetails}>
                <Text style={styles.categoryDetail}>
                  Planejado: {formatCurrency(category.planned_value)}
                      </Text>
                <Text style={styles.categoryDetail}>
                  Real: {formatCurrency(category.actual_value)}
                </Text>
                <Text style={styles.categoryDetail}>
                  Uso: {category.percentage_used.toFixed(1)}%
                        </Text>
                      </View>
                    </View>
          ))}
                  </View>
      )}

      {/* Empty State */}
      {!activeBudget && !budgetLoading && (
        <View style={styles.emptyContainer}>
          <Ionicons name="calculator-outline" size={64} color={colors.gray[400]} />
          <Text style={styles.emptyTitle}>Nenhum Orçamento</Text>
          <Text style={styles.emptySubtitle}>
            Crie seu primeiro orçamento para começar a controlar suas finanças
          </Text>
      </View>
      )}

      {/* Loading State */}
      {budgetLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
          <Text style={styles.loadingText}>Carregando...</Text>
          </View>
      )}
    </ScrollView>
  );

  const renderGoalView = () => (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Metas</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={async () => {
            const currentMonth = `${selectedYear}-${selectedMonth}`;
            const canCreate = await canCreateGoal('user-1', currentMonth);
            if (canCreate.canCreate) {
              setShowGoalForm(true);
            } else {
              Alert.alert('Ação não permitida', canCreate.message);
            }
          }}
        >
          <Ionicons name="add" size={24} color={colors.text.inverse} />
        </TouchableOpacity>
        {/* Botão temporário para debug das operações com goal_id */}
        {/* <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.warning[500], marginLeft: 8 }]}
          onPress={async () => {
            await listOperationsWithGoalId();
            Alert.alert('Debug', 'Veja o console para as operações com goal_id.');
          }}
        >
          <Ionicons name="bug-outline" size={24} color={colors.text.inverse} />
        </TouchableOpacity> */}
        
        {/* Botão para debug da tabela intermediária
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.secondary[500], marginLeft: 8 }]}
          onPress={async () => {
            try {
              const { getAllMonthlyFinanceSummaries } = await import('../../database/monthly-finance-summary');
              const summaries = await getAllMonthlyFinanceSummaries();
              console.log('🔍 DEBUG - Todos os resumos mensais:', summaries);
              
              if (summaries.length === 0) {
                console.log('🔍 Nenhum resumo encontrado. Tentando criar um de teste...');
                try {
                  const { updateMonthlyFinanceSummary } = await import('../../services/FinanceService');
                  const currentMonth = `${selectedYear}-${selectedMonth}`;
                  const testSummary = await updateMonthlyFinanceSummary('user-1', currentMonth);
                  console.log('🔍 Resumo de teste criado:', testSummary);
                  Alert.alert('Debug', 'Resumo de teste criado. Tente abrir o formulário de metas novamente.');
                } catch (createError) {
                  console.error('Erro ao criar resumo de teste:', createError);
                  Alert.alert('Erro', 'Erro ao criar resumo de teste');
                }
              } else {
                Alert.alert('Debug', `Encontrados ${summaries.length} resumos mensais. Veja o console.`);
              }
            } catch (error) {
              console.error('Erro ao buscar resumos:', error);
              Alert.alert('Erro', 'Erro ao buscar resumos mensais');
            }
          }}
        >
          <Ionicons name="analytics-outline" size={24} color={colors.text.inverse} />
        </TouchableOpacity> */}
        
        {/* Botão para atualizar estrutura da tabela goal */}
        {/* <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.warning[500], marginLeft: 8 }]}
          onPress={async () => {
            console.log('🔍 DEBUG - Atualizando estrutura da tabela goal...');
            try {
              const { updateGoalsTableStructure } = await import('../../database/goals');
              await updateGoalsTableStructure();
              console.log('  Estrutura da tabela goal atualizada com sucesso');
              Alert.alert('Sucesso', 'Estrutura da tabela goal atualizada!');
            } catch (error) {
              console.error('  Erro ao atualizar estrutura:', error);
              Alert.alert('Erro', `Erro ao atualizar estrutura: ${error}`);
            }
          }}
        >
          <Ionicons name="construct-outline" size={24} color={colors.text.inverse} />
        </TouchableOpacity> */}
      </View>

      {/* Monthly Summary Panel para Metas */}
      <MonthlySummaryPanel
        userId="user-1"
        month={`${selectedYear}-${selectedMonth}`}
      />
      {goals.length === 0 ? (
    <View style={styles.emptyContainer}>
      <Ionicons name="flag-outline" size={64} color={colors.gray[400]} />
          <Text style={styles.emptyTitle}>Nenhuma Meta</Text>
      <Text style={styles.emptySubtitle}>
            Crie sua primeira meta para começar a planejar seus objetivos!
                    </Text>
        </View>
      ) : (
        goals.map((goal) => {
          const progress = goalProgressMap[goal.id] ?? 0;
          const percentage = Math.min((progress / goal.target_value) * 100, 100);
          return (
            <View key={goal.id} style={styles.categoryCard}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryName}>{goal.description}</Text>
                <Text style={styles.categoryStatus}>{goal.status === 'completed' ? 'Concluída' : 'Em andamento'}</Text>
                <TouchableOpacity onPress={() => setEditingGoal(goal)} style={{ marginLeft: 8 }}>
                  <Ionicons name="create-outline" size={20} color={colors.primary[500]} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setDeletingGoal(goal)} style={{ marginLeft: 8 }}>
                  <Ionicons name="trash-outline" size={20} color={colors.error[500]} />
                </TouchableOpacity>
              </View>
              <Text style={styles.categoryDetail}>Tipo: {goal.type === 'economia' ? 'Economia' : 'Compra'}</Text>
              <Text style={styles.categoryDetail}>Valor alvo: {formatCurrency(goal.target_value)}</Text>
              <Text style={styles.categoryDetail}>Parcelas: {goal.num_parcela}x de {formatCurrency(goal.monthly_contribution)}</Text>
              <Text style={styles.categoryDetail}>Data limite: {new Date(goal.end_date).toLocaleDateString('pt-BR')}</Text>
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${percentage}%`,
                        backgroundColor: percentage >= 100 ? colors.success[500] : colors.primary[500]
                      }
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {formatCurrency(progress)} / {formatCurrency(goal.target_value)} ({percentage.toFixed(1)}%)
                </Text>
              </View>
                  </View>
          );
        })
      )}
      {/* Modal para criar meta */}
      <Modal
        visible={showGoalForm}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => { setShowGoalForm(false); setEditingGoal(null); }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowGoalForm(false)}>
              <Text style={styles.cancelButton}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Nova Meta</Text>
            <TouchableOpacity onPress={handleGoalFormSubmit} disabled={goalLoading}>
              <Text style={styles.saveButton}>{goalLoading ? 'Salvando...' : 'Salvar'}</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            {goalFormError && <Text style={{ color: 'red', marginBottom: 10 }}>{goalFormError}</Text>}
            
            {/* Verificação de permissão */}
            {!canCreateGoalState.canCreate && (
              <View style={styles.warningContainer}>
                <Ionicons name="warning" size={24} color={colors.warning[500]} />
                <Text style={styles.warningText}>{canCreateGoalState.message}</Text>
              </View>
            )}
            
            <Text style={styles.label}>Descrição</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Comprar geladeira, Reserva de emergência..."
              value={goalForm.description}
              onChangeText={text => handleGoalFormChange('description', text)}
              maxLength={200}
            />
            <Text style={styles.label}>Tipo da Meta</Text>
            <View style={styles.typeOptions}>
              <TouchableOpacity
                style={[styles.typeOption, goalForm.type === 'economia' && styles.typeOptionSelected]}
                onPress={() => handleGoalFormChange('type', 'economia')}
              >
                <Text style={[styles.typeOptionText, goalForm.type === 'economia' && styles.typeOptionTextSelected]}>Economia</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeOption, goalForm.type === 'compra' && styles.typeOptionSelected]}
                onPress={() => handleGoalFormChange('type', 'compra')}
              >
                <Text style={[styles.typeOptionText, goalForm.type === 'compra' && styles.typeOptionTextSelected]}>Compra</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.label}>Valor Alvo (R$)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 2000.00"
              keyboardType="numeric"
              value={goalForm.target_value}
              onChangeText={text => handleGoalFormChange('target_value', text)}
            />
            
            {/* Estratégia sugerida */}
            {goalStrategy && (
              <View style={styles.strategyContainer}>
                <Text style={styles.strategyText}>
                  <Text style={{ fontWeight: 'bold' }}>Estratégia sugerida:</Text> {goalStrategy.message}
                </Text>
              </View>
            )}
            <Text style={styles.label}>Data de Início</Text>
            <TouchableOpacity
              style={[styles.input, styles.datePickerButton]}
              onPress={() => setShowStartDatePicker(true)}
            >
              <Text style={styles.datePickerText}>{goalForm.start_date || 'Selecione a data'}</Text>
              <Ionicons name="calendar" size={20} color={colors.text.secondary} />
            </TouchableOpacity>
            {showStartDatePicker && (
              <DateTimePicker
                value={goalForm.start_date ? new Date(goalForm.start_date) : new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedDate) => {
                  setShowStartDatePicker(false);
                  if (selectedDate) {
                    handleGoalFormChange('start_date', selectedDate.toISOString().split('T')[0]);
                  }
                }}
              />
            )}
            <Text style={styles.label}>Número de Parcelas</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 3"
              keyboardType="numeric"
              value={goalForm.num_parcela}
              onChangeText={text => handleGoalFormChange('num_parcela', text)}
            />
            
            {/* Validação de parcelas */}
            {parcelValidation && (
              <View style={parcelValidation.isValid ? styles.parcelValidationContainer : styles.parcelErrorContainer}>
                <Text style={parcelValidation.isValid ? styles.parcelValidationText : styles.parcelErrorText}>
                  {parcelValidation.message}
                </Text>
              </View>
            )}
            <Text style={styles.label}>Renda Mensal (R$)</Text>
            <TextInput
              style={styles.readonlyInput}
              placeholder="Ex: 4000.00"
              keyboardType="numeric"
              value={goalForm.monthly_income}
              editable={false}
            />
            <Text style={styles.label}>Gastos Fixos Mensais (R$)</Text>
            <TextInput
              style={styles.readonlyInput}
              placeholder="Ex: 1500.00"
              keyboardType="numeric"
              value={goalForm.fixed_expenses}
              editable={false}
            />
            <Text style={styles.label}>Valor Disponível por Mês (R$)</Text>
            <TextInput
              style={styles.readonlyInput}
              placeholder="Ex: 500.00"
              keyboardType="numeric"
              value={goalForm.available_per_month}
              editable={false}
            />
            <Text style={styles.label}>Importância</Text>
            <TextInput
              style={styles.input}
              placeholder="Por que essa meta é importante para você?"
              value={goalForm.importance}
              onChangeText={text => handleGoalFormChange('importance', text)}
              maxLength={500}
            />
            <Text style={styles.label}>Prioridade (1 a 5)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 3"
              keyboardType="numeric"
              value={goalForm.priority}
              onChangeText={text => handleGoalFormChange('priority', text)}
              maxLength={1}
            />
            <Text style={styles.label}>Contribuição Mensal (R$)</Text>
            <TextInput
              style={styles.readonlyInput}
              placeholder="Calculado automaticamente"
              keyboardType="numeric"
              value={parcelValidation?.monthlyContribution ? parcelValidation.monthlyContribution.toFixed(2) : ''}
              editable={false}
            />
          </ScrollView>
        </View>
      </Modal>
      {/* Modal de confirmação de exclusão */}
      <Modal
        visible={!!deletingGoal}
        transparent
        animationType="fade"
        onRequestClose={() => setDeletingGoal(null)}
      >
        <View style={[styles.modalContainer, { justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }]}> 
          <View style={[styles.currentBudgetCard, { width: '90%' }]}> 
            <Text style={styles.headerTitle}>Excluir Meta</Text>
            <Text style={{ marginVertical: 16 }}>Tem certeza que deseja excluir a meta "{deletingGoal?.description}"?</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 16 }}>
              <TouchableOpacity onPress={() => setDeletingGoal(null)}>
                <Text style={styles.cancelButton}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={async () => {
                if (deletingGoal) {
                  await deleteGoal(deletingGoal.id);
                  setDeletingGoal(null);
                }
              }}>
                <Text style={[styles.saveButton, { color: colors.error[500] }]}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* Modal de edição de meta (pode ser implementado depois) */}
    </ScrollView>
  );

  const renderProjectionView = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="trending-up-outline" size={64} color={colors.gray[400]} />
      <Text style={styles.emptyTitle}>Projeções</Text>
      <Text style={styles.emptySubtitle}>
        Funcionalidade em desenvolvimento
                      </Text>
    </View>
  );

  const renderBudgetForm = () => (
    <Modal
      visible={showBudgetForm}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowBudgetForm(false)}>
            <Text style={styles.cancelButton}>Cancelar</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Novo Orçamento</Text>
          <TouchableOpacity onPress={handleCreateBudget}>
            <Text style={styles.saveButton}>Salvar</Text>
            </TouchableOpacity>
          </View>

        <ScrollView style={styles.modalContent}>
          {/* Budget Name */}
              <TextInput
            style={styles.input}
            placeholder="Nome do orçamento"
            value={budgetFormData.name}
            onChangeText={(text) => setBudgetFormData({...budgetFormData, name: text})}
          />

          {/* Budget Type */}
          <Text style={styles.sectionTitle}>Tipo de Orçamento</Text>
          <View style={styles.typeOptions}>
                  <TouchableOpacity
                    style={[
                styles.typeOption,
                budgetFormData.budget_type === 'manual' && styles.typeOptionSelected
              ]}
              onPress={() => setBudgetFormData({...budgetFormData, budget_type: 'manual'})}
            >
              <Ionicons 
                name="create-outline" 
                size={24} 
                color={budgetFormData.budget_type === 'manual' ? colors.primary[500] : colors.text.secondary} 
              />
              <Text style={[
                styles.typeOptionText,
                budgetFormData.budget_type === 'manual' && styles.typeOptionTextSelected
              ]}>
                Manual
                    </Text>
                  </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeOption,
                budgetFormData.budget_type === 'automatic' && styles.typeOptionSelected
              ]}
              onPress={() => setBudgetFormData({...budgetFormData, budget_type: 'automatic'})}
            >
              <Ionicons 
                name="analytics-outline" 
                size={24} 
                color={budgetFormData.budget_type === 'automatic' ? colors.primary[500] : colors.text.secondary} 
              />
              <Text style={[
                styles.typeOptionText,
                budgetFormData.budget_type === 'automatic' && styles.typeOptionTextSelected
              ]}>
                Automático
            </Text>
            </TouchableOpacity>
          </View>

          {/* Period */}
          <Text style={styles.sectionTitle}>Período</Text>
          <View style={styles.periodInputs}>
            <TouchableOpacity
              style={[styles.input, styles.periodInput, styles.datePickerButton]}
              onPress={() => setShowStartDatePicker(true)}
            >
              <Text style={styles.datePickerText}>
                {budgetFormData.start_period || 'Data início'}
              </Text>
              <Ionicons name="calendar" size={20} color={colors.text.secondary} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.input, styles.periodInput, styles.datePickerButton]}
              onPress={() => setShowEndDatePicker(true)}
            >
              <Text style={styles.datePickerText}>
                {budgetFormData.end_period || 'Data fim'}
              </Text>
              <Ionicons name="calendar" size={20} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          {/* DateTimePickers */}
          {showStartDatePicker && (
            <DateTimePicker
              value={budgetFormData.start_period ? new Date(budgetFormData.start_period) : new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedDate) => {
                setShowStartDatePicker(false);
                if (selectedDate) {
                  setBudgetFormData({
                    ...budgetFormData,
                    start_period: selectedDate.toISOString().split('T')[0]
                  });
                }
              }}
            />
          )}

          {showEndDatePicker && (
            <DateTimePicker
              value={budgetFormData.end_period ? new Date(budgetFormData.end_period) : new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedDate) => {
                setShowEndDatePicker(false);
                if (selectedDate) {
                  setBudgetFormData({
                    ...budgetFormData,
                    end_period: selectedDate.toISOString().split('T')[0]
                  });
                }
              }}
            />
          )}

          {budgetFormData.budget_type === 'manual' ? (
            /* Manual Budget Form */
            <View>
              <Text style={styles.sectionTitle}>Categorias de Despesa</Text>
              {getCategoryNamesByType('expense').map((category) => (
                <View key={category} style={styles.categoryItem}>
                  <TouchableOpacity
                    style={[
                      styles.categoryCheckbox,
                      selectedCategories.includes(category) && styles.categoryCheckboxSelected
                    ]}
                    onPress={() => {
                      if (selectedCategories.includes(category)) {
                        setSelectedCategories(selectedCategories.filter(c => c !== category));
                        const newValues = {...categoryValues};
                        delete newValues[category];
                        setCategoryValues(newValues);
                      } else {
                        setSelectedCategories([...selectedCategories, category]);
                      }
                    }}
                  >
                    {selectedCategories.includes(category) && (
                      <Ionicons name="checkmark" size={16} color={colors.text.inverse} />
                    )}
                  </TouchableOpacity>
                  <Text style={styles.categoryName}>{category}</Text>
                  {selectedCategories.includes(category) && (
              <TextInput
                      style={styles.valueInput}
                      placeholder="R$ 0,00"
                      value={categoryValues[category] || ''}
                      onChangeText={(text) => setCategoryValues({...categoryValues, [category]: text})}
                keyboardType="numeric"
              />
                  )}
            </View>
              ))}

              <Text style={styles.sectionTitle}>Categorias de Receita</Text>
              {getCategoryNamesByType('income').map((category) => (
                <View key={category} style={styles.categoryItem}>
                  <TouchableOpacity
                    style={[
                      styles.categoryCheckbox,
                      incomeCategories.includes(category) && styles.categoryCheckboxSelected
                    ]}
                    onPress={() => {
                      if (incomeCategories.includes(category)) {
                        setIncomeCategories(incomeCategories.filter(c => c !== category));
                        const newValues = {...incomeValues};
                        delete newValues[category];
                        setIncomeValues(newValues);
                      } else {
                        setIncomeCategories([...incomeCategories, category]);
                      }
                    }}
                  >
                    {incomeCategories.includes(category) && (
                      <Ionicons name="checkmark" size={16} color={colors.text.inverse} />
                    )}
                  </TouchableOpacity>
                  <Text style={styles.categoryName}>{category}</Text>
                  {incomeCategories.includes(category) && (
                    <TextInput
                      style={styles.valueInput}
                      placeholder="R$ 0,00"
                      value={incomeValues[category] || ''}
                      onChangeText={(text) => setIncomeValues({...incomeValues, [category]: text})}
                      keyboardType="numeric"
                    />
                  )}
                </View>
                ))}
              </View>
          ) : (
            /* Automatic Budget Form */
            <View>
              <Text style={styles.sectionTitle}>Mês Base</Text>
              <Picker
                selectedValue={budgetFormData.base_month || ''}
                onValueChange={(itemValue) => {
                  setBudgetFormData({ ...budgetFormData, base_month: itemValue });
                  handleLoadHistoricalData(itemValue);
                }}
                style={styles.picker}
              >
                <Picker.Item label="Selecionar mês base" value="" />
                {availableMonths.map((month) => (
                  <Picker.Item key={month.value} label={month.label} value={month.value} />
                ))}
              </Picker>

              {budgetFormData.base_month && (
                <View style={styles.historicalData}>
                  <Text style={styles.historicalTitle}>Dados Históricos do Mês Base</Text>
                  {historicalData.map((item, index) => (
                    <View key={index} style={styles.historicalItem}>
                      <Text style={styles.historicalCategory}>{item.category}</Text>
                      <Text style={styles.historicalValue}>
                        {formatCurrency(item.total_value)} ({item.nature === 'income' ? 'Receita' : 'Despesa'})
                      </Text>
          </View>
                  ))}
        </View>
              )}
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );

  return (
    <Layout>
      <View style={styles.container}>
        {/* Tab Navigator */}
        <View style={styles.tabNavigator}>
        <TouchableOpacity
            style={[styles.tab, currentView === 'budget' && styles.tabActive]}
            onPress={() => setCurrentView('budget')}
          >
            <Text style={[styles.tabText, currentView === 'budget' && styles.tabTextActive]}>
              Orçamento
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, currentView === 'goal' && styles.tabActive]}
            onPress={() => setCurrentView('goal')}
          >
            <Text style={[styles.tabText, currentView === 'goal' && styles.tabTextActive]}>
              Meta
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
            style={[styles.tab, currentView === 'projection' && styles.tabActive]}
            onPress={() => setCurrentView('projection')}
          >
            <Text style={[styles.tabText, currentView === 'projection' && styles.tabTextActive]}>
              Projeção
          </Text>
        </TouchableOpacity>
      </View>

        {/* Content */}
      {currentView === 'budget' && renderBudgetView()}
        {currentView === 'goal' && renderGoalView()}
        {currentView === 'projection' && renderProjectionView()}
      
        {/* Budget Form Modal */}
      {renderBudgetForm()}
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  headerTitle: {
    fontSize: typography.h2.fontSize,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  addButton: {
    backgroundColor: colors.primary[500],
    borderRadius: 8,
    padding: spacing.sm,
  },
  currentBudgetCard: {
    backgroundColor: colors.background.default,
    margin: spacing.md,
    padding: spacing.md,
    borderRadius: 12,
    shadowColor: colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  budgetName: {
    fontSize: typography.body1.fontSize,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  budgetPeriod: {
    fontSize: typography.caption.fontSize,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  budgetType: {
    fontSize: typography.caption.fontSize,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  budgetValue: {
    fontSize: typography.body1.fontSize,
    fontWeight: '600',
    color: colors.primary[600],
  },
  filterContainer: {
    margin: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.background.default,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  filterTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  filterItem: {
    flex: 1,
  },
  filterLabel: {
    fontSize: typography.caption.fontSize,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  selectContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.background.default,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
  },
  selectText: {
    fontSize: typography.body1.fontSize,
    color: colors.text.primary,
  },
  performanceContainer: {
    margin: spacing.md,
  },
  performanceTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  balanceCard: {
    backgroundColor: colors.background.default,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.md,
    shadowColor: colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  balanceTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  balanceLabel: {
    fontSize: typography.body1.fontSize,
    color: colors.text.secondary,
  },
  balanceValue: {
    fontSize: typography.body1.fontSize,
    fontWeight: '600',
    color: colors.text.primary,
  },
  balanceTotal: {
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    paddingTop: spacing.sm,
    marginTop: spacing.sm,
  },
  categoriesTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  categoryCard: {
    backgroundColor: colors.background.default,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.md,
    shadowColor: colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  categoryName: {
    fontSize: typography.body1.fontSize,
    fontWeight: '600',
    color: colors.text.primary,
  },
  categoryStatus: {
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
  },
  progressContainer: {
    marginBottom: spacing.sm,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.gray[200],
    borderRadius: 4,
    marginBottom: spacing.xs,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: typography.caption.fontSize,
    color: colors.text.secondary,
  },
  categoryDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  categoryDetail: {
    fontSize: typography.caption.fontSize,
    color: colors.text.secondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyTitle: {
    fontSize: typography.h2.fontSize,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginTop: spacing.md,
  },
  emptySubtitle: {
    fontSize: typography.body1.fontSize,
    color: colors.text.secondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.body1.fontSize,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  tabNavigator: {
    flexDirection: 'row',
    backgroundColor: colors.background.default,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary[500],
  },
  tabText: {
    fontSize: typography.body1.fontSize,
    color: colors.text.secondary,
  },
  tabTextActive: {
    color: colors.primary[500],
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
    backgroundColor: colors.background.default,
  },
  modalTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  cancelButton: {
    fontSize: typography.body1.fontSize,
    color: colors.text.secondary,
  },
  saveButton: {
    fontSize: typography.body1.fontSize,
    color: colors.primary[500],
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: spacing.md,
  },
  input: {
    backgroundColor: colors.background.default,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    padding: spacing.md,
    fontSize: typography.body1.fontSize,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
  typeOptions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  typeOption: {
    flex: 1,
    backgroundColor: colors.background.default,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    padding: spacing.md,
    alignItems: 'center',
  },
  typeOptionSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  typeOptionText: {
    fontSize: typography.body1.fontSize,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  typeOptionTextSelected: {
    color: colors.primary[500],
    fontWeight: '600',
  },
  periodInputs: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  periodInput: {
    flex: 1,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  categoryCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.gray[300],
    marginRight: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryCheckboxSelected: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  valueInput: {
    backgroundColor: colors.background.default,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 6,
    padding: spacing.sm,
    fontSize: typography.body1.fontSize,
    width: 100,
    textAlign: 'right',
  },
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.background.default,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  monthSelectorText: {
    fontSize: typography.body1.fontSize,
    color: colors.text.primary,
  },
  historicalData: {
    backgroundColor: colors.gray[50],
    padding: spacing.md,
    borderRadius: 8,
  },
  historicalTitle: {
    fontSize: typography.body1.fontSize,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  historicalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  historicalCategory: {
    fontSize: typography.body1.fontSize,
    color: colors.text.primary,
  },
  historicalValue: {
    fontSize: typography.body1.fontSize,
    color: colors.text.secondary,
  },
  datePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  datePickerText: {
    fontSize: typography.body1.fontSize,
    color: colors.text.primary,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  editButton: {
    padding: spacing.xs,
  },
  budgetItemsContainer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  budgetItemsTitle: {
    fontSize: typography.h4.fontSize,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  budgetItemsLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  budgetItemsLoadingText: {
    fontSize: typography.body2.fontSize,
    color: colors.text.secondary,
    marginLeft: spacing.sm,
  },
  budgetItemsEmpty: {
    padding: spacing.md,
    alignItems: 'center',
  },
  budgetItemsEmptyText: {
    fontSize: typography.body2.fontSize,
    color: colors.text.secondary,
  },
  budgetItemsContent: {
    gap: spacing.md,
  },
  budgetItemsSection: {
    gap: spacing.xs,
  },
  budgetItemsSectionTitle: {
    fontSize: typography.body1.fontSize,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  budgetItemsSubSectionTitle: {
    fontSize: typography.body2.fontSize,
    fontWeight: '500',
    color: colors.text.secondary,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  budgetItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.gray[50],
    borderRadius: 6,
  },
  budgetItemName: {
    fontSize: typography.body2.fontSize,
    color: colors.text.primary,
    flex: 1,
  },
  budgetItemValue: {
    fontSize: typography.body2.fontSize,
    fontWeight: '600',
    color: colors.primary[600],
  },
  // Picker Modal Styles
  pickerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  pickerModalContainer: {
    backgroundColor: colors.background.default,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: spacing.lg,
  },
  pickerModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  pickerModalCancel: {
    fontSize: typography.body1.fontSize,
    color: colors.text.secondary,
  },
  pickerModalTitle: {
    fontSize: typography.h4.fontSize,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  pickerModalDone: {
    fontSize: typography.body1.fontSize,
    color: colors.primary[500],
    fontWeight: '600',
  },
  picker: {
    height: 200,
  },

  // Inline Picker Styles
  pickerContainer: {
    backgroundColor: colors.background.default,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    overflow: 'hidden',
  },
  inlinePicker: {
    height: 50,
    margin: 0,
    padding: 0,
  },
  label: {
    fontSize: typography.body1.fontSize,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning[50],
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.warning[500],
  },
  warningText: {
    fontSize: typography.body1.fontSize,
    color: colors.warning[600],
    marginLeft: spacing.sm,
    flex: 1,
  },
  strategyContainer: {
    backgroundColor: colors.gray[50],
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  strategyText: {
    fontSize: typography.body1.fontSize,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  parcelValidationContainer: {
    backgroundColor: colors.success[50],
    padding: spacing.sm,
    borderRadius: 6,
    marginTop: spacing.xs,
  },
  parcelValidationText: {
    fontSize: typography.body2.fontSize,
    color: colors.success[600],
  },
  parcelErrorContainer: {
    backgroundColor: colors.error[50],
    padding: spacing.sm,
    borderRadius: 6,
    marginTop: spacing.xs,
  },
  parcelErrorText: {
    fontSize: typography.body2.fontSize,
    color: colors.error[600],
  },
  readonlyInput: {
    backgroundColor: colors.gray[100],
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 6,
    padding: spacing.sm,
    fontSize: typography.body1.fontSize,
    color: colors.text.secondary,
  },
});