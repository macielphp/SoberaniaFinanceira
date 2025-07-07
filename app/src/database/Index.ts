// app\src\database\Index.ts
import * as SQLite from 'expo-sqlite';
import { Operation } from '../services/FinanceService';

// Type definitions for Category and Account (database entities)
export interface Category {
    id: string;
    name: string;
    isDefault: boolean;
    createdAt: string;
}

export interface Account {
    id: string;
    name: string;
    isDefault: boolean;
    createdAt: string;
}

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

// Criando a tabela se não existir
export const setupDatabase = async () => {

    await db.execAsync(
        `CREATE TABLE IF NOT EXISTS operations (
            id TEXT PRIMARY KEY,
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
            project TEXT,
            createdAt TEXT NOT NULL DEFAULT (datetime('now'))
        )`
    );

    // Tabela de categorias
    await db.execAsync(
        `CREATE TABLE IF NOT EXISTS categories (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL UNIQUE,
            isDefault INTEGER NOT NULL DEFAULT 0,
            createdAt TEXT NOT NULL DEFAULT (datetime('now'))
        )`
    );

    // Tabela de contas
    await db.execAsync(
        `CREATE TABLE IF NOT EXISTS accounts (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL UNIQUE,
            isDefault INTEGER NOT NULL DEFAULT 0,
            createdAt TEXT NOT NULL DEFAULT (datetime('now'))
        )`
    );

    // Índices para operações
    await db.execAsync('CREATE INDEX IF NOT EXISTS idx_date ON operations (date);');
    await db.execAsync('CREATE INDEX IF NOT EXISTS idx_category ON operations (category);');
    await db.execAsync('CREATE INDEX IF NOT EXISTS idx_source_account ON operations (sourceAccount);');
    await db.execAsync('CREATE INDEX IF NOT EXISTS idx_destination_account ON operations (destinationAccount);');

    // Índices para categorias e contas
    await db.execAsync('CREATE INDEX IF NOT EXISTS idx_category_name ON categories (name);');
    await db.execAsync('CREATE INDEX IF NOT EXISTS idx_account_name ON accounts (name);');
    // https://www.sqlite.org/lang_createindex.html

    // Inserir categorias padrão se não existirem
    await insertDefaultCategories();
    await insertDefaultAccounts();
};

// Função para inserir categorias padrão
const insertDefaultCategories = async () => {
    const defaultCategories = [
        'Reparação', 'Adiantamento-pessoal', 'Movimentação interna',
        'Alimento-supermercado', 'Aluguel', 'Energia-elétrica',
        'Saneamento-básico', 'Presente', 'Doação', 'Transporte-público',
        'Uber', 'Combustível', 'Salário-CLT', 'PLR/Comissão', 'Adiantamento-salário-CLT', 'Vale-refeição',
        'Vale-alimentação', 'Cashback', 'Internet-e-plano-residência/móvel',
        'Lanche-rápido', 'Vestuário', 'Costura-roupa', 'Curso-superior',
        'Curso-técnico', 'Curso-profissionalizante', 'Livro', 'Dentista',
        'Remédio', 'Oftalmologista', 'Óculos-de-grau', 'Suplemento-vitaminas',
        'Gás-cozinha', 'Financiamento', 'Consórcio', 'Dívida',
        'Assinatura-digital-pessoal', 'Assinatura-digital-profissional',
        'Acessório-celular', 'bolsa-valores', 'criptomoedas', 'renda-fixa'
    ];

    for (const categoryName of defaultCategories) {
        try {
            await db.runAsync(
                `INSERT OR IGNORE INTO categories (id, name, isDefault, createdAt) VALUES (?, ?, 1, ?);`,
                [`default-${categoryName}`, categoryName, new Date().toISOString()]
            );
        } catch (err) {
            console.log(`Categoria ${categoryName} já existe.`);
        }
    }
};

// Função para inserir contas padrão
const insertDefaultAccounts = async () => {
    const defaultAccounts = [
        'Conta Corrente', 'Poupança', 'Carteira-física', 'Cartão de Crédito',
        'Conta Digital', 'Investimentos'
    ];
    for (const accountName of defaultAccounts) {
        try {
            await db.runAsync(
                `INSERT OR IGNORE INTO accounts (id, name, isDefault, createdAt) 
                 VALUES (?, ?, 1, ?)`,
                [`default-${accountName}`, accountName, new Date().toISOString()]
            );
        } catch (err) {
            console.log(`Conta ${accountName} já existe.`);
        }
    }
};

