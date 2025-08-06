import { IOperationRepository } from '../../domain/repositories/IOperationRepository';
import { Operation, OperationProps } from '../../domain/entities/Operation';

export class OperationViewModel {
  public operations: Operation[] = [];
  private operationRepository: IOperationRepository;

  constructor(operationRepository: IOperationRepository) {
    this.operationRepository = operationRepository;
  }

  async loadOperations(): Promise<void> {
    this.operations = await this.operationRepository.findAll();
  }

  async createOperation(operationProps: OperationProps): Promise<void> {
    const operation = new Operation(operationProps);
    await this.operationRepository.save(operation);
    this.operations = await this.operationRepository.findAll();
  }

  async updateOperation(operationProps: OperationProps): Promise<void> {
    const operation = new Operation(operationProps);
    await this.operationRepository.save(operation);
    this.operations = await this.operationRepository.findAll();
  }

  async deleteOperation(operationId: string): Promise<void> {
    await this.operationRepository.delete(operationId);
    this.operations = await this.operationRepository.findAll();
  }
}