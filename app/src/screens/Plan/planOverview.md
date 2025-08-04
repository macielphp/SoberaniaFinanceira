Vou documentar detalhadamente o arquivo `Plan.tsx`. Primeiro, vou ler o arquivo completo para entender sua estrutura e funcionalidades:

Read file: app/src/screens/Plan/Plan.tsx
# �� **DOCUMENTAÇÃO DETALHADA - PLAN.TSX**

## �� **VISÃO GERAL**

O arquivo `Plan.tsx` é uma tela complexa e multifuncional que implementa o sistema de planejamento financeiro da aplicação. Ele oferece três funcionalidades principais através de um sistema de abas:

1. **�� Orçamento** - Criação e gerenciamento de orçamentos
2. **🎯 Metas** - Definição e acompanhamento de metas financeiras  
3. **📈 Projeção** - Funcionalidade em desenvolvimento

---

## ��️ **ARQUITETURA E ESTRUTURA**

### **📦 Imports e Dependências**

```typescript
// React e React Native
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert, Modal, ActivityIndicator, Platform } from 'react-native';

// Componentes de UI
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

// Componentes internos
import Layout from '../../components/Layout/Layout';
import PeriodFilter from '../../components/Filters/PeriodFilter';
import MonthlySummaryPanel from '../../components/MonthlySummary/MonthlySummaryPanel';

// Contextos e serviços
import { useFinance } from '../../contexts/FinanceContext';
import { canRegisterVariableExpense, canCreateOrEditGoal } from '../../services/ValidationService';
import { calculateGoalStrategy, validateGoalParcels, canCreateGoal, calculateGoalEndDate } from '../../services/GoalService';

// Banco de dados
import { BudgetItemInput, getBudgetItemsByBudgetId } from '../../database';
import { Goal } from '../../database/goals';
import { getGoalProgress } from '../../database/goals';
import { listOperationsWithGoalId } from '../../database/operations';
import { getMonthlyFinanceSummaryByUserAndMonth } from '../../database/monthly-finance-summary';
```

### **🎛️ Tipos e Interfaces**

```typescript
type ViewMode = 'budget' | 'goal' | 'projection';

interface BudgetFormData {
  name: string;
  start_period: string;
  end_period: string;
  budget_type: 'manual' | 'automatic';
  base_month?: string;
  budget_items: BudgetItemInput[];
}
```

---

## 🎯 **FUNCIONALIDADES PRINCIPAIS**

### **1. 📊 SISTEMA DE ORÇAMENTO**

#### **�� Estados Principais**
```typescript
const [currentView, setCurrentView] = useState<ViewMode>('budget');
const [showBudgetForm, setShowBudgetForm] = useState(false);
const [budgetFormData, setBudgetFormData] = useState<BudgetFormData>({...});
const [isEditingBudget, setIsEditingBudget] = useState(false);
const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);
```

#### **�� Tipos de Orçamento**

**A. Orçamento Manual**
- Usuário define categorias e valores manualmente
- Seleção de categorias de despesa e receita
- Input de valores para cada categoria selecionada

**B. Orçamento Automático**
- Baseado em dados históricos de um mês específico
- Seleção de mês base (últimos 6 meses)
- Cálculo automático baseado em operações anteriores

#### **🔄 Fluxo de Criação/Edição**

1. **Inicialização**: `handleCreateBudget()` ou `handleEditBudget()`
2. **Validação**: Verificação de campos obrigatórios
3. **Processamento**: Diferenciação entre manual/automático
4. **Persistência**: Chamada para `createManualBudget()` ou `createAutomaticBudget()`
5. **Feedback**: Alert de sucesso/erro

#### **📊 Desempenho Mensal**

```typescript
// Carregamento automático do desempenho
useEffect(() => {
  if (selectedMonth && selectedYear && activeBudget) {
    const monthKey = `${selectedYear}-${selectedMonth}`;
    loadMonthlyBudgetPerformance(monthKey);
  }
}, [selectedMonth, selectedYear, activeBudget]);
```

**Métricas Calculadas:**
- Receitas planejadas vs. reais
- Despesas planejadas vs. reais
- Balanço geral (superávit/déficit/equilibrado)
- Performance por categoria com barras de progresso

---

### **2. 🎯 SISTEMA DE METAS**

#### **🔧 Estados do Formulário**
```typescript
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
```

#### **🧮 Lógica de Cálculo**

**A. Estratégia de Meta**
```typescript
const handleGoalFormChange = (field: string, value: string) => {
  // Recalcular estratégia quando target_value ou available_per_month mudar
  if (field === 'target_value' || field === 'available_per_month') {
    const targetValue = field === 'target_value' ? Number(value) : Number(goalForm.target_value);
    const availablePerMonth = field === 'available_per_month' ? Number(value) : Number(goalForm.available_per_month);
    
    if (targetValue > 0 && availablePerMonth > 0) {
      const strategy = calculateGoalStrategy(targetValue, availablePerMonth);
      setGoalStrategy(strategy);
    }
  }
};
```

