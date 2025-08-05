// Use Case: GetAccountByIdUseCase
// Responsável por buscar uma conta específica por ID

import { IAccountRepository } from '../repositories/IAccountRepository';
import { Account } from '../entities/Account';
import { Result, success, failure } from '../../shared/utils/Result';

// Input DTO for getting account by ID
export interface GetAccountByIdRequest {
  id: string;
}

// Output DTO for the use case result
export interface GetAccountByIdResponse {
  account: Account | null;
}

export class GetAccountByIdUseCase {
  constructor(private accountRepository: IAccountRepository) {}

  async execute(request: GetAccountByIdRequest): Promise<Result<GetAccountByIdResponse, Error>> {
    try {
      // Validate request
      const validationResult = this.validateRequest(request);
      if (validationResult.isFailure()) {
        return validationResult.match(
          () => failure<GetAccountByIdResponse, Error>(new Error('Validation failed')),
          (error) => failure<GetAccountByIdResponse, Error>(error)
        );
      }

      // Find account by ID
      const account = await this.accountRepository.findById(request.id);

      return success<GetAccountByIdResponse, Error>({
        account
      });

    } catch (error) {
      return failure<GetAccountByIdResponse, Error>(
        new Error(`Failed to get account: ${error instanceof Error ? error.message : 'Unknown error'}`)
      );
    }
  }

  private validateRequest(request: GetAccountByIdRequest): Result<void, Error> {
    // Validate ID
    if (!request.id || request.id.trim() === '') {
      return failure<void, Error>(new Error('Account ID cannot be empty'));
    }

    return success<void, Error>(undefined);
  }
} 