// Use Case: UpdateAccountUseCase
// Responsável por atualizar uma conta existente

import { IAccountRepository } from '../repositories/IAccountRepository';
import { Account } from '../entities/Account';
import { Result, success, failure } from '../../shared/utils/Result';
import { EventBus } from '../../shared/events/EventBus';
import { DomainEventFactory } from '../events/DomainEvents';

// Input DTO for updating accounts
export interface UpdateAccountRequest {
  id: string;
  name: string;
  type: 'corrente' | 'poupanca' | 'investimento' | 'cartao_credito' | 'dinheiro';
  balance: any; // Money object
  description?: string;
  color?: string;
}

// Output DTO for the use case result
export interface UpdateAccountResponse {
  account: Account;
}

export class UpdateAccountUseCase {
  constructor(
    private accountRepository: IAccountRepository,
    private eventBus?: EventBus
  ) {}

  async execute(request: UpdateAccountRequest): Promise<Result<UpdateAccountResponse, Error>> {
    try {
      // Find existing account
      const existingAccount = await this.accountRepository.findById(request.id);
      if (!existingAccount) {
        return failure<UpdateAccountResponse, Error>(new Error('Account not found'));
      }

      // Validate request
      const validationResult = this.validateRequest(request);
      if (validationResult.isFailure()) {
        return validationResult.match(
          () => failure<UpdateAccountResponse, Error>(new Error('Validation failed')),
          (error) => failure<UpdateAccountResponse, Error>(error)
        );
      }

      // Check if account name already exists for different account
      const accountsWithSameName = await this.accountRepository.findByName(request.name);
      const nameExistsForDifferentAccount = accountsWithSameName.some(
        acc => acc.id !== request.id && acc.name.toLowerCase() === request.name.toLowerCase()
      );

      if (nameExistsForDifferentAccount) {
        return failure<UpdateAccountResponse, Error>(new Error('Account with this name already exists'));
      }

      // Create updated account entity
      const updatedAccount = new Account({
        id: existingAccount.id, // Preserve original ID
        name: request.name,
        type: request.type,
        balance: request.balance,
        description: request.description ?? existingAccount.description,
        color: request.color ?? existingAccount.color,
        createdAt: existingAccount.createdAt // Preserve original creation date
      });

      // Save updated account
      const savedAccount = await this.accountRepository.save(updatedAccount);

      // Publish domain event if event bus is available
      if (this.eventBus) {
        const event = DomainEventFactory.createAccountUpdated(savedAccount);
        this.eventBus.publish('AccountUpdated', event);
      }

      return success<UpdateAccountResponse, Error>({
        account: savedAccount
      });

    } catch (error) {
      return failure<UpdateAccountResponse, Error>(
        new Error(`Failed to update account: ${error instanceof Error ? error.message : 'Unknown error'}`)
      );
    }
  }

  private validateRequest(request: UpdateAccountRequest): Result<void, Error> {
    // Validate name
    if (!request.name || request.name.trim() === '') {
      return failure<void, Error>(new Error('Account name cannot be empty'));
    }

    // Validate type
    if (!request.type || request.type.trim() === '') {
      return failure<void, Error>(new Error('Account type cannot be empty'));
    }

    const validTypes = ['corrente', 'poupanca', 'investimento', 'cartao_credito', 'dinheiro'];
    if (!validTypes.includes(request.type)) {
      return failure<void, Error>(new Error('Invalid account type'));
    }

    // Validate balance
    if (request.balance.value < 0) {
      return failure<void, Error>(new Error('Account balance cannot be negative'));
    }

    return success<void, Error>(undefined);
  }
} 