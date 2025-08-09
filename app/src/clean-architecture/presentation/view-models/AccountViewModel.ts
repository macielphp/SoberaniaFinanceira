import { Account } from '../../domain/entities/Account';
import { IAccountRepository } from '../../domain/repositories/IAccountRepository';
import { CreateAccountUseCase } from '../../domain/use-cases/CreateAccountUseCase';
import { UpdateAccountUseCase } from '../../domain/use-cases/UpdateAccountUseCase';
import { DeleteAccountUseCase } from '../../domain/use-cases/DeleteAccountUseCase';
import { GetAccountByIdUseCase } from '../../domain/use-cases/GetAccountByIdUseCase';
import { GetAccountsUseCase } from '../../domain/use-cases/GetAccountsUseCase';
import { Money } from '../../shared/utils/Money';

export interface CreateAccountData {
  name: string;
  type: 'corrente' | 'poupanca' | 'investimento' | 'cartao_credito' | 'dinheiro';
  balance: Money;
  description?: string;
  color?: string;
  isActive?: boolean;
  isDefault?: boolean;
}

export interface UpdateAccountData {
  name?: string;
  type?: 'corrente' | 'poupanca' | 'investimento' | 'cartao_credito' | 'dinheiro';
  balance?: Money;
  description?: string;
  color?: string;
  isActive?: boolean;
  isDefault?: boolean;
}

export class AccountViewModel {
  public loading: boolean = false;
  public error: string | null = null;
  public accounts: Account[] = [];

  private createAccountUseCase: CreateAccountUseCase;
  private updateAccountUseCase: UpdateAccountUseCase;
  private deleteAccountUseCase: DeleteAccountUseCase;
  private getAccountByIdUseCase: GetAccountByIdUseCase;
  private getAccountsUseCase: GetAccountsUseCase;

  constructor(accountRepository: IAccountRepository) {
    this.createAccountUseCase = new CreateAccountUseCase(accountRepository);
    this.updateAccountUseCase = new UpdateAccountUseCase(accountRepository);
    this.deleteAccountUseCase = new DeleteAccountUseCase(accountRepository);
    this.getAccountByIdUseCase = new GetAccountByIdUseCase(accountRepository);
    this.getAccountsUseCase = new GetAccountsUseCase(accountRepository);
  }

  async createAccount(data: CreateAccountData): Promise<Account> {
    try {
      this.loading = true;
      this.error = null;

      const result = await this.createAccountUseCase.execute({
        name: data.name,
        type: data.type,
        balance: data.balance,
        description: data.description,
        color: data.color,
      });

      return result.match(
        (response) => response.account,
        (error) => {
          this.error = error.message;
          throw error;
        }
      );
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Erro ao criar conta';
      throw error;
    } finally {
      this.loading = false;
    }
  }

  async updateAccount(accountId: string, data: UpdateAccountData): Promise<Account> {
    try {
      this.loading = true;
      this.error = null;

      const result = await this.updateAccountUseCase.execute(accountId, data);
      return result;
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Erro ao atualizar conta';
      throw error;
    } finally {
      this.loading = false;
    }
  }

  async deleteAccount(accountId: string): Promise<boolean> {
    try {
      this.loading = true;
      this.error = null;

      const result = await this.deleteAccountUseCase.execute({ id: accountId });
      return result.match(
        (response) => response.deleted,
        (error) => {
          this.error = error.message;
          throw error;
        }
      );
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Erro ao deletar conta';
      throw error;
    } finally {
      this.loading = false;
    }
  }

  async getAccountById(accountId: string): Promise<Account | null> {
    try {
      this.loading = true;
      this.error = null;

      const result = await this.getAccountByIdUseCase.execute({ id: accountId });
      return result.match(
        (response) => response.account,
        (error) => {
          this.error = error.message;
          throw error;
        }
      );
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Erro ao buscar conta';
      throw error;
    } finally {
      this.loading = false;
    }
  }

  async getAllAccounts(): Promise<Account[]> {
    try {
      this.loading = true;
      this.error = null;

      const result = await this.getAccountsUseCase.execute({});
      const accounts = result.match(
        (response) => response.accounts,
        (error) => {
          this.error = error.message;
          throw error;
        }
      );
      this.accounts = accounts;
      return accounts;
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Erro ao carregar contas';
      throw error;
    } finally {
      this.loading = false;
    }
  }

  // Getters for reactive properties
  get isLoading(): boolean {
    return this.loading;
  }

  setError(error: string): void {
    this.error = error;
  }

  clearError(): void {
    this.error = null;
  }

  setLoading(loading: boolean): void {
    this.loading = loading;
  }
}