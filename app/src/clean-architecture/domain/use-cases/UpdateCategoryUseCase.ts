// Use Case: UpdateCategoryUseCase
// Responsável por atualizar uma categoria existente

import { ICategoryRepository } from '../repositories/ICategoryRepository';
import { Category } from '../entities/Category';
import { Result, success, failure } from '../../shared/utils/Result';
import { EventBus } from '../../shared/events/EventBus';
import { DomainEventFactory } from '../events/DomainEvents';

// Input DTO for updating categories
export interface UpdateCategoryRequest {
  id: string;
  name?: string;
  type?: 'income' | 'expense';
  isDefault?: boolean;
}

// Output DTO for the use case result
export interface UpdateCategoryResponse {
  category: Category;
}

export class UpdateCategoryUseCase {
  constructor(
    private categoryRepository: ICategoryRepository,
    private eventBus?: EventBus
  ) {}

  async execute(request: UpdateCategoryRequest): Promise<Result<UpdateCategoryResponse, Error>> {
    try {
      // Validate request
      const validationResult = this.validateRequest(request);
      if (validationResult.isFailure()) {
        return validationResult.match(
          () => failure<UpdateCategoryResponse, Error>(new Error('Validation failed')),
          (error) => failure<UpdateCategoryResponse, Error>(error)
        );
      }

      // Check if category exists
      const existingCategory = await this.categoryRepository.findById(request.id);
      if (!existingCategory) {
        return failure<UpdateCategoryResponse, Error>(new Error('Category not found'));
      }

      // Check if name already exists (if name is being updated)
      if (request.name && request.name !== existingCategory.name) {
        const categoriesWithSameName = await this.categoryRepository.findByName(request.name);
        const nameExistsForSameType = categoriesWithSameName.some(
          cat => cat.name.toLowerCase() === request.name!.toLowerCase() && 
                 cat.type === (request.type || existingCategory.type) &&
                 cat.id !== request.id
        );

        if (nameExistsForSameType) {
          return failure<UpdateCategoryResponse, Error>(new Error('Category with this name already exists'));
        }
      }

      // Create updated category
      const updatedCategory = new Category({
        id: existingCategory.id,
        name: request.name || existingCategory.name,
        type: request.type || existingCategory.type,
        isDefault: request.isDefault !== undefined ? request.isDefault : existingCategory.isDefault,
        createdAt: existingCategory.createdAt
      });

      // Save updated category
      const savedCategory = await this.categoryRepository.save(updatedCategory);

      // Publish domain event if event bus is available
      if (this.eventBus) {
        const event = DomainEventFactory.createCategoryUpdated(savedCategory);
        this.eventBus.publish('CategoryUpdated', event);
      }

      return success<UpdateCategoryResponse, Error>({
        category: savedCategory
      });

    } catch (error) {
      return failure<UpdateCategoryResponse, Error>(
        new Error(`Failed to update category: ${error instanceof Error ? error.message : 'Unknown error'}`)
      );
    }
  }

  private validateRequest(request: UpdateCategoryRequest): Result<void, Error> {
    // Validate id
    if (!request.id || request.id.trim() === '') {
      return failure<void, Error>(new Error('Category ID cannot be empty'));
    }

    // Validate name if provided
    if (request.name !== undefined) {
      if (request.name.trim() === '') {
        return failure<void, Error>(new Error('Category name cannot be empty'));
      }
    }

    // Validate type if provided
    if (request.type !== undefined) {
      const validTypes = ['income', 'expense'];
      if (!validTypes.includes(request.type)) {
        return failure<void, Error>(new Error('Invalid category type'));
      }
    }

    return success<void, Error>(undefined);
  }
} 