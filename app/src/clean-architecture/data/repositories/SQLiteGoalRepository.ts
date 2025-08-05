// SQLite Implementation of IGoalRepository
// Implements the repository pattern for Goal entity using SQLite

import * as SQLite from 'expo-sqlite';
import { IGoalRepository } from '../../domain/repositories/IGoalRepository';
import { Goal } from '../../domain/entities/Goal';
import { GoalMapper } from '../mappers/GoalMapper';
import { GoalDTO } from '../dto/GoalDTO';

export class SQLiteGoalRepository implements IGoalRepository {
  private db: SQLite.SQLiteDatabase;
  private mapper: GoalMapper;

  constructor() {
    this.db = SQLite.openDatabaseSync('finance.db');
    this.mapper = new GoalMapper();
    this.initializeDatabase();
  }

  private async initializeDatabase(): Promise<void> {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS goals (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        description TEXT NOT NULL,
        type TEXT NOT NULL,
        target_value REAL NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        monthly_income REAL NOT NULL,
        fixed_expenses REAL NOT NULL,
        available_per_month REAL NOT NULL,
        importance TEXT NOT NULL,
        priority INTEGER NOT NULL,
        strategy TEXT,
        monthly_contribution REAL NOT NULL,
        num_parcela INTEGER NOT NULL,
        status TEXT DEFAULT 'active',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `;
    
    await this.db.execAsync(createTableSQL);
  }

  async save(goal: Goal): Promise<Goal> {
    const existingGoal = await this.findById(goal.id);
    
    if (existingGoal) {
      // Update existing goal
      const dto = this.mapper.toDTO(goal);
      const updateSQL = `
        UPDATE goals 
        SET user_id = ?, description = ?, type = ?, target_value = ?, start_date = ?, 
            end_date = ?, monthly_income = ?, fixed_expenses = ?, available_per_month = ?,
            importance = ?, priority = ?, strategy = ?, monthly_contribution = ?, 
            num_parcela = ?, status = ?, updated_at = ?
        WHERE id = ?
      `;
      
      await this.db.runAsync(
        updateSQL,
        [
          dto.user_id, dto.description, dto.type, dto.target_value, dto.start_date,
          dto.end_date, dto.monthly_income, dto.fixed_expenses, dto.available_per_month,
          dto.importance, dto.priority, dto.strategy || null, dto.monthly_contribution,
          dto.num_parcela, dto.status || 'active', dto.updated_at, dto.id
        ]
      );
    } else {
      // Create new goal
      const dto = this.mapper.toDTO(goal);
      const insertSQL = `
        INSERT INTO goals (
          id, user_id, description, type, target_value, start_date, end_date,
          monthly_income, fixed_expenses, available_per_month, importance, priority,
          strategy, monthly_contribution, num_parcela, status, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      await this.db.runAsync(
        insertSQL,
        [
          dto.id, dto.user_id, dto.description, dto.type, dto.target_value, dto.start_date,
          dto.end_date, dto.monthly_income, dto.fixed_expenses, dto.available_per_month,
          dto.importance, dto.priority, dto.strategy || null, dto.monthly_contribution,
          dto.num_parcela, dto.status || 'active', dto.created_at, dto.updated_at
        ]
      );
    }

    return goal;
  }

  async findById(id: string): Promise<Goal | null> {
    const sql = 'SELECT * FROM goals WHERE id = ?';
    const rows = await this.db.getAllAsync(sql, [id]) as GoalDTO[];
    
    if (rows.length === 0) {
      return null;
    }

    return this.mapper.toDomain(rows[0]);
  }

  async findAll(): Promise<Goal[]> {
    const sql = 'SELECT * FROM goals ORDER BY end_date';
    const rows = await this.db.getAllAsync(sql) as GoalDTO[];
    
    return this.mapper.toDomainList(rows);
  }

  async findByUserId(userId: string): Promise<Goal[]> {
    const sql = 'SELECT * FROM goals WHERE user_id = ? ORDER BY end_date';
    const rows = await this.db.getAllAsync(sql, [userId]) as GoalDTO[];
    
    return this.mapper.toDomainList(rows);
  }

  async findByType(type: string): Promise<Goal[]> {
    const sql = 'SELECT * FROM goals WHERE type = ? ORDER BY end_date';
    const rows = await this.db.getAllAsync(sql, [type]) as GoalDTO[];
    
    return this.mapper.toDomainList(rows);
  }

  async findByStatus(status: string): Promise<Goal[]> {
    const sql = 'SELECT * FROM goals WHERE status = ? ORDER BY end_date';
    const rows = await this.db.getAllAsync(sql, [status]) as GoalDTO[];
    
    return this.mapper.toDomainList(rows);
  }

  async findActive(): Promise<Goal[]> {
    const sql = 'SELECT * FROM goals WHERE end_date >= ? ORDER BY end_date';
    const today = new Date().toISOString();
    const rows = await this.db.getAllAsync(sql, [today]) as GoalDTO[];
    
    return this.mapper.toDomainList(rows);
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Goal[]> {
    const sql = 'SELECT * FROM goals WHERE end_date BETWEEN ? AND ? ORDER BY end_date';
    const rows = await this.db.getAllAsync(sql, [startDate.toISOString(), endDate.toISOString()]) as GoalDTO[];
    
    return this.mapper.toDomainList(rows);
  }

  async delete(id: string): Promise<boolean> {
    const sql = 'DELETE FROM goals WHERE id = ?';
    const result = await this.db.runAsync(sql, [id]);
    
    return result.changes > 0;
  }

  async count(): Promise<number> {
    const sql = 'SELECT COUNT(*) as count FROM goals';
    const result = await this.db.getAllAsync(sql) as any[];
    
    return result[0].count;
  }

  async countByUserId(userId: string): Promise<number> {
    const sql = 'SELECT COUNT(*) as count FROM goals WHERE user_id = ?';
    const result = await this.db.getAllAsync(sql, [userId]) as any[];
    
    return result[0].count;
  }

  async countActive(): Promise<number> {
    const sql = 'SELECT COUNT(*) as count FROM goals WHERE end_date >= ?';
    const today = new Date().toISOString();
    const result = await this.db.getAllAsync(sql, [today]) as any[];
    
    return result[0].count;
  }
} 