// Use Case: UpdateOperationUseCase
// Responsável por atualizar uma operação existente

import { IOperationRepository } from '../repositories/IOperationRepository';
import { Operation } from '../entities/Operation';
import { Result, success, failure } from '../../shared/utils/Result';

// Input DTO for updating operations
export interface UpdateOperationRequest {
  id: string;
  nature: 'despesa' | 'receita';
  state: 'pagar' | 'pago' | 'receber' | 'recebido';
  paymentMethod: 'Cartão de crédito' | 'Cartão de débito' | 'Pix' | 'TED' | 'Estorno' | 'Transferência bancária';
  sourceAccount: string;
  destinationAccount: string;
  date: Date;
  value: any; // Money object
  category: string;
  details?: string;
  project?: string;
}

// Output DTO for the use case result
export interface UpdateOperationResponse {
  operation: Operation;
}

export class UpdateOperationUseCase {
  constructor(private operationRepository: IOperationRepository) {}

  async execute(request: UpdateOperationRequest): Promise<Result<UpdateOperationResponse, Error>> {
    try {
      // Find existing operation
      const existingOperation = await this.operationRepository.findById(request.id);
      if (!existingOperation) {
        return failure<UpdateOperationResponse, Error>(new Error('Operation not found'));
      }

      // Validate request
      const validationResult = this.validateRequest(request);
      if (validationResult.isFailure()) {
        return validationResult.match(
          () => failure<UpdateOperationResponse, Error>(new Error('Validation failed')),
          (error) => failure<UpdateOperationResponse, Error>(error)
        );
      }

      // Create updated operation entity
      const updatedOperation = new Operation({
        id: existingOperation.id, // Preserve original ID
        nature: request.nature,
        state: request.state,
        paymentMethod: request.paymentMethod,
        sourceAccount: request.sourceAccount,
        destinationAccount: request.destinationAccount,
        date: request.date,
        value: request.value,
        category: request.category,
        details: request.details ?? existingOperation.details,
        project: request.project ?? existingOperation.project,
        createdAt: existingOperation.createdAt // Preserve original creation date
      });

      // Save updated operation
      const savedOperation = await this.operationRepository.save(updatedOperation);

      return success<UpdateOperationResponse, Error>({
        operation: savedOperation
      });

    } catch (error) {
      return failure<UpdateOperationResponse, Error>(
        new Error(`Failed to update operation: ${error instanceof Error ? error.message : 'Unknown error'}`)
      );
    }
  }

  private validateRequest(request: UpdateOperationRequest): Result<void, Error> {
    // Validate nature
    if (!['despesa', 'receita'].includes(request.nature)) {
      return failure<void, Error>(new Error('Invalid nature'));
    }

    // Validate state
    if (!['pagar', 'pago', 'receber', 'recebido'].includes(request.state)) {
      return failure<void, Error>(new Error('Invalid state'));
    }

    // Validate payment method
    if (!['Cartão de crédito', 'Cartão de débito', 'Pix', 'TED', 'Estorno', 'Transferência bancária'].includes(request.paymentMethod)) {
      return failure<void, Error>(new Error('Invalid payment method'));
    }

    // Validate source account
    if (!request.sourceAccount || request.sourceAccount.trim() === '') {
      return failure<void, Error>(new Error('Source account cannot be empty'));
    }

    // Validate destination account
    if (!request.destinationAccount || request.destinationAccount.trim() === '') {
      return failure<void, Error>(new Error('Destination account cannot be empty'));
    }

    // Validate category
    if (!request.category || request.category.trim() === '') {
      return failure<void, Error>(new Error('Category cannot be empty'));
    }

    // Validate state compatibility with nature
    if (request.nature === 'despesa' && !['pagar', 'pago', 'transferir', 'transferido'].includes(request.state)) {
      return failure<void, Error>(new Error(`State "${request.state}" is not compatible with nature "${request.nature}"`));
    }

    if (request.nature === 'receita' && !['receber', 'recebido'].includes(request.state)) {
      return failure<void, Error>(new Error(`State "${request.state}" is not compatible with nature "${request.nature}"`));
    }

    return success<void, Error>(undefined);
  }
} 