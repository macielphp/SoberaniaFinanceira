// Use Case: CreateCategoryUseCase
// Responsável por criar uma nova categoria

import { ICategoryRepository } from '../repositories/ICategoryRepository';
import { Category } from '../entities/Category';
import { Result, success, failure } from '../../shared/utils/Result';
import { EventBus } from '../../shared/events/EventBus';
import { DomainEventFactory } from '../events/DomainEvents';

// Input DTO for creating categories
export interface CreateCategoryRequest {
  name: string;
  type: 'income' | 'expense';
  isDefault?: boolean;
}

// Output DTO for the use case result
export interface CreateCategoryResponse {
  category: Category;
}

export class CreateCategoryUseCase {
  constructor(
    private categoryRepository: ICategoryRepository,
    private eventBus?: EventBus
  ) {}

  async execute(request: CreateCategoryRequest): Promise<Result<CreateCategoryResponse, Error>> {
    try {
      // Validate request
      const validationResult = this.validateRequest(request);
      if (validationResult.isFailure()) {
        return validationResult.match(
          () => failure<CreateCategoryResponse, Error>(new Error('Validation failed')),
          (error) => failure<CreateCategoryResponse, Error>(error)
        );
      }

      // Check if category with same name and type already exists
      const existingCategories = await this.categoryRepository.findByName(request.name);
      const nameExistsForSameType = existingCategories.some(
        cat => cat.name.toLowerCase() === request.name.toLowerCase() && cat.type === request.type
      );

      if (nameExistsForSameType) {
        return failure<CreateCategoryResponse, Error>(new Error('Category with this name already exists'));
      }

      // Create category entity
      const category = new Category({
        id: this.generateId(),
        name: request.name,
        type: request.type,
        isDefault: request.isDefault
      });

      // Save category
      const savedCategory = await this.categoryRepository.save(category);

      // Publish domain event if event bus is available
      if (this.eventBus) {
        const event = DomainEventFactory.createCategoryCreated(savedCategory);
        this.eventBus.publish('CategoryCreated', event);
      }

      return success<CreateCategoryResponse, Error>({
        category: savedCategory
      });

    } catch (error) {
      return failure<CreateCategoryResponse, Error>(
        new Error(`Failed to create category: ${error instanceof Error ? error.message : 'Unknown error'}`)
      );
    }
  }

  private validateRequest(request: CreateCategoryRequest): Result<void, Error> {
    // Validate name
    if (!request.name || request.name.trim() === '') {
      return failure<void, Error>(new Error('Category name cannot be empty'));
    }

    // Validate type
    if (!request.type || request.type.trim() === '') {
      return failure<void, Error>(new Error('Category type cannot be empty'));
    }

    const validTypes = ['income', 'expense'];
    if (!validTypes.includes(request.type)) {
      return failure<void, Error>(new Error('Invalid category type'));
    }

    return success<void, Error>(undefined);
  }

  private generateId(): string {
    return `cat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
} 