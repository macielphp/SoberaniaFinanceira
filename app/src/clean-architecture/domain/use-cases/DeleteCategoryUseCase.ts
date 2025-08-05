// Use Case: DeleteCategoryUseCase
// Responsável por deletar uma categoria existente

import { ICategoryRepository } from '../repositories/ICategoryRepository';
import { Result, success, failure } from '../../shared/utils/Result';

// Output DTO for the use case result
export interface DeleteCategoryResponse {
  success: boolean;
}

export class DeleteCategoryUseCase {
  constructor(private categoryRepository: ICategoryRepository) {}

  async execute(id: string): Promise<Result<DeleteCategoryResponse, Error>> {
    try {
      // Validate id
      if (!id || typeof id !== 'string' || id.trim() === '') {
        return failure<DeleteCategoryResponse, Error>(new Error('Category ID cannot be empty'));
      }

      // Check if category exists
      const category = await this.categoryRepository.findById(id);
      if (!category) {
        // Not found, but not an error (idempotent)
        return success<DeleteCategoryResponse, Error>({ success: false });
      }

      // Try to delete
      const deleted = await this.categoryRepository.delete(id);
      return success<DeleteCategoryResponse, Error>({ success: deleted });
    } catch (error) {
      return failure<DeleteCategoryResponse, Error>(
        new Error(`Failed to delete category${error instanceof Error ? ': ' + error.message : ''}`)
      );
    }
  }
}