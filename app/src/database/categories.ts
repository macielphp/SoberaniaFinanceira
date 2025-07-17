// app\src\database\categories.ts
import * as SQLite from 'expo-sqlite';
import { isCategoryUsedInOperations } from './operations';

// Type definition for Category
export interface Category {
    id: string;
    name: string;
    type: 'income' | 'expense';
    isDefault: boolean;
    createdAt: string;
}

// Abrindo ou criando banco
const db = SQLite.openDatabaseSync('finance.db');

// Criando a tabela de categorias
export const createCategoriesTable = async () => {
    await db.execAsync(
        `CREATE TABLE IF NOT EXISTS categories (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL UNIQUE,
            type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
            isDefault INTEGER NOT NULL DEFAULT 0,
            createdAt TEXT NOT NULL DEFAULT (datetime('now'))
        )`
    );

    // Índice para categorias
    await db.execAsync('CREATE INDEX IF NOT EXISTS idx_category_name ON categories (name);');
    await db.execAsync('CREATE INDEX IF NOT EXISTS idx_category_type ON categories (type);');
};

// Função para inserir categorias padrão
export const insertDefaultCategories = async () => {
    console.log('📝 Iniciando inserção de categorias padrão...');
    
    const defaultCategories = [
        // Categorias de despesa (expense)
        { name: 'Reparação', type: 'expense' as const },
        { name: 'Adiantamento-pessoal', type: 'expense' as const },
        { name: 'Movimentação interna', type: 'expense' as const },
        { name: 'Alimento-supermercado', type: 'expense' as const },
        { name: 'Aluguel', type: 'expense' as const },
        { name: 'Energia-elétrica', type: 'expense' as const },
        { name: 'Saneamento-básico', type: 'expense' as const },
        { name: 'Presente', type: 'expense' as const },
        { name: 'Doação', type: 'expense' as const },
        { name: 'Transporte-público', type: 'expense' as const },
        { name: 'Uber', type: 'expense' as const },
        { name: 'Combustível', type: 'expense' as const },
        { name: 'Internet-e-plano-residência/móvel', type: 'expense' as const },
        { name: 'Lanche-rápido', type: 'expense' as const },
        { name: 'Vestuário', type: 'expense' as const },
        { name: 'Costura-roupa', type: 'expense' as const },
        { name: 'Curso-superior', type: 'expense' as const },
        { name: 'Curso-técnico', type: 'expense' as const },
        { name: 'Curso-profissionalizante', type: 'expense' as const },
        { name: 'Livro', type: 'expense' as const },
        { name: 'Dentista', type: 'expense' as const },
        { name: 'Remédio', type: 'expense' as const },
        { name: 'Oftalmologista', type: 'expense' as const },
        { name: 'Óculos-de-grau', type: 'expense' as const },
        { name: 'Suplemento-vitaminas', type: 'expense' as const },
        { name: 'Gás-cozinha', type: 'expense' as const },
        { name: 'Financiamento', type: 'expense' as const },
        { name: 'Consórcio', type: 'expense' as const },
        { name: 'Dívida', type: 'expense' as const },
        { name: 'Assinatura-digital-pessoal', type: 'expense' as const },
        { name: 'Assinatura-digital-profissional', type: 'expense' as const },
        { name: 'Acessório-celular', type: 'expense' as const },
        
        // Categorias de receita (income)
        { name: 'Salário-CLT', type: 'income' as const },
        { name: 'PLR/Comissão', type: 'income' as const },
        { name: 'Adiantamento-salário-CLT', type: 'income' as const },
        { name: 'Vale-refeição', type: 'income' as const },
        { name: 'Vale-alimentação', type: 'income' as const },
        { name: 'Cashback', type: 'income' as const },
        { name: 'bolsa-valores', type: 'income' as const },
        { name: 'criptomoedas', type: 'income' as const },
        { name: 'renda-fixa', type: 'income' as const }
    ];

    let insertedCount = 0;
    for (const category of defaultCategories) {
        try {
            const result = await db.runAsync(
                `INSERT OR IGNORE INTO categories (id, name, type, isDefault, createdAt) VALUES (?, ?, ?, 1, ?);`,
                [`default-${category.name}`, category.name, category.type, new Date().toISOString()]
            );
            if (result.changes > 0) {
                insertedCount++;
                console.log(`✅ Categoria inserida: ${category.name}`);
            } else {
                console.log(`⏭️ Categoria já existe: ${category.name}`);
            }
        } catch (err) {
            console.error(`❌ Erro ao inserir categoria ${category.name}:`, err);
        }
    }
    
    console.log(`📊 Total de categorias inseridas: ${insertedCount}/${defaultCategories.length}`);
};

// CRUD para categorias
export const insertCategory = async (category: Omit<Category, 'id'>) => {
    try {
        const id = `cat-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
        return await db.runAsync(
            `INSERT INTO categories (id, name, type, isDefault, createdAt) VALUES (?, ?, ?, ?, ?)`,
            [id, category.name.trim(), category.type, category.isDefault ? 1 : 0, category.createdAt]
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
            `UPDATE categories SET name = ?, type = ?, isDefault = ? WHERE id = ?`,
            [category.name.trim(), category.type, category.isDefault ? 1 : 0, category.id]
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
        const isUsed = await isCategoryUsedInOperations(categoryName);
        
        if (isUsed) {
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
        console.log('📊 Buscando todas as categorias...');
        const result = await db.getAllAsync<any>('SELECT * FROM categories ORDER BY isDefault DESC, name ASC');
        console.log(`✅ ${result.length} categorias encontradas`);
        return result.map(item => ({
            ...item,
            type: item.type as 'income' | 'expense',
            isDefault: Boolean(item.isDefault),
        }));
    } catch (err) {
        console.error('❌ Erro ao buscar categorias:', err);
        throw new Error('Falha ao buscar categorias do banco de dados.');
    }
};

// Função para buscar categorias por tipo
export const getCategoriesByType = async (type: 'income' | 'expense'): Promise<Category[]> => {
    try {
        const result = await db.getAllAsync<any>(
            'SELECT * FROM categories WHERE type = ? ORDER BY isDefault DESC, name ASC',
            [type]
        );
        return result.map(item => ({
            ...item,
            type: item.type as 'income' | 'expense',
            isDefault: Boolean(item.isDefault),
        }));
    } catch (err) {
        console.error('Erro ao buscar categorias por tipo:', err);
        throw new Error('Falha ao buscar categorias do banco de dados.');
    }
}; 