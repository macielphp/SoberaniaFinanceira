// Screen: RegisterScreen
// Responsável por gerenciar o estado e lógica de apresentação para a tela de registro
// Composição de 5 subtelas: register, manage, settings, categories, accounts

import { OperationViewModel } from '../view-models/OperationViewModel';
import { CategoryViewModel } from '../view-models/CategoryViewModel';
import { AccountViewModel } from '../view-models/AccountViewModel';

export type ViewMode = 'register' | 'manage' | 'settings' | 'categories' | 'accounts';

export class RegisterScreen {
  private currentView: ViewMode = 'register';
  private showAccountForm: boolean = false;
  private showCategoryForm: boolean = false;
  private editingAccount: any = undefined;
  private editingCategory: any = undefined;
  private editingOperation: any = undefined;
  
  // Filter states
  private selectedNature: string | undefined = undefined;
  private selectedState: string | undefined = undefined;
  private selectedCategory: string | undefined = undefined;
  private selectedAccount: string | undefined = undefined;
  private selectedStartDate: Date | null = null;
  private selectedEndDate: Date | null = null;

  constructor(
    private operationViewModel: OperationViewModel,
    private categoryViewModel: CategoryViewModel,
    private accountViewModel: AccountViewModel
  ) {}

  // Getters
  getCurrentView(): ViewMode { return this.currentView; }
  getShowAccountForm(): boolean { return this.showAccountForm; }
  getShowCategoryForm(): boolean { return this.showCategoryForm; }
  getEditingAccount(): any { return this.editingAccount; }
  getEditingCategory(): any { return this.editingCategory; }
  getEditingOperation(): any { return this.editingOperation; }
  getSelectedNature(): string | undefined { return this.selectedNature; }
  getSelectedState(): string | undefined { return this.selectedState; }
  getSelectedCategory(): string | undefined { return this.selectedCategory; }
  getSelectedAccount(): string | undefined { return this.selectedAccount; }
  getSelectedStartDate(): Date | null { return this.selectedStartDate; }
  getSelectedEndDate(): Date | null { return this.selectedEndDate; }

  // Setters
  setCurrentView(view: ViewMode): void { 
    this.currentView = view; 
    this.clearErrors();
    if (view !== 'register') {
      this.setEditingOperation(undefined);
    }
  }
  setShowAccountForm(show: boolean): void { this.showAccountForm = show; }
  setShowCategoryForm(show: boolean): void { this.showCategoryForm = show; }
  setEditingAccount(account: any): void { this.editingAccount = account; }
  setEditingCategory(category: any): void { this.editingCategory = category; }
  setEditingOperation(operation: any): void { this.editingOperation = operation; }
  setSelectedNature(nature: string | undefined): void { this.selectedNature = nature; }
  setSelectedState(state: string | undefined): void { this.selectedState = state; }
  setSelectedCategory(category: string | undefined): void { this.selectedCategory = category; }
  setSelectedAccount(account: string | undefined): void { this.selectedAccount = account; }
  setSelectedStartDate(date: Date | null): void { this.selectedStartDate = date; }
  setSelectedEndDate(date: Date | null): void { this.selectedEndDate = date; }

  // Lifecycle
  async onMount(): Promise<void> {
    await Promise.all([
      this.operationViewModel.loadOperations(),
      this.categoryViewModel.loadCategories(),
      this.accountViewModel.getAllAccounts()
    ]);
  }

  // Operation Management
  handleOperationSuccess(operation: any): void {
    this.setEditingOperation(undefined);
    this.setCurrentView('register');
  }

  handleEditOperation(operationId: string): void {
    const operation = this.operationViewModel.operations.find(op => op.id === operationId);
    if (operation) {
      this.setEditingOperation(operation);
      this.setCurrentView('register');
    }
  }

  async handleDeleteOperation(id: string, description: string): Promise<void> {
    await this.operationViewModel.deleteOperation(id);
  }

  // Category Management
  handleCreateCategory(): void {
    this.setEditingCategory(undefined);
    this.setShowCategoryForm(true);
  }

  handleEditCategory(category: any): void {
    this.setEditingCategory(category);
    this.setShowCategoryForm(true);
  }

  async handleCategorySubmit(name: string, type: 'income' | 'expense'): Promise<boolean> {
    try {
      if (this.editingCategory) {
        await this.categoryViewModel.updateCategory({ name, type });
      } else {
        await this.categoryViewModel.createCategory({ name, type });
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  handleCategoryCancel(): void {
    this.setShowCategoryForm(false);
    this.setEditingCategory(undefined);
  }

  async handleDeleteCategory(category: any): Promise<void> {
    await this.categoryViewModel.deleteCategory(category.id);
  }

  // Account Management
  handleCreateAccount(): void {
    this.setEditingAccount(undefined);
    this.setShowAccountForm(true);
  }

  handleEditAccount(account: any): void {
    this.setEditingAccount(account);
    this.setShowAccountForm(true);
  }

  async handleAccountSubmit(name: string, type: string): Promise<boolean> {
    try {
      if (this.editingAccount) {
        await this.accountViewModel.updateAccount(this.editingAccount.id, { name, type: type as any });
      } else {
        await this.accountViewModel.createAccount({ name, type: type as any, balance: { value: 0, currency: 'BRL' } as any });
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  handleAccountCancel(): void {
    this.setShowAccountForm(false);
    this.setEditingAccount(undefined);
  }

  async handleDeleteAccount(account: any): Promise<void> {
    await this.accountViewModel.deleteAccount(account.id);
  }

  // Filter Management
  clearAllFilters(): void {
    this.setSelectedNature(undefined);
    this.setSelectedState(undefined);
    this.setSelectedCategory(undefined);
    this.setSelectedAccount(undefined);
    this.setSelectedStartDate(null);
    this.setSelectedEndDate(null);
  }

  hasActiveFilters(): boolean {
    return !!(this.selectedNature || this.selectedState || this.selectedCategory || 
              this.selectedAccount || this.selectedStartDate || this.selectedEndDate);
  }

  // Error Handling
  private clearErrors(): void {
    this.operationViewModel.setError(null);
    this.categoryViewModel.setError(null);
    this.accountViewModel.clearError();
  }

  // Data Access
  getOperations(): any[] { return this.operationViewModel.operations; }
  getCategories(): any[] { return this.categoryViewModel.categories; }
  getAccounts(): any[] { return this.accountViewModel.accounts; }
  getLoading(): boolean { return this.operationViewModel.isLoading || this.categoryViewModel.isLoading || this.accountViewModel.isLoading; }
  getError(): string | null { return this.operationViewModel.error || this.categoryViewModel.error || this.accountViewModel.error; }
}

