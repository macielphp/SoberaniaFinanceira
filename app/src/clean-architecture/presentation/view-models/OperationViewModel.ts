import { Operation, OperationProps } from '../../domain/entities/Operation';
import { Money } from '../../shared/utils/Money';

// Interfaces para os Use Cases
interface CreateOperationUseCase {
  execute(data: CreateOperationData): Promise<Operation>;
}

interface UpdateOperationUseCase {
  execute(id: string, data: UpdateOperationData): Promise<Operation>;
}

interface GetOperationByIdUseCase {
  execute(id: string): Promise<Operation>;
}

interface GetOperationsUseCase {
  execute(request: any): Promise<any>;
}

interface DeleteOperationUseCase {
  execute(id: string): Promise<void>;
}

// Interfaces para os dados
interface CreateOperationData {
  nature: 'receita' | 'despesa';
  state: 'receber' | 'recebido' | 'pagar' | 'pago';
  paymentMethod: 'Cartão de débito' | 'Cartão de crédito' | 'Pix' | 'TED' | 'Estorno' | 'Transferência bancária';
  sourceAccount: string;
  destinationAccount: string;
  date: Date;
  value: Money;
  category: string;
  details?: string;
}

interface UpdateOperationData {
  nature?: 'receita' | 'despesa';
  state?: 'receber' | 'recebido' | 'pagar' | 'pago';
  paymentMethod?: 'Cartão de débito' | 'Cartão de crédito' | 'Pix' | 'TED' | 'Estorno' | 'Transferência bancária';
  sourceAccount?: string;
  destinationAccount?: string;
  date?: Date;
  value?: Money;
  category?: string;
  details?: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

interface OperationSummary {
  id: string;
  description: string;
  amount: string;
  type: 'receita' | 'despesa';
  categoryName: string;
  accountName: string;
  date: string;
  isRecurring: boolean;
  installments: number;
  currentInstallment: number;
}

export class OperationViewModel {
  private _operation: Operation | null = null;
  private _operations: Operation[] = [];
  private _isLoading: boolean = false;
  private _error: string | null = null;
  private _isEditing: boolean = false;
  
  // Form properties
  private _operationType: 'income' | 'expense' = 'income';
  private _amount: string = '';
  private _description: string = '';
  private _date: string = '';
  private _selectedCategory: any = null;
  private _selectedAccount: any = null;

  constructor(
    private createOperationUseCase: CreateOperationUseCase,
    private updateOperationUseCase: UpdateOperationUseCase,
    private getOperationByIdUseCase: GetOperationByIdUseCase,
    private getOperationsUseCase: GetOperationsUseCase,
    private deleteOperationUseCase: DeleteOperationUseCase
  ) {}

  // Getters
  get operation(): Operation | null {
    return this._operation;
  }

  get operations(): Operation[] {
    return this._operations;
  }

  get isLoading(): boolean {
    return this._isLoading;
  }

  get error(): string | null {
    return this._error;
  }

  get isEditing(): boolean {
    return this._isEditing;
  }

  // Form getters
  get operationType(): 'income' | 'expense' {
    return this._operationType;
  }

  get amount(): string {
    return this._amount;
  }

  get description(): string {
    return this._description;
  }

  get date(): string {
    return this._date;
  }

  get selectedCategory(): any {
    return this._selectedCategory;
  }

  get selectedAccount(): any {
    return this._selectedAccount;
  }

  // Setters
  setOperation(operation: Operation | null): void {
    this._operation = operation;
    this._isEditing = operation !== null;
  }

  setLoading(loading: boolean): void {
    this._isLoading = loading;
  }

  setError(error: string | null): void {
    this._error = error;
  }

  reset(): void {
    this._operation = null;
    this._isLoading = false;
    this._error = null;
    this._isEditing = false;
    
    // Reset form properties
    this._operationType = 'income';
    this._amount = '';
    this._description = '';
    this._date = '';
    this._selectedCategory = null;
    this._selectedAccount = null;
  }

  // Form setters
  setOperationType(type: 'income' | 'expense'): void {
    this._operationType = type;
  }

  setAmount(amount: string): void {
    this._amount = amount;
  }

  setDescription(description: string): void {
    this._description = description;
  }

  setSelectedCategory(category: any): void {
    this._selectedCategory = category;
  }

  setSelectedAccount(account: any): void {
    this._selectedAccount = account;
  }

