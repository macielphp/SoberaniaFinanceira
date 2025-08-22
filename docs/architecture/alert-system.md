# Sistema de Alertas (Clean Architecture + TDD)

## 🎯 Visão Geral

O sistema de alertas implementa **Clean Architecture** e **TDD** para monitorar contas financeiras e gerar alertas automáticos baseados em regras de negócio específicas. O sistema detecta situações críticas como saldo baixo, saldo negativo e limite de crédito próximo.

## 🏗️ Arquitetura Clean Architecture

### 🎯 Domain Layer

#### **Entidade Principal**

```typescript
// Alert Entity (Domain)
export class Alert {
  private _id: string;
  private _accountId: string;
  private _accountName: string;
  private _type: 'low_balance' | 'negative_balance' | 'credit_limit';
  private _message: string;
  private _severity: 'warning' | 'error';
  private _value: Money;
  private _threshold: Money;
  private _isDismissed: boolean;
  private _createdAt: Date;
  private _dismissedAt?: Date;

  // Métodos de domínio
  dismiss(): Alert
  isActive(): boolean
  isCritical(): boolean
  getFormattedMessage(): string
  getIcon(): string
  getColor(): string
}

// Alert Types
export type AlertType = 'low_balance' | 'negative_balance' | 'credit_limit';
export type AlertSeverity = 'warning' | 'error';
```

#### **Interface de Repositório**

```typescript
// Domain Repository Interface
export interface IAlertRepository {
  save(alert: Alert): Promise<Alert>;
  findById(id: string): Promise<Alert | null>;
  findAll(): Promise<Alert[]>;
  findByAccount(accountId: string): Promise<Alert[]>;
  findByType(type: AlertType): Promise<Alert[]>;
  findBySeverity(severity: AlertSeverity): Promise<Alert[]>;
  findActive(): Promise<Alert[]>;
  findDismissed(): Promise<Alert[]>;
  dismiss(id: string): Promise<Alert>;
  delete(id: string): Promise<boolean>;
  deleteAll(): Promise<void>;
  count(): Promise<number>;
}
```

#### **Serviço de Domínio**

```typescript
// AlertService (Domain Service)
export class AlertService {
  static checkAccountAlerts(
    account: Account, 
    balance: AccountBalance, 
    creditLimit?: Money
  ): Alert[] {
    const alerts: Alert[] = [];

    // Alerta de saldo baixo (menos de R$ 100)
    if (account.type === 'propria' && 
        balance.currentBalance.value < 100 && 
        balance.currentBalance.value > 0) {
      alerts.push(new Alert({
        accountId: account.id,
        accountName: account.name,
        type: 'low_balance',
        message: `Saldo baixo na conta ${account.name}`,
        severity: 'warning',
        value: balance.currentBalance,
        threshold: new Money(100, 'BRL')
      }));
    }

    // Alerta de saldo negativo
    if (account.type === 'propria' && balance.currentBalance.value < 0) {
      alerts.push(new Alert({
        accountId: account.id,
        accountName: account.name,
        type: 'negative_balance',
        message: `Saldo negativo na conta ${account.name}`,
        severity: 'error',
        value: balance.currentBalance,
        threshold: new Money(0, 'BRL')
      }));
    }

    // Alerta de limite de crédito próximo (80% do limite)
    if (creditLimit && account.name.toLowerCase().includes('cartão')) {
      const usedAmount = Math.abs(balance.currentBalance.value);
      const usagePercentage = (usedAmount / creditLimit.value) * 100;
      
      if (usagePercentage >= 80) {
        alerts.push(new Alert({
          accountId: account.id,
          accountName: account.name,
          type: 'credit_limit',
          message: `Limite de crédito próximo do esgotamento (${usagePercentage.toFixed(1)}%)`,
          severity: usagePercentage >= 95 ? 'error' : 'warning',
          value: new Money(usedAmount, 'BRL'),
          threshold: new Money(creditLimit.value * 0.8, 'BRL')
        }));
      }
    }

    return alerts;
  }

  static checkAllAccountAlerts(
    accounts: Account[], 
    balances: AccountBalance[], 
    creditLimits?: { [accountId: string]: Money }
  ): Alert[] {
    const allAlerts: Alert[] = [];

    accounts.forEach(account => {
      const balance = balances.find(b => b.accountId === account.id);
      if (balance) {
        const creditLimit = creditLimits?.[account.id];
        const alerts = this.checkAccountAlerts(account, balance, creditLimit);
        allAlerts.push(...alerts);
      }
    });

    return allAlerts.sort((a, b) => {
      // Priorizar erros sobre warnings
      if (a.severity !== b.severity) {
        return a.severity === 'error' ? -1 : 1;
      }
      // Ordenar por valor (mais crítico primeiro)
      return Math.abs(a.value.value) - Math.abs(b.value.value);
    });
  }

  static hasCriticalAlerts(alerts: Alert[]): boolean {
    return alerts.some(alert => alert.severity === 'error');
  }

  static getAlertsSummary(alerts: Alert[]): {
    total: number;
    warnings: number;
    errors: number;
    criticalAccounts: string[];
  } {
    const warnings = alerts.filter(a => a.severity === 'warning').length;
    const errors = alerts.filter(a => a.severity === 'error').length;
    const criticalAccounts = alerts
      .filter(a => a.severity === 'error')
      .map(a => a.accountName);

    return {
      total: alerts.length,
      warnings,
      errors,
      criticalAccounts
    };
  }
}
```

