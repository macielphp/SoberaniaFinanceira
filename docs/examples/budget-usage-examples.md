# 💰 Exemplos de Uso - Sistema de Orçamento

## 🎯 Visão Geral

Este documento demonstra como usar as novas funcionalidades de orçamento manual e automático implementadas no sistema.

---

## 🔧 Orçamento Manual

### 📝 Exemplo 1: Criando um Orçamento Manual Básico

```typescript
import { createManualBudget, BudgetItemInput } from '../database';

// Dados do usuário
const user_id = 'user-123';
const budget_name = 'Orçamento Janeiro 2024';
const start_period = '2024-01-01';
const end_period = '2024-01-31';

// Itens do orçamento
const budget_items: BudgetItemInput[] = [
  // Despesas
  {
    category_name: 'Aluguel',
    planned_value: 1400.00,
    category_type: 'expense'
  },
  {
    category_name: 'Alimentação',
    planned_value: 1000.00,
    category_type: 'expense'
  },
  {
    category_name: 'Transporte',
    planned_value: 300.00,
    category_type: 'expense'
  },
  {
    category_name: 'Internet-e-plano-residência/móvel',
    planned_value: 200.00,
    category_type: 'expense'
  },
  
  // Receitas
  {
    category_name: 'Salário-CLT',
    planned_value: 5000.00,
    category_type: 'income'
  },
  {
    category_name: 'Freelance',
    planned_value: 800.00,
    category_type: 'income'
  }
];

// Criar orçamento
try {
  const budget = await createManualBudget(
    user_id,
    budget_name,
    start_period,
    end_period,
    budget_items
  );
  
  console.log('✅ Orçamento manual criado:', budget);
} catch (error) {
  console.error('❌ Erro ao criar orçamento:', error.message);
}
```

### 📊 Exemplo 2: Orçamento Manual com Validações

```typescript
import { createManualBudget, getAllCategories } from '../database';

async function createValidatedManualBudget(user_id: string) {
  try {
    // Buscar categorias disponíveis
    const categories = await getAllCategories();
    
    // Filtrar categorias de despesas (exemplo)
    const expenseCategories = categories.filter(cat => 
      !cat.name.includes('Salário') && 
      !cat.name.includes('Freelance') &&
      !cat.name.includes('Cashback')
    );
    
    // Criar itens baseados nas categorias disponíveis
    const budget_items: BudgetItemInput[] = [
      // Despesas (primeiras 5 categorias)
      ...expenseCategories.slice(0, 5).map(cat => ({
        category_name: cat.name,
        planned_value: Math.random() * 1000 + 100, // Valor aleatório entre 100-1100
        category_type: 'expense' as const
      })),
      
      // Receitas (categorias específicas)
      {
        category_name: 'Salário-CLT',
        planned_value: 5000.00,
        category_type: 'income'
      }
    ];
    
    const budget = await createManualBudget(
      user_id,
      'Orçamento Validado',
      '2024-02-01',
      '2024-02-29',
      budget_items
    );
    
    return budget;
  } catch (error) {
    console.error('Erro na validação:', error.message);
    throw error;
  }
}
```

---

## 🤖 Orçamento Automático

### 📝 Exemplo 1: Criando um Orçamento Automático

```typescript
import { createAutomaticBudget, getHistoricalDataForAutomaticBudget } from '../database';

// Dados do usuário
const user_id = 'user-123';
const budget_name = 'Orçamento Automático Fevereiro 2024';
const start_period = '2024-02-01';
const end_period = '2024-02-29';
const base_month = '2024-01'; // Janeiro como referência

// Primeiro, verificar dados históricos disponíveis
async function checkHistoricalData() {
  try {
    const historicalData = await getHistoricalDataForAutomaticBudget(user_id, base_month);
    
    if (historicalData.length === 0) {
      console.log('⚠️ Não há dados suficientes para criar orçamento automático');
      return null;
    }
    
    console.log('📊 Dados históricos encontrados:', historicalData);
    return historicalData;
  } catch (error) {
    console.error('❌ Erro ao buscar dados históricos:', error.message);
    return null;
  }
}

// Criar orçamento automático
async function createAutomaticBudgetExample() {
  try {
    const budget = await createAutomaticBudget(
      user_id,
      budget_name,
      start_period,
      end_period,
      base_month
    );
    
    console.log('✅ Orçamento automático criado:', budget);
    return budget;
  } catch (error) {
    console.error('❌ Erro ao criar orçamento automático:', error.message);
    throw error;
  }
}

// Executar
checkHistoricalData().then(data => {
  if (data) {
    createAutomaticBudgetExample();
  }
});
```

