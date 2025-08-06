import { IAccountRepository } from '../../domain/repositories/IAccountRepository';
import { Account, AccountProps } from '../../domain/entities/Account';

export class AccountViewModel {
  public accounts: Account[] = [];
  private accountRepository: IAccountRepository;

  constructor(accountRepository: IAccountRepository) {
    this.accountRepository = accountRepository;
  }

  async loadAccounts(): Promise<void> {
    this.accounts = await this.accountRepository.findAll();
  }

  async createAccount(accountProps: AccountProps): Promise<void> {
    const account = new Account(accountProps);
    await this.accountRepository.save(account);
    this.accounts = await this.accountRepository.findAll();
  }

  async updateAccount(accountProps: AccountProps): Promise<void> {
    const account = new Account(accountProps);
    await this.accountRepository.save(account);
    this.accounts = await this.accountRepository.findAll();
  }

  async deleteAccount(accountId: string): Promise<void> {
    await this.accountRepository.delete(accountId);
    this.accounts = await this.accountRepository.findAll();
  }
}