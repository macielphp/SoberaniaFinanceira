// Use Case: CreateOperationUseCase
// Responsável por criar uma nova operação financeira

import { IOperationRepository } from '../repositories/IOperationRepository';
import { Operation } from '../entities/Operation';
import { Result, success, failure } from '../../shared/utils/Result';
import { Money } from '../../shared/utils/Money';

// Input DTO for creating an operation
export interface CreateOperationRequest {
  nature: 'receita' | 'despesa';
  state: 'receber' | 'recebido' | 'pagar' | 'pago';
  paymentMethod: 'Cartão de débito' | 'Cartão de crédito' | 'Pix' | 'TED' | 'Estorno' | 'Transferência bancária';
  sourceAccount: string;
  destinationAccount: string;
  date: Date;
  value: Money;
  category: string;
  details?: string;
  project?: string;
}

// Output DTO for the use case result
export interface CreateOperationResponse {
  operation: Operation;
}

export class CreateOperationUseCase {
  constructor(private operationRepository: IOperationRepository) {}

  async execute(request: CreateOperationRequest): Promise<Result<CreateOperationResponse, Error>> {
    try {
      // Validate input data
      const validationResult = this.validateRequest(request);
      if (validationResult.isFailure()) {
        // Get the specific error message from validation
        const errorMessage = this.getValidationErrorMessage(request);
        return failure<CreateOperationResponse, Error>(new Error(errorMessage));
      }

      // Create operation entity
      const operation = new Operation({
        id: this.generateId(),
        nature: request.nature,
        state: request.state,
        paymentMethod: request.paymentMethod,
        sourceAccount: request.sourceAccount,
        destinationAccount: request.destinationAccount,
        date: request.date,
        value: request.value,
        category: request.category,
        details: request.details,
        project: request.project,
        createdAt: new Date()
      });

      // Save to repository
      const savedOperation = await this.operationRepository.save(operation);

      return success<CreateOperationResponse, Error>({
        operation: savedOperation
      });

    } catch (error) {
      return failure<CreateOperationResponse, Error>(
        new Error(`Failed to create operation: ${error instanceof Error ? error.message : 'Unknown error'}`)
      );
    }
  }

  private validateRequest(request: CreateOperationRequest): Result<void, Error> {
    // Validate nature
    if (!['receita', 'despesa'].includes(request.nature)) {
      return failure<void, Error>(new Error(`Invalid nature: ${request.nature}`));
    }

    // Validate state
    if (!['receber', 'recebido', 'pagar', 'pago'].includes(request.state)) {
      return failure<void, Error>(new Error(`Invalid state: ${request.state}`));
    }

    // Validate payment method
    const validPaymentMethods = [
      'Cartão de débito',
      'Cartão de crédito',
      'Pix',
      'TED',
      'Estorno',
      'Transferência bancária'
    ];
    if (!validPaymentMethods.includes(request.paymentMethod)) {
      return failure<void, Error>(new Error(`Invalid payment method: ${request.paymentMethod}`));
    }

    // Validate accounts
    if (!request.sourceAccount || request.sourceAccount.trim() === '') {
      return failure<void, Error>(new Error('Source account cannot be empty'));
    }

    if (!request.destinationAccount || request.destinationAccount.trim() === '') {
      return failure<void, Error>(new Error('Destination account cannot be empty'));
    }

    // Validate category
    if (!request.category || request.category.trim() === '') {
      return failure<void, Error>(new Error('Category cannot be empty'));
    }

    // Validate state compatibility with nature
    const isCompatible = this.isStateCompatibleWithNature(request.nature, request.state);
    if (!isCompatible) {
      return failure<void, Error>(
        new Error(`State "${request.state}" is not compatible with nature "${request.nature}"`)
      );
    }

    return success<void, Error>(undefined);
  }

  private isStateCompatibleWithNature(nature: string, state: string): boolean {
    const compatibilityMap = {
      receita: ['receber', 'recebido'],
      despesa: ['pagar', 'pago'],
      transferencia: ['transferir', 'transferido']
    };

    // Handle transfer operations
    if (state === 'transferir' || state === 'transferido') {
      return true; // Transfer operations are compatible with any nature
    }

    const compatibleStates = compatibilityMap[nature as keyof typeof compatibilityMap];
    return compatibleStates ? compatibleStates.includes(state) : false;
  }

  private generateId(): string {
    return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getValidationErrorMessage(request: CreateOperationRequest): string {
    // Validate nature
    if (!['receita', 'despesa'].includes(request.nature)) {
      return `Invalid nature: ${request.nature}`;
    }

    // Validate state
    if (!['receber', 'recebido', 'pagar', 'pago', 'transferir', 'transferido'].includes(request.state)) {
      return `Invalid state: ${request.state}`;
    }

    // Validate payment method
    const validPaymentMethods = [
      'Cartão de débito',
      'Cartão de crédito',
      'Pix',
      'TED',
      'Estorno',
      'Transferência bancária'
    ];
    if (!validPaymentMethods.includes(request.paymentMethod)) {
      return `Invalid payment method: ${request.paymentMethod}`;
    }

    // Validate accounts
    if (!request.sourceAccount || request.sourceAccount.trim() === '') {
      return 'Source account cannot be empty';
    }

    if (!request.destinationAccount || request.destinationAccount.trim() === '') {
      return 'Destination account cannot be empty';
    }

    // Validate category
    if (!request.category || request.category.trim() === '') {
      return 'Category cannot be empty';
    }

    // Validate state compatibility with nature
    const isCompatible = this.isStateCompatibleWithNature(request.nature, request.state);
    if (!isCompatible) {
      return `State "${request.state}" is not compatible with nature "${request.nature}"`;
    }

    return 'Validation failed';
  }
} 