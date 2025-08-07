import { EventBus } from '../events/EventBus';
import { CacheManager } from './CacheManager';

/**
 * Interface para o estado da aplicação
 */
export interface AppState {
  operations: any[];
  categories: any[];
  accounts: any[];
  goals: any[];
  loading: boolean;
  error: string | null;
  lastUpdated: number;
}

/**
 * Interface para resumo financeiro
 */
export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  pendingOperations: number;
  pendingIncome: number;
  pendingExpenses: number;
  liquidBalance: number;
}

/**
 * ApplicationStore com Cache Inteligente
 * 
 * Funcionalidades:
 * - Gerenciamento de estado global
 * - Cache inteligente para otimizar re-renders
 * - Integração com EventBus
 * - Sistema de listeners para atualizações
 */
export class ApplicationStore {
  private state: AppState = {
    operations: [],
    categories: [],
    accounts: [],
    goals: [],
    loading: false,
    error: null,
    lastUpdated: Date.now(),
  };

  private listeners: Array<(state: AppState) => void> = [];
  private eventBus: EventBus;
  private cacheManager: CacheManager;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
    this.cacheManager = new CacheManager(eventBus, {
      defaultTTL: 2 * 60 * 1000, // 2 minutos para dados da aplicação
      maxSize: 500,
      cleanupInterval: 30 * 1000, // 30 segundos
    });

