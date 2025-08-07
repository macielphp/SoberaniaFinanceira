import { EventBus } from '../events/EventBus';

/**
 * Interface para itens do cache
 */
interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live em milissegundos
}

/**
 * Interface para configuração do cache
 */
interface CacheConfig {
  defaultTTL: number; // TTL padrão em milissegundos
  maxSize: number; // Tamanho máximo do cache
  cleanupInterval: number; // Intervalo de limpeza em milissegundos
}

/**
 * Sistema de Cache Inteligente para otimizar re-renders
 * 
 * Funcionalidades:
 * - Cache com TTL (Time To Live)
 * - Limpeza automática de itens expirados
 * - Invalidação baseada em eventos
 * - Cache hierárquico por domínio
 * - Otimização de memória
 */
export class CacheManager {
  private cache: Map<string, CacheItem<any>> = new Map();
  private config: CacheConfig;
  private eventBus: EventBus;
  private cleanupTimer?: NodeJS.Timeout;

  constructor(eventBus: EventBus, config: Partial<CacheConfig> = {}) {
    this.eventBus = eventBus;
    this.config = {
      defaultTTL: 5 * 60 * 1000, // 5 minutos
      maxSize: 1000,
      cleanupInterval: 60 * 1000, // 1 minuto
      ...config,
    };

    this.setupEventListeners();
    this.startCleanupTimer();
  }

  /**
   * Configura listeners de eventos para invalidação automática
   */
  private setupEventListeners(): void {
    // Eventos que invalidam cache de operações
    const operationEvents = [
      'OperationCreated',
      'OperationUpdated',
      'OperationDeleted',
    ];

    // Eventos que invalidam cache de categorias
    const categoryEvents = [
      'CategoryCreated',
      'CategoryUpdated',
      'CategoryDeleted',
    ];

    // Eventos que invalidam cache de contas
    const accountEvents = [
      'AccountCreated',
      'AccountUpdated',
      'AccountDeleted',
    ];

    // Eventos que invalidam cache de metas
    const goalEvents = [
      'GoalCreated',
      'GoalUpdated',
      'GoalDeleted',
    ];

    // Registrar listeners para todos os eventos
    [...operationEvents, ...categoryEvents, ...accountEvents, ...goalEvents].forEach(eventName => {
      this.eventBus.subscribe(eventName, () => {
        this.invalidateByEvent(eventName);
      });
    });
  }

  /**
   * Inicia o timer de limpeza automática
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  /**
   * Para o timer de limpeza
   */
  public stop(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
  }

  /**
   * Gera uma chave de cache baseada no domínio e parâmetros
   */
  private generateKey(domain: string, params: Record<string, any> = {}): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join('|');
    
    return `${domain}:${sortedParams}`;
  }

  /**
   * Adiciona um item ao cache
   */
  public set<T>(domain: string, params: Record<string, any>, data: T, ttl?: number): void {
    const key = this.generateKey(domain, params);
    const itemTTL = ttl || this.config.defaultTTL;

    // Verificar se o cache está cheio
    if (this.cache.size >= this.config.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: itemTTL,
    });
  }

  /**
   * Obtém um item do cache
   */
  public get<T>(domain: string, params: Record<string, any> = {}): T | null {
    const key = this.generateKey(domain, params);
    const item = this.cache.get(key);

    if (!item) {
      return null;
    }

    // Verificar se o item expirou
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  /**
   * Verifica se um item existe no cache e não expirou
   */
  public has(domain: string, params: Record<string, any> = {}): boolean {
    const key = this.generateKey(domain, params);
    const item = this.cache.get(key);

    if (!item) {
      return false;
    }

    // Verificar se o item expirou
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Remove um item específico do cache
   */
  public delete(domain: string, params: Record<string, any> = {}): boolean {
    const key = this.generateKey(domain, params);
    return this.cache.delete(key);
  }

  /**
   * Remove todos os itens de um domínio
   */
  public invalidateDomain(domain: string): void {
    const keysToDelete: string[] = [];
    
    this.cache.forEach((_, key) => {
      if (key.startsWith(`${domain}:`)) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => {
      this.cache.delete(key);
    });
  }

  /**
   * Remove todos os itens do cache
   */
  public clear(): void {
    this.cache.clear();
  }

  /**
   * Invalida cache baseado em eventos
   */
  private invalidateByEvent(eventName: string): void {
    if (eventName.includes('Operation')) {
      this.invalidateDomain('operations');
      this.invalidateDomain('financial-summary');
    } else if (eventName.includes('Category')) {
      this.invalidateDomain('categories');
      this.invalidateDomain('financial-summary');
    } else if (eventName.includes('Account')) {
      this.invalidateDomain('accounts');
      this.invalidateDomain('financial-summary');
    } else if (eventName.includes('Goal')) {
      this.invalidateDomain('goals');
    }
  }

  /**
   * Remove o item mais antigo do cache
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTimestamp = Date.now();

    this.cache.forEach((item, key) => {
      if (item.timestamp < oldestTimestamp) {
        oldestTimestamp = item.timestamp;
        oldestKey = key;
      }
    });

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Limpa itens expirados do cache
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.cache.forEach((item, key) => {
      if (now - item.timestamp > item.ttl) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => {
      this.cache.delete(key);
    });
  }

  /**
   * Obtém estatísticas do cache
   */
  public getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    missRate: number;
  } {
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      hitRate: 0, // TODO: Implementar tracking de hits/misses
      missRate: 0,
    };
  }

  /**
   * Obtém informações sobre itens do cache
   */
  public getCacheInfo(): Array<{
    key: string;
    domain: string;
    age: number;
    ttl: number;
    expired: boolean;
  }> {
    const now = Date.now();
    const info: Array<{
      key: string;
      domain: string;
      age: number;
      ttl: number;
      expired: boolean;
    }> = [];

    this.cache.forEach((item, key) => {
      const domain = key.split(':')[0];
      const age = now - item.timestamp;
      const expired = age > item.ttl;

      info.push({
        key,
        domain,
        age,
        ttl: item.ttl,
        expired,
      });
    });

    return info.sort((a, b) => b.age - a.age);
  }
}

/**
 * Hook para usar o cache em componentes React
 */
export const useCache = (cacheManager: CacheManager) => {
  return {
    get: <T>(domain: string, params: Record<string, any> = {}): T | null => {
      return cacheManager.get<T>(domain, params);
    },
    set: <T>(domain: string, params: Record<string, any>, data: T, ttl?: number): void => {
      cacheManager.set(domain, params, data, ttl);
    },
    has: (domain: string, params: Record<string, any> = {}): boolean => {
      return cacheManager.has(domain, params);
    },
    delete: (domain: string, params: Record<string, any> = {}): boolean => {
      return cacheManager.delete(domain, params);
    },
    invalidateDomain: (domain: string): void => {
      cacheManager.invalidateDomain(domain);
    },
    clear: (): void => {
      cacheManager.clear();
    },
    getStats: () => cacheManager.getStats(),
    getCacheInfo: () => cacheManager.getCacheInfo(),
  };
};
