# Sistema de Metas (Clean Architecture + TDD)

## 🎯 Visão Geral

O sistema de metas implementa **Clean Architecture** e **TDD** para permitir ao usuário definir objetivos financeiros SMART (Specific, Measurable, Achievable, Relevant, Time-bound) e acompanhar o progresso vinculando operações financeiras a essas metas.

## 🏗️ Arquitetura Clean Architecture

### 🎯 Domain Layer

#### **Entidade Principal**

```typescript
// Goal Entity (Domain)
export class Goal {
  private _id: string;
  private _userId: string;
  private _description: string;
  private _targetValue: Money;
  private _startDate: Date;
  private _endDate: Date;
  private _monthlyIncome: Money;
  private _fixedExpenses: Money;
  private _availablePerMonth: Money;
  private _importance: string;
  private _priority: number; // 1-5
  private _strategy?: string;
  private _monthlyContribution: Money;
  private _status: 'active' | 'completed' | 'paused' | 'cancelled';
  private _createdAt: Date;
  private _updatedAt: Date;

  // Métodos de domínio
  updateDescription(description: string): Goal
  updateTargetValue(value: Money): Goal
  updateDates(startDate: Date, endDate: Date): Goal
  updateFinancials(monthlyIncome: Money, fixedExpenses: Money): Goal
  updatePriority(priority: number): Goal
  updateStrategy(strategy: string): Goal
  updateStatus(status: GoalStatus): Goal
  calculateProgress(operations: Operation[]): number
  isAchievable(): boolean
  getRemainingAmount(): Money
  getEstimatedCompletionDate(): Date | null
  generateMotivationalMantra(): string
}
```

#### **Value Objects**

```typescript
// Money Value Object (Shared)
export class Money extends ValueObject<{ value: number; currency: string }> {
  constructor(value: number, currency: string = 'BRL') {
    if (value < 0) {
      throw new Error('Amount cannot be negative');
    }
    super({ value, currency });
  }
}

// Goal Types
export type GoalStatus = 'active' | 'completed' | 'paused' | 'cancelled';
export type GoalPriority = 1 | 2 | 3 | 4 | 5;
```

#### **Interface de Repositório**

```typescript
// Domain Repository Interface
export interface IGoalRepository {
  save(goal: Goal): Promise<Goal>;
  findById(id: string): Promise<Goal | null>;
  findAll(): Promise<Goal[]>;
  findByUser(userId: string): Promise<Goal[]>;
  findByStatus(status: GoalStatus): Promise<Goal[]>;
  findByPriority(priority: GoalPriority): Promise<Goal[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<Goal[]>;
  findActiveByUser(userId: string): Promise<Goal[]>;
  delete(id: string): Promise<boolean>;
  deleteAll(): Promise<void>;
  count(): Promise<number>;
}
```

### 💾 Data Layer

#### **DTO (Data Transfer Object)**

```typescript
// GoalDTO
export interface GoalDTO {
  id: string;
  user_id: string;
  description: string;
  target_value: number;
  start_date: string;        // ISO string
  end_date: string;          // ISO string
  monthly_income: number;
  fixed_expenses: number;
  available_per_month: number;
  importance: string;
  priority: number;          // 1-5
  strategy: string | null;
  monthly_contribution: number;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  created_at: string;        // ISO string
  updated_at: string;        // ISO string
}
```

#### **Mapper**

```typescript
// GoalMapper
export class GoalMapper {
  toDomain(dto: GoalDTO): Goal
  toDTO(goal: Goal): GoalDTO
  toDomainList(dtos: GoalDTO[]): Goal[]
}
```

#### **Repositório SQLite**

```typescript
// SQLiteGoalRepository
export class SQLiteGoalRepository implements IGoalRepository {
  private db: SQLite.SQLiteDatabase;
  private mapper: GoalMapper;

  constructor() {
    this.db = SQLite.openDatabaseSync('finance.db');
    this.mapper = new GoalMapper();
    this.initializeDatabase();
  }

  // Implementação de todos os métodos da interface
  async save(goal: Goal): Promise<Goal>
  async findById(id: string): Promise<Goal | null>
  // ... outros métodos
}
```

