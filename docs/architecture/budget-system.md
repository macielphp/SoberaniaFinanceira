# Sistema de Orçamentos (Clean Architecture + TDD)

## 🎯 Visão Geral

O sistema de orçamentos implementa **Clean Architecture** e **TDD** para oferecer controle financeiro através de orçamentos manuais. O sistema permite ao usuário definir metas financeiras baseadas em categorias de despesas e receitas, com tracking de performance e alertas.

## 🏗️ Arquitetura Clean Architecture

### 🎯 Domain Layer

#### **Entidades Principais**

```typescript
// Budget Entity (Domain)
export class Budget {
  private _id: string;
  private _userId: string;
  private _name: string;
  private _startPeriod: Date;
  private _endPeriod: Date;
  private _type: 'manual'; // Limitado a manual
  private _totalPlannedValue: Money;
  private _isActive: boolean;
  private _status: 'active' | 'inactive' | 'expired';
  private _createdAt: Date;

  // Métodos de domínio
  activate(): Budget
  deactivate(): Budget
  updateTotalPlannedValue(value: Money): Budget
  updateName(name: string): Budget
  getDurationInDays(): number
}

// BudgetItem Entity (Domain)
export class BudgetItem {
  private _id: string;
  private _budgetId: string;
  private _categoryName: string;
  private _plannedValue: Money;
  private _categoryType: 'expense' | 'income';
  private _actualValue?: Money;
  private _createdAt: Date;

  // Métodos de domínio
  updatePlannedValue(value: Money): BudgetItem
  updateActualValue(value: Money): BudgetItem
  calculateVariance(): Money // Retorna Math.abs(variance)
}

// MonthlyFinanceSummary Entity (Domain)
export class MonthlyFinanceSummary {
  private _id: string;
  private _userId: string;
  private _month: string; // YYYY-MM
  private _totalIncome: Money;
  private _totalExpense: Money;
  private _balance: Money; // Math.max(0, income - expense)
  private _totalPlannedBudget: Money;
  private _totalActualBudget: Money;
  private _createdAt: Date;

  // Métodos de domínio
  updateTotalIncome(value: Money): MonthlyFinanceSummary
  updateTotalExpense(value: Money): MonthlyFinanceSummary
  calculateSavingsRate(): number
  isProfitable(): boolean
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

  add(other: Money): Money
  subtract(other: Money): Money
  multiply(factor: number): Money
  format(): string
}
```

#### **Interfaces de Repositório**

```typescript
// Domain Repository Interfaces
export interface IBudgetRepository {
  save(budget: Budget): Promise<Budget>;
  findById(id: string): Promise<Budget | null>;
  findAll(): Promise<Budget[]>;
  findByUser(userId: string): Promise<Budget[]>;
  findActiveByUser(userId: string): Promise<Budget[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<Budget[]>;
  delete(id: string): Promise<boolean>;
  deleteAll(): Promise<void>;
  count(): Promise<number>;
}

export interface IBudgetItemRepository {
  save(budgetItem: BudgetItem): Promise<BudgetItem>;
  findById(id: string): Promise<BudgetItem | null>;
  findAll(): Promise<BudgetItem[]>;
  findByBudget(budgetId: string): Promise<BudgetItem[]>;
  findByCategory(categoryName: string): Promise<BudgetItem[]>;
  delete(id: string): Promise<boolean>;
  deleteAll(): Promise<void>;
  count(): Promise<number>;
}

export interface IMonthlyFinanceSummaryRepository {
  save(summary: MonthlyFinanceSummary): Promise<MonthlyFinanceSummary>;
  findById(id: string): Promise<MonthlyFinanceSummary | null>;
  findAll(): Promise<MonthlyFinanceSummary[]>;
  findByUser(userId: string): Promise<MonthlyFinanceSummary[]>;
  findByMonth(month: string): Promise<MonthlyFinanceSummary[]>;
  findByUserAndMonth(userId: string, month: string): Promise<MonthlyFinanceSummary[]>;
  delete(id: string): Promise<boolean>;
  deleteAll(): Promise<void>;
  count(): Promise<number>;
}
```

### 💾 Data Layer

#### **DTOs (Data Transfer Objects)**

