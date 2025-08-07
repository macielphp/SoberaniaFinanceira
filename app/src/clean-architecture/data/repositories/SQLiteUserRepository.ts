import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/entities/User';
import * as SQLite from 'expo-sqlite';

export class SQLiteUserRepository implements IUserRepository {
  private db: SQLite.SQLiteDatabase;

  constructor() {
    this.db = SQLite.openDatabaseSync('soberania_financeira.db');
    this.initDatabase().catch(console.error);
  }

  private async initDatabase(): Promise<void> {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        isActive INTEGER DEFAULT 1,
        createdAt TEXT NOT NULL
      );
    `;
    
    await this.db.execAsync(createTableSQL);
  }

  async save(user: User): Promise<User> {
    try {
      // Check if user exists
      const existingUser = await this.findById(user.id);
      
      if (existingUser) {
        // Update existing user
        await this.db.runAsync(
          'UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?',
          [user.name, user.email, user.password, user.id]
        );
      } else {
        // Create new user
        await this.db.runAsync(
          'INSERT INTO users (id, name, email, password, isActive, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
          [
            user.id,
            user.name,
            user.email,
            user.password,
            user.isActive ? 1 : 0,
            user.createdAt.toISOString()
          ]
        );
      }

      return user;
    } catch (error) {
      throw new Error(`Failed to save user: ${error}`);
    }
  }

  async findById(id: string): Promise<User | null> {
    try {
      const result = await this.db.getAllAsync(
        'SELECT * FROM users WHERE id = ?',
        [id]
      );

      if (result.length > 0) {
        const row = result[0] as any;
        return new User({
          id: row.id,
          name: row.name,
          email: row.email,
          password: row.password,
          isActive: row.isActive === 1,
          createdAt: new Date(row.createdAt)
        });
      }

      return null;
    } catch (error) {
      throw new Error(`Failed to find user by id: ${error}`);
    }
  }

  async findAll(): Promise<User[]> {
    try {
      const result = await this.db.getAllAsync(
        'SELECT * FROM users ORDER BY name'
      );

      return result.map((row: any) => new User({
        id: row.id,
        name: row.name,
        email: row.email,
        password: row.password,
        isActive: row.isActive === 1,
        createdAt: new Date(row.createdAt)
      }));
    } catch (error) {
      throw new Error(`Failed to find all users: ${error}`);
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const result = await this.db.getAllAsync(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );

      if (result.length > 0) {
        const row = result[0] as any;
        return new User({
          id: row.id,
          name: row.name,
          email: row.email,
          password: row.password,
          isActive: row.isActive === 1,
          createdAt: new Date(row.createdAt)
        });
      }

      return null;
    } catch (error) {
      throw new Error(`Failed to find user by email: ${error}`);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.db.runAsync(
        'DELETE FROM users WHERE id = ?',
        [id]
      );

      return result.changes > 0;
    } catch (error) {
      throw new Error(`Failed to delete user: ${error}`);
    }
  }

  async count(): Promise<number> {
    try {
      const result = await this.db.getFirstAsync(
        'SELECT COUNT(*) as count FROM users'
      ) as any;

      return result?.count || 0;
    } catch (error) {
      throw new Error(`Failed to count users: ${error}`);
    }
  }
}