### 📊 Exemplo 2: Orçamento Automático com Análise Detalhada

```typescript
import { 
  createAutomaticBudget, 
  getHistoricalDataForAutomaticBudget,
  getBudgetItemsByBudgetId 
} from '../database';

async function createDetailedAutomaticBudget(user_id: string) {
  try {
    // 1. Analisar dados históricos
    const historicalData = await getHistoricalDataForAutomaticBudget(user_id, '2024-01');
    
    console.log('📈 Análise dos dados históricos:');
    historicalData.forEach(item => {
      console.log(`  ${item.category}: R$ ${item.total_value.toFixed(2)} (${item.nature})`);
    });
    
    // 2. Criar orçamento automático
    const budget = await createAutomaticBudget(
      user_id,
      'Orçamento Detalhado Março 2024',
      '2024-03-01',
      '2024-03-31',
      '2024-01'
    );
    
    // 3. Buscar itens criados
    const budgetItems = await getBudgetItemsByBudgetId(budget.id);
    
    console.log('📋 Itens do orçamento criado:');
    budgetItems.forEach(item => {
      const actualInfo = item.actual_value ? ` (baseado em R$ ${item.actual_value})` : '';
      console.log(`  ${item.category_name}: R$ ${item.planned_value}${actualInfo}`);
    });
    
    return { budget, items: budgetItems };
  } catch (error) {
    console.error('❌ Erro:', error.message);
    throw error;
  }
}
```

---

## 📈 Análise de Performance

### 📊 Exemplo 1: Calculando Performance de um Orçamento

```typescript
import { calculateBudgetPerformance, getBudgetById } from '../database';

async function analyzeBudgetPerformance(budget_id: string, user_id: string) {
  try {
    // Buscar orçamento
    const budget = await getBudgetById(budget_id, user_id);
    if (!budget) {
      throw new Error('Orçamento não encontrado');
    }
    
    // Calcular performance
    const performance = await calculateBudgetPerformance(budget_id, user_id);
    
    console.log('📊 Performance do Orçamento:');
    console.log(`  Status Geral: ${performance.status}`);
    console.log(`  Total Planejado: R$ ${performance.total_planned.toFixed(2)}`);
    console.log(`  Total Real: R$ ${performance.total_actual.toFixed(2)}`);
    console.log(`  Diferença: R$ ${performance.difference.toFixed(2)}`);
    console.log(`  Percentual Utilizado: ${performance.percentage_used.toFixed(1)}%`);
    console.log(`  Percentual Economizado: ${performance.percentage_saved.toFixed(1)}%`);
    
    console.log('\n📋 Performance por Categoria:');
    performance.items_performance.forEach(item => {
      const statusEmoji = item.status === 'superávit' ? '✅' : 
                         item.status === 'déficit' ? '❌' : '⚖️';
      console.log(`  ${statusEmoji} ${item.category_name}: ${item.percentage_used.toFixed(1)}% usado`);
    });
    
    return performance;
  } catch (error) {
    console.error('❌ Erro na análise:', error.message);
    throw error;
  }
}
```

### 📊 Exemplo 2: Comparando Múltiplos Orçamentos

```typescript
import { getAllBudgets, calculateBudgetPerformance } from '../database';

async function compareBudgets(user_id: string) {
  try {
    // Buscar todos os orçamentos
    const budgets = await getAllBudgets(user_id);
    
    console.log('📊 Comparação de Orçamentos:');
    
    for (const budget of budgets) {
      const performance = await calculateBudgetPerformance(budget.id, user_id);
      
      console.log(`\n📋 ${budget.name} (${budget.type}):`);
      console.log(`  Período: ${budget.start_period} a ${budget.end_period}`);
      console.log(`  Status: ${performance.status}`);
      console.log(`  Economia: ${performance.percentage_saved.toFixed(1)}%`);
      
      if (budget.type === 'automatic' && budget.base_month) {
        console.log(`  Baseado em: ${budget.base_month}`);
      }
    }
  } catch (error) {
    console.error('❌ Erro na comparação:', error.message);
    throw error;
  }
}
```

---

## 🔄 Operações Avançadas