```typescript
// BudgetDTO
export interface BudgetDTO {
  id: string;
  user_id: string;
  name: string;
  start_period: string; // ISO string
  end_period: string;   // ISO string
  type: 'manual';
  total_planned_value: number;
  is_active: boolean;
  status: 'active' | 'inactive' | 'expired';
  created_at: string;   // ISO string
}

// BudgetItemDTO
export interface BudgetItemDTO {
  id: string;
  budget_id: string;
  category_name: string;
  planned_value: number;
  category_type: 'expense' | 'income';
  actual_value: number | null;
  created_at: string;   // ISO string
}

// MonthlyFinanceSummaryDTO
export interface MonthlyFinanceSummaryDTO {
  id: string;
  user_id: string;
  month: string;        // YYYY-MM
  total_income: number;
  total_expense: number;
  balance: number;
  total_planned_budget: number;
  total_actual_budget: number;
  created_at: string;   // ISO string
}
```

#### **Mappers**

```typescript
// BudgetMapper
export class BudgetMapper {
  toDomain(dto: BudgetDTO): Budget
  toDTO(budget: Budget): BudgetDTO
  toDomainList(dtos: BudgetDTO[]): Budget[]
}

// BudgetItemMapper
export class BudgetItemMapper {
  toDomain(dto: BudgetItemDTO): BudgetItem
  toDTO(budgetItem: BudgetItem): BudgetItemDTO
  toDomainList(dtos: BudgetItemDTO[]): BudgetItem[]
}

// MonthlyFinanceSummaryMapper
export class MonthlyFinanceSummaryMapper {
  toDomain(dto: MonthlyFinanceSummaryDTO): MonthlyFinanceSummary
  toDTO(summary: MonthlyFinanceSummary): MonthlyFinanceSummaryDTO
  toDomainList(dtos: MonthlyFinanceSummaryDTO[]): MonthlyFinanceSummary[]
}
```

#### **Repositórios SQLite**

```typescript
// SQLiteBudgetRepository
export class SQLiteBudgetRepository implements IBudgetRepository {
  private db: SQLite.SQLiteDatabase;
  private mapper: BudgetMapper;

  constructor() {
    this.db = SQLite.openDatabaseSync('finance.db');
    this.mapper = new BudgetMapper();
    this.initializeDatabase();
  }

  // Implementação de todos os métodos da interface
  async save(budget: Budget): Promise<Budget>
  async findById(id: string): Promise<Budget | null>
  // ... outros métodos
}

// SQLiteBudgetItemRepository
export class SQLiteBudgetItemRepository implements IBudgetItemRepository {
  // Implementação similar
}

// SQLiteMonthlyFinanceSummaryRepository
export class SQLiteMonthlyFinanceSummaryRepository implements IMonthlyFinanceSummaryRepository {
  // Implementação similar
}
```

### 🎨 Presentation Layer

#### **ViewModels**

```typescript
// BudgetViewModel
export class BudgetViewModel {
  private _budgets: Budget[] = [];
  private _loading: boolean = false;
  private _error: string | null = null;

  // Observables/State
  get budgets(): Budget[]
  get loading(): boolean
  get error(): string | null

  // Actions
  async loadBudgets(): Promise<void>
  async createBudget(data: CreateBudgetDTO): Promise<Result<Budget>>
  async updateBudget(id: string, data: UpdateBudgetDTO): Promise<Result<Budget>>
  async deleteBudget(id: string): Promise<Result<boolean>>
  async activateBudget(id: string): Promise<Result<Budget>>
  async deactivateBudget(id: string): Promise<Result<Budget>>
}

// BudgetItemViewModel
export class BudgetItemViewModel {
  // Similar structure for budget items
}

// MonthlyFinanceSummaryViewModel
export class MonthlyFinanceSummaryViewModel {
  // Similar structure for monthly summaries
}
```

#### **UI Adapters**

```typescript
// useBudgetAdapter
export const useBudgetAdapter = () => {
  const viewModel = useViewModel(BudgetViewModel);
  
  return {
    budgets: viewModel.budgets,
    loading: viewModel.loading,
    error: viewModel.error,
    loadBudgets: viewModel.loadBudgets,
    createBudget: viewModel.createBudget,
    updateBudget: viewModel.updateBudget,
    deleteBudget: viewModel.deleteBudget,
    activateBudget: viewModel.activateBudget,
    deactivateBudget: viewModel.deactivateBudget,
  };
};

// useBudgetItemAdapter
export const useBudgetItemAdapter = () => {
  // Similar structure
};

// useMonthlyFinanceSummaryAdapter
export const useMonthlyFinanceSummaryAdapter = () => {
  // Similar structure
};
```

## 🧪 Estratégia de Testes (TDD)

### 📋 Testes de Entidades (Domain)

