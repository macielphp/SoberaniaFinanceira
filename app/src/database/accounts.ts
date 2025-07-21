// app\src\database\accounts.ts
import * as SQLite from 'expo-sqlite';
import { isAccountUsedInOperations } from './operations';

// Type definition for Account
export interface Account {
    id: string;
    name: string;
    type: 'propria' | 'externa'; // novo campo
    saldo?: number; // só para própria
    isDefault: boolean;
    createdAt: string;
}

// Abrindo ou criando banco
const db = SQLite.openDatabaseSync('finance.db');

// Criando a tabela de contas
export const createAccountsTable = async () => {
    await db.execAsync(
        `CREATE TABLE IF NOT EXISTS accounts (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL UNIQUE,
            type TEXT NOT NULL CHECK(type IN ('propria', 'externa')) DEFAULT 'propria',
            saldo REAL,
            isDefault INTEGER NOT NULL DEFAULT 0,
            createdAt TEXT NOT NULL DEFAULT (datetime('now'))
        )`
    );

    // Índice para contas
    await db.execAsync('CREATE INDEX IF NOT EXISTS idx_account_name ON accounts (name);');
    await db.execAsync('CREATE INDEX IF NOT EXISTS idx_account_type ON accounts (type);');
};

// Função para inserir contas padrão
export const insertDefaultAccounts = async () => {
    console.log('📝 Iniciando inserção de contas padrão...');
    
    const defaultAccounts = [
        'Conta Corrente', 'Poupança', 'Carteira-física', 'Cartão de Crédito',
        'Conta Digital', 'Investimentos'
    ];
    
    let insertedCount = 0;
    for (const accountName of defaultAccounts) {
        try {
            const result = await db.runAsync(
                `INSERT OR IGNORE INTO accounts (id, name, isDefault, createdAt) 
                 VALUES (?, ?, 1, ?)`,
                [`default-${accountName}`, accountName, new Date().toISOString()]
            );
            if (result.changes > 0) {
                insertedCount++;
                console.log(`✅ Conta inserida: ${accountName}`);
            } else {
                console.log(`⏭️ Conta já existe: ${accountName}`);
            }
        } catch (err) {
            console.error(`❌ Erro ao inserir conta ${accountName}:`, err);
        }
    }
    
    console.log(`📊 Total de contas inseridas: ${insertedCount}/${defaultAccounts.length}`);
};

// CRUD para Contas
export const insertAccount = async (account: Omit<Account, 'id'>) => {
    try {
        const id = `acc-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
        return await db.runAsync(
            `INSERT INTO accounts (id, name, type, saldo, isDefault, createdAt) VALUES (?, ?, ?, ?, ?, ?)`,
            [id, account.name.trim(), account.type, account.type === 'propria' ? account.saldo ?? 0 : null, account.isDefault ? 1 : 0, account.createdAt]
        );
    } catch (err) {
        console.error('Erro ao inserir conta:', err);
        if (err instanceof Error && err.message.includes('UNIQUE constraint failed')) {
            throw new Error('Já existe uma conta com este nome.');
        }
        throw new Error('Falha ao salvar conta no banco de dados.');
    }
};

export const updateAccount = async (account: Account) => {
    try {
        return await db.runAsync(
            `UPDATE accounts SET name = ?, type = ?, saldo = ?, isDefault = ? WHERE id = ?`,
            [account.name.trim(), account.type, account.type === 'propria' ? account.saldo ?? 0 : null, account.isDefault ? 1 : 0, account.id]
        );
    } catch (err) {
        console.error('Erro ao atualizar conta:', err);
        if (err instanceof Error && err.message.includes('UNIQUE constraint failed')) {
            throw new Error('Já existe uma conta com este nome.');
        }
        throw new Error('Falha ao atualizar conta no banco de dados.');
    }
};
 
export const deleteAccount = async (id: string) => {
    try {
        // First get the account name
        const accountResult = await db.getAllAsync<{ name: string }>(
            'SELECT name FROM accounts WHERE id = ?',
            [id]
        );
        
        if (accountResult.length === 0) {
            throw new Error('Conta não encontrada.');
        }
        
        const accountName = accountResult[0].name;
        
        // Check if the account is being used in operations
        const isUsed = await isAccountUsedInOperations(accountName);
        
        if (isUsed) {
            throw new Error('Não é possível excluir conta que está sendo usada em operações.');
        }

        const result = await db.runAsync('DELETE FROM accounts WHERE id = ? AND isDefault = 0', [id]);
        
        if (result.changes === 0) {
            throw new Error('Não é possível excluir conta padrão ou conta não encontrada.');
        }
        
        return result;
    } catch (err) {
        console.error('Erro ao deletar conta:', err);
        throw err;
    }
};

export const getAllAccounts = async (): Promise<Account[]> => {
    try {
        console.log('📊 Buscando todas as contas...');
        const result = await db.getAllAsync<any>('SELECT * FROM accounts ORDER BY isDefault DESC, name ASC');
        console.log(`✅ ${result.length} contas encontradas`);
        return result.map(item => ({
            ...item,
            type: item.type as 'propria' | 'externa',
            saldo: item.saldo !== null && item.saldo !== undefined ? Number(item.saldo) : undefined,
            isDefault: Boolean(item.isDefault),
        }));
    } catch (err) {
        console.error('❌ Erro ao buscar contas:', err);
        throw new Error('Falha ao buscar contas do banco de dados.');
    }
}; 