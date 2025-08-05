// Use Case: DeleteAccountUseCase
// Responsável por deletar uma conta existente

import { IAccountRepository } from '../repositories/IAccountRepository';
import { Result, success, failure } from '../../shared/utils/Result';

// Input DTO for deleting accounts
export interface DeleteAccountRequest {
  id: string;
}

// Output DTO for the use case result
export interface DeleteAccountResponse {
  deleted: boolean;
}

export class DeleteAccountUseCase {
  constructor(private accountRepository: IAccountRepository) {}

  async execute(request: DeleteAccountRequest): Promise<Result<DeleteAccountResponse, Error>> {
    try {
      // Validate request
      const validationResult = this.validateRequest(request);
      if (validationResult.isFailure()) {
        return validationResult.match(
          () => failure<DeleteAccountResponse, Error>(new Error('Validation failed')),
          (error) => failure<DeleteAccountResponse, Error>(error)
        );
      }

      // Check if account exists
      const existingAccount = await this.accountRepository.findById(request.id);
      if (!existingAccount) {
        return failure<DeleteAccountResponse, Error>(new Error('Account not found'));
      }

      // Delete account
      const deleted = await this.accountRepository.delete(request.id);

      if (!deleted) {
        return failure<DeleteAccountResponse, Error>(new Error('Account not found'));
      }

      return success<DeleteAccountResponse, Error>({
        deleted: true
      });

    } catch (error) {
      return failure<DeleteAccountResponse, Error>(
        new Error(`Failed to delete account: ${error instanceof Error ? error.message : 'Unknown error'}`)
      );
    }
  }

  private validateRequest(request: DeleteAccountRequest): Result<void, Error> {
    // Validate ID
    if (!request.id || request.id.trim() === '') {
      return failure<void, Error>(new Error('Account ID cannot be empty'));
    }

    return success<void, Error>(undefined);
  }
} 