```typescript
// Budget.test.ts
describe('Budget', () => {
  it('should create valid budget', () => {
    const budget = new Budget({
      id: 'budget-123',
      userId: 'user-456',
      name: 'Orçamento Janeiro 2024',
      startPeriod: new Date('2024-01-01'),
      endPeriod: new Date('2024-01-31'),
      type: 'manual',
      totalPlannedValue: new Money(5000, 'BRL')
    });
    
    expect(budget.name).toBe('Orçamento Janeiro 2024');
    expect(budget.isActive).toBe(true);
  });

  it('should throw error for negative planned value', () => {
    expect(() => {
      new Budget({
        id: 'budget-123',
        userId: 'user-456',
        name: 'Orçamento Teste',
        startPeriod: new Date('2024-01-01'),
        endPeriod: new Date('2024-01-31'),
        type: 'manual',
        totalPlannedValue: new Money(-1000, 'BRL')
      });
    }).toThrow('Amount cannot be negative');
  });

  it('should activate and deactivate budget', () => {
    const budget = new Budget({...});
    const activated = budget.activate();
    expect(activated.isActive).toBe(true);
    
    const deactivated = activated.deactivate();
    expect(deactivated.isActive).toBe(false);
  });
});

// BudgetItem.test.ts
describe('BudgetItem', () => {
  it('should calculate variance correctly', () => {
    const budgetItem = new BudgetItem({
      id: 'item-123',
      budgetId: 'budget-456',
      categoryName: 'Alimentação',
      plannedValue: new Money(500, 'BRL'),
      categoryType: 'expense',
      actualValue: new Money(550, 'BRL')
    });
    
    const variance = budgetItem.calculateVariance();
    expect(variance).toEqual(new Money(50, 'BRL')); // Math.abs(500 - 550)
  });
});

// MonthlyFinanceSummary.test.ts
describe('MonthlyFinanceSummary', () => {
  it('should calculate savings rate correctly', () => {
    const summary = new MonthlyFinanceSummary({
      id: 'summary-123',
      userId: 'user-456',
      month: '2024-01',
      totalIncome: new Money(5000, 'BRL'),
      totalExpense: new Money(3000, 'BRL'),
      balance: new Money(2000, 'BRL'),
      totalPlannedBudget: new Money(4000, 'BRL'),
      totalActualBudget: new Money(3000, 'BRL')
    });
    
    const savingsRate = summary.calculateSavingsRate();
    expect(savingsRate).toBe(40); // (2000 / 5000) * 100
  });

  it('should handle negative balance with Money constraints', () => {
    const summary = new MonthlyFinanceSummary({
      id: 'summary-123',
      userId: 'user-456',
      month: '2024-01',
      totalIncome: new Money(2000, 'BRL'),
      totalExpense: new Money(3000, 'BRL'),
      balance: new Money(0, 'BRL'), // Cannot be negative with Money
      totalPlannedBudget: new Money(2500, 'BRL'),
      totalActualBudget: new Money(3000, 'BRL')
    });
    
    expect(summary.isProfitable()).toBe(false);
  });
});
```

### 📋 Testes de Repositórios (Data)

```typescript
// SQLiteBudgetRepository.test.ts
describe('SQLiteBudgetRepository', () => {
  let repository: SQLiteBudgetRepository;
  let mockDatabase: any;

  beforeEach(() => {
    mockDatabase = {
      execAsync: jest.fn(),
      runAsync: jest.fn(),
      getAllAsync: jest.fn(),
      getFirstAsync: jest.fn(),
    };
    
    jest.mock('expo-sqlite', () => ({
      openDatabaseSync: jest.fn(() => mockDatabase)
    }));
    
    repository = new SQLiteBudgetRepository();
  });

  it('should save a new budget', async () => {
    const budget = new Budget({...});
    mockDatabase.runAsync.mockResolvedValue({ changes: 1 });
    
    const savedBudget = await repository.save(budget);
    expect(savedBudget).toEqual(budget);
    expect(mockDatabase.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO budgets'),
      expect.arrayContaining([budget.id, budget.name])
    );
  });

  it('should find budget by id', async () => {
    const budgetDTO = {
      id: 'budget-123',
      user_id: 'user-456',
      name: 'Test Budget',
      start_period: '2024-01-01T00:00:00.000Z',
      end_period: '2024-01-31T00:00:00.000Z',
      type: 'manual',
      total_planned_value: 5000,
      is_active: 1,
      status: 'active',
      created_at: '2024-01-01T00:00:00.000Z'
    };
    
    mockDatabase.getAllAsync.mockResolvedValue([budgetDTO]);
    
    const foundBudget = await repository.findById('budget-123');
    expect(foundBudget).toBeInstanceOf(Budget);
    expect(foundBudget?.name).toBe('Test Budget');
  });
});
```

### 📋 Testes de ViewModels (Presentation)

