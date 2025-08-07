// Use Case: CreateCategoryUseCase
// Responsável por criar uma nova categoria

import { ICategoryRepository } from '../repositories/ICategoryRepository';
import { Category } from '../entities/Category';

export interface CreateCategoryRequest {
  name: string;
  type: 'income' | 'expense';
  isDefault?: boolean;
}

export interface CreateCategoryResponse {
  category: Category;
}

export class CreateCategoryUseCase {
  constructor(private categoryRepository: ICategoryRepository) {}

  async execute(request: CreateCategoryRequest): Promise<Category> {
    try {
      this.validateCreateData(request);

      // Check if category with same name already exists
      const existingCategories = await this.categoryRepository.findByName(request.name);
      if (existingCategories.length > 0) {
        throw new Error('Categoria com este nome já existe');
      }

      // Create new category
      const category = new Category({
        id: this.generateId(),
        name: request.name,
        type: request.type,
        isDefault: request.isDefault ?? false,
        createdAt: new Date(),
      });

      // Save to repository
      const savedCategory = await this.categoryRepository.save(category);
      return savedCategory;
    } catch (error) {
      if (error instanceof Error) {
        // Re-throw validation errors as-is
        if (error.message.includes('Nome da categoria é obrigatório') || 
            error.message.includes('Tipo de categoria inválido') ||
            error.message.includes('Categoria com este nome já existe')) {
          throw error;
        }
        // Wrap repository errors
        throw new Error('Erro ao salvar categoria');
      }
      throw new Error('Erro ao salvar categoria');
    }
  }

  private validateCreateData(data: CreateCategoryRequest): void {
    if (!data.name || data.name.trim() === '') {
      throw new Error('Nome da categoria é obrigatório');
    }

    if (!data.type || !['income', 'expense'].includes(data.type)) {
      throw new Error('Tipo de categoria inválido');
    }
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }
} 