**B. Validação de Parcelas**
```typescript
// Validar parcelas quando num_parcela ou target_value mudar
if (field === 'num_parcela' || field === 'target_value') {
  const targetValue = field === 'target_value' ? Number(value) : Number(goalForm.target_value);
  const numParcels = field === 'num_parcela' ? Number(value) : Number(goalForm.num_parcela);
  const availablePerMonth = Number(goalForm.available_per_month);
  
  if (targetValue > 0 && numParcels > 0 && availablePerMonth > 0) {
    const validation = validateGoalParcels(targetValue, numParcels, availablePerMonth);
    setParcelValidation(validation);
  }
}
```

#### **�� Integração com Resumo Mensal**

```typescript
// Carregar dados da tabela intermediária quando abrir formulário de metas
useEffect(() => {
  const loadMonthlySummaryForGoal = async () => {
    if (showGoalForm && !editingGoal) {
      const currentMonth = `${selectedYear}-${selectedMonth}`;
      const canCreate = await canCreateGoal('user-1', currentMonth);
      setCanCreateGoalState(canCreate);
      
      if (canCreate.canCreate) {
        const summary = await getMonthlyFinanceSummaryByUserAndMonth('user-1', currentMonth + '-01');
        if (summary) {
          setMonthlySummary(summary);
          // Preencher campos com valores da tabela intermediária
          const updatedForm = {
            monthly_income: summary.total_monthly_income.toString(),
            fixed_expenses: summary.total_monthly_expense.toString(),
            available_per_month: summary.total_monthly_available.toString(),
          };
          setGoalForm(prev => ({ ...prev, ...updatedForm }));
        }
      }
    }
  };
  loadMonthlySummaryForGoal();
}, [showGoalForm, editingGoal, selectedYear, selectedMonth]);
```

#### **✏️ Edição de Metas**

```typescript
// Atualizar formulário ao editar meta
useEffect(() => {
  if (editingGoal) {
    const loadUpdatedDataForEdit = async () => {
      const currentMonth = editingGoal.start_date.substring(0, 7); // YYYY-MM
      const summary = await getMonthlyFinanceSummaryByUserAndMonth('user-1', currentMonth + '-01');
      
      if (summary) {
        // Usar dados atualizados do resumo mensal em vez dos dados antigos da meta
        setGoalForm({
          ...editingGoal,
          monthly_income: summary.total_monthly_income.toString(), // Dados atualizados
          fixed_expenses: summary.total_monthly_expense.toString(), // Dados atualizados
          available_per_month: summary.total_monthly_available.toString(), // Dados atualizados
        });
      }
    };
    loadUpdatedDataForEdit();
  }
}, [editingGoal]);
```

#### **📈 Progresso das Metas**

```typescript
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
```

---

### **3. ��️ SISTEMA DE NAVEGAÇÃO POR ABAS**

```typescript
const renderBudgetView = () => (/* Componente de orçamento */);
const renderGoalView = () => (/* Componente de metas */);
const renderProjectionView = () => (/* Componente de projeção */);

return (
  <Layout>
    <View style={styles.container}>
      {/* Tab Navigator */}
      <View style={styles.tabNavigator}>
        <TouchableOpacity onPress={() => setCurrentView('budget')}>
          <Text>Orçamento</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setCurrentView('goal')}>
          <Text>Meta</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setCurrentView('projection')}>
          <Text>Projeção</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {currentView === 'budget' && renderBudgetView()}
      {currentView === 'goal' && renderGoalView()}
      {currentView === 'projection' && renderProjectionView()}
    </View>
  </Layout>
);
```

---

## 🔧 **COMPONENTES AUXILIARES**

### **📋 BudgetItemsList**

Componente interno para listar itens do orçamento:

```typescript
const BudgetItemsList: React.FC<{ budgetId: string }> = ({ budgetId }) => {
  const [budgetItems, setBudgetItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBudgetItems = async () => {
      const items = await getBudgetItemsByBudgetId(budgetId);
      setBudgetItems(items);
    };
    loadBudgetItems();
  }, [budgetId]);

  // Renderização condicional baseada no estado
  if (loading) return <LoadingComponent />;
  if (budgetItems.length === 0) return <EmptyComponent />;

  // Separação por tipo (despesa/receita)
  const expenseItems = budgetItems.filter(item => item.category_type === 'expense');
  const incomeItems = budgetItems.filter(item => item.category_type === 'income');

  return (
    <View>
      {/* Renderização dos itens */}
    </View>
  );
};
```

