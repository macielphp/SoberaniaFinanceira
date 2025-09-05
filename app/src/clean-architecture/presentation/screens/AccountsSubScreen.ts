// Screen: AccountsSubScreen
// Responsável por gerenciar o estado e lógica de apresentação para gerenciamento de contas
// Integra com AccountViewModel

import { AccountViewModel } from '../view-models/AccountViewModel';
import { Account, AccountType } from '../../domain/entities/Account';
import { Money } from '../../shared/utils/Money';

// Types for account data
export interface AccountData {
  name: string;
  type: AccountType;
  balance: Money;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface AccountsStatistics {
  total: number;
  active: number;
  inactive: number;
  totalBalance: number;
  byType: {
    corrente: number;
    poupanca: number;
    investimento: number;
    cartao_credito: number;
    dinheiro: number;
  };
}

export class AccountsSubScreen {
  private _showForm: boolean = false;
  private editingAccount: Account | null = null;

  constructor(
    private accountViewModel: AccountViewModel
  ) {}

  // Getters
  getAccounts(): Account[] {
    return this.accountViewModel.accounts || [];
  }

  getLoading(): boolean {
    return this.accountViewModel.isLoading;
  }

  getError(): string | null {
    return this.accountViewModel.error;
  }

  getShowForm(): boolean {
    return this._showForm;
  }

  getEditingAccount(): Account | null {
    return this.editingAccount;
  }

  // Account management
  async createAccount(data: AccountData): Promise<Account> {
    try {
      this.accountViewModel.setLoading(true);
      this.accountViewModel.clearError();

      const result = await this.accountViewModel.createAccount(data);
      this.hideForm();
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar conta';
      this.accountViewModel.setError(errorMessage);
      throw error;
    } finally {
      this.accountViewModel.setLoading(false);
    }
  }

  async updateAccount(accountId: string, data: AccountData): Promise<Account> {
    try {
      this.accountViewModel.setLoading(true);
      this.accountViewModel.clearError();

      const result = await this.accountViewModel.updateAccount(accountId, data);
      this.hideForm();
      this.editingAccount = null;
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar conta';
      this.accountViewModel.setError(errorMessage);
      throw error;
    } finally {
      this.accountViewModel.setLoading(false);
    }
  }

  async deleteAccount(accountId: string): Promise<boolean> {
    try {
      this.accountViewModel.setLoading(true);
      this.accountViewModel.clearError();

      const result = await this.accountViewModel.deleteAccount(accountId);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao deletar conta';
      this.accountViewModel.setError(errorMessage);
      throw error;
    } finally {
      this.accountViewModel.setLoading(false);
    }
  }

  // Form management
  showForm(): void {
    this._showForm = true;
    this.editingAccount = null;
  }

  editAccount(account: Account): void {
    this._showForm = true;
    this.editingAccount = account;
  }

  hideForm(): void {
    this._showForm = false;
    this.editingAccount = null;
  }

  cancelEdit(): void {
    this.hideForm();
  }

  // Filtering and search
  filterAccountsByType(type: AccountType): Account[] {
    return this.getAccounts().filter(account => account.type === type);
  }

  searchAccounts(query: string): Account[] {
    if (!query.trim()) {
      return this.getAccounts();
    }

    const searchTerm = query.toLowerCase();
    return this.getAccounts().filter(account =>
      account.name.toLowerCase().includes(searchTerm)
    );
  }

  getAccountsByType(): { [key in AccountType]: number } {
    const accounts = this.getAccounts();
    const counts = {
      corrente: 0,
      poupanca: 0,
      investimento: 0,
      cartao_credito: 0,
      dinheiro: 0,
    };

    accounts.forEach(account => {
      counts[account.type]++;
    });

    return counts;
  }

  // Validation
  validateAccountData(data: AccountData): ValidationResult {
    const errors: Record<string, string> = {};

    // Validar nome
    if (!data.name || data.name.trim() === '') {
      errors.name = 'Nome é obrigatório';
    }

    // Validar tipo
    if (!data.type) {
      errors.type = 'Tipo é obrigatório';
    }

    // Validar saldo
    if (data.balance.value < 0) {
      errors.balance = 'Saldo não pode ser negativo';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  // Error handling
  clearErrors(): void {
    this.accountViewModel.clearError();
  }

  // Statistics
  getTotalAccountsCount(): number {
    return this.getAccounts().length;
  }

  getActiveAccountsCount(): number {
    return this.getAccounts().filter(account => account.isActive).length;
  }

  getTotalBalance(): number {
    return this.getAccounts().reduce((total, account) => {
      return total + account.balance.value;
    }, 0);
  }

  getAccountsStatistics(): AccountsStatistics {
    const accounts = this.getAccounts();
    const byType = this.getAccountsByType();

    return {
      total: accounts.length,
      active: accounts.filter(account => account.isActive).length,
      inactive: accounts.filter(account => !account.isActive).length,
      totalBalance: this.getTotalBalance(),
      byType,
    };
  }

  // Lifecycle
  async onMount(): Promise<void> {
    try {
      this.accountViewModel.setLoading(true);
      this.accountViewModel.clearError();

      await this.accountViewModel.getAllAccounts();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar contas';
      this.accountViewModel.setError(errorMessage);
    } finally {
      this.accountViewModel.setLoading(false);
    }
  }
}
