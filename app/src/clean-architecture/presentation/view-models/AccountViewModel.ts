import { IAccountRepository } from '../../domain/repositories/IAccountRepository';
import { Account, AccountProps } from '../../domain/entities/Account';

export class AccountViewModel {
  public accounts: Account[] = [];
  public loading: boolean = false;
  public error: string | null = null;
  public selectedAccount: Account | null = null;
  private accountRepository: IAccountRepository;

  constructor(accountRepository: IAccountRepository) {
    this.accountRepository = accountRepository;
  }

  async loadAccounts(): Promise<void> {
    try {
      this.loading = true;
      this.error = null;
      this.accounts = await this.accountRepository.findAll();
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Erro ao carregar contas';
      throw error;
    } finally {
      this.loading = false;
    }
  }

  async createAccount(accountProps: AccountProps): Promise<void> {
    try {
      this.loading = true;
      this.error = null;
      const account = new Account(accountProps);
      await this.accountRepository.save(account);
      this.accounts = await this.accountRepository.findAll();
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Erro ao criar conta';
      throw error;
    } finally {
      this.loading = false;
    }
  }

  async updateAccount(accountId: string, accountProps: Partial<AccountProps>): Promise<void> {
    try {
      this.loading = true;
      this.error = null;
      const account = new Account({ id: accountId, ...accountProps } as AccountProps);
      await this.accountRepository.save(account);
      this.accounts = await this.accountRepository.findAll();
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Erro ao atualizar conta';
      throw error;
    } finally {
      this.loading = false;
    }
  }

  async deleteAccount(accountId: string): Promise<void> {
    try {
      this.loading = true;
      this.error = null;
      await this.accountRepository.delete(accountId);
      this.accounts = await this.accountRepository.findAll();
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Erro ao deletar conta';
      throw error;
    } finally {
      this.loading = false;
    }
  }

  getAccounts(): Account[] {
    return this.accounts;
  }

  setSelectedAccount(account: Account | null): void {
    this.selectedAccount = account;
  }

  clearError(): void {
    this.error = null;
  }

  setLoading(loading: boolean): void {
    this.loading = loading;
  }
}