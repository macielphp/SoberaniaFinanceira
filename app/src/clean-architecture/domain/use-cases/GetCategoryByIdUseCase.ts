import { ICategoryRepository } from '../repositories/ICategoryRepository';
import { Category } from '../entities/Category';

export interface GetCategoryByIdRequest {
  id: string;
}

export interface GetCategoryByIdResponse {
  category: Category;
}

export class GetCategoryByIdUseCase {
  constructor(private categoryRepository: ICategoryRepository) {}

  async execute(categoryId: string): Promise<Category> {
    try {
      if (!categoryId || categoryId.trim() === '') {
        throw new Error('ID da categoria é obrigatório');
      }

      const category = await this.categoryRepository.findById(categoryId);
      
      if (!category) {
        throw new Error('Categoria não encontrada');
      }

      return category;
    } catch (error) {
      if (error instanceof Error) {
        // Re-throw validation errors as-is
        if (error.message.includes('ID da categoria é obrigatório') || 
            error.message.includes('Categoria não encontrada')) {
          throw error;
        }
        // Wrap repository errors
        throw new Error('Erro ao buscar categoria');
      }
      throw new Error('Erro ao buscar categoria');
    }
  }
}
