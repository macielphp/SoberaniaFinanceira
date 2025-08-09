import { Category } from '../../domain/entities/Category';

// Interfaces para os Use Cases
interface CreateCategoryUseCase {
  execute(data: CreateCategoryData): Promise<Category>;
}

interface UpdateCategoryUseCase {
  execute(id: string, data: UpdateCategoryData): Promise<Category>;
}

interface GetCategoryByIdUseCase {
  execute(id: string): Promise<Category>;
}

interface GetCategoriesUseCase {
  execute(): Promise<Category[]>;
}

interface DeleteCategoryUseCase {
  execute(id: string): Promise<boolean>;
}

// Interfaces para os dados
interface CreateCategoryData {
  name: string;
  type: 'income' | 'expense';
}

interface UpdateCategoryData {
  name: string;
  type: 'income' | 'expense';
}

interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

interface CategorySummary {
  id: string;
  name: string;
  type: 'income' | 'expense';
  transactionCount: number;
}

export class CategoryViewModel {
  private _category: Category | null = null;
  private _categories: Category[] = [];
  private _isLoading: boolean = false;
  private _error: string | null = null;
  private _isEditing: boolean = false;

  constructor(
    private createCategoryUseCase: CreateCategoryUseCase,
    private updateCategoryUseCase: UpdateCategoryUseCase,
    private getCategoryByIdUseCase: GetCategoryByIdUseCase,
    private getCategoriesUseCase: GetCategoriesUseCase,
    private deleteCategoryUseCase: DeleteCategoryUseCase
  ) {}

  // Getters
  get category(): Category | null {
    return this._category;
  }

  get categories(): Category[] {
    return this._categories;
  }

  get isLoading(): boolean {
    return this._isLoading;
  }

  get error(): string | null {
    return this._error;
  }

  get isEditing(): boolean {
    return this._isEditing;
  }

  // Setters
  setCategory(category: Category | null): void {
    this._category = category;
    this._isEditing = category !== null;
  }

  setCategories(categories: Category[]): void {
    this._categories = categories;
  }

  setLoading(loading: boolean): void {
    this._isLoading = loading;
  }

  setError(error: string | null): void {
    this._error = error;
  }

  reset(): void {
    this._category = null;
    this._categories = [];
    this._isLoading = false;
    this._error = null;
    this._isEditing = false;
  }

  validateForm(data: CreateCategoryData): ValidationResult {
    const errors: Record<string, string> = {};

    // Validar nome
    if (!data.name || data.name.trim() === '') {
      errors.name = 'Nome é obrigatório';
    }

    // Validar tipo
    if (!data.type) {
      errors.type = 'Tipo é obrigatório';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  async createCategory(data: CreateCategoryData): Promise<Category> {
    try {
      this.setLoading(true);
      this.setError(null);

      const category = await this.createCategoryUseCase.execute(data);
      this.setCategory(category);
      return category;
    } catch (error) {
      this.setError(error instanceof Error ? error.message : 'Erro ao criar categoria');
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  async updateCategory(data: UpdateCategoryData): Promise<Category> {
    if (!this._category) {
      throw new Error('Nenhuma categoria selecionada para edição');
    }

    try {
      this.setLoading(true);
      this.setError(null);

      const updatedCategory = await this.updateCategoryUseCase.execute(this._category.id, data);
      this.setCategory(updatedCategory);
      return updatedCategory;
    } catch (error) {
      this.setError(error instanceof Error ? error.message : 'Erro ao atualizar categoria');
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  async loadCategory(id: string): Promise<Category> {
    try {
      this.setLoading(true);
      this.setError(null);

      const category = await this.getCategoryByIdUseCase.execute(id);
      this.setCategory(category);
      return category;
    } catch (error) {
      this.setError(error instanceof Error ? error.message : 'Erro ao carregar categoria');
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  async loadCategories(): Promise<Category[]> {
    try {
      this.setLoading(true);
      this.setError(null);

      const categories = await this.getCategoriesUseCase.execute();
      this.setCategories(categories);
      return categories;
    } catch (error) {
      this.setError(error instanceof Error ? error.message : 'Erro ao carregar categorias');
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  async deleteCategory(id: string): Promise<boolean> {
    try {
      this.setLoading(true);
      this.setError(null);

      const result = await this.deleteCategoryUseCase.execute(id);
      return result;
    } catch (error) {
      this.setError(error instanceof Error ? error.message : 'Erro ao deletar categoria');
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  getCategorySummary(): CategorySummary | null {
    if (!this._category) {
      return null;
    }

    return {
      id: this._category.id,
      name: this._category.name,
      type: this._category.type,
      transactionCount: 0, // TODO: Implementar contagem de transações
    };
  }

  getCategoriesByType(type: 'income' | 'expense'): Category[] {
    return this._categories.filter(category => category.type === type);
  }
}