```typescript
// BudgetViewModel.test.ts
describe('BudgetViewModel', () => {
  let viewModel: BudgetViewModel;
  let mockBudgetRepository: jest.Mocked<IBudgetRepository>;

  beforeEach(() => {
    mockBudgetRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findByUser: jest.fn(),
      findActiveByUser: jest.fn(),
      findByDateRange: jest.fn(),
      delete: jest.fn(),
      deleteAll: jest.fn(),
      count: jest.fn(),
    };
    
    viewModel = new BudgetViewModel(mockBudgetRepository);
  });

  it('should load budgets successfully', async () => {
    const mockBudgets = [
      new Budget({...}),
      new Budget({...})
    ];
    
    mockBudgetRepository.findByUser.mockResolvedValue(mockBudgets);
    
    await viewModel.loadBudgets();
    
    expect(viewModel.budgets).toEqual(mockBudgets);
    expect(viewModel.loading).toBe(false);
    expect(viewModel.error).toBeNull();
  });

  it('should handle error when loading budgets', async () => {
    mockBudgetRepository.findByUser.mockRejectedValue(new Error('Database error'));
    
    await viewModel.loadBudgets();
    
    expect(viewModel.error).toBe('Database error');
    expect(viewModel.loading).toBe(false);
  });
});
```

## 📊 Regras de Negócio (Preservadas)

### 💰 Validações Financeiras

```typescript
// 1. Money Value Object Constraints
- Não aceita valores negativos
- Validação automática no construtor
- Operações matemáticas seguras

// 2. Budget Constraints
- BudgetType limitado a 'manual'
- Períodos válidos (startPeriod < endPeriod)
- Nome obrigatório e não vazio
- Apenas um orçamento ativo por usuário

// 3. BudgetItem Constraints
- CategoryType: 'expense' | 'income'
- Valores planejados obrigatórios
- Valores reais opcionais
- Cálculo de variância com Math.abs()

// 4. MonthlyFinanceSummary Constraints
- Balance = Math.max(0, totalIncome - totalExpense)
- Month formato: YYYY-MM
- Validação de consistência dos valores
```

### 📈 Cálculos de Performance

```typescript
// 1. Budget Performance
- Total Planned vs Total Actual
- Percentual de uso: (actual / planned) * 100
- Status: superávit, déficit, equilibrado

// 2. BudgetItem Performance
- Variance = Math.abs(planned - actual)
- Percentual de uso por categoria
- Status por item individual

// 3. Monthly Finance Summary
- Savings Rate = (balance / totalIncome) * 100
- Profitability = totalIncome > totalExpense
- Budget vs Actual comparison
```

### 🔄 Lifecycle Management

```typescript
// 1. Budget Lifecycle
- Criação: isActive = true, status = 'active'
- Desativação: isActive = false, status = 'inactive'
- Expiração automática: status = 'expired'

// 2. BudgetItem Lifecycle
- Vinculação a Budget existente
- Atualização de valores planejados
- Registro de valores reais

// 3. MonthlyFinanceSummary Lifecycle
- Geração automática mensal
- Atualização baseada em operações
- Histórico preservado
```

## 🚀 Use Cases (A Implementar)

### 📋 Budget Use Cases

```typescript
// CreateBudgetUseCase
export class CreateBudgetUseCase {
  constructor(private budgetRepository: IBudgetRepository) {}
  
  async execute(data: CreateBudgetDTO): Promise<Result<Budget>> {
    // 1. Validar dados de entrada
    // 2. Verificar se já existe orçamento ativo
    // 3. Criar entidade Budget
    // 4. Salvar no repositório
    // 5. Retornar resultado
  }
}

// UpdateBudgetUseCase
export class UpdateBudgetUseCase {
  constructor(private budgetRepository: IBudgetRepository) {}
  
  async execute(id: string, data: UpdateBudgetDTO): Promise<Result<Budget>> {
    // 1. Buscar orçamento existente
    // 2. Validar modificações
    // 3. Atualizar entidade
    // 4. Salvar alterações
    // 5. Retornar resultado
  }
}

// CalculateBudgetPerformanceUseCase
export class CalculateBudgetPerformanceUseCase {
  constructor(
    private budgetRepository: IBudgetRepository,
    private budgetItemRepository: IBudgetItemRepository
  ) {}
  
  async execute(budgetId: string): Promise<Result<BudgetPerformance>> {
    // 1. Buscar orçamento e itens
    // 2. Calcular performance
    // 3. Gerar relatório
    // 4. Retornar resultado
  }
}
```

### 📋 BudgetItem Use Cases

