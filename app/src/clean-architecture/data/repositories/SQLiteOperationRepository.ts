// SQLite Implementation of OperationRepository
// Implements the repository pattern for SQLite database operations

import { IOperationRepository } from '../../domain/repositories/IOperationRepository';
import { Operation } from '../../domain/entities/Operation';
import { OperationMapper } from '../mappers/OperationMapper';
import { OperationDTO } from '../dto/OperationDTO';
import * as SQLite from 'expo-sqlite';

export class SQLiteOperationRepository implements IOperationRepository {
  private db: SQLite.SQLiteDatabase;
  private mapper: OperationMapper;

  constructor() {
    this.db = SQLite.openDatabaseSync('finance.db');
    this.mapper = new OperationMapper();
    this.initializeDatabase();
  }

  private async initializeDatabase(): Promise<void> {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS operations (
        id TEXT PRIMARY KEY,
        nature TEXT NOT NULL,
        state TEXT NOT NULL,
        paymentMethod TEXT NOT NULL,
        sourceAccount TEXT NOT NULL,
        destinationAccount TEXT NOT NULL,
        date TEXT NOT NULL,
        value REAL NOT NULL,
        category TEXT NOT NULL,
        details TEXT,
        project TEXT,
        receipt BLOB,
        createdAt TEXT NOT NULL
      )
    `;
    
    await this.db.execAsync(createTableSQL);
  }

  async save(operation: Operation): Promise<Operation> {
    // Check if operation exists
    const existingOperation = await this.findById(operation.id);
    
    if (existingOperation) {
      // Update existing operation
      const updateSQL = `
        UPDATE operations 
        SET nature = ?, state = ?, paymentMethod = ?, sourceAccount = ?, 
            destinationAccount = ?, date = ?, value = ?, category = ?, 
            details = ?, project = ?, receipt = ?
        WHERE id = ?
      `;
      
      await this.db.runAsync(
        updateSQL,
        [
          operation.nature,
          operation.state,
          operation.paymentMethod,
          operation.sourceAccount,
          operation.destinationAccount,
          operation.date.toISOString(),
          operation.value.value,
          operation.category,
          operation.details || null,
          operation.project || null,
          operation.receipt ? new Uint8Array(await operation.receipt.arrayBuffer()) : null,
          operation.id
        ]
      );
    } else {
      // Insert new operation
      const insertSQL = `
        INSERT INTO operations (
          id, nature, state, paymentMethod, sourceAccount, destinationAccount,
          date, value, category, details, project, receipt, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      await this.db.runAsync(
        insertSQL,
        [
          operation.id,
          operation.nature,
          operation.state,
          operation.paymentMethod,
          operation.sourceAccount,
          operation.destinationAccount,
          operation.date.toISOString(),
          operation.value.value,
          operation.category,
          operation.details || null,
          operation.project || null,
          operation.receipt ? new Uint8Array(await operation.receipt.arrayBuffer()) : null,
          operation.createdAt.toISOString()
        ]
      );
    }

    return operation;
  }

  async findById(id: string): Promise<Operation | null> {
    const sql = 'SELECT * FROM operations WHERE id = ?';
    const result = await this.db.getAllAsync(sql, [id]);
    
    if (result.length === 0) {
      return null;
    }

    return this.mapper.toDomain(result[0] as OperationDTO);
  }

  async findAll(): Promise<Operation[]> {
    const sql = 'SELECT * FROM operations ORDER BY date DESC';
    const rows = await this.db.getAllAsync(sql);
    return this.mapper.toDomainList(rows as OperationDTO[]);
  }

  async delete(id: string): Promise<boolean> {
    const sql = 'DELETE FROM operations WHERE id = ?';
    const result = await this.db.runAsync(sql, [id]);
    return result.changes > 0;
  }

  async findByAccount(accountId: string): Promise<Operation[]> {
    const sql = `
      SELECT * FROM operations 
      WHERE sourceAccount = ? OR destinationAccount = ?
      ORDER BY date DESC
    `;
    const rows = await this.db.getAllAsync(sql, [accountId, accountId]);
    return this.mapper.toDomainList(rows as OperationDTO[]);
  }

  async findByPeriod(startDate: Date, endDate: Date): Promise<Operation[]> {
    const sql = `
      SELECT * FROM operations 
      WHERE date BETWEEN ? AND ?
      ORDER BY date DESC
    `;
    const rows = await this.db.getAllAsync(sql, [
      startDate.toISOString(),
      endDate.toISOString()
    ]);
    return this.mapper.toDomainList(rows as OperationDTO[]);
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Operation[]> {
    return this.findByPeriod(startDate, endDate);
  }

  async findByCategory(category: string): Promise<Operation[]> {
    const sql = `
      SELECT * FROM operations 
      WHERE category = ?
      ORDER BY date DESC
    `;
    const rows = await this.db.getAllAsync(sql, [category]);
    return this.mapper.toDomainList(rows as OperationDTO[]);
  }

  async count(): Promise<number> {
    const sql = 'SELECT COUNT(*) as count FROM operations';
    const result = await this.db.getAllAsync(sql);
    return (result[0] as any)?.count || 0;
  }
} 