### 💾 Data Layer

#### **DTO (Data Transfer Object)**

```typescript
// AlertDTO
export interface AlertDTO {
  id: string;
  account_id: string;
  account_name: string;
  type: 'low_balance' | 'negative_balance' | 'credit_limit';
  message: string;
  severity: 'warning' | 'error';
  value: number;
  threshold: number;
  is_dismissed: boolean;
  created_at: string;        // ISO string
  dismissed_at: string | null; // ISO string
}
```

#### **Mapper**

```typescript
// AlertMapper
export class AlertMapper {
  toDomain(dto: AlertDTO): Alert
  toDTO(alert: Alert): AlertDTO
  toDomainList(dtos: AlertDTO[]): Alert[]
}
```

#### **Repositório SQLite**

```typescript
// SQLiteAlertRepository
export class SQLiteAlertRepository implements IAlertRepository {
  private db: SQLite.SQLiteDatabase;
  private mapper: AlertMapper;

  constructor() {
    this.db = SQLite.openDatabaseSync('finance.db');
    this.mapper = new AlertMapper();
    this.initializeDatabase();
  }

  // Implementação de todos os métodos da interface
  async save(alert: Alert): Promise<Alert>
  async findById(id: string): Promise<Alert | null>
  async findByAccount(accountId: string): Promise<Alert[]>
  async findActive(): Promise<Alert[]>
  async dismiss(id: string): Promise<Alert>
  // ... outros métodos
}
```

### 🎨 Presentation Layer

#### **ViewModel**

```typescript
// AlertViewModel
export class AlertViewModel {
  private _alerts: Alert[] = [];
  private _loading: boolean = false;
  private _error: string | null = null;
  private _summary: AlertSummary | null = null;

  // Observables/State
  get alerts(): Alert[]
  get loading(): boolean
  get error(): string | null
  get summary(): AlertSummary | null

  // Actions
  async loadAlerts(): Promise<void>
  async checkAccountAlerts(accountId: string): Promise<Result<Alert[]>>
  async dismissAlert(id: string): Promise<Result<Alert>>
  async dismissAllAlerts(): Promise<Result<void>>
  async getAlertsSummary(): Promise<Result<AlertSummary>>
  async hasCriticalAlerts(): Promise<Result<boolean>>
}
```

#### **UI Adapter**

