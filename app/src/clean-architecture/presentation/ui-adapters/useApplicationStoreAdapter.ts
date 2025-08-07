import { useCallback, useEffect, useState } from 'react';
import { ApplicationStore, AppState, FinancialSummary } from '../../shared/state/ApplicationStore';
import { container } from '../../shared/di/Container';

interface UseApplicationStoreAdapterReturn {
  // Estado
  operations: AppState['operations'];
  categories: AppState['categories'];
  accounts: AppState['accounts'];
  goals: AppState['goals'];
  loading: AppState['loading'];
  error: AppState['error'];
  lastUpdated: AppState['lastUpdated'];
  
  // Ações
  setState: (newState: Partial<AppState>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Cache
  getCacheManager: () => any;
  getCachedData: <T>(domain: string, params?: Record<string, any>) => T | null;
  setCachedData: <T>(domain: string, params: Record<string, any>, data: T, ttl?: number) => void;
  hasCachedData: (domain: string, params?: Record<string, any>) => boolean;
  invalidateCache: (domain: string) => void;
  getCacheStats: () => any;
  clearCache: () => void;
  
  // Resumo financeiro
  getFinancialSummary: () => FinancialSummary;
  getFilteredOperations: () => any[];
}

export function useApplicationStoreAdapter(): UseApplicationStoreAdapterReturn {
  const [state, setState] = useState<AppState>({
    operations: [],
    categories: [],
    accounts: [],
    goals: [],
    loading: false,
    error: null,
    lastUpdated: Date.now(),
  });

  const store = container.resolve<ApplicationStore>('ApplicationStore');

  useEffect(() => {
    const unsubscribe = store.subscribe((newState: AppState) => {
      setState(newState);
    });

    return unsubscribe;
  }, [store]);

  const setStateHandler = useCallback((newState: Partial<AppState>) => {
    store.setState(newState);
  }, [store]);

  const setLoadingHandler = useCallback((loading: boolean) => {
    store.setLoading(loading);
  }, [store]);

  const setErrorHandler = useCallback((error: string | null) => {
    store.setError(error);
  }, [store]);

  const clearErrorHandler = useCallback(() => {
    store.clearError();
  }, [store]);

  const getCacheManager = useCallback(() => {
    return store.getCacheManager();
  }, [store]);

  const getCachedData = useCallback(<T>(domain: string, params: Record<string, any> = {}): T | null => {
    return store.getCachedData<T>(domain, params);
  }, [store]);

  const setCachedData = useCallback(<T>(domain: string, params: Record<string, any>, data: T, ttl?: number) => {
    store.setCachedData(domain, params, data, ttl);
  }, [store]);

  const hasCachedData = useCallback((domain: string, params: Record<string, any> = {}): boolean => {
    return store.hasCachedData(domain, params);
  }, [store]);

  const invalidateCache = useCallback((domain: string) => {
    store.invalidateCache(domain);
  }, [store]);

  const getCacheStats = useCallback(() => {
    return store.getCacheStats();
  }, [store]);

  const clearCache = useCallback(() => {
    store.clearCache();
  }, [store]);

  const getFinancialSummary = useCallback((): FinancialSummary => {
    return store.getFinancialSummary();
  }, [store]);

  const getFilteredOperations = useCallback((): any[] => {
    return store.getFilteredOperations();
  }, [store]);

  return {
    // Estado
    operations: state.operations,
    categories: state.categories,
    accounts: state.accounts,
    goals: state.goals,
    loading: state.loading,
    error: state.error,
    lastUpdated: state.lastUpdated,
    
    // Ações
    setState: setStateHandler,
    setLoading: setLoadingHandler,
    setError: setErrorHandler,
    clearError: clearErrorHandler,
    
    // Cache
    getCacheManager,
    getCachedData,
    setCachedData,
    hasCachedData,
    invalidateCache,
    getCacheStats,
    clearCache,
    
    // Resumo financeiro
    getFinancialSummary,
    getFilteredOperations,
  };
}