  setDate(date: string): void {
    this._date = date;
  }

  validateForm(data: CreateOperationData): ValidationResult {
    const errors: Record<string, string> = {};

    // Validar natureza
    if (!data.nature) {
      errors.nature = 'Natureza é obrigatória';
    }

    // Validar estado
    if (!data.state) {
      errors.state = 'Estado é obrigatório';
    }

    // Validar método de pagamento
    if (!data.paymentMethod) {
      errors.paymentMethod = 'Método de pagamento é obrigatório';
    }

    // Validar conta de origem
    if (!data.sourceAccount) {
      errors.sourceAccount = 'Conta de origem é obrigatória';
    }

    // Validar conta de destino
    if (!data.destinationAccount) {
      errors.destinationAccount = 'Conta de destino é obrigatória';
    }

    // Validar valor
    if (data.value.value <= 0) {
      errors.value = 'Valor deve ser maior que zero';
    }

    // Validar categoria
    if (!data.category) {
      errors.category = 'Categoria é obrigatória';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  async createOperation(data: CreateOperationData): Promise<Operation> {
    try {
      this.setLoading(true);
      this.setError(null);

      const operation = await this.createOperationUseCase.execute(data);
      this.setOperation(operation);

      return operation;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar operação';
      this.setError(errorMessage);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  async updateOperation(data: UpdateOperationData): Promise<Operation> {
    if (!this._operation) {
      throw new Error('Nenhuma operação selecionada para edição');
    }

    try {
      this.setLoading(true);
      this.setError(null);

      const updatedOperation = await this.updateOperationUseCase.execute(this._operation.id, data);
      this.setOperation(updatedOperation);

      return updatedOperation;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar operação';
      this.setError(errorMessage);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  async loadOperation(id: string): Promise<Operation> {
    try {
      this.setLoading(true);
      this.setError(null);

      const operation = await this.getOperationByIdUseCase.execute(id);
      this.setOperation(operation);

      return operation;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Operação não encontrada';
      this.setError(errorMessage);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  formatAmount(amount: Money): string {
    return amount.format();
  }

  getOperationSummary(): OperationSummary | null {
    if (!this._operation) {
      return null;
    }

    return {
      id: this._operation.id,
      description: this._operation.details || 'Sem descrição',
      amount: this.formatAmount(this._operation.value),
      type: this._operation.nature,
      categoryName: this._operation.category,
      accountName: this._operation.sourceAccount,
      date: this._operation.date.toLocaleDateString('pt-BR'),
      isRecurring: false, // Não implementado na entidade atual
      installments: 1, // Não implementado na entidade atual
      currentInstallment: 1, // Não implementado na entidade atual
    };
  }

  async loadOperations(): Promise<Operation[]> {
    console.log('🔄 OperationViewModel: Iniciando loadOperations...');
    try {
      this._isLoading = true;
      this._error = null;

      console.log('📊 OperationViewModel: Chamando getOperationsUseCase.execute...');
      console.log('📊 OperationViewModel: getOperationsUseCase:', !!this.getOperationsUseCase);
      console.log('📊 OperationViewModel: getOperationsUseCase.execute:', !!this.getOperationsUseCase?.execute);
      
      const result = await this.getOperationsUseCase.execute({});
      console.log('✅ OperationViewModel: getOperationsUseCase.execute concluído');
      
      const operations = result.match(
        (response: any) => response.operations,
        (error: any) => {
          this._error = error.message;
          throw error;
        }
      );
      this._operations = operations;
      console.log('✅ OperationViewModel: loadOperations concluído com sucesso, operações:', operations.length);
      return operations;
    } catch (error) {
      console.error('❌ OperationViewModel: Erro em loadOperations:', error);
      this._error = error instanceof Error ? error.message : 'Erro ao carregar operações';
      throw error;
    } finally {
      this._isLoading = false;
    }
  }

  async deleteOperation(id: string): Promise<void> {
    try {
      this.setLoading(true);
      this.setError(null);

      await this.deleteOperationUseCase.execute(id);
      
      // Remove from local operations array
      this._operations = this._operations.filter(op => op.id !== id);
      
      // Clear current operation if it was the deleted one
      if (this._operation && this._operation.id === id) {
        this.setOperation(null);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao deletar operação';
      this.setError(errorMessage);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }
}