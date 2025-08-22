import { Alert, AlertType, AlertSeverity } from '../entities/Alert';

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