```typescript
// CreateBudgetItemUseCase
export class CreateBudgetItemUseCase {
  constructor(private budgetItemRepository: IBudgetItemRepository) {}
  
  async execute(data: CreateBudgetItemDTO): Promise<Result<BudgetItem>> {
    // Implementação TDD
  }
}

// UpdateBudgetItemUseCase
export class UpdateBudgetItemUseCase {
  constructor(private budgetItemRepository: IBudgetItemRepository) {}
  
  async execute(id: string, data: UpdateBudgetItemDTO): Promise<Result<BudgetItem>> {
    // Implementação TDD
  }
}
```

### 📋 MonthlyFinanceSummary Use Cases

```typescript
// GenerateMonthlySummaryUseCase
export class GenerateMonthlySummaryUseCase {
  constructor(
    private monthlySummaryRepository: IMonthlyFinanceSummaryRepository,
    private operationRepository: IOperationRepository
  ) {}
  
  async execute(userId: string, month: string): Promise<Result<MonthlyFinanceSummary>> {
    // 1. Buscar operações do mês
    // 2. Calcular totais
    // 3. Gerar resumo
    // 4. Salvar resultado
    // 5. Retornar resultado
  }
}

// GetMonthlySummaryUseCase
export class GetMonthlySummaryUseCase {
  constructor(private monthlySummaryRepository: IMonthlyFinanceSummaryRepository) {}
  
  async execute(userId: string, month: string): Promise<Result<MonthlyFinanceSummary | null>> {
    // Implementação TDD
  }
}
```

## 📱 Integração com UI

### 🎨 Pure Components

```typescript
// BudgetForm.tsx
export const BudgetForm: React.FC<BudgetFormProps> = ({
  onSubmit,
  initialData,
  loading
}) => {
  // Componente puro sem dependências externas
  // Recebe props e callbacks
  // Renderiza formulário de orçamento
};

// BudgetCard.tsx
export const BudgetCard: React.FC<BudgetCardProps> = ({
  budget,
  onEdit,
  onDelete,
  onActivate
}) => {
  // Componente puro para exibição de orçamento
  // Recebe dados e callbacks
  // Renderiza card de orçamento
};

// BudgetPerformanceChart.tsx
export const BudgetPerformanceChart: React.FC<BudgetPerformanceChartProps> = ({
  performance,
  onItemPress
}) => {
  // Componente puro para gráficos de performance
  // Recebe dados de performance
  // Renderiza visualizações
};
```

### 🔗 UI Adapters

```typescript
// useBudgetFormAdapter.tsx
export const useBudgetFormAdapter = () => {
  const { createBudget, updateBudget, loading, error } = useBudgetAdapter();
  
  const handleSubmit = async (data: BudgetFormData) => {
    if (data.id) {
      return await updateBudget(data.id, data);
    } else {
      return await createBudget(data);
    }
  };
  
  return {
    onSubmit: handleSubmit,
    loading,
    error
  };
};

// useBudgetListAdapter.tsx
export const useBudgetListAdapter = () => {
  const { budgets, loadBudgets, deleteBudget, activateBudget } = useBudgetAdapter();
  
  useEffect(() => {
    loadBudgets();
  }, []);
  
  return {
    budgets,
    onDelete: deleteBudget,
    onActivate: activateBudget
  };
};
```

## 🔄 Migração da Arquitetura Antiga

### 📚 Legacy Code (app/src/database/budget.ts - 726 linhas)

```typescript
// Arquitetura Antiga
export interface Budget {
  id: string;
  user_id: string;
  name: string;
  start_period: string;
  end_period: string;
  type: 'manual' | 'automatic'; // ❌ Automatic removido
  base_month?: string;
  total_planned_value: number;
  total_actual_value?: number;
  created_at: string;
  updated_at: string;
}

// Clean Architecture
export class Budget {
  private _type: 'manual'; // ✅ Apenas manual
  private _totalPlannedValue: Money; // ✅ Money value object
  // ... outros campos com validações
}
```

### 🔄 Estratégia de Migração

1. **Feature Flags**: Migração gradual por funcionalidade
2. **MigrationWrapper**: Componente de transição
3. **Testes de Regressão**: Garantir funcionalidade
4. **Documentação**: Guias de migração

## 📊 Status da Implementação

### ✅ Concluído
- **Entidades**: Budget, BudgetItem, MonthlyFinanceSummary
- **Value Objects**: Money (com validações)
- **Repositórios**: SQLite implementations
- **Mappers**: DTO ↔ Entity conversion
- **Testes**: 100% green para entidades e repositórios

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
- [Goal System](./goal-system.md) - Sistema de metas
- [Clean Architecture Guide](../clean_architecture/5-step%20of%20understanding) - Guia detalhado 