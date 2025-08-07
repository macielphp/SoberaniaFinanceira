/**
 * Mock para expo-sqlite
 * 
 * Este arquivo fornece mocks para o módulo expo-sqlite
 * que causa problemas de transformação no Jest.
 */

export class SQLiteDatabase {
  constructor() {
    this.isOpen = true;
    this.data = new Map();
  }

  async execAsync(sql: string, args?: any[]): Promise<any> {
    return { rows: [], rowCount: 0 };
  }

  async getAllAsync(sql: string, args?: any[]): Promise<any[]> {
    return [];
  }

  async getFirstAsync(sql: string, args?: any[]): Promise<any> {
    return null;
  }

  async runAsync(sql: string, args?: any[]): Promise<any> {
    return { lastInsertRowId: 1, changes: 1 };
  }

  async closeAsync(): Promise<void> {
    this.isOpen = false;
  }

  isOpen: boolean;
  data: Map<string, any>;
}

export function openDatabaseAsync(name: string): Promise<SQLiteDatabase> {
  return Promise.resolve(new SQLiteDatabase());
}

// Adicionar openDatabaseSync para compatibilidade
export function openDatabaseSync(name: string): SQLiteDatabase {
  return new SQLiteDatabase();
}

export default {
  SQLiteDatabase,
  openDatabaseAsync,
  openDatabaseSync,
};
