// SQLite Implementation of ICategoryRepository
// Implements the repository pattern for Category entity using SQLite

import * as SQLite from 'expo-sqlite';
import { ICategoryRepository } from '../../domain/repositories/ICategoryRepository';
import { Category } from '../../domain/entities/Category';
import { CategoryMapper } from '../mappers/CategoryMapper';
import { CategoryDTO } from '../dto/CategoryDTO';

export class SQLiteCategoryRepository implements ICategoryRepository {
  private db: SQLite.SQLiteDatabase;
  private mapper: CategoryMapper;

  constructor() {
    this.db = SQLite.openDatabaseSync('finance.db');
    this.mapper = new CategoryMapper();
    this.initializeDatabase();
  }

  private async initializeDatabase(): Promise<void> {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        isDefault INTEGER DEFAULT 0,
        createdAt TEXT NOT NULL
      );
    `;
    
    await this.db.execAsync(createTableSQL);
  }

  async save(category: Category): Promise<Category> {
    const existingCategory = await this.findById(category.id);
    
    if (existingCategory) {
      // Update existing category
      const dto = this.mapper.toDTO(category);
      const updateSQL = `
        UPDATE categories 
        SET name = ?, type = ?, isDefault = ?, createdAt = ?
        WHERE id = ?
      `;
      
      await this.db.runAsync(
        updateSQL,
        [dto.name, dto.type, dto.isDefault ? 1 : 0, dto.createdAt, dto.id]
      );
    } else {
      // Create new category
      const dto = this.mapper.toDTO(category);
      const insertSQL = `
        INSERT INTO categories (id, name, type, isDefault, createdAt)
        VALUES (?, ?, ?, ?, ?)
      `;
      
      await this.db.runAsync(
        insertSQL,
        [dto.id, dto.name, dto.type, dto.isDefault ? 1 : 0, dto.createdAt]
      );
    }

    return category;
  }

  async findById(id: string): Promise<Category | null> {
    const sql = 'SELECT * FROM categories WHERE id = ?';
    const rows = await this.db.getAllAsync(sql, [id]) as CategoryDTO[];
    
    if (rows.length === 0) {
      return null;
    }

    return this.mapper.toDomain(rows[0]);
  }

  async findAll(): Promise<Category[]> {
    const sql = 'SELECT * FROM categories ORDER BY name';
    const rows = await this.db.getAllAsync(sql) as CategoryDTO[];
    
    return this.mapper.toDomainList(rows);
  }

  async findByType(type: string): Promise<Category[]> {
    const sql = 'SELECT * FROM categories WHERE type = ? ORDER BY name';
    const rows = await this.db.getAllAsync(sql, [type]) as CategoryDTO[];
    
    return this.mapper.toDomainList(rows);
  }

  async findByName(name: string): Promise<Category[]> {
    const sql = 'SELECT * FROM categories WHERE name LIKE ? ORDER BY name';
    const rows = await this.db.getAllAsync(sql, [`%${name}%`]) as CategoryDTO[];
    
    return this.mapper.toDomainList(rows);
  }

  async findDefault(): Promise<Category[]> {
    const sql = 'SELECT * FROM categories WHERE isDefault = 1 ORDER BY name';
    const rows = await this.db.getAllAsync(sql) as CategoryDTO[];
    
    return this.mapper.toDomainList(rows);
  }

  async delete(id: string): Promise<boolean> {
    const sql = 'DELETE FROM categories WHERE id = ?';
    const result = await this.db.runAsync(sql, [id]);
    
    return result.changes > 0;
  }

  async count(): Promise<number> {
    const sql = 'SELECT COUNT(*) as count FROM categories';
    const result = await this.db.getAllAsync(sql) as any[];
    
    return result[0].count;
  }

  async countByType(type: string): Promise<number> {
    const sql = 'SELECT COUNT(*) as count FROM categories WHERE type = ?';
    const result = await this.db.getAllAsync(sql, [type]) as any[];
    
    return result[0].count;
  }
} 