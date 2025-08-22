import { Alert, AlertType, AlertSeverity } from '../../domain/entities/Alert';
import { IAlertRepository } from '../../domain/repositories/IAlertRepository';
import { Money } from '../../shared/utils/Money';

export interface AlertData {
  accountId: string;
  accountName: string;
  type: AlertType;
  message: string;
  severity: AlertSeverity;
  value: Money;
  threshold: Money;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class AlertViewModel {
  private _alerts: Alert[] = [];
  private _loading: boolean = false;
  private _error: string | null = null;
  private _repository: IAlertRepository;

  constructor(repository: IAlertRepository) {
    this._repository = repository;
  }

  // Getters
  get alerts(): Alert[] {
    return this._alerts;
  }

  get loading(): boolean {
    return this._loading;
  }

  get error(): string | null {
    return this._error;
  }

  get activeAlerts(): Alert[] {
    return this._alerts.filter(alert => alert.isActive());
  }

  get dismissedAlerts(): Alert[] {
    return this._alerts.filter(alert => alert.isDismissed);
  }

  // State Management
  setLoading(loading: boolean): void {
    this._loading = loading;
  }

  setError(error: string): void {
    this._error = error;
  }

  clearError(): void {
    this._error = null;
  }

  // Alert Management
  async loadAlerts(): Promise<void> {
    try {
      this.setLoading(true);
      this.clearError();
      
      this._alerts = await this._repository.findAll();
    } catch (error) {
      this.setError(error instanceof Error ? error.message : 'Failed to load alerts');
      this._alerts = [];
    } finally {
      this.setLoading(false);
    }
  }

  async loadActiveAlerts(): Promise<void> {
    try {
      this.setLoading(true);
      this.clearError();
      
      const activeAlerts = await this._repository.findActive();
      this._alerts = activeAlerts;
    } catch (error) {
      this.setError(error instanceof Error ? error.message : 'Failed to load active alerts');
      this._alerts = [];
    } finally {
      this.setLoading(false);
    }
  }

  async loadDismissedAlerts(): Promise<void> {
    try {
      this.setLoading(true);
      this.clearError();
      
      const dismissedAlerts = await this._repository.findDismissed();
      this._alerts = dismissedAlerts;
    } catch (error) {
      this.setError(error instanceof Error ? error.message : 'Failed to load dismissed alerts');
      this._alerts = [];
    } finally {
      this.setLoading(false);
    }
  }

  async saveAlert(alert: Alert): Promise<Alert> {
    try {
      this.clearError();
      const savedAlert = await this._repository.save(alert);
      
      // Update local state
      const index = this._alerts.findIndex(a => a.id === savedAlert.id);
      if (index >= 0) {
        this._alerts[index] = savedAlert;
      } else {
        this._alerts.push(savedAlert);
      }
      
      return savedAlert;
    } catch (error) {
      this.setError(error instanceof Error ? error.message : 'Failed to save alert');
      throw error;
    }
  }

  async dismissAlert(id: string): Promise<Alert> {
    try {
      this.clearError();
      const dismissedAlert = await this._repository.dismiss(id);
      
      // Update local state
      const index = this._alerts.findIndex(a => a.id === id);
      if (index >= 0) {
        this._alerts[index] = dismissedAlert;
      }
      
      return dismissedAlert;
    } catch (error) {
      this.setError(error instanceof Error ? error.message : 'Failed to dismiss alert');
      throw error;
    }
  }

  async deleteAlert(id: string): Promise<boolean> {
    try {
      this.clearError();
      const success = await this._repository.delete(id);
      
      if (success) {
        // Remove from local state
        this._alerts = this._alerts.filter(a => a.id !== id);
      }
      
      return success;
    } catch (error) {
      this.setError(error instanceof Error ? error.message : 'Failed to delete alert');
      throw error;
    }
  }

  async findAlertById(id: string): Promise<Alert | null> {
    try {
      this.clearError();
      return await this._repository.findById(id);
    } catch (error) {
      this.setError(error instanceof Error ? error.message : 'Failed to find alert');
      return null;
    }
  }

  async findAlertsByAccount(accountId: string): Promise<Alert[]> {
    try {
      this.clearError();
      return await this._repository.findByAccount(accountId);
    } catch (error) {
      this.setError(error instanceof Error ? error.message : 'Failed to find alerts by account');
      return [];
    }
  }

  async findAlertsByType(type: AlertType): Promise<Alert[]> {
    try {
      this.clearError();
      return await this._repository.findByType(type);
    } catch (error) {
      this.setError(error instanceof Error ? error.message : 'Failed to find alerts by type');
      return [];
    }
  }

  async findAlertsBySeverity(severity: AlertSeverity): Promise<Alert[]> {
    try {
      this.clearError();
      return await this._repository.findBySeverity(severity);
    } catch (error) {
      this.setError(error instanceof Error ? error.message : 'Failed to find alerts by severity');
      return [];
    }
  }

  async getAlertCount(): Promise<number> {
    try {
      this.clearError();
      return await this._repository.count();
    } catch (error) {
      this.setError(error instanceof Error ? error.message : 'Failed to get alert count');
      return 0;
    }
  }

  async clearAllAlerts(): Promise<void> {
    try {
      this.clearError();
      await this._repository.deleteAll();
      this._alerts = [];
    } catch (error) {
      this.setError(error instanceof Error ? error.message : 'Failed to clear all alerts');
      throw error;
    }
  }

  // Computed Properties
  getCriticalAlerts(): Alert[] {
    return this._alerts.filter(alert => alert.isCritical());
  }

  getWarningAlerts(): Alert[] {
    return this._alerts.filter(alert => alert.severity === 'warning');
  }

  getAlertsByAccount(accountId: string): Alert[] {
    return this._alerts.filter(alert => alert.accountId === accountId);
  }

  getAlertsByType(type: AlertType): Alert[] {
    return this._alerts.filter(alert => alert.type === type);
  }

  getAlertsBySeverity(severity: AlertSeverity): Alert[] {
    return this._alerts.filter(alert => alert.severity === severity);
  }

  // State Updates
  updateAlerts(alerts: Alert[]): void {
    this._alerts = alerts;
  }

  addAlert(alert: Alert): void {
    this._alerts.push(alert);
  }

  removeAlert(id: string): void {
    this._alerts = this._alerts.filter(alert => alert.id !== id);
  }

  updateAlert(updatedAlert: Alert): void {
    const index = this._alerts.findIndex(alert => alert.id === updatedAlert.id);
    if (index >= 0) {
      this._alerts[index] = updatedAlert;
    }
  }

  // Validation
  validateAlertData(data: AlertData): ValidationResult {
    const errors: string[] = [];

    if (!data.accountId || data.accountId.trim() === '') {
      errors.push('Account ID is required');
    }

    if (!data.accountName || data.accountName.trim() === '') {
      errors.push('Account name is required');
    }

    if (!data.type || !['low_balance', 'negative_balance', 'credit_limit'].includes(data.type)) {
      errors.push('Valid alert type is required');
    }

    if (!data.message || data.message.trim() === '') {
      errors.push('Alert message is required');
    }

    if (!data.severity || !['warning', 'error'].includes(data.severity)) {
      errors.push('Valid alert severity is required');
    }

    if (!data.value) {
      errors.push('Alert value is required');
    }

    if (!data.threshold) {
      errors.push('Alert threshold is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Utility Methods
  hasActiveAlerts(): boolean {
    return this.activeAlerts.length > 0;
  }

  hasCriticalAlerts(): boolean {
    return this.getCriticalAlerts().length > 0;
  }

  getAlertSummary(): {
    total: number;
    active: number;
    dismissed: number;
    critical: number;
    warnings: number;
  } {
    return {
      total: this._alerts.length,
      active: this.activeAlerts.length,
      dismissed: this.dismissedAlerts.length,
      critical: this.getCriticalAlerts().length,
      warnings: this.getWarningAlerts().length
    };
  }

  // Refresh data
  async refresh(): Promise<void> {
    await this.loadAlerts();
  }
}
