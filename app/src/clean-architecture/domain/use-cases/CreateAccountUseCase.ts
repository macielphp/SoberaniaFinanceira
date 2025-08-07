// Use Case: CreateAccountUseCase
// Responsável por criar uma nova conta

import { IAccountRepository } from '../repositories/IAccountRepository';
import { Account } from '../entities/Account';
import { Result, success, failure } from '../../shared/utils/Result';
import { EventBus } from '../../shared/events/EventBus';
import { DomainEventFactory } from '../events/DomainEvents';

// Input DTO for creating accounts
export interface CreateAccountRequest {
  name: string;
  type: 'corrente' | 'poupanca' | 'investimento' | 'cartao_credito' | 'dinheiro';
  balance: any; // Money object
  description?: string;
  color?: string;
}

// Output DTO for the use case result
export interface CreateAccountResponse {
  account: Account;
}

export class CreateAccountUseCase {
  constructor(
    private accountRepository: IAccountRepository,
    private eventBus?: EventBus
  ) {}

  async execute(request: CreateAccountRequest): Promise<Result<CreateAccountResponse, Error>> {
    try {
      // Validate request
      const validationResult = this.validateRequest(request);
      if (validationResult.isFailure()) {
        return validationResult.match(
          () => failure<CreateAccountResponse, Error>(new Error('Validation failed')),
          (error) => failure<CreateAccountResponse, Error>(error)
        );
      }

      // Check if account with same name already exists
      const existingAccounts = await this.accountRepository.findByName(request.name);
      if (existingAccounts.length > 0) {
        return failure<CreateAccountResponse, Error>(new Error('Account with this name already exists'));
      }

      // Create account entity
      const account = new Account({
        id: this.generateId(),
        name: request.name,
        type: request.type,
        balance: request.balance,
        description: request.description,
        color: request.color
      });

      // Save account
      const savedAccount = await this.accountRepository.save(account);

      // Publish domain event if event bus is available
      if (this.eventBus) {
        const event = DomainEventFactory.createAccountCreated(savedAccount);
        this.eventBus.publish('AccountCreated', event);
      }

      return success<CreateAccountResponse, Error>({
        account: savedAccount
      });

    } catch (error) {
      return failure<CreateAccountResponse, Error>(
        new Error(`Failed to create account: ${error instanceof Error ? error.message : 'Unknown error'}`)
      );
    }
  }

  private validateRequest(request: CreateAccountRequest): Result<void, Error> {
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

  private generateId(): string {
    return `acc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
} 