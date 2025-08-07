/**
 * State Management Core - Implementação
 * 
 * Este arquivo implementa o sistema core de State Management
 * seguindo Clean Architecture e TDD.
 */

import { EventBus } from '../events/EventBus';
import { CacheManager } from './CacheManager';

/**
 * Interface para o estado da aplicação
 */
export interface ApplicationState {
  operations: any[];
  accounts: any[];
  categories: any[];
  goals: any[];
  loading: boolean;
  error: string | null;
  lastUpdated: number;
}

/**
 * Interface para estatísticas do cache
 */
export interface CacheStats {
  size: number;
  hits: number;
  misses: number;
}

/**
 * ApplicationStore - Gerenciador de Estado Principal
 * 
 * Responsabilidades:
 * - Gerenciar estado global da aplicação
 * - Notificar listeners sobre mudanças
 * - Integrar com EventBus e CacheManager
 * - Fornecer interface para UI Adapters
 */
export class ApplicationStore {
  private state: ApplicationState = {
    operations: [],
    accounts: [],
    categories: [],
    goals: [],
    loading: false,
    error: null,
    lastUpdated: Date.now(),
  };
  private listeners: Function[] = [];
  private eventBus: EventBus;
  private cacheManager: CacheManager;

  constructor(eventBus: EventBus, cacheManager: CacheManager) {
    this.eventBus = eventBus;
    this.cacheManager = cacheManager;
  }

  /**
   * Obtém o estado atual da aplicação
   */
  getState(): ApplicationState {
    return { ...this.state };
  }

  /**
   * Atualiza o estado da aplicação
   */
  setState(newState: Partial<ApplicationState>): void {
    this.state = { ...this.state, ...newState };
    this.notifyListeners();
  }

  /**
   * Inscreve um listener para mudanças de estado
   */
  subscribe(listener: Function): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Define o estado de loading
   */
  setLoading(loading: boolean): void {
    this.setState({ loading });
  }

  /**
   * Define o erro atual
   */
  setError(error: string | null): void {
    this.setState({ error });
  }

  /**
   * Limpa o erro atual
   */
  clearError(): void {
    this.setState({ error: null });
  }

  /**
   * Define dados no cache
   */
  setCachedData(domain: string, params: any, data: any): void {
    this.cacheManager.set(domain, params, data);
  }

  /**
   * Obtém dados do cache
   */
  getCachedData(domain: string, params: any): any {
    return this.cacheManager.get(domain, params);
  }

  /**
   * Verifica se dados existem no cache
   */
  hasCachedData(domain: string, params: any): boolean {
    return this.cacheManager.has(domain, params);
  }

  /**
   * Invalida cache por domínio
   */
  invalidateCache(domain: string): void {
    // Implementação futura
  }

  /**
   * Obtém estatísticas do cache
   */
  getCacheStats(): CacheStats {
    return { size: 0, hits: 0, misses: 0 };
  }

  /**
   * Limpa todo o cache
   */
  clearCache(): void {
    this.cacheManager.clear();
  }

  /**
   * Para o store e limpa listeners
   */
  stop(): void {
    this.listeners = [];
  }

  /**
   * Notifica todos os listeners sobre mudanças de estado
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.state));
  }
}

/**
 * Factory para criar ApplicationStore
 */
export class ApplicationStoreFactory {
  static create(eventBus: EventBus, cacheManager: CacheManager): ApplicationStore {
    return new ApplicationStore(eventBus, cacheManager);
  }
}
