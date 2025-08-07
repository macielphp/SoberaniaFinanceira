// Use Case: UpdateOperationUseCase
// Responsável por atualizar uma operação existente

import { IOperationRepository } from '../repositories/IOperationRepository';
import { Operation, OperationProps } from '../entities/Operation';

export class UpdateOperationUseCase {
  constructor(private operationRepository: IOperationRepository) {}

  async execute(operationId: string, updateData: Partial<OperationProps>): Promise<Operation> {
    // Buscar operação existente
    const existingOperation = await this.operationRepository.findById(operationId);
    if (!existingOperation) {
      throw new Error('Operation not found');
    }

    // Validar dados de atualização
    this.validateUpdateData(updateData);

    // Criar nova operação com dados atualizados
    const updatedOperationProps: OperationProps = {
      id: operationId,
      nature: updateData.nature || existingOperation.nature,
      state: updateData.state || existingOperation.state,
      paymentMethod: updateData.paymentMethod || existingOperation.paymentMethod,
      sourceAccount: updateData.sourceAccount || existingOperation.sourceAccount,
      destinationAccount: updateData.destinationAccount || existingOperation.destinationAccount,
      date: updateData.date || existingOperation.date,
      value: updateData.value || existingOperation.value,
      category: updateData.category || existingOperation.category,
      details: updateData.details || existingOperation.details,
      receipt: updateData.receipt || existingOperation.receipt,
      project: updateData.project || existingOperation.project,
      createdAt: existingOperation.createdAt, // Preservar data de criação original
    };

    // Criar nova instância da operação
    const updatedOperation = new Operation(updatedOperationProps);

    // Salvar no repositório
    const savedOperation = await this.operationRepository.save(updatedOperation);

    return savedOperation;
  }

  private validateUpdateData(updateData: Partial<OperationProps>): void {
    // Validar valor se fornecido
    if (updateData.value && updateData.value.value <= 0) {
      throw new Error('Operation value must be greater than zero');
    }

    // Validar método de pagamento se fornecido
    if (updateData.paymentMethod && !this.isValidPaymentMethod(updateData.paymentMethod)) {
      throw new Error('Invalid payment method');
    }

    // Validar natureza se fornecida
    if (updateData.nature && !this.isValidNature(updateData.nature)) {
      throw new Error('Invalid operation nature');
    }

    // Validar estado se fornecido
    if (updateData.state && !this.isValidState(updateData.state)) {
      throw new Error('Invalid operation state');
    }
  }

  private isValidPaymentMethod(method: string): boolean {
    const validMethods = ['Pix', 'Cartão de crédito', 'Cartão de débito', 'TED', 'Estorno', 'Transferência bancária'];
    return validMethods.includes(method);
  }

  private isValidNature(nature: string): boolean {
    const validNatures = ['despesa', 'receita'];
    return validNatures.includes(nature);
  }

  private isValidState(state: string): boolean {
    const validStates = ['pagar', 'pago', 'receber', 'recebido'];
    return validStates.includes(state);
  }
} 