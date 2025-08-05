// SQLite Implementation of IAccountRepository
// Implements the repository pattern for Account entity using SQLite

import * as SQLite from 'expo-sqlite';
import { IAccountRepository } from '../../domain/repositories/IAccountRepository';
import { Account } from '../../domain/entities/Account';
import { AccountMapper } from '../mappers/AccountMapper';
import { AccountDTO } from '../dto/AccountDTO';

export class SQLiteAccountRepository implements IAccountRepository {
  private db: SQLite.SQLiteDatabase;
  private mapper: AccountMapper;

  constructor() {
    this.db = SQLite.openDatabaseSync('finance.db');
    this.mapper = new AccountMapper();
    this.initializeDatabase();
  }

  private async initializeDatabase(): Promise<void> {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS accounts (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        saldo REAL,
        isDefault INTEGER DEFAULT 0,
        createdAt TEXT NOT NULL
      );
    `;
    
    await this.db.execAsync(createTableSQL);
  }

  async save(account: Account): Promise<Account> {
    const existingAccount = await this.findById(account.id);
    
    if (existingAccount) {
      // Update existing account
      const dto = this.mapper.toDTO(account);
      const updateSQL = `
        UPDATE accounts 
        SET name = ?, type = ?, saldo = ?, isDefault = ?, createdAt = ?
        WHERE id = ?
      `;
      
      await this.db.runAsync(
        updateSQL,
        [dto.name, dto.type, dto.saldo || 0, dto.isDefault ? 1 : 0, dto.createdAt, dto.id]
      );
    } else {
      // Create new account
      const dto = this.mapper.toDTO(account);
      const insertSQL = `
        INSERT INTO accounts (id, name, type, saldo, isDefault, createdAt)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      await this.db.runAsync(
        insertSQL,
        [dto.id, dto.name, dto.type, dto.saldo || 0, dto.isDefault ? 1 : 0, dto.createdAt]
      );
    }

    return account;
  }

  async findById(id: string): Promise<Account | null> {
    const sql = 'SELECT * FROM accounts WHERE id = ?';
    const rows = await this.db.getAllAsync(sql, [id]) as AccountDTO[];
    
    if (rows.length === 0) {
      return null;
    }

    return this.mapper.toDomain(rows[0]);
  }

  async findAll(): Promise<Account[]> {
    const sql = 'SELECT * FROM accounts ORDER BY name';
    const rows = await this.db.getAllAsync(sql) as AccountDTO[];
    
    return this.mapper.toDomainList(rows);
  }

  async findActive(): Promise<Account[]> {
    // Since the current DTO doesn't have isActive, we'll return all accounts
    // This can be enhanced when the database schema is updated
    return this.findAll();
  }

  async findByType(type: string): Promise<Account[]> {
    // Map domain type to database type
    const dbType = type === 'cartao_credito' ? 'externa' : 'propria';
    const sql = 'SELECT * FROM accounts WHERE type = ? ORDER BY name';
    const rows = await this.db.getAllAsync(sql, [dbType]) as AccountDTO[];
    
    return this.mapper.toDomainList(rows);
  }

  async findByName(name: string): Promise<Account[]> {
    const sql = 'SELECT * FROM accounts WHERE name LIKE ? ORDER BY name';
    const rows = await this.db.getAllAsync(sql, [`%${name}%`]) as AccountDTO[];
    
    return this.mapper.toDomainList(rows);
  }

  async delete(id: string): Promise<boolean> {
    const sql = 'DELETE FROM accounts WHERE id = ?';
    const result = await this.db.runAsync(sql, [id]);
    
    return result.changes > 0;
  }

  async count(): Promise<number> {
    const sql = 'SELECT COUNT(*) as count FROM accounts';
    const result = await this.db.getAllAsync(sql) as any[];
    
    return result[0].count;
  }

  async countActive(): Promise<number> {
    // Since the current DTO doesn't have isActive, we'll return total count
    // This can be enhanced when the database schema is updated
    return this.count();
  }
} 