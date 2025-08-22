// SQLite implementation of IBudgetItemRepository
// Handles BudgetItem data persistence using SQLite database

import * as SQLite from 'expo-sqlite';
import { IBudgetItemRepository } from '../../domain/repositories/IBudgetItemRepository';
import { BudgetItem } from '../../domain/entities/BudgetItem';
import { BudgetItemDTO } from '../dto/BudgetItemDTO';
import { BudgetItemMapper } from '../mappers/BudgetItemMapper';

export class SQLiteBudgetItemRepository implements IBudgetItemRepository {
  private db: SQLite.SQLiteDatabase;
  private mapper: BudgetItemMapper;

  constructor() {
    this.db = SQLite.openDatabaseSync('finance.db');
    this.mapper = new BudgetItemMapper();
    this.initializeDatabase();
  }

  private async initializeDatabase(): Promise<void> {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS budget_items (
        id TEXT PRIMARY KEY,
        budget_id TEXT NOT NULL,
        category_name TEXT NOT NULL,
        planned_value REAL NOT NULL,
        category_type TEXT NOT NULL,
        actual_value REAL,
        created_at TEXT NOT NULL
      )
    `;
    
    await this.db.execAsync(createTableSQL);
  }

  async save(budgetItem: BudgetItem): Promise<BudgetItem> {
    try {
      // Check if budget item exists
      const existingItem = await this.findById(budgetItem.id);

      if (!existingItem) {
        // Insert new budget item
        const insertSQL = `
          INSERT INTO budget_items (
            id, budget_id, category_name, planned_value, 
            category_type, actual_value, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        
        await this.db.runAsync(
          insertSQL,
          [
            budgetItem.id,
            budgetItem.budgetId,
            budgetItem.categoryName,
            budgetItem.plannedValue.value,
            budgetItem.categoryType,
            budgetItem.actualValue?.value || null,
            budgetItem.createdAt.toISOString()
          ]
        );
      } else {
        // Update existing budget item
        const updateSQL = `
          UPDATE budget_items SET 
            budget_id = ?, category_name = ?, planned_value = ?,
            category_type = ?, actual_value = ?
          WHERE id = ?
        `;
        
        await this.db.runAsync(
          updateSQL,
          [
            budgetItem.budgetId,
            budgetItem.categoryName,
            budgetItem.plannedValue.value,
            budgetItem.categoryType,
            budgetItem.actualValue?.value || null,
            budgetItem.id
          ]
        );
      }

      return budgetItem;
    } catch (error) {
      console.error('Error saving budget item:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<BudgetItem | null> {
    const selectSQL = `
      SELECT * FROM budget_items WHERE id = ?
    `;
    
    const result = await this.db.getAllAsync(selectSQL, [id]);
    
    if (result.length === 0) {
      return null;
    }

    return this.mapper.toDomain(result[0] as BudgetItemDTO);
  }

  async findAll(): Promise<BudgetItem[]> {
    const selectSQL = `
      SELECT * FROM budget_items ORDER BY created_at DESC
    `;
    
    const result = await this.db.getAllAsync(selectSQL);
    
    return this.mapper.toDomainList(result as BudgetItemDTO[]);
  }

  async findByBudget(budgetId: string): Promise<BudgetItem[]> {
    const selectSQL = `
      SELECT * FROM budget_items WHERE budget_id = ? ORDER BY created_at DESC
    `;
    
    const result = await this.db.getAllAsync(selectSQL, [budgetId]);
    
    return this.mapper.toDomainList(result as BudgetItemDTO[]);
  }

  async findByCategory(categoryName: string): Promise<BudgetItem[]> {
    const selectSQL = `
      SELECT * FROM budget_items WHERE category_name = ? ORDER BY created_at DESC
    `;
    
    const result = await this.db.getAllAsync(selectSQL, [categoryName]);
    
    return this.mapper.toDomainList(result as BudgetItemDTO[]);
  }

  async delete(id: string): Promise<boolean> {
    const deleteSQL = `
      DELETE FROM budget_items WHERE id = ?
    `;
    
    const result = await this.db.runAsync(deleteSQL, [id]);
    
    return result.changes > 0;
  }

  async deleteAll(): Promise<void> {
    const deleteSQL = `DELETE FROM budget_items`;
    await this.db.runAsync(deleteSQL);
  }

  async count(): Promise<number> {
    const countSQL = `
      SELECT COUNT(*) as count FROM budget_items
    `;
    
    const result = await this.db.getAllAsync(countSQL);
    
    return (result[0] as any)?.count || 0;
  }
}
