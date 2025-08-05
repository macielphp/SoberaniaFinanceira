// Use Case: DeleteOperationUseCase
// Responsável por deletar uma operação existente

import { IOperationRepository } from '../repositories/IOperationRepository';
import { Result, success, failure } from '../../shared/utils/Result';

// Input DTO for deleting operations
export interface DeleteOperationRequest {
  id: string;
}

// Output DTO for the use case result
export interface DeleteOperationResponse {
  deleted: boolean;
}

export class DeleteOperationUseCase {
  constructor(private operationRepository: IOperationRepository) {}

  async execute(request: DeleteOperationRequest): Promise<Result<DeleteOperationResponse, Error>> {
    try {
      // Validate request
      const validationResult = this.validateRequest(request);
      if (validationResult.isFailure()) {
        return validationResult.match(
          () => failure<DeleteOperationResponse, Error>(new Error('Validation failed')),
          (error) => failure<DeleteOperationResponse, Error>(error)
        );
      }

      // Check if operation exists
      const existingOperation = await this.operationRepository.findById(request.id);
      if (!existingOperation) {
        return failure<DeleteOperationResponse, Error>(new Error('Operation not found'));
      }

      // Delete operation
      const deleted = await this.operationRepository.delete(request.id);

      if (!deleted) {
        return failure<DeleteOperationResponse, Error>(new Error('Operation not found'));
      }

      return success<DeleteOperationResponse, Error>({
        deleted: true
      });

    } catch (error) {
      return failure<DeleteOperationResponse, Error>(
        new Error(`Failed to delete operation: ${error instanceof Error ? error.message : 'Unknown error'}`)
      );
    }
  }

  private validateRequest(request: DeleteOperationRequest): Result<void, Error> {
    // Validate ID
    if (!request.id || request.id.trim() === '') {
      return failure<void, Error>(new Error('Operation ID cannot be empty'));
    }

    return success<void, Error>(undefined);
  }
} 