// CRUD para operações
export const insertOperation = async (operation: Operation) => {
    try {
        console.log('🗄️ Iniciando inserção de operação no banco...');
        
        const {
            id, nature, state, paymentMethod, sourceAccount, destinationAccount, date, value, category,
            details, receipt, project
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

        const result = await db.runAsync(
            `INSERT INTO operations (
            id, nature, state, paymentMethod, sourceAccount, destinationAccount, date, value, category,
            details, receipt, project
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
            [id, nature, state, paymentMethod, sourceAccount, destinationAccount, date, value,
             category, details ?? null, receiptData, project ?? null]
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
            category, details, receipt, project
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
                details = ?, receipt = ?, project = ?
            WHERE id = ?;`,
            [nature, state, paymentMethod, sourceAccount, destinationAccount, date, value,
             category, details ?? null, receiptData, project ?? null, id]
        );
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
        const result = await db.getAllAsync<Operation>('SELECT * FROM operations ORDER BY date DESC, createdAt DESC;');
        return result.map(item => ({
            ...item,
            value: Number(item.value), // garantindo tipo number
        }));
    } catch (err) {
        console.error('Erro ao buscar operações:', err);
        throw new Error('Falha ao buscar operações do banco de dados.');
    }
};

// CRUD para categories
export const insertCategory = async (category: Omit<Category, 'id'>) => {
    try {
        const id = `cat-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
        return await db.runAsync(
            `INSERT INTO categories (id, name, isDefault, createdAt) VALUES (?, ?, ?, ?)`,
            [id, category.name.trim(), category.isDefault ? 1 : 0, category.createdAt]
        );
    } catch (err) {
        console.error('Erro ao inserir categoria:', err);
        if (err instanceof Error && err.message.includes('UNIQUE constraint failed')) {
            throw new Error('Já existe uma categoria com este nome.');
        }
        throw new Error('Falha ao salvar categoria no banco de dados.');
    }
};

export const updateCategory = async (category: Category) => {
    try {
        return await db.runAsync(
            `UPDATE categories SET name = ?, isDefault = ? WHERE id = ?`,
            [category.name.trim(), category.isDefault ? 1 : 0, category.id]
        );
    } catch (err) {
        console.error('Erro ao atualizar categoria:', err);
        if (err instanceof Error && err.message.includes('UNIQUE constraint failed')) {
            throw new Error('Já existe uma categoria com este nome.');
        }
        throw new Error('Falha ao atualizar categoria no banco de dados.');
    }
};

export const deleteCategory = async (id: string) => {
    try {
        // First get the category name
        const categoryResult = await db.getAllAsync<{ name: string }>(
            'SELECT name FROM categories WHERE id = ?',
            [id]
        );
        
        if (categoryResult.length === 0) {
            throw new Error('Categoria não encontrada.');
        }
        
        const categoryName = categoryResult[0].name;
        
        // Check if the category is being used in operations
        const operations = await db.getAllAsync<{ count: number }>(
            'SELECT COUNT(*) as count FROM operations WHERE category = ?',
            [categoryName]
        );
        
        if (operations[0]?.count > 0) {
            throw new Error('Não é possível excluir categoria que está sendo usada em operações.');
        }

        const result = await db.runAsync('DELETE FROM categories WHERE id = ? AND isDefault = 0', [id]);
        
        if (result.changes === 0) {
            throw new Error('Não é possível excluir categoria padrão ou categoria não encontrada.');
        }
        
        return result;
    } catch (err) {
        console.error('Erro ao deletar categoria:', err);
        throw err;
    }
};

export const getAllCategories = async (): Promise<Category[]> => {
    try {
        const result = await db.getAllAsync<any>('SELECT * FROM categories ORDER BY isDefault DESC, name ASC');
        return result.map(item => ({
            ...item,
            isDefault: Boolean(item.isDefault),
        }));
    } catch (err) {
        console.error('Erro ao buscar categorias:', err);
        throw new Error('Falha ao buscar categorias do banco de dados.');
    }
};

// CRUD para Contas
export const insertAccount = async (account: Omit<Account, 'id'>) => {
    try {
        const id = `acc-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
        return await db.runAsync(
            `INSERT INTO accounts (id, name, isDefault, createdAt) VALUES (?, ?, ?, ?)`,
            [id, account.name.trim(), account.isDefault ? 1 : 0, account.createdAt]
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
            `UPDATE accounts SET name = ?, isDefault = ? WHERE id = ?`,
            [account.name.trim(), account.isDefault ? 1 : 0, account.id]
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
        
        // Check if the account is being used in operations (FIXED: using correct column names)
        const operations = await db.getAllAsync<{ count: number }>(
            `SELECT COUNT(*) as count FROM operations 
             WHERE sourceAccount = ? OR destinationAccount = ?`,
            [accountName, accountName]
        );
        
        if (operations[0]?.count > 0) {
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
        const result = await db.getAllAsync<any>('SELECT * FROM accounts ORDER BY isDefault DESC, name ASC');
        return result.map(item => ({
            ...item,
            isDefault: Boolean(item.isDefault),
        }));
    } catch (err) {
        console.error('Erro ao buscar contas:', err);
        throw new Error('Falha ao buscar contas do banco de dados.');
    }
};

// Additional utility functions
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