```typescript
// useAlertAdapter
export const useAlertAdapter = () => {
  const viewModel = useViewModel(AlertViewModel);
  
  return {
    alerts: viewModel.alerts,
    loading: viewModel.loading,
    error: viewModel.error,
    summary: viewModel.summary,
    loadAlerts: viewModel.loadAlerts,
    checkAccountAlerts: viewModel.checkAccountAlerts,
    dismissAlert: viewModel.dismissAlert,
    dismissAllAlerts: viewModel.dismissAllAlerts,
    getAlertsSummary: viewModel.getAlertsSummary,
    hasCriticalAlerts: viewModel.hasCriticalAlerts,
  };
};
```

## 🧪 Estratégia de Testes (TDD)

### 📋 Testes de Entidades (Domain)

```typescript
// Alert.test.ts
describe('Alert', () => {
  it('should create valid alert', () => {
    const alert = new Alert({
      id: 'alert-123',
      accountId: 'account-456',
      accountName: 'Conta Corrente',
      type: 'low_balance',
      message: 'Saldo baixo na conta Conta Corrente',
      severity: 'warning',
      value: new Money(50, 'BRL'),
      threshold: new Money(100, 'BRL')
    });
    
    expect(alert.type).toBe('low_balance');
    expect(alert.severity).toBe('warning');
    expect(alert.isActive()).toBe(true);
  });

  it('should dismiss alert', () => {
    const alert = new Alert({...});
    const dismissed = alert.dismiss();
    
    expect(dismissed.isDismissed).toBe(true);
    expect(dismissed.isActive()).toBe(false);
    expect(dismissed.dismissedAt).toBeDefined();
  });

  it('should identify critical alerts', () => {
    const criticalAlert = new Alert({
      // ... dados válidos
      severity: 'error'
    });
    
    expect(criticalAlert.isCritical()).toBe(true);
  });
});
```

### 📋 Testes de Serviços (Domain)

```typescript
// AlertService.test.ts
describe('AlertService', () => {
  it('should check account alerts for low balance', () => {
    const account = new Account({
      id: 'account-123',
      name: 'Conta Corrente',
      type: 'propria'
    });
    
    const balance = new AccountBalance({
      accountId: 'account-123',
      currentBalance: new Money(50, 'BRL')
    });
    
    const alerts = AlertService.checkAccountAlerts(account, balance);
    
    expect(alerts).toHaveLength(1);
    expect(alerts[0].type).toBe('low_balance');
    expect(alerts[0].severity).toBe('warning');
  });

  it('should check account alerts for negative balance', () => {
    const account = new Account({
      id: 'account-123',
      name: 'Conta Corrente',
      type: 'propria'
    });
    
    const balance = new AccountBalance({
      accountId: 'account-123',
      currentBalance: new Money(-100, 'BRL')
    });
    
    const alerts = AlertService.checkAccountAlerts(account, balance);
    
    expect(alerts).toHaveLength(1);
    expect(alerts[0].type).toBe('negative_balance');
    expect(alerts[0].severity).toBe('error');
  });

  it('should prioritize errors over warnings', () => {
    const alerts = [
      new Alert({ severity: 'warning', value: new Money(100, 'BRL') }),
      new Alert({ severity: 'error', value: new Money(50, 'BRL') })
    ];
    
    const sorted = AlertService.checkAllAccountAlerts([], []);
    expect(sorted[0].severity).toBe('error');
  });
});
```

## 📊 Regras de Negócio (Preservadas)

### 🔔 Tipos de Alertas

1. **Saldo Baixo (Low Balance)**
   - Condição: Saldo < R$ 100
   - Severidade: Warning
   - Aplicável: Contas próprias
   - Mensagem: "Saldo baixo na conta [nome]"

2. **Saldo Negativo (Negative Balance)**
   - Condição: Saldo < 0
   - Severidade: Error
   - Aplicável: Contas próprias
   - Mensagem: "Saldo negativo na conta [nome]"

3. **Limite de Crédito (Credit Limit)**
   - Condição: Uso ≥ 80% do limite
   - Severidade: Warning (80-95%) ou Error (≥95%)
   - Aplicável: Contas de cartão
   - Mensagem: "Limite de crédito próximo do esgotamento (X%)"

### 📈 Priorização de Alertas

- **Erros** têm prioridade sobre **Warnings**
- Ordenação por valor crítico (maior valor primeiro)
- Alertas críticos são destacados na interface