---

## �� **SISTEMA DE ESTILOS**

### **📐 Estrutura de Estilos**

```typescript
const styles = StyleSheet.create({
  // Layout principal
  container: { flex: 1, backgroundColor: colors.background.default },
  
  // Navegação por abas
  tabNavigator: { flexDirection: 'row', borderBottomWidth: 1 },
  tab: { flex: 1, paddingVertical: spacing.md, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: colors.primary[500] },
  
  // Cards e containers
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
  
  // Formulários
  input: {
    backgroundColor: colors.background.default,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    padding: spacing.md,
    fontSize: typography.body1.fontSize,
    marginBottom: spacing.md,
  },
  
  // Modais
  modalContainer: { flex: 1, backgroundColor: colors.background.default },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
});
```

---

## 🔄 **FLUXOS DE DADOS**

### **�� Fluxo de Orçamento**

1. **Inicialização** → Carrega orçamento ativo
2. **Criação/Edição** → Abre modal com formulário
3. **Validação** → Verifica campos obrigatórios
4. **Processamento** → Diferencia manual/automático
5. **Persistência** → Salva no banco de dados
6. **Atualização** → Recarrega dados e fecha modal

### **�� Fluxo de Metas**

1. **Verificação** → Checa se pode criar meta (resumo mensal)
2. **Carregamento** → Busca dados do resumo mensal
3. **Preenchimento** → Popula formulário com dados atuais
4. **Cálculo** → Estratégia e validação de parcelas
5. **Persistência** → Salva meta no banco
6. **Atualização** → Recarrega lista de metas

---

## 🛡️ **VALIDAÇÕES E SEGURANÇA**

### **📋 Validações de Orçamento**

```typescript
// Validações básicas
if (!budgetFormData.name.trim()) {
  Alert.alert('Erro', 'Nome do orçamento é obrigatório');
  return;
}

if (!budgetFormData.start_period || !budgetFormData.end_period) {
  Alert.alert('Erro', 'Período é obrigatório');
  return;
}

// Validações específicas por tipo
if (budgetFormData.budget_type === 'manual') {
  if (expenseItems.length === 0) {
    Alert.alert('Erro', 'Pelo menos uma categoria de despesa deve ser selecionada');
    return;
  }
  if (incomeItems.length === 0) {
    Alert.alert('Erro', 'Pelo menos uma categoria de receita deve ser selecionada');
    return;
  }
}
```

### **🎯 Validações de Metas**

```typescript
// Validação de permissão
if (!editingGoal && !canCreateGoalState.canCreate) {
  return setGoalFormError(canCreateGoalState.message);
}

// Validações básicas
if (!goalForm.description.trim()) return setGoalFormError('Descrição é obrigatória');
if (!goalForm.target_value || isNaN(Number(goalForm.target_value)) || Number(goalForm.target_value) <= 0) 
  return setGoalFormError('Valor alvo inválido');

// Validação de parcelas
const validation = validateGoalParcels(targetValue, numParcels, availablePerMonth);
if (!validation.isValid) {
  return setGoalFormError(validation.message);
}
```

---

## 🔍 **PONTOS DE ATENÇÃO**

### **⚠️ Complexidade**

- **Arquivo extenso**: 2163 linhas de código
- **Múltiplas responsabilidades**: Orçamento, metas e projeções
- **Estados complexos**: Muitos estados interdependentes

### **🔄 Dependências**

- **Context API**: `useFinance` para dados globais
- **Serviços externos**: `GoalService`, `ValidationService`
- **Banco de dados**: Múltiplas tabelas e operações

### **📱 Performance**

- **useEffect múltiplos**: Pode causar re-renders desnecessários
- **Cálculos em tempo real**: Estratégia e validação de metas
- **Carregamento assíncrono**: Dados de resumo mensal

---

## 🚀 **MELHORIAS SUGERIDAS**

1. **📦 Refatoração**: Dividir em componentes menores
2. **🔄 Otimização**: Reduzir re-renders com useMemo/useCallback
3. **🧪 Testes**: Adicionar testes unitários
4. **📚 Documentação**: Comentários inline para lógicas complexas
5. **🎨 UI/UX**: Melhorar feedback visual e estados de loading

---

## �� **CONCLUSÃO**

O `Plan.tsx` é um componente robusto e funcional que implementa um sistema completo de planejamento financeiro. Sua arquitetura permite gerenciar orçamentos e metas de forma integrada, com validações rigorosas e cálculos automáticos. A complexidade é justificada pela riqueza de funcionalidades oferecidas, mas sugere-se refatoração para melhorar manutenibilidade e performance.