import { useState, useCallback, useEffect } from 'react';
import { AlertViewModel } from '../view-models/AlertViewModel';
import { Alert } from '../../domain/entities/Alert';
import { SQLiteAlertRepository } from '../../data/repositories/SQLiteAlertRepository';

export const useAlertViewModelAdapter = () => {
  const [viewModel] = useState(() => {
    const repository = new SQLiteAlertRepository();
    return new AlertViewModel(repository);
  });

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Local state to trigger re-renders
  const [, setUpdateCounter] = useState(0);
  const forceUpdate = useCallback(() => setUpdateCounter(prev => prev + 1), []);

  // Load alerts on mount
  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await viewModel.loadAlerts();
      setAlerts(viewModel.alerts);
      forceUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load alerts');
    } finally {
      setLoading(false);
    }
  }, [viewModel, forceUpdate]);

  const loadActiveAlerts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await viewModel.loadActiveAlerts();
      setAlerts(viewModel.activeAlerts);
      forceUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load active alerts');
    } finally {
      setLoading(false);
    }
  }, [viewModel, forceUpdate]);

  const saveAlert = useCallback(async (alert: Alert) => {
    try {
      setError(null);
      const savedAlert = await viewModel.saveAlert(alert);
      setAlerts(viewModel.alerts);
      forceUpdate();
      return savedAlert;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save alert');
      throw err;
    }
  }, [viewModel, forceUpdate]);

  const dismissAlert = useCallback(async (alertId: string) => {
    try {
      setError(null);
      const dismissedAlert = await viewModel.dismissAlert(alertId);
      setAlerts(viewModel.alerts);
      forceUpdate();
      return dismissedAlert;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to dismiss alert');
      throw err;
    }
  }, [viewModel, forceUpdate]);

  const deleteAlert = useCallback(async (alertId: string) => {
    try {
      setError(null);
      const success = await viewModel.deleteAlert(alertId);
      if (success) {
        setAlerts(viewModel.alerts);
        forceUpdate();
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete alert');
      throw err;
    }
  }, [viewModel, forceUpdate]);

  const findAlertById = useCallback(async (alertId: string) => {
    try {
      setError(null);
      return await viewModel.findAlertById(alertId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to find alert');
      return null;
    }
  }, [viewModel]);

  const findAlertsByAccount = useCallback(async (accountId: string) => {
    try {
      setError(null);
      return await viewModel.findAlertsByAccount(accountId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to find alerts by account');
      return [];
    }
  }, [viewModel]);

  const findAlertsByType = useCallback(async (type: 'low_balance' | 'negative_balance' | 'credit_limit') => {
    try {
      setError(null);
      return await viewModel.findAlertsByType(type);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to find alerts by type');
      return [];
    }
  }, [viewModel]);

  const findAlertsBySeverity = useCallback(async (severity: 'warning' | 'error') => {
    try {
      setError(null);
      return await viewModel.findAlertsBySeverity(severity);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to find alerts by severity');
      return [];
    }
  }, [viewModel]);

  const getAlertCount = useCallback(async () => {
    try {
      setError(null);
      return await viewModel.getAlertCount();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get alert count');
      return 0;
    }
  }, [viewModel]);

  const clearAllAlerts = useCallback(async () => {
    try {
      setError(null);
      await viewModel.clearAllAlerts();
      setAlerts([]);
      forceUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear all alerts');
      throw err;
    }
  }, [viewModel, forceUpdate]);

  const refresh = useCallback(async () => {
    await loadAlerts();
  }, [loadAlerts]);

  const setCustomError = useCallback((errorMessage: string) => {
    setError(errorMessage);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Computed properties
  const activeAlerts = alerts.filter(alert => alert.isActive());
  const dismissedAlerts = alerts.filter(alert => alert.isDismissed);
  const criticalAlerts = alerts.filter(alert => alert.isCritical());
  const warningAlerts = alerts.filter(alert => alert.severity === 'warning');

  const getAlertsByAccount = useCallback((accountId: string) => {
    return alerts.filter(alert => alert.accountId === accountId);
  }, [alerts]);

  const getAlertsByType = useCallback((type: 'low_balance' | 'negative_balance' | 'credit_limit') => {
    return alerts.filter(alert => alert.type === type);
  }, [alerts]);

  const getAlertsBySeverity = useCallback((severity: 'warning' | 'error') => {
    return alerts.filter(alert => alert.severity === severity);
  }, [alerts]);

  const hasActiveAlerts = activeAlerts.length > 0;
  const hasCriticalAlerts = criticalAlerts.length > 0;

  const getAlertSummary = () => ({
    total: alerts.length,
    active: activeAlerts.length,
    dismissed: dismissedAlerts.length,
    critical: criticalAlerts.length,
    warnings: warningAlerts.length
  });

  return {
    // State
    alerts,
    loading,
    error,
    
    // Actions
    loadAlerts,
    loadActiveAlerts,
    saveAlert,
    dismissAlert,
    deleteAlert,
    findAlertById,
    findAlertsByAccount,
    findAlertsByType,
    findAlertsBySeverity,
    getAlertCount,
    clearAllAlerts,
    refresh,
    setCustomError,
    clearError,
    
    // Computed properties
    activeAlerts,
    dismissedAlerts,
    criticalAlerts,
    warningAlerts,
    getAlertsByAccount,
    getAlertsByType,
    getAlertsBySeverity,
    hasActiveAlerts,
    hasCriticalAlerts,
    getAlertSummary
  };
};
