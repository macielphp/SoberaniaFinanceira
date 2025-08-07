import { EventBus } from '../events/EventBus';
import { Operation } from '../../domain/entities/Operation';
import { Account } from '../../domain/entities/Account';
import { Category } from '../../domain/entities/Category';
import { Goal } from '../../domain/entities/Goal';
import { Money } from '../utils/Money';

// State interface
export interface AppState {
  operations: Operation[];
  accounts: Account[];
  categories: Category[];
  goals: Goal[];
  loading: boolean;
  error: string | null;
  selectedPeriod: string;
  includeVariableIncome: boolean;
}

// Financial summary interface
export interface FinancialSummary {
  totalReceitas: number;
  totalDespesas: number;
  saldoLiquido: number;
  receitasPendentes: number;
  despesasPendentes: number;
  totalOperacoes: number;
  operacoesPendentes: number;
}

export class ApplicationStore {
  private state: AppState = {
    operations: [],
    accounts: [],
    categories: [],
    goals: [],
    loading: false,
    error: null,
    selectedPeriod: 'all',
    includeVariableIncome: false,
  };

  private listeners: Array<(state: AppState) => void> = [];
  private eventBus: EventBus;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
    this.subscribeToEvents();
  }

  // State management
  getState(): AppState {
    return { ...this.state };
  }

  setState(newState: Partial<AppState>): void {
    this.state = { ...this.state, ...newState };
    this.notifyListeners();
  }

  subscribe(listener: (state: AppState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.state));
  }

  // Event handling
  private subscribeToEvents(): void {
    // Operation events
    this.eventBus.subscribe('OperationCreated', (event: any) => {
      const operation = event.data as Operation;
      this.setState({
        operations: [...this.state.operations, operation]
      });
    });

    this.eventBus.subscribe('OperationUpdated', (event: any) => {
      const updatedOperation = event.data as Operation;
      this.setState({
        operations: this.state.operations.map(op => 
          op.id === updatedOperation.id ? updatedOperation : op
        )
      });
    });

    this.eventBus.subscribe('OperationDeleted', (event: any) => {
      const operationId = event.data.operationId as string;
      this.setState({
        operations: this.state.operations.filter(op => op.id !== operationId)
      });
    });

    // Account events
    this.eventBus.subscribe('AccountCreated', (event: any) => {
      const account = event.data as Account;
      this.setState({
        accounts: [...this.state.accounts, account]
      });
    });

    this.eventBus.subscribe('AccountUpdated', (event: any) => {
      const updatedAccount = event.data as Account;
      this.setState({
        accounts: this.state.accounts.map(acc => 
          acc.id === updatedAccount.id ? updatedAccount : acc
        )
      });
    });

    this.eventBus.subscribe('AccountDeleted', (event: any) => {
      const accountId = event.data.accountId as string;
      this.setState({
        accounts: this.state.accounts.filter(acc => acc.id !== accountId)
      });
    });

    // Category events
    this.eventBus.subscribe('CategoryCreated', (event: any) => {
      const category = event.data as Category;
      this.setState({
        categories: [...this.state.categories, category]
      });
    });

    this.eventBus.subscribe('CategoryUpdated', (event: any) => {
      const updatedCategory = event.data as Category;
      this.setState({
        categories: this.state.categories.map(cat => 
          cat.id === updatedCategory.id ? updatedCategory : cat
        )
      });
    });

    this.eventBus.subscribe('CategoryDeleted', (event: any) => {
      const categoryId = event.data.categoryId as string;
      this.setState({
        categories: this.state.categories.filter(cat => cat.id !== categoryId)
      });
    });

    // Goal events
    this.eventBus.subscribe('GoalCreated', (event: any) => {
      const goal = event.data as Goal;
      this.setState({
        goals: [...this.state.goals, goal]
      });
    });

    this.eventBus.subscribe('GoalUpdated', (event: any) => {
      const updatedGoal = event.data as Goal;
      this.setState({
        goals: this.state.goals.map(goal => 
          goal.id === updatedGoal.id ? updatedGoal : goal
        )
      });
    });

    this.eventBus.subscribe('GoalDeleted', (event: any) => {
      const goalId = event.data.goalId as string;
      this.setState({
        goals: this.state.goals.filter(goal => goal.id !== goalId)
      });
    });
  }

  // Computed values
  getFinancialSummary(): FinancialSummary {
    const filteredOperations = this.getFilteredOperations();
    
    // Receitas realizadas (recebidas)
    const totalReceitas = filteredOperations
      .filter(op => op.nature === 'receita' && op.state === 'recebido')
      .reduce((total, op) => total + Math.abs(op.value.value), 0);

    // Despesas realizadas (pagas)
    const totalDespesas = filteredOperations
      .filter(op => op.nature === 'despesa' && op.state === 'pago')
      .reduce((total, op) => total + Math.abs(op.value.value), 0);

    // Saldo líquido
    const saldoLiquido = totalReceitas - totalDespesas;

    // Operações pendentes
    const operacoesPendentes = filteredOperations.filter(op => 
      ['receber', 'pagar', 'transferir'].includes(op.state)
    );

    // Receitas pendentes
    const receitasPendentes = operacoesPendentes
      .filter(op => op.nature === 'receita')
      .reduce((total, op) => total + Math.abs(op.value.value), 0);

    // Despesas pendentes
    const despesasPendentes = operacoesPendentes
      .filter(op => op.nature === 'despesa')
      .reduce((total, op) => total + Math.abs(op.value.value), 0);

    return {
      totalReceitas,
      totalDespesas,
      saldoLiquido,
      receitasPendentes,
      despesasPendentes,
      totalOperacoes: filteredOperations.length,
      operacoesPendentes: operacoesPendentes.length
    };
  }

  getFilteredOperations(): Operation[] {
    if (this.state.selectedPeriod === 'all') {
      return this.state.operations;
    }

    const [year, month] = this.state.selectedPeriod.split('-').map(Number);

    return this.state.operations.filter(operation => {
      const operationDate = new Date(operation.date);
      const operationYear = operationDate.getFullYear();
      const operationMonth = operationDate.getMonth() + 1;
      return operationYear === year && operationMonth === month;
    });
  }

  // Utility methods
  clearError(): void {
    this.setState({ error: null });
  }

  setLoading(loading: boolean): void {
    this.setState({ loading });
  }

  setError(error: string | null): void {
    this.setState({ error });
  }

  setSelectedPeriod(period: string): void {
    this.setState({ selectedPeriod: period });
  }

  setIncludeVariableIncome(include: boolean): void {
    this.setState({ includeVariableIncome: include });
  }

  // Cleanup
  destroy(): void {
    // Unsubscribe from all events
    this.eventBus.unsubscribe('OperationCreated', () => {});
    this.eventBus.unsubscribe('OperationUpdated', () => {});
    this.eventBus.unsubscribe('OperationDeleted', () => {});
    this.eventBus.unsubscribe('AccountCreated', () => {});
    this.eventBus.unsubscribe('AccountUpdated', () => {});
    this.eventBus.unsubscribe('AccountDeleted', () => {});
    this.eventBus.unsubscribe('CategoryCreated', () => {});
    this.eventBus.unsubscribe('CategoryUpdated', () => {});
    this.eventBus.unsubscribe('CategoryDeleted', () => {});
    this.eventBus.unsubscribe('GoalCreated', () => {});
    this.eventBus.unsubscribe('GoalUpdated', () => {});
    this.eventBus.unsubscribe('GoalDeleted', () => {});
    
    // Clear listeners
    this.listeners = [];
  }
}
