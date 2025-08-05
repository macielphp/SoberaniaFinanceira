// Use Case: GetAccountsUseCase
// Responsável por buscar contas com filtros opcionais

import { IAccountRepository } from '../repositories/IAccountRepository';
import { Account } from '../entities/Account';
import { Result, success, failure } from '../../shared/utils/Result';

// Input DTO for getting accounts
export interface GetAccountsRequest {
  type?: string;
  name?: string;
  activeOnly?: boolean;
}

// Output DTO for the use case result
export interface GetAccountsResponse {
  accounts: Account[];
}

export class GetAccountsUseCase {
  constructor(private accountRepository: IAccountRepository) {}

  async execute(request: GetAccountsRequest): Promise<Result<GetAccountsResponse, Error>> {
    try {
      let accounts: Account[];

      // Apply filters based on request
      if (request.activeOnly) {
        accounts = await this.accountRepository.findActive();
      } else if (request.type) {
        accounts = await this.accountRepository.findByType(request.type);
      } else if (request.name) {
        accounts = await this.accountRepository.findByName(request.name);
      } else {
        accounts = await this.accountRepository.findAll();
      }

      // Apply additional filters if multiple are provided
      if (request.type && request.name) {
        const typeFiltered = await this.accountRepository.findByType(request.type);
        const nameFiltered = await this.accountRepository.findByName(request.name);
        accounts = typeFiltered.filter(acc => 
          nameFiltered.some(nameAcc => nameAcc.id === acc.id)
        );
      }

      if (request.type && request.activeOnly) {
        const typeFiltered = await this.accountRepository.findByType(request.type);
        const activeFiltered = await this.accountRepository.findActive();
        accounts = typeFiltered.filter(acc => 
          activeFiltered.some(activeAcc => activeAcc.id === acc.id)
        );
      }

      if (request.name && request.activeOnly) {
        const nameFiltered = await this.accountRepository.findByName(request.name);
        const activeFiltered = await this.accountRepository.findActive();
        accounts = nameFiltered.filter(acc => 
          activeFiltered.some(activeAcc => activeAcc.id === acc.id)
        );
      }

      // Apply all three filters if provided
      if (request.type && request.name && request.activeOnly) {
        const typeFiltered = await this.accountRepository.findByType(request.type);
        const nameFiltered = await this.accountRepository.findByName(request.name);
        const activeFiltered = await this.accountRepository.findActive();
        
        accounts = typeFiltered.filter(acc => 
          nameFiltered.some(nameAcc => nameAcc.id === acc.id) &&
          activeFiltered.some(activeAcc => activeAcc.id === acc.id)
        );
      }

      return success<GetAccountsResponse, Error>({
        accounts
      });

    } catch (error) {
      return failure<GetAccountsResponse, Error>(
        new Error(`Failed to get accounts: ${error instanceof Error ? error.message : 'Unknown error'}`)
      );
    }
  }
} 