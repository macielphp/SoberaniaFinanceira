// app\src\database\operations.ts
import * as SQLite from 'expo-sqlite';
import { Operation } from '../services/FinanceService';

// Abrindo ou criando banco
const db = SQLite.openDatabaseSync('finance.db');

// Função auxiliar para converter Blob para Uint8Array
const blobToUint8Array = async (blob: Blob): Promise<Uint8Array> => {
    return new Promise<Uint8Array>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            if (reader.result instanceof ArrayBuffer) {
                resolve(new Uint8Array(reader.result));
            } else {
                reject(new Error('Falha ao ler blob como ArrayBuffer'));
            }
        };
        reader.onerror = () => reject(new Error('Erro ao ler blob'));
        reader.readAsArrayBuffer(blob);
    });
};

// Criando a tabela de operações
export const createOperationsTable = async () => {
    await db.execAsync(
        `CREATE TABLE IF NOT EXISTS operations (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            nature TEXT NOT NULL,
            state TEXT NOT NULL,
            paymentMethod TEXT NOT NULL,
            sourceAccount TEXT NOT NULL,
            destinationAccount TEXT NOT NULL,
            date TEXT NOT NULL,
            value REAL NOT NULL,
            category TEXT NOT NULL,
            details TEXT,
            receipt BLOB, -- campo para armazenar imagem binária
            goal_id TEXT REFERENCES goal(id),
            createdAt TEXT NOT NULL DEFAULT (datetime('now'))
        )`
    );

    // Índices para operações
    await db.execAsync('CREATE INDEX IF NOT EXISTS idx_user_id ON operations (user_id);');
    await db.execAsync('CREATE INDEX IF NOT EXISTS idx_date ON operations (date);');
    await db.execAsync('CREATE INDEX IF NOT EXISTS idx_category ON operations (category);');
    await db.execAsync('CREATE INDEX IF NOT EXISTS idx_source_account ON operations (sourceAccount);');
    await db.execAsync('CREATE INDEX IF NOT EXISTS idx_destination_account ON operations (destinationAccount);');
};

