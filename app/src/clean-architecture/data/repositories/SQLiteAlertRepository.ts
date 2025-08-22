import * as SQLite from 'expo-sqlite';
import { IAlertRepository } from '../../domain/repositories/IAlertRepository';
import { Alert, AlertType, AlertSeverity } from '../../domain/entities/Alert';
import { AlertMapper } from '../mappers/AlertMapper';
import { AlertDTO } from '../dto/AlertDTO';

export class SQLiteAlertRepository implements IAlertRepository {
  private db: SQLite.SQLiteDatabase;
  private mapper: typeof AlertMapper;

  constructor() {
    this.db = SQLite.openDatabaseSync('finance.db');
    this.mapper = AlertMapper;
    this.initializeDatabase(); // Sync call for constructor
  }

  private async initializeDatabase(): Promise<void> {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS alerts (
        id TEXT PRIMARY KEY,
        account_id TEXT NOT NULL,
        account_name TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('low_balance', 'negative_balance', 'credit_limit')),
        message TEXT NOT NULL,
        severity TEXT NOT NULL CHECK(severity IN ('warning', 'error')),
        value REAL NOT NULL,
        threshold REAL NOT NULL,
        is_dismissed INTEGER NOT NULL DEFAULT 0 CHECK(is_dismissed IN (0, 1)),
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        dismissed_at TEXT DEFAULT NULL
      );
    `;

    await this.db.execAsync(createTableSQL);
  }

  async save(alert: Alert): Promise<Alert> {
    const dto = this.mapper.toDTO(alert);
    
    const saveSQL = `
      INSERT OR REPLACE INTO alerts (
        id, account_id, account_name, type, message, severity,
        value, threshold, is_dismissed, created_at, dismissed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await this.db.runAsync(saveSQL, [
      dto.id,
      dto.account_id,
      dto.account_name,
      dto.type,
      dto.message,
      dto.severity,
      dto.value,
      dto.threshold,
      dto.is_dismissed,
      dto.created_at,
      dto.dismissed_at
    ]);

    return alert;
  }

  async findById(id: string): Promise<Alert | null> {
    const findSQL = `SELECT * FROM alerts WHERE id = ?`;
    const result = await this.db.getFirstAsync(findSQL, [id]) as AlertDTO | null;
    
    if (!result) {
      return null;
    }

    return this.mapper.toDomain(result);
  }

  async findAll(): Promise<Alert[]> {
    const findAllSQL = `SELECT * FROM alerts ORDER BY created_at DESC`;
    const results = await this.db.getAllAsync(findAllSQL) as AlertDTO[];
    
    return this.mapper.toDomainList(results);
  }

  async findByAccount(accountId: string): Promise<Alert[]> {
    const findByAccountSQL = `SELECT * FROM alerts WHERE account_id = ? ORDER BY created_at DESC`;
    const results = await this.db.getAllAsync(findByAccountSQL, [accountId]) as AlertDTO[];
    
    return this.mapper.toDomainList(results);
  }

  async findByType(type: AlertType): Promise<Alert[]> {
    const findByTypeSQL = `SELECT * FROM alerts WHERE type = ? ORDER BY created_at DESC`;
    const results = await this.db.getAllAsync(findByTypeSQL, [type]) as AlertDTO[];
    
    return this.mapper.toDomainList(results);
  }

  async findBySeverity(severity: AlertSeverity): Promise<Alert[]> {
    const findBySeveritySQL = `SELECT * FROM alerts WHERE severity = ? ORDER BY created_at DESC`;
    const results = await this.db.getAllAsync(findBySeveritySQL, [severity]) as AlertDTO[];
    
    return this.mapper.toDomainList(results);
  }

  async findActive(): Promise<Alert[]> {
    const findActiveSQL = `SELECT * FROM alerts WHERE is_dismissed = 0 ORDER BY created_at DESC`;
    const results = await this.db.getAllAsync(findActiveSQL) as AlertDTO[];
    
    return this.mapper.toDomainList(results);
  }

  async findDismissed(): Promise<Alert[]> {
    const findDismissedSQL = `SELECT * FROM alerts WHERE is_dismissed = 1 ORDER BY created_at DESC`;
    const results = await this.db.getAllAsync(findDismissedSQL) as AlertDTO[];
    
    return this.mapper.toDomainList(results);
  }

  async dismiss(id: string): Promise<Alert> {
    // First, find the alert
    const alert = await this.findById(id);
    if (!alert) {
      throw new Error(`Alert with id ${id} not found`);
    }

    // Dismiss the alert
    const dismissedAlert = alert.dismiss();
    
    // Update in database
    const updateSQL = `
      UPDATE alerts 
      SET is_dismissed = 1, dismissed_at = ? 
      WHERE id = ?
    `;
    
    await this.db.runAsync(updateSQL, [
      dismissedAlert.dismissedAt!.toISOString(),
      id
    ]);

    return dismissedAlert;
  }

  async delete(id: string): Promise<boolean> {
    const deleteSQL = `DELETE FROM alerts WHERE id = ?`;
    const result = await this.db.runAsync(deleteSQL, [id]);
    
    return result.changes > 0;
  }

  async deleteAll(): Promise<void> {
    const deleteAllSQL = `DELETE FROM alerts`;
    await this.db.runAsync(deleteAllSQL);
  }

  async count(): Promise<number> {
    const countSQL = `SELECT COUNT(*) as count FROM alerts`;
    const result = await this.db.getAllAsync(countSQL);
    return (result[0] as any)?.count || 0;
  }
}
