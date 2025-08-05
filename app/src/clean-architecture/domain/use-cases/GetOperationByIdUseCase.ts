// Use Case: GetOperationByIdUseCase
// Responsável por buscar uma operação específica por ID

import { IOperationRepository } from '../repositories/IOperationRepository';
import { Operation } from '../entities/Operation';
import { Result, success, failure } from '../../shared/utils/Result';

// Input DTO for getting operation by ID
export interface GetOperationByIdRequest {
  id: string;
}

// Output DTO for the use case result
export interface GetOperationByIdResponse {
  operation: Operation | null;
}

export class GetOperationByIdUseCase {
  constructor(private operationRepository: IOperationRepository) {}

  async execute(request: GetOperationByIdRequest): Promise<Result<GetOperationByIdResponse, Error>> {
    try {
      // Validate request
      const validationResult = this.validateRequest(request);
      if (validationResult.isFailure()) {
        return validationResult.match(
          () => failure<GetOperationByIdResponse, Error>(new Error('Validation failed')),
          (error) => failure<GetOperationByIdResponse, Error>(error)
        );
      }

      // Find operation by ID
      const operation = await this.operationRepository.findById(request.id);

      return success<GetOperationByIdResponse, Error>({
        operation
      });

    } catch (error) {
      return failure<GetOperationByIdResponse, Error>(
        new Error(`Failed to get operation: ${error instanceof Error ? error.message : 'Unknown error'}`)
      );
    }
  }

  private validateRequest(request: GetOperationByIdRequest): Result<void, Error> {
    // Validate ID
    if (!request.id || request.id.trim() === '') {
      return failure<void, Error>(new Error('Operation ID cannot be empty'));
    }

    return success<void, Error>(undefined);
  }
} 