// CRUD para operações
export const insertOperation = async (operation: Operation) => {
    try {
        console.log('🗄️ Iniciando inserção de operação no banco...');
        
        const {
            id, nature, state, paymentMethod, sourceAccount, destinationAccount, date, value, category,
            details, receipt, goal_id
        } = operation;

        console.log('📋 Receipt recebido:', receipt ? (typeof receipt === 'string' ? `string(${receipt.length})` : `Uint8Array(${receipt.length} bytes)`) : 'null/undefined');

        // Converter receipt para Uint8Array se for Blob
        let receiptData: Uint8Array | null = null;
        if (receipt) {
            if (receipt instanceof Blob) {
                console.log('🔄 Convertendo Blob para Uint8Array...');
                receiptData = await blobToUint8Array(receipt);
            } else if (receipt instanceof Uint8Array) {
                console.log('✅ Receipt já é Uint8Array, usando diretamente');
                receiptData = receipt;
            } else if (typeof receipt === 'string') {
                console.log('📝 Receipt é string, não será salvo como imagem');
                receiptData = null; // String não é salva no campo BLOB
            }
        }

        console.log('💾 Receipt final para banco:', receiptData ? `Uint8Array(${receiptData.length} bytes)` : 'null');
        console.log('🔗 goal_id a ser salvo:', goal_id);

        const result = await db.runAsync(
            `INSERT INTO operations (
            id, user_id, nature, state, paymentMethod, sourceAccount, destinationAccount, date, value, category,
            details, receipt, goal_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
            [id, operation.user_id, nature, state, paymentMethod, sourceAccount, destinationAccount, date, value,
             category, details ?? null, receiptData, goal_id ?? null]
        );
        
        console.log('✅ Operação inserida com sucesso!');
        return result;
    } catch (err) {
        console.error('❌ Erro ao inserir operação:', err);
        throw new Error('Falha ao salvar operação no banco de dados.');
    }
};

export const updateOperation = async (operation: Operation) => {
    try {
        const {
            id, nature, state, paymentMethod, sourceAccount, destinationAccount, date, value,
            category, details, receipt, goal_id
        } = operation;

        // Converter receipt para Uint8Array se for Blob
        let receiptData: Uint8Array | null = null;
        if (receipt) {
            if (receipt instanceof Blob) {
                receiptData = await blobToUint8Array(receipt);
            } else if (receipt instanceof Uint8Array) {
                receiptData = receipt;
            }
        }

        return await db.runAsync(
            `UPDATE operations SET
                nature = ?, state = ?, paymentMethod = ?, sourceAccount = ?, 
                destinationAccount = ?, date = ?, value = ?, category = ?, 
                details = ?, receipt = ?, goal_id = ?
            WHERE id = ?;`,
            [nature, state, paymentMethod, sourceAccount, destinationAccount, date, value,
             category, details ?? null, receiptData, goal_id ?? null, id]
        );
        console.log('🔗 goal_id atualizado:', goal_id);
    } catch (err) {
        console.error('Erro ao atualizar operação:', err);
        throw new Error('Falha ao atualizar operação no banco de dados.');
    }
};

export const deleteOperation = async (id: string) => {
    try {
        return await db.runAsync('DELETE FROM operations WHERE id = ?;', [id]);
    } catch (err) {
        console.error('Erro ao deletar operação:', err);
        throw new Error('Falha ao deletar operação do banco de dados.');
    }
};

export const getAllOperations = async (): Promise<Operation[]> => {
    try {
        console.log('📊 Buscando todas as operações...');
        const result = await db.getAllAsync<Operation>('SELECT * FROM operations ORDER BY date DESC, createdAt DESC;');
        console.log(`✅ ${result.length} operações encontradas`);
        return result.map(item => ({
            ...item,
            value: Number(item.value), // garantindo tipo number
        }));
    } catch (err) {
        console.error('❌ Erro ao buscar operações:', err);
        throw new Error('Falha ao buscar operações do banco de dados.');
    }
};

// Utility functions for operations
export const getOperationsByDateRange = async (startDate: string, endDate: string): Promise<Operation[]> => {
    try {
        const result = await db.getAllAsync<Operation>(
            'SELECT * FROM operations WHERE date BETWEEN ? AND ? ORDER BY date DESC',
            [startDate, endDate]
        );
        return result.map(item => ({
            ...item,
            value: Number(item.value),
        }));
    } catch (err) {
        console.error('Erro ao buscar operações por período:', err);
        throw new Error('Falha ao buscar operações por período.');
    }
};

export const getOperationsByCategory = async (categoryName: string): Promise<Operation[]> => {
    try {
        const result = await db.getAllAsync<Operation>(
            'SELECT * FROM operations WHERE category = ? ORDER BY date DESC',
            [categoryName]
        );
        return result.map(item => ({
            ...item,
            value: Number(item.value),
        }));
    } catch (err) {
        console.error('Erro ao buscar operações por categoria:', err);
        throw new Error('Falha ao buscar operações por categoria.');
    }
};

export const getOperationsByAccount = async (accountName: string): Promise<Operation[]> => {
    try {
        const result = await db.getAllAsync<Operation>(
            'SELECT * FROM operations WHERE sourceAccount = ? OR destinationAccount = ? ORDER BY date DESC',
            [accountName, accountName]
        );
        return result.map(item => ({
            ...item,
            value: Number(item.value),
        }));
    } catch (err) {
        console.error('Erro ao buscar operações por conta:', err);
        throw new Error('Falha ao buscar operações por conta.');
    }
};

// Função para verificar se uma categoria está sendo usada em operações
export const isCategoryUsedInOperations = async (categoryName: string): Promise<boolean> => {
    try {
        const operations = await db.getAllAsync<{ count: number }>(
            'SELECT COUNT(*) as count FROM operations WHERE category = ?',
            [categoryName]
        );
        return operations[0]?.count > 0;
    } catch (err) {
        console.error('Erro ao verificar uso da categoria:', err);
        return false;
    }
};

// Função para verificar se uma conta está sendo usada em operações
export const isAccountUsedInOperations = async (accountName: string): Promise<boolean> => {
    try {
        const operations = await db.getAllAsync<{ count: number }>(
            `SELECT COUNT(*) as count FROM operations 
             WHERE sourceAccount = ? OR destinationAccount = ?`,
            [accountName, accountName]
        );
        return operations[0]?.count > 0;
    } catch (err) {
        console.error('Erro ao verificar uso da conta:', err);
        return false;
    }
}; 

// Função utilitária para debug: listar todas as operações com goal_id
export const listOperationsWithGoalId = async () => {
    const result = await db.getAllAsync<any>(
        'SELECT id, nature, value, goal_id FROM operations WHERE goal_id IS NOT NULL ORDER BY date DESC, createdAt DESC;'
    );
    console.log('🔎 Operações com goal_id:', result);
    return result;
}; 