### 📝 Exemplo 1: Atualizando Itens de Orçamento

```typescript
import { 
  getBudgetItemsByBudgetId, 
  updateBudgetItem,
  calculateBudgetTotals 
} from '../database';

async function updateBudgetItems(budget_id: string) {
  try {
    // Buscar itens atuais
    const currentItems = await getBudgetItemsByBudgetId(budget_id);
    
    console.log('📋 Itens atuais:');
    currentItems.forEach(item => {
      console.log(`  ${item.category_name}: R$ ${item.planned_value}`);
    });
    
    // Atualizar um item específico
    const itemToUpdate = currentItems.find(item => item.category_name === 'Alimentação');
    if (itemToUpdate) {
      await updateBudgetItem(itemToUpdate.id, {
        planned_value: itemToUpdate.planned_value * 1.1 // Aumentar 10%
      });
      console.log('✅ Item atualizado: Alimentação +10%');
    }
    
    // Recalcular totais
    const newTotals = await calculateBudgetTotals(budget_id);
    console.log('💰 Novos totais:', newTotals);
    
  } catch (error) {
    console.error('❌ Erro na atualização:', error.message);
    throw error;
  }
}
```

### 📝 Exemplo 2: Gerenciando Orçamentos por Período

```typescript
import { 
  getBudgetsByPeriod, 
  getCurrentBudget,
  calculateBudgetPerformance 
} from '../database';

async function managePeriodBudgets(user_id: string) {
  try {
    // Buscar orçamentos do primeiro trimestre de 2024
    const q1Budgets = await getBudgetsByPeriod(
      user_id, 
      '2024-01-01', 
      '2024-03-31'
    );
    
    console.log(`📊 Orçamentos Q1 2024: ${q1Budgets.length} encontrados`);
    
    // Buscar orçamento atual
    const currentDate = new Date().toISOString().split('T')[0];
    const currentBudget = await getCurrentBudget(user_id, currentDate);
    
    if (currentBudget) {
      console.log('📅 Orçamento atual:', currentBudget.name);
      
      // Analisar performance do orçamento atual
      const performance = await calculateBudgetPerformance(currentBudget.id, user_id);
      console.log(`  Status: ${performance.status}`);
    } else {
      console.log('⚠️ Nenhum orçamento ativo no momento');
    }
    
  } catch (error) {
    console.error('❌ Erro no gerenciamento:', error.message);
    throw error;
  }
}
```

---

## 🎯 Casos de Uso Práticos

### 💼 Caso 1: Usuário Iniciante (Orçamento Manual)

```typescript
// Usuário que está começando a controlar suas finanças
async function beginnerUserBudget(user_id: string) {
  const simpleBudget = await createManualBudget(
    user_id,
    'Meu Primeiro Orçamento',
    '2024-03-01',
    '2024-03-31',
    [
      // Despesas básicas
      { category_name: 'Aluguel', planned_value: 1200, category_type: 'expense' },
      { category_name: 'Alimentação', planned_value: 800, category_type: 'expense' },
      { category_name: 'Transporte', planned_value: 200, category_type: 'expense' },
      
      // Receita principal
      { category_name: 'Salário-CLT', planned_value: 3000, category_type: 'income' }
    ]
  );
  
  return simpleBudget;
}
```

### 💼 Caso 2: Usuário Experiente (Orçamento Automático)

```typescript
// Usuário com histórico que quer otimizar
async function experiencedUserBudget(user_id: string) {
  // Verificar se há dados suficientes
  const historicalData = await getHistoricalDataForAutomaticBudget(user_id, '2024-02');
  
  if (historicalData.length >= 5) { // Pelo menos 5 categorias
    const automaticBudget = await createAutomaticBudget(
      user_id,
      'Orçamento Otimizado Março 2024',
      '2024-03-01',
      '2024-03-31',
      '2024-02'
    );
    
    return automaticBudget;
  } else {
    // Fallback para orçamento manual
    return await beginnerUserBudget(user_id);
  }
}
```

---

## 🚀 Próximos Passos

1. **Implementar Interface**: Criar telas para criação manual e automática
2. **Validações Avançadas**: Adicionar mais validações de negócio
3. **Relatórios**: Gerar relatórios de performance
4. **Notificações**: Alertas quando orçamento estiver próximo do limite
5. **Sincronização**: Sincronizar com dados externos se necessário 