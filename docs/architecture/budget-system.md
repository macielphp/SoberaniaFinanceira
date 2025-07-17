# 💰 Sistema de Orçamento - Budget System

## 🎯 Visão Geral

O sistema de orçamento oferece duas modalidades para criação de orçamentos: **Manual** e **Automático**. Ambas as opções permitem ao usuário definir metas financeiras baseadas em categorias de despesas e receitas.

---

## 📋 Modalidades de Orçamento

### 🔧 Orçamento Manual

O usuário tem controle total sobre a definição do orçamento, selecionando categorias específicas e definindo valores personalizados.

#### 🎯 Características
- **Seleção de Categorias**: Usuário escolhe quais categorias incluir no orçamento
- **Valores Personalizados**: Define valores específicos para cada categoria
- **Flexibilidade Total**: Controle completo sobre a estrutura do orçamento
- **Categorias de Despesas**: Apenas categorias relacionadas a gastos
- **Categorias de Receitas**: Espaço dedicado para definir receitas esperadas

#### 📊 Estrutura de Dados
```typescript
interface ManualBudget {
  id: string;
  user_id: string;
  name: string;
  start_period: string;
  end_period: string;
  type: 'manual';
  budget_items: BudgetItem[];
  created_at: string;
  updated_at: string;
}

interface BudgetItem {
  id: string;
  budget_id: string;
  category_name: string;
  planned_value: number;
  category_type: 'expense' | 'income';
}
```

#### 🔄 Fluxo de Criação
1. **Seleção de Período**: Usuário define período do orçamento
2. **Escolha de Categorias**: Seleciona categorias de despesas da tabela `categories`
3. **Definição de Valores**: Define valor > 0 para cada categoria selecionada
4. **Receitas**: Define categorias de receitas e valores esperados
5. **Validação**: Sistema valida valores e categorias
6. **Salvamento**: Orçamento é salvo no banco de dados

---

### 🤖 Orçamento Automático

O sistema analisa o histórico financeiro do usuário e gera um orçamento baseado nos padrões reais de gastos e receitas.

#### 🎯 Características
- **Análise Histórica**: Baseado em dados reais do usuário
- **Geração Automática**: Sistema calcula valores baseados no histórico
- **Transparência**: Mostra valores reais que serviram de base
- **Personalização**: Usuário pode ajustar valores gerados automaticamente
- **Inteligência**: Considera sazonalidade e padrões mensais

#### 📊 Estrutura de Dados
```typescript
interface AutomaticBudget {
  id: string;
  user_id: string;
  name: string;
  start_period: string;
  end_period: string;
  type: 'automatic';
  base_month: string; // Mês usado como referência
  budget_items: BudgetItem[];
  created_at: string;
  updated_at: string;
}

interface BudgetItem {
  id: string;
  budget_id: string;
  category_name: string;
  planned_value: number;
  actual_value: number; // Valor real do mês base
  category_type: 'expense' | 'income';
}
```

#### 🔄 Fluxo de Criação
1. **Seleção de Período**: Usuário define período do orçamento
2. **Escolha do Mês Base**: Seleciona mês de referência (padrão: mês anterior)
3. **Análise Automática**: Sistema busca categorias e valores do mês base
4. **Apresentação**: Mostra categorias encontradas e valores reais
5. **Ajustes**: Usuário pode modificar valores sugeridos
6. **Confirmação**: Orçamento é salvo com valores finais

---

## 🗄️ Estrutura do Banco de Dados

### 📊 Tabela Principal: `budget`

