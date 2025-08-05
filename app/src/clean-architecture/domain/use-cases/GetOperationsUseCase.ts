// Use Case: GetOperationsUseCase
// Responsável por buscar operações com filtros opcionais

import { IOperationRepository } from '../repositories/IOperationRepository';
import { Operation } from '../entities/Operation';
import { Result, success, failure } from '../../shared/utils/Result';

// Input DTO for getting operations
export interface GetOperationsRequest {
  startDate?: Date;
  endDate?: Date;
  accountId?: string;
  category?: string;
}

// Output DTO for the use case result
export interface GetOperationsResponse {
  operations: Operation[];
}

export class GetOperationsUseCase {
  constructor(private operationRepository: IOperationRepository) {}

  async execute(request: GetOperationsRequest): Promise<Result<GetOperationsResponse, Error>> {
    try {
      let operations: Operation[];

      // Apply filters based on request
      if (request.startDate && request.endDate) {
        operations = await this.operationRepository.findByDateRange(request.startDate, request.endDate);
      } else if (request.accountId) {
        operations = await this.operationRepository.findByAccount(request.accountId);
      } else if (request.category) {
        operations = await this.operationRepository.findByCategory(request.category);
      } else {
        operations = await this.operationRepository.findAll();
      }

      // Apply additional filters if multiple are provided
      if (request.startDate && request.endDate && request.accountId) {
        const dateFiltered = await this.operationRepository.findByDateRange(request.startDate, request.endDate);
        const accountFiltered = await this.operationRepository.findByAccount(request.accountId);
        operations = dateFiltered.filter(op => 
          accountFiltered.some(accountOp => accountOp.id === op.id)
        );
      }

      if (request.startDate && request.endDate && request.category) {
        const dateFiltered = await this.operationRepository.findByDateRange(request.startDate, request.endDate);
        const categoryFiltered = await this.operationRepository.findByCategory(request.category);
        operations = dateFiltered.filter(op => 
          categoryFiltered.some(categoryOp => categoryOp.id === op.id)
        );
      }

      if (request.accountId && request.category) {
        const accountFiltered = await this.operationRepository.findByAccount(request.accountId);
        const categoryFiltered = await this.operationRepository.findByCategory(request.category);
        operations = accountFiltered.filter(op => 
          categoryFiltered.some(categoryOp => categoryOp.id === op.id)
        );
      }

      // Apply all three filters if provided
      if (request.startDate && request.endDate && request.accountId && request.category) {
        const dateFiltered = await this.operationRepository.findByDateRange(request.startDate, request.endDate);
        const accountFiltered = await this.operationRepository.findByAccount(request.accountId);
        const categoryFiltered = await this.operationRepository.findByCategory(request.category);
        
        operations = dateFiltered.filter(op => 
          accountFiltered.some(accountOp => accountOp.id === op.id) &&
          categoryFiltered.some(categoryOp => categoryOp.id === op.id)
        );
      }

      return success<GetOperationsResponse, Error>({
        operations
      });

    } catch (error) {
      return failure<GetOperationsResponse, Error>(
        new Error(`Failed to get operations: ${error instanceof Error ? error.message : 'Unknown error'}`)
      );
    }
  }
} 