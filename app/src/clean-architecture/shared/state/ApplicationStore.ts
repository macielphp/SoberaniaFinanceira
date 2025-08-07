import { EventBus } from '../events/EventBus';
import { CacheManager } from './CacheManager';

/**
 * Interface para o estado da aplicação
 */
interface AppState {
  operations: any[];
  categories: any[];
  accounts: any[];
  goals: any[];
  loading: boolean;
  error: string | null;
  lastUpdated: number;
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
   * Obtém o estado atual
   */
  public getState(): AppState {
    return { ...this.state };
  }

  /**
   * Atualiza o estado
   */
  public setState(newState: Partial<AppState>): void {
    this.state = { ...this.state, ...newState, lastUpdated: Date.now() };
    this.notifyListeners();
  }

  /**
   * Adiciona um listener para mudanças de estado
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
   * Notifica todos os listeners
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.state));
  }

  // === OPERAÇÕES ===

  /**
   * Adiciona uma operação ao estado
   */
  private addOperation(operation: any): void {
    const operations = [...this.state.operations, operation];
    this.setState({ operations });
    this.cacheManager.invalidateDomain('operations');
    this.cacheManager.invalidateDomain('financial-summary');
  }

  /**
   * Atualiza uma operação no estado
   */
  private updateOperation(operation: any): void {
    const operations = this.state.operations.map(op => 
      op.id === operation.id ? operation : op
    );
    this.setState({ operations });
    this.cacheManager.invalidateDomain('operations');
    this.cacheManager.invalidateDomain('financial-summary');
  }

  /**
   * Remove uma operação do estado
   */
  private removeOperation(operationId: string): void {
    const operations = this.state.operations.filter(op => op.id !== operationId);
    this.setState({ operations });
    this.cacheManager.invalidateDomain('operations');
    this.cacheManager.invalidateDomain('financial-summary');
  }

  // === CATEGORIAS ===

  /**
   * Adiciona uma categoria ao estado
   */
  private addCategory(category: any): void {
    const categories = [...this.state.categories, category];
    this.setState({ categories });
    this.cacheManager.invalidateDomain('categories');
  }

  /**
   * Atualiza uma categoria no estado
   */
  private updateCategory(category: any): void {
    const categories = this.state.categories.map(cat => 
      cat.id === category.id ? category : cat
    );
    this.setState({ categories });
    this.cacheManager.invalidateDomain('categories');
  }

  /**
   * Remove uma categoria do estado
   */
  private removeCategory(categoryId: string): void {
    const categories = this.state.categories.filter(cat => cat.id !== categoryId);
    this.setState({ categories });
    this.cacheManager.invalidateDomain('categories');
  }

  // === CONTAS ===

  /**
   * Adiciona uma conta ao estado
   */
  private addAccount(account: any): void {
    const accounts = [...this.state.accounts, account];
    this.setState({ accounts });
    this.cacheManager.invalidateDomain('accounts');
  }

  /**
   * Atualiza uma conta no estado
   */
  private updateAccount(account: any): void {
    const accounts = this.state.accounts.map(acc => 
      acc.id === account.id ? account : acc
    );
    this.setState({ accounts });
    this.cacheManager.invalidateDomain('accounts');
  }

  /**
   * Remove uma conta do estado
   */
  private removeAccount(accountId: string): void {
    const accounts = this.state.accounts.filter(acc => acc.id !== accountId);
    this.setState({ accounts });
    this.cacheManager.invalidateDomain('accounts');
  }

  // === METAS ===

  /**
   * Adiciona uma meta ao estado
   */
  private addGoal(goal: any): void {
    const goals = [...this.state.goals, goal];
    this.setState({ goals });
    this.cacheManager.invalidateDomain('goals');
  }

  /**
   * Atualiza uma meta no estado
   */
  private updateGoal(goal: any): void {
    const goals = this.state.goals.map(g => 
      g.id === goal.id ? goal : g
    );
    this.setState({ goals });
    this.cacheManager.invalidateDomain('goals');
  }

  /**
   * Remove uma meta do estado
   */
  private removeGoal(goalId: string): void {
    const goals = this.state.goals.filter(g => g.id !== goalId);
    this.setState({ goals });
    this.cacheManager.invalidateDomain('goals');
  }

  // === ESTADOS DE LOADING E ERRO ===

  /**
   * Define o estado de loading
   */
  public setLoading(loading: boolean): void {
    this.setState({ loading });
  }

  /**
   * Define o erro
   */
  public setError(error: string | null): void {
    this.setState({ error });
  }

  /**
   * Limpa o erro
   */
  public clearError(): void {
    this.setState({ error: null });
  }

  // === CACHE ===

  /**
   * Obtém o cache manager
   */
  public getCacheManager(): CacheManager {
    return this.cacheManager;
  }

  /**
   * Obtém dados do cache
   */
  public getCachedData<T>(domain: string, params: Record<string, any> = {}): T | null {
    return this.cacheManager.get<T>(domain, params);
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
   * Invalida cache de um domínio
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
   * Para o cache manager (para cleanup)
   */
  public stop(): void {
    this.cacheManager.stop();
  }
}