    this.setupEventListeners();
  }

  /**
   * Configura listeners de eventos para atualizações automáticas
   */
  private setupEventListeners(): void {
    // Eventos de operações
    this.eventBus.subscribe('OperationCreated', (operation: any) => {
      this.addOperation(operation);
    });

    this.eventBus.subscribe('OperationUpdated', (operation: any) => {
      this.updateOperation(operation);
    });

    this.eventBus.subscribe('OperationDeleted', (operationId: string) => {
      this.removeOperation(operationId);
    });

    // Eventos de categorias
    this.eventBus.subscribe('CategoryCreated', (category: any) => {
      this.addCategory(category);
    });

    this.eventBus.subscribe('CategoryUpdated', (category: any) => {
      this.updateCategory(category);
    });

    this.eventBus.subscribe('CategoryDeleted', (categoryId: string) => {
      this.removeCategory(categoryId);
    });

    // Eventos de contas
    this.eventBus.subscribe('AccountCreated', (account: any) => {
      this.addAccount(account);
    });

    this.eventBus.subscribe('AccountUpdated', (account: any) => {
      this.updateAccount(account);
    });

    this.eventBus.subscribe('AccountDeleted', (accountId: string) => {
      this.removeAccount(accountId);
    });

    // Eventos de metas
    this.eventBus.subscribe('GoalCreated', (goal: any) => {
      this.addGoal(goal);
    });

    this.eventBus.subscribe('GoalUpdated', (goal: any) => {
      this.updateGoal(goal);
    });

    this.eventBus.subscribe('GoalDeleted', (goalId: string) => {
      this.removeGoal(goalId);
    });
  }

  /**
   * Obtém o estado atual da aplicação
   */
  public getState(): AppState {
    return { ...this.state };
  }

  /**
   * Atualiza o estado da aplicação
   */
  public setState(newState: Partial<AppState>): void {
    this.state = { ...this.state, ...newState };
    this.notifyListeners();
  }

  /**
   * Inscreve um listener para mudanças de estado
   */
  public subscribe(listener: (state: AppState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Notifica todos os listeners sobre mudanças de estado
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.state));
  }

  /**
   * Adiciona uma operação ao estado
   */
  private addOperation(operation: any): void {
    this.state.operations.push(operation);
    this.state.lastUpdated = Date.now();
    this.notifyListeners();
  }

  /**
   * Atualiza uma operação no estado
   */
  private updateOperation(operation: any): void {
    const index = this.state.operations.findIndex(op => op.id === operation.id);
    if (index !== -1) {
      this.state.operations[index] = operation;
      this.state.lastUpdated = Date.now();
      this.notifyListeners();
    }
  }

  /**
   * Remove uma operação do estado
   */
  private removeOperation(operationId: string): void {
    this.state.operations = this.state.operations.filter(op => op.id !== operationId);
    this.state.lastUpdated = Date.now();
    this.notifyListeners();
  }

  /**
   * Adiciona uma categoria ao estado
   */
  private addCategory(category: any): void {
    this.state.categories.push(category);
    this.state.lastUpdated = Date.now();
    this.notifyListeners();
  }

  /**
   * Atualiza uma categoria no estado
   */
  private updateCategory(category: any): void {
    const index = this.state.categories.findIndex(cat => cat.id === category.id);
    if (index !== -1) {
      this.state.categories[index] = category;
      this.state.lastUpdated = Date.now();
      this.notifyListeners();
    }
  }

  /**
   * Remove uma categoria do estado
   */
  private removeCategory(categoryId: string): void {
    this.state.categories = this.state.categories.filter(cat => cat.id !== categoryId);
    this.state.lastUpdated = Date.now();
    this.notifyListeners();
  }

  /**
   * Adiciona uma conta ao estado
   */
  private addAccount(account: any): void {
    this.state.accounts.push(account);
    this.state.lastUpdated = Date.now();
    this.notifyListeners();
  }

  /**
   * Atualiza uma conta no estado
   */
  private updateAccount(account: any): void {
    const index = this.state.accounts.findIndex(acc => acc.id === account.id);
    if (index !== -1) {
      this.state.accounts[index] = account;
      this.state.lastUpdated = Date.now();
      this.notifyListeners();
    }
  }

  /**
   * Remove uma conta do estado
   */
  private removeAccount(accountId: string): void {
    this.state.accounts = this.state.accounts.filter(acc => acc.id !== accountId);
    this.state.lastUpdated = Date.now();
    this.notifyListeners();
  }

  /**
   * Adiciona uma meta ao estado
   */
  private addGoal(goal: any): void {
    this.state.goals.push(goal);
    this.state.lastUpdated = Date.now();
    this.notifyListeners();
  }

  /**
   * Atualiza uma meta no estado
   */
  private updateGoal(goal: any): void {
    const index = this.state.goals.findIndex(g => g.id === goal.id);
    if (index !== -1) {
      this.state.goals[index] = goal;
      this.state.lastUpdated = Date.now();
      this.notifyListeners();
    }
  }

  /**
   * Remove uma meta do estado
   */
  private removeGoal(goalId: string): void {
    this.state.goals = this.state.goals.filter(g => g.id !== goalId);
    this.state.lastUpdated = Date.now();
    this.notifyListeners();
  }

  /**
   * Define o estado de loading
   */
  public setLoading(loading: boolean): void {
    this.state.loading = loading;
    this.notifyListeners();
  }

  /**
   * Define o erro atual
   */
  public setError(error: string | null): void {
    this.state.error = error;
    this.notifyListeners();
  }

  /**
   * Limpa o erro atual
   */
  public clearError(): void {
    this.state.error = null;
    this.notifyListeners();
  }

  /**
   * Obtém o gerenciador de cache
   */
  public getCacheManager(): CacheManager {
    return this.cacheManager;
  }

  /**
   * Obtém dados do cache
   */
  public getCachedData<T>(domain: string, params: Record<string, any> = {}): T | null {
    return this.cacheManager.get(domain, params);
  }

  /**
   * Define dados no cache
   */
  public setCachedData<T>(domain: string, params: Record<string, any>, data: T, ttl?: number): void {
    this.cacheManager.set(domain, params, data, ttl);
  }

  /**
   * Verifica se dados existem no cache
   */
  public hasCachedData(domain: string, params: Record<string, any> = {}): boolean {
    return this.cacheManager.has(domain, params);
  }

  /**
   * Invalida cache por domínio
   */
  public invalidateCache(domain: string): void {
    this.cacheManager.invalidateDomain(domain);
  }

  /**
   * Obtém estatísticas do cache
   */
  public getCacheStats() {
    return this.cacheManager.getStats();
  }

  /**
   * Limpa todo o cache
   */
  public clearCache(): void {
    this.cacheManager.clear();
  }

  /**
   * Para o store e limpa listeners
   */
  public stop(): void {
    this.listeners = [];
    this.cacheManager.stop();
  }

  /**
   * Obtém resumo financeiro (método de compatibilidade)
   */
  public getFinancialSummary(): FinancialSummary {
    const operations = this.state.operations;
    const totalIncome = operations
      .filter(op => op.nature === 'receita')
      .reduce((sum, op) => sum + (op.value || 0), 0);
    
    const totalExpenses = operations
      .filter(op => op.nature === 'despesa')
      .reduce((sum, op) => sum + (op.value || 0), 0);

    const pendingOperations = operations.filter(op => op.state === 'pendente').length;
    const pendingIncome = operations
      .filter(op => op.nature === 'receita' && op.state === 'pendente')
      .reduce((sum, op) => sum + (op.value || 0), 0);
    const pendingExpenses = operations
      .filter(op => op.nature === 'despesa' && op.state === 'pendente')
      .reduce((sum, op) => sum + (op.value || 0), 0);

    return {
      totalIncome,
      totalExpenses,
      netBalance: totalIncome - totalExpenses,
      pendingOperations,
      pendingIncome,
      pendingExpenses,
      liquidBalance: (totalIncome - pendingIncome) - (totalExpenses - pendingExpenses),
    };
  }

  /**
   * Obtém operações filtradas (método de compatibilidade)
   */
  public getFilteredOperations(): any[] {
    return this.state.operations;
  }

  /**
   * Define período selecionado (método de compatibilidade)
   */
  public setSelectedPeriod(period: string): void {
    // Implementação futura
  }

  /**
   * Define inclusão de receita variável (método de compatibilidade)
   */
  public setIncludeVariableIncome(include: boolean): void {
    // Implementação futura
  }

  /**
   * Destrói o store (método de compatibilidade)
   */
  public destroy(): void {
    this.stop();
  }
}
