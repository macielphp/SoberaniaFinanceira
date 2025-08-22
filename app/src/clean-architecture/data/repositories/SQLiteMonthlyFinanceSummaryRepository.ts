// SQLite implementation of IMonthlyFinanceSummaryRepository
// Handles MonthlyFinanceSummary data persistence using SQLite database

import * as SQLite from 'expo-sqlite';
import { IMonthlyFinanceSummaryRepository } from '../../domain/repositories/IMonthlyFinanceSummaryRepository';
import { MonthlyFinanceSummary } from '../../domain/entities/MonthlyFinanceSummary';
import { MonthlyFinanceSummaryDTO } from '../dto/MonthlyFinanceSummaryDTO';
import { MonthlyFinanceSummaryMapper } from '../mappers/MonthlyFinanceSummaryMapper';

export class SQLiteMonthlyFinanceSummaryRepository implements IMonthlyFinanceSummaryRepository {
  private db: SQLite.SQLiteDatabase;
  private mapper: MonthlyFinanceSummaryMapper;

  constructor() {
    this.db = SQLite.openDatabaseSync('finance.db');
    this.mapper = new MonthlyFinanceSummaryMapper();
    this.initializeDatabase();
  }

  private async initializeDatabase(): Promise<void> {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS monthly_finance_summaries (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        month TEXT NOT NULL,
        total_income REAL NOT NULL,
        total_expense REAL NOT NULL,
        balance REAL NOT NULL,
        total_planned_budget REAL NOT NULL,
        total_actual_budget REAL NOT NULL,
        created_at TEXT NOT NULL
      )
    `;
    
    await this.db.execAsync(createTableSQL);
  }

  async save(monthlyFinanceSummary: MonthlyFinanceSummary): Promise<MonthlyFinanceSummary> {
    try {
      // Check if monthly finance summary exists
      const existingSummary = await this.findById(monthlyFinanceSummary.id);

      if (!existingSummary) {
        // Insert new monthly finance summary
        const insertSQL = `
          INSERT INTO monthly_finance_summaries (
            id, user_id, month, total_income, total_expense, 
            balance, total_planned_budget, total_actual_budget, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        await this.db.runAsync(
          insertSQL,
          [
            monthlyFinanceSummary.id,
            monthlyFinanceSummary.userId,
            monthlyFinanceSummary.month,
            monthlyFinanceSummary.totalIncome.value,
            monthlyFinanceSummary.totalExpense.value,
            monthlyFinanceSummary.balance.value,
            monthlyFinanceSummary.totalPlannedBudget.value,
            monthlyFinanceSummary.totalActualBudget.value,
            monthlyFinanceSummary.createdAt.toISOString()
          ]
        );
      } else {
        // Update existing monthly finance summary
        const updateSQL = `
          UPDATE monthly_finance_summaries SET 
            user_id = ?, month = ?, total_income = ?, total_expense = ?,
            balance = ?, total_planned_budget = ?, total_actual_budget = ?
          WHERE id = ?
        `;
        
        await this.db.runAsync(
          updateSQL,
          [
            monthlyFinanceSummary.userId,
            monthlyFinanceSummary.month,
            monthlyFinanceSummary.totalIncome.value,
            monthlyFinanceSummary.totalExpense.value,
            monthlyFinanceSummary.balance.value,
            monthlyFinanceSummary.totalPlannedBudget.value,
            monthlyFinanceSummary.totalActualBudget.value,
            monthlyFinanceSummary.id
          ]
        );
      }

      return monthlyFinanceSummary;
    } catch (error) {
      console.error('Error saving monthly finance summary:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<MonthlyFinanceSummary | null> {
    const selectSQL = `
      SELECT * FROM monthly_finance_summaries WHERE id = ?
    `;
    
    const result = await this.db.getAllAsync(selectSQL, [id]);
    
    if (result.length === 0) {
      return null;
    }

    return this.mapper.toDomain(result[0] as MonthlyFinanceSummaryDTO);
  }

  async findAll(): Promise<MonthlyFinanceSummary[]> {
    const selectSQL = `
      SELECT * FROM monthly_finance_summaries ORDER BY month DESC
    `;
    
    const result = await this.db.getAllAsync(selectSQL);
    
    return this.mapper.toDomainList(result as MonthlyFinanceSummaryDTO[]);
  }

  async findByUser(userId: string): Promise<MonthlyFinanceSummary[]> {
    const selectSQL = `
      SELECT * FROM monthly_finance_summaries WHERE user_id = ? ORDER BY month DESC
    `;
    
    const result = await this.db.getAllAsync(selectSQL, [userId]);
    
    return this.mapper.toDomainList(result as MonthlyFinanceSummaryDTO[]);
  }

  async findByMonth(month: string): Promise<MonthlyFinanceSummary[]> {
    const selectSQL = `
      SELECT * FROM monthly_finance_summaries WHERE month = ? ORDER BY created_at DESC
    `;
    
    const result = await this.db.getAllAsync(selectSQL, [month]);
    
    return this.mapper.toDomainList(result as MonthlyFinanceSummaryDTO[]);
  }

  async findByUserAndMonth(userId: string, month: string): Promise<MonthlyFinanceSummary[]> {
    const selectSQL = `
      SELECT * FROM monthly_finance_summaries WHERE user_id = ? AND month = ? ORDER BY created_at DESC
    `;
    
    const result = await this.db.getAllAsync(selectSQL, [userId, month]);
    
    return this.mapper.toDomainList(result as MonthlyFinanceSummaryDTO[]);
  }

  async delete(id: string): Promise<boolean> {
    const deleteSQL = `
      DELETE FROM monthly_finance_summaries WHERE id = ?
    `;
    
    const result = await this.db.runAsync(deleteSQL, [id]);
    
    return result.changes > 0;
  }

  async deleteAll(): Promise<void> {
    const deleteSQL = `DELETE FROM monthly_finance_summaries`;
    await this.db.runAsync(deleteSQL);
  }

  async count(): Promise<number> {
    const countSQL = `
      SELECT COUNT(*) as count FROM monthly_finance_summaries
    `;
    
    const result = await this.db.getAllAsync(countSQL);
    
    return (result[0] as any)?.count || 0;
  }
}
