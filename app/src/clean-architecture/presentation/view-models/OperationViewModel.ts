import { IOperationRepository } from '../../domain/repositories/IOperationRepository';
import { Operation, OperationProps } from '../../domain/entities/Operation';

export class OperationViewModel {
  public operations: Operation[] = [];
  public loading: boolean = false;
  public error: string | null = null;
  public selectedOperation: Operation | null = null;
  private operationRepository: IOperationRepository;

  constructor(operationRepository: IOperationRepository) {
    this.operationRepository = operationRepository;
  }

  async loadOperations(): Promise<void> {
    try {
      this.loading = true;
      this.error = null;
      this.operations = await this.operationRepository.findAll();
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Erro ao carregar operações';
      throw error;
    } finally {
      this.loading = false;
    }
  }

  async createOperation(operationProps: OperationProps): Promise<void> {
    try {
      this.loading = true;
      this.error = null;
      const operation = new Operation(operationProps);
      await this.operationRepository.save(operation);
      this.operations = await this.operationRepository.findAll();
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Erro ao criar operação';
      throw error;
    } finally {
      this.loading = false;
    }
  }

  async updateOperation(operationId: string, operationProps: Partial<OperationProps>): Promise<void> {
    try {
      this.loading = true;
      this.error = null;
      const operation = new Operation({ id: operationId, ...operationProps } as OperationProps);
      await this.operationRepository.save(operation);
      this.operations = await this.operationRepository.findAll();
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Erro ao atualizar operação';
      throw error;
    } finally {
      this.loading = false;
    }
  }

  async deleteOperation(operationId: string): Promise<void> {
    try {
      this.loading = true;
      this.error = null;
      await this.operationRepository.delete(operationId);
      this.operations = await this.operationRepository.findAll();
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Erro ao deletar operação';
      throw error;
    } finally {
      this.loading = false;
    }
  }

  getOperations(): Operation[] {
    return this.operations;
  }

  setSelectedOperation(operation: Operation | null): void {
    this.selectedOperation = operation;
  }

  clearError(): void {
    this.error = null;
  }

  setLoading(loading: boolean): void {
    this.loading = loading;
  }
}