### 🔄 Lifecycle Management

- **Criação**: Automática baseada em regras de negócio
- **Dismiss**: Usuário pode descartar alertas
- **Atualização**: Reavaliação automática quando dados mudam
- **Limpeza**: Alertas antigos são removidos automaticamente

## 🚀 Use Cases (A Implementar)

### 📋 Alert Use Cases

```typescript
// CheckAccountAlertsUseCase
export class CheckAccountAlertsUseCase {
  constructor(
    private alertRepository: IAlertRepository,
    private accountRepository: IAccountRepository
  ) {}
  
  async execute(accountId: string): Promise<Result<Alert[]>> {
    // 1. Buscar conta e saldo
    // 2. Aplicar regras de alerta
    // 3. Salvar alertas gerados
    // 4. Retornar lista de alertas
  }
}

// DismissAlertUseCase
export class DismissAlertUseCase {
  constructor(private alertRepository: IAlertRepository) {}
  
  async execute(alertId: string): Promise<Result<Alert>> {
    // 1. Buscar alerta
    // 2. Marcar como descartado
    // 3. Salvar alteração
    // 4. Retornar alerta atualizado
  }
}

// GetAlertsSummaryUseCase
export class GetAlertsSummaryUseCase {
  constructor(private alertRepository: IAlertRepository) {}
  
  async execute(): Promise<Result<AlertSummary>> {
    // 1. Buscar todos os alertas ativos
    // 2. Calcular resumo
    // 3. Retornar estatísticas
  }
}
```

## 📱 Integração com UI

### 🎨 Pure Components

```typescript
// AlertCard.tsx
export const AlertCard: React.FC<AlertCardProps> = ({
  alert,
  onDismiss,
  onPress
}) => {
  // Componente puro para exibição de alerta
  // Recebe dados e callbacks
  // Renderiza card de alerta com ícone e cor
};

// AlertsPanel.tsx
export const AlertsPanel: React.FC<AlertsPanelProps> = ({
  alerts,
  onDismiss,
  onViewAll
}) => {
  // Componente puro para painel de alertas
  // Recebe lista de alertas
  // Renderiza lista com resumo
};

// AlertBadge.tsx
export const AlertBadge: React.FC<AlertBadgeProps> = ({
  count,
  severity,
  onPress
}) => {
  // Componente puro para badge de alertas
  // Recebe contagem e severidade
  // Renderiza badge com cor apropriada
};
```

### 🔗 UI Adapters

```typescript
// useAlertsPanelAdapter.tsx
export const useAlertsPanelAdapter = () => {
  const { alerts, summary, loadAlerts, dismissAlert } = useAlertAdapter();
  
  useEffect(() => {
    loadAlerts();
  }, []);
  
  return {
    alerts,
    summary,
    onDismiss: dismissAlert
  };
};
```

## 📊 Status da Implementação

### ✅ Concluído
- **Serviço**: AlertService (migrado da arquitetura antiga)
- **Regras de Negócio**: Todas as validações preservadas
- **Lógica**: Priorização e cálculos implementados

### 🚧 Em Andamento
- **Entidade**: Alert (a implementar)
- **Repositório**: SQLite implementation (a implementar)
- **ViewModels**: Implementação TDD (a implementar)
- **UI Adapters**: Implementação TDD (a implementar)

### 📋 Próximos Passos
1. Implementar entidade Alert (TDD)
2. Implementar repositório SQLite (TDD)
3. Implementar ViewModels (TDD)
4. Implementar UI Adapters (TDD)
5. Integrar com HomeScreen

## 📚 Documentação Relacionada

- [System Architecture](./system-architecture.md) - Arquitetura geral
- [Data Model](./data-model.md) - Modelo de dados
- [Database Schema](./database-schema.md) - Esquema do banco
- [Budget System](./budget-system.md) - Sistema de orçamentos
- [Goal System](./goal-system.md) - Sistema de metas
- [Clean Architecture Guide](../clean_architecture/5-step%20of%20understanding) - Guia detalhado
