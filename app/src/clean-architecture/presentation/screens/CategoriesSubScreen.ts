// Screen: CategoriesSubScreen
// Responsável por gerenciar o estado e lógica de apresentação para gerenciamento de categorias
// Integra com CategoryViewModel

import { CategoryViewModel } from '../view-models/CategoryViewModel';
import { Category, CategoryType } from '../../domain/entities/Category';

// Types for category data
export interface CategoryData {
  name: string;
  type: CategoryType;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface CategoriesStatistics {
  total: number;
  active: number;
  inactive: number;
  byType: {
    income: number;
    expense: number;
  };
}

export class CategoriesSubScreen {
  private _showForm: boolean = false;
  private editingCategory: Category | null = null;

  constructor(
    private categoryViewModel: CategoryViewModel
  ) {}

  // Getters
  getCategories(): Category[] {
    return this.categoryViewModel.categories || [];
  }

  getLoading(): boolean {
    return this.categoryViewModel.isLoading;
  }

  getError(): string | null {
    return this.categoryViewModel.error;
  }

  getShowForm(): boolean {
    return this._showForm;
  }

  getEditingCategory(): Category | null {
    return this.editingCategory;
  }

  // Category management
  async createCategory(data: CategoryData): Promise<Category> {
    try {
      this.categoryViewModel.setLoading(true);
      this.categoryViewModel.setError(null);

      const result = await this.categoryViewModel.createCategory(data);
      this.hideForm();
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar categoria';
      this.categoryViewModel.setError(errorMessage);
      throw error;
    } finally {
      this.categoryViewModel.setLoading(false);
    }
  }

  async updateCategory(categoryId: string, data: CategoryData): Promise<Category> {
    try {
      this.categoryViewModel.setLoading(true);
      this.categoryViewModel.setError(null);

      // Set the category first for editing
      const category = this.getCategories().find(cat => cat.id === categoryId);
      if (category) {
        this.categoryViewModel.setCategory(category);
      }
      const result = await this.categoryViewModel.updateCategory(data);
      this.hideForm();
      this.editingCategory = null;
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar categoria';
      this.categoryViewModel.setError(errorMessage);
      throw error;
    } finally {
      this.categoryViewModel.setLoading(false);
    }
  }

  async deleteCategory(categoryId: string): Promise<boolean> {
    try {
      this.categoryViewModel.setLoading(true);
      this.categoryViewModel.setError(null);

      const result = await this.categoryViewModel.deleteCategory(categoryId);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao deletar categoria';
      this.categoryViewModel.setError(errorMessage);
      throw error;
    } finally {
      this.categoryViewModel.setLoading(false);
    }
  }

  // Form management
  showForm(): void {
    this._showForm = true;
    this.editingCategory = null;
  }

  editCategory(category: Category): void {
    this._showForm = true;
    this.editingCategory = category;
  }

  hideForm(): void {
    this._showForm = false;
    this.editingCategory = null;
  }

  cancelEdit(): void {
    this.hideForm();
  }

  // Filtering and search
  filterCategoriesByType(type: CategoryType): Category[] {
    return this.getCategories().filter(category => category.type === type);
  }

  searchCategories(query: string): Category[] {
    if (!query.trim()) {
      return this.getCategories();
    }

    const searchTerm = query.toLowerCase();
    return this.getCategories().filter(category =>
      category.name.toLowerCase().includes(searchTerm)
    );
  }

  getCategoriesByType(): { income: number; expense: number } {
    const categories = this.getCategories();
    return {
      income: categories.filter(cat => cat.type === 'income').length,
      expense: categories.filter(cat => cat.type === 'expense').length,
    };
  }

  // Validation
  validateCategoryData(data: CategoryData): ValidationResult {
    return this.categoryViewModel.validateForm(data);
  }

  // Error handling
  clearErrors(): void {
    this.categoryViewModel.setError(null);
  }

  // Statistics
  getTotalCategoriesCount(): number {
    return this.getCategories().length;
  }

  getActiveCategoriesCount(): number {
    // All categories are considered active in this implementation
    // If you need inactive categories, you'd need to add an isActive property to Category
    return this.getCategories().length;
  }

  getCategoriesStatistics(): CategoriesStatistics {
    const categories = this.getCategories();
    const byType = this.getCategoriesByType();

    return {
      total: categories.length,
      active: categories.length, // All categories are active
      inactive: 0,
      byType,
    };
  }

  // Lifecycle
  async onMount(): Promise<void> {
    try {
      this.categoryViewModel.setLoading(true);
      this.categoryViewModel.setError(null);

      await this.categoryViewModel.loadCategories();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar categorias';
      this.categoryViewModel.setError(errorMessage);
    } finally {
      this.categoryViewModel.setLoading(false);
    }
  }
}
