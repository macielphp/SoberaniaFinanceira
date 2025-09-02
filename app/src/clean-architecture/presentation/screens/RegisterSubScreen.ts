// Screen: RegisterSubScreen
// Responsável por gerenciar o estado e lógica de apresentação para o formulário de operações
// Integra com OperationViewModel, CategoryViewModel e AccountViewModel

import { OperationViewModel } from '../view-models/OperationViewModel';
import { CategoryViewModel } from '../view-models/CategoryViewModel';
import { AccountViewModel } from '../view-models/AccountViewModel';
import { Operation } from '../../domain/entities/Operation';
import { Money } from '../../shared/utils/Money';

// Types for form data
export type OperationNature = 'receita' | 'despesa';
export type OperationState = 'receber' | 'recebido' | 'pagar' | 'pago';
export type PaymentMethod = 
  | 'Cartão de débito'
  | 'Cartão de crédito'
  | 'Pix'
  | 'TED'
  | 'Estorno'
  | 'Transferência bancária';

export interface FormData {
  nature: OperationNature;
  state: OperationState;
  paymentMethod: PaymentMethod;
  sourceAccount: string;
  destinationAccount: string;
  date: Date;
  value: { amount: number; currency: string };
  category: string;
  details: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export class RegisterSubScreen {
  private formData: FormData;
  private isEditing: boolean = false;
  private showForm: boolean = true;
  private editingOperation: Operation | null = null;

  constructor(
    private operationViewModel: OperationViewModel,
    private categoryViewModel: CategoryViewModel,
    private accountViewModel: AccountViewModel
  ) {
    this.formData = this.getDefaultFormData();
  }

  // Getters
  getFormData(): FormData { return this.formData; }
  getIsEditing(): boolean { return this.isEditing; }
  getShowForm(): boolean { return this.showForm; }
  getEditingOperation(): Operation | null { return this.editingOperation; }

  // Setters
  setEditingOperation(operation: Operation | null): void {
    this.editingOperation = operation;
    this.isEditing = !!operation;
    
    if (operation) {
      this.formData = {
        nature: operation.nature,
        state: operation.state,
        paymentMethod: operation.paymentMethod,
        sourceAccount: operation.sourceAccount,
        destinationAccount: operation.destinationAccount,
        date: operation.date,
        value: { amount: operation.value.value, currency: operation.value.currency },
        category: operation.category,
        details: operation.details || '',
      };
    } else {
      this.formData = this.getDefaultFormData();
    }
  }

  // Form data management
  updateFormData(newData: Partial<FormData>): void {
    this.formData = { ...this.formData, ...newData };
  }

  resetForm(): void {
    this.formData = this.getDefaultFormData();
    this.isEditing = false;
    this.editingOperation = null;
  }

  // Form visibility
  toggleForm(): void {
    this.showForm = !this.showForm;
  }

  hideForm(): void {
    this.showForm = false;
  }

  displayForm(): void {
    this.showForm = true;
  }

  // Operation submission
  async handleSubmit(): Promise<boolean> {
    try {
      if (this.isEditing && this.editingOperation) {
        // Update existing operation
        const result = await this.operationViewModel.updateOperation({
          details: this.formData.details,
        });
        this.isEditing = false;
        this.editingOperation = null;
        return true;
      } else {
        // Create new operation
        const money = new Money(this.formData.value.amount, this.formData.value.currency);
        const result = await this.operationViewModel.createOperation({
          nature: this.formData.nature,
          state: this.formData.state,
          paymentMethod: this.formData.paymentMethod,
          sourceAccount: this.formData.sourceAccount,
          destinationAccount: this.formData.destinationAccount,
          date: this.formData.date,
          value: money,
          category: this.formData.category,
          details: this.formData.details,
        });
        this.isEditing = false;
        return true;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Operation failed';
      this.operationViewModel.setError(errorMessage);
      return false;
    }
  }

  // Form validation
  validateForm(data: FormData): ValidationResult {
    const errors: Record<string, string> = {};

    if (!data.nature) {
      errors.nature = 'Nature is required';
    }

    if (!data.state) {
      errors.state = 'State is required';
    }

    if (!data.paymentMethod) {
      errors.paymentMethod = 'Payment method is required';
    }

    if (!data.sourceAccount) {
      errors.sourceAccount = 'Source account is required';
    }

    if (!data.destinationAccount) {
      errors.destinationAccount = 'Destination account is required';
    }

    if (!data.value || data.value.amount <= 0) {
      errors.value = 'Value must be greater than 0';
    }

    if (!data.category) {
      errors.category = 'Category is required';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  // Editing mode
  clearEditingOperation(): void {
    this.editingOperation = null;
    this.isEditing = false;
    this.formData = this.getDefaultFormData();
  }

  // Data loading
  async onMount(): Promise<void> {
    await this.loadData();
  }

  async loadData(): Promise<void> {
    try {
      await Promise.all([
        this.categoryViewModel.loadCategories(),
        this.accountViewModel.getAllAccounts(),
      ]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Load failed';
      this.categoryViewModel.setError(errorMessage);
    }
  }

  // Filter management
  getCategoriesByType(type: 'income' | 'expense'): any[] {
    const typeMap = { income: 'receita', expense: 'despesa' };
    return this.categoryViewModel.categories.filter(cat => cat.type === typeMap[type]);
  }

  getAllAccounts(): any[] {
    return this.accountViewModel.accounts;
  }

  // Error handling
  clearErrors(): void {
    this.operationViewModel.setError(null);
    this.categoryViewModel.setError(null);
    this.accountViewModel.clearError();
  }

  getLoading(): boolean {
    return this.operationViewModel.isLoading || 
           this.categoryViewModel.isLoading || 
           this.accountViewModel.isLoading;
  }

  getError(): string | null {
    return this.operationViewModel.error || 
           this.categoryViewModel.error || 
           this.accountViewModel.error;
  }

  // Private methods
  private getDefaultFormData(): FormData {
    return {
      nature: 'receita',
      state: 'recebido',
      paymentMethod: 'Pix',
      sourceAccount: '',
      destinationAccount: '',
      date: new Date(),
      value: { amount: 0, currency: 'BRL' },
      category: '',
      details: '',
    };
  }
}