### 🎨 Presentation Layer

#### **ViewModel**

```typescript
// GoalViewModel
export class GoalViewModel {
  private _goals: Goal[] = [];
  private _loading: boolean = false;
  private _error: string | null = null;
  private _selectedGoal: Goal | null = null;

  // Observables/State
  get goals(): Goal[]
  get loading(): boolean
  get error(): string | null
  get selectedGoal(): Goal | null

  // Actions
  async loadGoals(): Promise<void>
  async createGoal(data: CreateGoalDTO): Promise<Result<Goal>>
  async updateGoal(id: string, data: UpdateGoalDTO): Promise<Result<Goal>>
  async deleteGoal(id: string): Promise<Result<boolean>>
  async selectGoal(id: string): Promise<void>
  async calculateGoalProgress(goalId: string): Promise<Result<number>>
  async generateMotivationalMantra(goalId: string): Promise<Result<string>>
}
```

#### **UI Adapter**

```typescript
// useGoalAdapter
export const useGoalAdapter = () => {
  const viewModel = useViewModel(GoalViewModel);
  
  return {
    goals: viewModel.goals,
    loading: viewModel.loading,
    error: viewModel.error,
    selectedGoal: viewModel.selectedGoal,
    loadGoals: viewModel.loadGoals,
    createGoal: viewModel.createGoal,
    updateGoal: viewModel.updateGoal,
    deleteGoal: viewModel.deleteGoal,
    selectGoal: viewModel.selectGoal,
    calculateGoalProgress: viewModel.calculateGoalProgress,
    generateMotivationalMantra: viewModel.generateMotivationalMantra,
  };
};
```

## 🧪 Estratégia de Testes (TDD)

### 📋 Testes de Entidades (Domain)

```typescript
// Goal.test.ts
describe('Goal', () => {
  it('should create valid goal', () => {
    const goal = new Goal({
      id: 'goal-123',
      userId: 'user-456',
      description: 'Comprar um carro',
      targetValue: new Money(50000, 'BRL'),
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      monthlyIncome: new Money(5000, 'BRL'),
      fixedExpenses: new Money(3000, 'BRL'),
      availablePerMonth: new Money(2000, 'BRL'),
      importance: 'Necessário para trabalho',
      priority: 5,
      monthlyContribution: new Money(1500, 'BRL')
    });
    
    expect(goal.description).toBe('Comprar um carro');
    expect(goal.priority).toBe(5);
    expect(goal.status).toBe('active');
  });

  it('should validate priority range', () => {
    expect(() => {
      new Goal({
        // ... dados válidos
        priority: 6, // ❌ Invalid priority
      });
    }).toThrow('Priority must be between 1 and 5');
  });

  it('should calculate if goal is achievable', () => {
    const goal = new Goal({
      // ... dados válidos
      targetValue: new Money(10000, 'BRL'),
      monthlyContribution: new Money(1500, 'BRL')
    });
    
    expect(goal.isAchievable()).toBe(true); // 1500 * 12 = 18000 > 10000
  });
});
```

### 📋 Testes de Repositórios (Data)

```typescript
// SQLiteGoalRepository.test.ts
describe('SQLiteGoalRepository', () => {
  it('should save a new goal', async () => {
    const goal = new Goal({...});
    const savedGoal = await repository.save(goal);
    expect(savedGoal).toEqual(goal);
  });

  it('should find goal by id', async () => {
    const foundGoal = await repository.findById('goal-123');
    expect(foundGoal).toBeInstanceOf(Goal);
    expect(foundGoal?.description).toBe('Comprar um carro');
  });
});
```

## 📊 Regras de Negócio (Preservadas)

### 🎯 Metas SMART

1. **Specific (Específico)**
   - Descrição clara e detalhada da meta
   - Máximo 200 caracteres
   - Evitar vaguedades

2. **Measurable (Mensurável)**
   - Valor objetivo em reais
   - Progresso calculável
   - Indicadores claros

