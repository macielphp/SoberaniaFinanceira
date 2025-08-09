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

  constructor(
    private createOperationUseCase: CreateOperationUseCase,
    private updateOperationUseCase: UpdateOperationUseCase,
    private getOperationByIdUseCase: GetOperationByIdUseCase,
    private getOperationsUseCase: GetOperationsUseCase
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
    try {
      this._isLoading = true;
      this._error = null;

      const result = await this.getOperationsUseCase.execute({});
      const operations = result.match(
        (response: any) => response.operations,
        (error: any) => {
          this._error = error.message;
          throw error;
        }
      );
      this._operations = operations;
      return operations;
    } catch (error) {
      this._error = error instanceof Error ? error.message : 'Erro ao carregar operações';
      throw error;
    } finally {
      this._isLoading = false;
    }
  }
}