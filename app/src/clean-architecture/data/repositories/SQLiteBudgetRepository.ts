// SQLite Implementation of BudgetRepository
// Implements the repository pattern for SQLite database operations

import { IBudgetRepository } from '../../domain/repositories/IBudgetRepository';
import { Budget } from '../../domain/entities/Budget';
import { BudgetMapper } from '../mappers/BudgetMapper';
import { BudgetDTO } from '../dto/BudgetDTO';
import * as SQLite from 'expo-sqlite';

export class SQLiteBudgetRepository implements IBudgetRepository {
  private db: SQLite.SQLiteDatabase;
  private mapper: BudgetMapper;

  constructor() {
    this.db = SQLite.openDatabaseSync('finance.db');
    this.mapper = new BudgetMapper();
    this.initializeDatabase();
  }

  private async initializeDatabase(): Promise<void> {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS budgets (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        start_period TEXT NOT NULL,
        end_period TEXT NOT NULL,
        type TEXT NOT NULL,
        total_planned_value REAL NOT NULL,
        is_active INTEGER NOT NULL,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL
      )
    `;
    
    await this.db.execAsync(createTableSQL);
  }

  async save(budget: Budget): Promise<Budget> {
    try {
      // Check if budget exists
      const existingBudget = await this.findById(budget.id);
      
      if (existingBudget) {
        // Update existing budget
        const updateSQL = `
          UPDATE budgets 
          SET user_id = ?, name = ?, start_period = ?, end_period = ?, 
              type = ?, total_planned_value = ?, is_active = ?, status = ?
          WHERE id = ?
        `;
        
        const result = await this.db.runAsync(
          updateSQL,
          [
            budget.userId,
            budget.name,
            budget.startPeriod.toISOString(),
            budget.endPeriod.toISOString(),
            budget.type,
            budget.totalPlannedValue.value,
            budget.isActive ? 1 : 0,
            budget.status,
            budget.id
          ]
        );
        
        console.log('Update result:', result);
      } else {
        // Insert new budget
        const insertSQL = `
          INSERT INTO budgets (
            id, user_id, name, start_period, end_period, type, 
            total_planned_value, is_active, status, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        await this.db.runAsync(
          insertSQL,
          [
            budget.id,
            budget.userId,
            budget.name,
            budget.startPeriod.toISOString(),
            budget.endPeriod.toISOString(),
            budget.type,
            budget.totalPlannedValue.value,
            budget.isActive ? 1 : 0,
            budget.status,
            budget.createdAt.toISOString()
          ]
        );
      }

      return budget;
    } catch (error) {
      console.error('Error saving budget:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<Budget | null> {
    const selectSQL = `
      SELECT * FROM budgets WHERE id = ?
    `;
    
    const result = await this.db.getAllAsync(selectSQL, [id]);
    
    if (result.length === 0) {
      return null;
    }

    return this.mapper.toDomain(result[0] as BudgetDTO);
  }

  async findAll(): Promise<Budget[]> {
    const selectSQL = `
      SELECT * FROM budgets ORDER BY created_at DESC
    `;
    
    const result = await this.db.getAllAsync(selectSQL);
    
    return this.mapper.toDomainList(result as BudgetDTO[]);
  }

  async findByUser(userId: string): Promise<Budget[]> {
    const selectSQL = `
      SELECT * FROM budgets WHERE user_id = ? ORDER BY created_at DESC
    `;
    
    const result = await this.db.getAllAsync(selectSQL, [userId]);
    
    return this.mapper.toDomainList(result as BudgetDTO[]);
  }

  async findActiveByUser(userId: string): Promise<Budget[]> {
    const selectSQL = `
      SELECT * FROM budgets 
      WHERE user_id = ? AND is_active = 1 AND status = 'active'
      ORDER BY created_at DESC
    `;
    
    const result = await this.db.getAllAsync(selectSQL, [userId]);
    
    return this.mapper.toDomainList(result as BudgetDTO[]);
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Budget[]> {
    const selectSQL = `
      SELECT * FROM budgets 
      WHERE start_period >= ? AND end_period <= ?
      ORDER BY created_at DESC
    `;
    
    const result = await this.db.getAllAsync(
      selectSQL, 
      [startDate.toISOString(), endDate.toISOString()]
    );
    
    return this.mapper.toDomainList(result as BudgetDTO[]);
  }

  async delete(id: string): Promise<boolean> {
    const deleteSQL = `
      DELETE FROM budgets WHERE id = ?
    `;
    
    const result = await this.db.runAsync(deleteSQL, [id]);
    
    return result.changes > 0;
  }

  async count(): Promise<number> {
    const countSQL = 'SELECT COUNT(*) as count FROM budgets';
    const result = await this.db.getAllAsync(countSQL);
    return (result[0] as any)?.count || 0;
  }

  async deleteAll(): Promise<void> {
    const deleteSQL = `
      DELETE FROM budgets
    `;
    
    await this.db.runAsync(deleteSQL);
  }
}