3. **Achievable (Atingível)**
   - Validação automática de viabilidade
   - Cálculo baseado em renda disponível
   - Sugestões de ajuste se necessário

4. **Relevant (Relevante)**
   - Justificativa/importância obrigatória
   - Máximo 500 caracteres
   - Vinculação com objetivos pessoais

5. **Time-bound (Temporal)**
   - Data de início e fim definidas
   - Prazo realista
   - Cálculo de tempo restante

### 💰 Validações Financeiras

- **Validação de Viabilidade**: Meta deve ser atingível no prazo
- **Validação de Prioridades**: Prioridade de 1 (baixa) a 5 (alta)
- **Validação de Datas**: StartDate < EndDate, EndDate > hoje
- **Validação de Valores**: Todos os valores > 0, MonthlyIncome >= FixedExpenses

### 🔄 Lifecycle Management

- **Status da Meta**: active, completed, paused, cancelled
- **Transições de Status**: Validações de transição
- **Cálculo de Progresso**: Baseado em operações vinculadas

## 🚀 Use Cases (A Implementar)

### 📋 Goal Use Cases

```typescript
// CreateGoalUseCase
export class CreateGoalUseCase {
  constructor(private goalRepository: IGoalRepository) {}
  
  async execute(data: CreateGoalDTO): Promise<Result<Goal>> {
    // 1. Validar dados de entrada
    // 2. Verificar viabilidade da meta
    // 3. Criar entidade Goal
    // 4. Salvar no repositório
    // 5. Retornar resultado
  }
}

// CalculateGoalProgressUseCase
export class CalculateGoalProgressUseCase {
  constructor(
    private goalRepository: IGoalRepository,
    private operationRepository: IOperationRepository
  ) {}
  
  async execute(goalId: string): Promise<Result<number>> {
    // 1. Buscar meta
    // 2. Buscar operações vinculadas
    // 3. Calcular progresso
    // 4. Retornar percentual
  }
}
```

## 📱 Integração com UI

### 🎨 Pure Components

```typescript
// GoalForm.tsx
export const GoalForm: React.FC<GoalFormProps> = ({
  onSubmit,
  initialData,
  loading
}) => {
  // Componente puro sem dependências externas
  // Recebe props e callbacks
  // Renderiza formulário de meta
};

// GoalCard.tsx
export const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  progress,
  onEdit,
  onDelete,
  onPause,
  onResume
}) => {
  // Componente puro para exibição de meta
  // Recebe dados e callbacks
  // Renderiza card de meta com progresso
};
```

### 🔗 UI Adapters

```typescript
// useGoalFormAdapter.tsx
export const useGoalFormAdapter = () => {
  const { createGoal, updateGoal, loading, error } = useGoalAdapter();
  
  const handleSubmit = async (data: GoalFormData) => {
    if (data.id) {
      return await updateGoal(data.id, data);
    } else {
      return await createGoal(data);
    }
  };
  
  return {
    onSubmit: handleSubmit,
    loading,
    error
  };
};
```

## 📊 Status da Implementação

### ✅ Concluído
- **Entidade**: Goal com validações completas
- **Value Objects**: Money (com validações)
- **Repositório**: SQLite implementation
- **Mapper**: DTO ↔ Entity conversion
- **Testes**: 100% green para entidade e repositório

### 🚧 Em Andamento
- **Use Cases**: Implementação TDD
- **ViewModels**: Implementação TDD
- **UI Adapters**: Implementação TDD
- **Pure Components**: Implementação TDD

### 📋 Próximos Passos
1. Implementar Use Cases (TDD)
2. Implementar ViewModels (TDD)
3. Implementar UI Adapters (TDD)
4. Implementar Pure Components (TDD)
5. Testes de integração completos

## 📚 Documentação Relacionada

- [System Architecture](./system-architecture.md) - Arquitetura geral
- [Data Model](./data-model.md) - Modelo de dados
- [Database Schema](./database-schema.md) - Esquema do banco
- [Budget System](./budget-system.md) - Sistema de orçamentos
- [Clean Architecture Guide](../clean_architecture/5-step%20of%20understanding) - Guia detalhado