```sql
CREATE TABLE IF NOT EXISTS budget (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    start_period TEXT NOT NULL,
    end_period TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('manual', 'automatic')),
    base_month TEXT, -- Apenas para orçamentos automáticos
    total_planned_value REAL NOT NULL,
    total_actual_value REAL, -- Para orçamentos automáticos
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

### 📊 Tabela de Itens: `budget_items`

```sql
CREATE TABLE IF NOT EXISTS budget_items (
    id TEXT PRIMARY KEY,
    budget_id TEXT NOT NULL,
    category_name TEXT NOT NULL,
    planned_value REAL NOT NULL,
    actual_value REAL, -- Valor real do mês base (automático)
    category_type TEXT NOT NULL CHECK(category_type IN ('expense', 'income')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (budget_id) REFERENCES budget(id) ON DELETE CASCADE
);
```

---

## 🔧 Funcionalidades do Sistema

### 📊 Criação de Orçamento Manual

#### Função: `createManualBudget`
```typescript
async function createManualBudget(
  user_id: string,
  name: string,
  start_period: string,
  end_period: string,
  budget_items: {
    category_name: string;
    planned_value: number;
    category_type: 'expense' | 'income';
  }[]
): Promise<Budget>
```

#### Validações:
- ✅ Valores devem ser > 0
- ✅ Categorias devem existir na tabela `categories`
- ✅ Período deve ser válido
- ✅ Pelo menos uma categoria deve ser selecionada

### 🤖 Criação de Orçamento Automático

#### Função: `createAutomaticBudget`
```typescript
async function createAutomaticBudget(
  user_id: string,
  name: string,
  start_period: string,
  end_period: string,
  base_month: string // Mês de referência (YYYY-MM)
): Promise<Budget>
```

#### Processo Automático:
1. **Buscar Operações**: Operações do mês base
2. **Agrupar por Categoria**: Somar valores por categoria
3. **Separar Despesas/Receitas**: Baseado na natureza da operação
4. **Calcular Médias**: Considerar sazonalidade se necessário
5. **Gerar Sugestões**: Valores baseados no histórico real

### 📈 Análise de Performance

#### Função: `calculateBudgetPerformance`
```typescript
async function calculateBudgetPerformance(
  budget_id: string,
  user_id: string
): Promise<BudgetPerformance>
```

#### Indicadores Calculados:
- **Valor Planejado vs Real**: Comparação por categoria
- **Percentual de Atingimento**: (Real / Planejado) × 100
- **Status por Categoria**: Superávit, Déficit, Equilibrado
- **Status Geral**: Baseado no total de despesas

---

## 🎨 Interface do Usuário

### 📱 Tela de Criação de Orçamento

#### Seleção de Tipo
```
┌─────────────────────────────────────┐
│  Criar Orçamento                    │
├─────────────────────────────────────┤
│  Tipo de Orçamento:                 │
│  ○ Manual                           │
│  ○ Automático                       │
└─────────────────────────────────────┘
```

#### Formulário Manual
```
┌─────────────────────────────────────┐
│  Orçamento Manual                   │
├─────────────────────────────────────┤
│  Nome: [________________]           │
│  Período: [01/01/2024] a [31/01/2024] │
│                                     │
│  Categorias de Despesas:            │
│  ☑ Aluguel: R$ [1.400,00]          │
│  ☑ Alimentação: R$ [1.000,00]      │
│  ☐ Transporte: R$ [_____]           │
│                                     │
│  Categorias de Receitas:            │
│  ☑ Salário: R$ [5.000,00]          │
│  ☐ Freelance: R$ [_____]            │
└─────────────────────────────────────┘
```

#### Formulário Automático
```
┌─────────────────────────────────────┐
│  Orçamento Automático               │
├─────────────────────────────────────┤
│  Nome: [________________]           │
│  Período: [01/02/2024] a [29/02/2024] │
│  Mês Base: [Janeiro 2024]           │
│                                     │
│  Baseado no histórico de Janeiro:   │
│                                     │
│  Despesas:                          │
│  ☑ Aluguel: R$ 1.400,00 → [1.400,00] │
│  ☑ Alimentação: R$ 950,00 → [1.000,00] │
│  ☑ Transporte: R$ 320,00 → [350,00]   │
│                                     │
│  Receitas:                          │
│  ☑ Salário: R$ 5.000,00 → [5.000,00] │
│  ☑ Freelance: R$ 800,00 → [800,00]   │
└─────────────────────────────────────┘
```

---

## 🔄 Regras de Negócio

### 📊 Validações Gerais
- **Período**: Data início < Data fim
- **Valores**: Todos os valores devem ser > 0
- **Categorias**: Devem existir na tabela `categories`
- **Usuário**: Orçamento pertence ao usuário logado

### 🎯 Regras Específicas

#### Orçamento Manual
- Mínimo 1 categoria de despesa
- Mínimo 1 categoria de receita
- Valores obrigatórios para todas as categorias selecionadas

#### Orçamento Automático
- Mês base deve ter dados disponíveis
- Se não houver dados, sugerir criação manual
- Considerar apenas operações com estado 'pago'/'recebido'

### 📈 Cálculos de Performance
- **Superávit**: Real < Planejado (despesas)
- **Déficit**: Real > Planejado (despesas)
- **Equilibrado**: Real = Planejado (despesas)

---

## 🚀 Implementação

### 📁 Estrutura de Arquivos
```
app/src/database/
├── budget.ts          # Funções principais
├── budget-items.ts    # Funções de itens
└── budget-analysis.ts # Análises e cálculos
```

### 🔧 Próximos Passos
1. Refatorar tabela `budget` existente
2. Criar tabela `budget_items`
3. Implementar funções de criação manual/automática
4. Desenvolver interface de usuário
5. Testes e validações

---

## 📝 Considerações Técnicas

### 🔍 Performance
- Índices em `user_id`, `period`, `type`
- Consultas otimizadas para análise histórica
- Cache de cálculos de performance

### 🛡️ Segurança
- Validação de propriedade por usuário
- Sanitização de inputs
- Transações para operações complexas

### 🔄 Manutenibilidade
- Código modular e reutilizável
- Documentação clara
- Testes unitários e de integração 