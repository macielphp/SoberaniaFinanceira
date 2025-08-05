// Use Case: GetCategoriesUseCase
// Responsável por buscar todas as categorias

import { ICategoryRepository } from '../repositories/ICategoryRepository';
import { Category } from '../entities/Category';
import { Result, success, failure } from '../../shared/utils/Result';

// Output DTO for the use case result
export interface GetCategoriesResponse {
  categories: Category[];
  total: number;
}

export class GetCategoriesUseCase {
  constructor(private categoryRepository: ICategoryRepository) {}

  async execute(): Promise<Result<GetCategoriesResponse, Error>> {
    try {
      // Get all categories from repository
      const categories = await this.categoryRepository.findAll();
      const total = await this.categoryRepository.count();

      return success<GetCategoriesResponse, Error>({
        categories,
        total
      });

    } catch (error) {
      return failure<GetCategoriesResponse, Error>(
        new Error(`Failed to get categories: ${error instanceof Error ? error.message : 'Unknown error'}`)
      );
    }
  }
} 