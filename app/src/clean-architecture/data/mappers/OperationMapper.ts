// Mapper for Operation entity
// Converts between DTO (database) and Domain Entity

import { Operation, OperationState, PaymentMethod } from '../../domain/entities/Operation';
import { OperationDTO } from '../dto/OperationDTO';
import { Money } from '../../shared/utils/Money';

export class OperationMapper {
  /**
   * Converts OperationDTO to Operation domain entity
   */
  toDomain(dto: OperationDTO): Operation {
    // Map database states to domain states
    const mapState = (dbState: string, nature: string): OperationState => {
      switch (dbState) {
        case 'completed':
          return nature === 'receita' ? 'recebido' : 'pago';
        case 'pending':
          return nature === 'receita' ? 'receber' : 'pagar';
        case 'received':
          return 'recebido';
        case 'to_receive':
          return 'receber';
        default:
          return nature === 'receita' ? 'recebido' : 'pago';
      }
    };

    // Map database payment methods to domain payment methods
    const mapPaymentMethod = (dbMethod: string): PaymentMethod => {
      switch (dbMethod) {
        case 'pix':
          return 'Pix';
        case 'cartao':
          return 'Cartão de crédito';
        case 'transferencia':
          return 'Transferência bancária';
        case 'ted':
          return 'TED';
        case 'estorno':
          return 'Estorno';
        default:
          return 'Pix';
      }
    };

    return new Operation({
      id: dto.id,
      nature: dto.nature,
      state: mapState(dto.state, dto.nature),
      paymentMethod: mapPaymentMethod(dto.paymentMethod),
      sourceAccount: dto.sourceAccount,
      destinationAccount: dto.destinationAccount,
      date: new Date(dto.date),
      value: new Money(dto.value, 'BRL'),
      category: dto.category,
      details: dto.details,
      receipt: dto.receipt ? new Blob([dto.receipt]) : undefined,
      createdAt: new Date(dto.createdAt)
    });
  }

  /**
   * Converts Operation domain entity to OperationDTO
   */
  async toDTO(operation: Operation): Promise<OperationDTO> {
    // Map domain states to database states
    const mapState = (domainState: OperationState): string => {
      switch (domainState) {
        case 'pago':
          return 'completed';
        case 'pagar':
          return 'pending';
        case 'recebido':
          return 'received';
        case 'receber':
          return 'to_receive';
        default:
          return 'completed';
      }
    };

    // Map domain payment methods to database payment methods
    const mapPaymentMethod = (domainMethod: PaymentMethod): string => {
      switch (domainMethod) {
        case 'Pix':
          return 'pix';
        case 'Cartão de crédito':
          return 'cartao';
        case 'Cartão de débito':
          return 'cartao';
        case 'Transferência bancária':
          return 'transferencia';
        case 'TED':
          return 'ted';
        case 'Estorno':
          return 'estorno';
        default:
          return 'pix';
      }
    };

    return {
      id: operation.id,
      user_id: 'user-1', // Domain doesn't have userId, default to 'user-1'
      nature: operation.nature,
      state: mapState(operation.state),
      paymentMethod: mapPaymentMethod(operation.paymentMethod),
      sourceAccount: operation.sourceAccount,
      destinationAccount: operation.destinationAccount,
      date: operation.date.toISOString(),
      value: operation.value.value,
      category: operation.category,
      details: operation.details,
      receipt: operation.receipt ? new Uint8Array(await operation.receipt.arrayBuffer()) : null,
      goal_id: null, // Domain doesn't have goalId
      createdAt: operation.createdAt.toISOString()
    };
  }

  /**
   * Converts array of OperationDTO to array of Operation entities
   */
  toDomainList(dtos: OperationDTO[]): Operation[] {
    return dtos.map(dto => this.toDomain(dto));
  }

  /**
   * Converts array of Operation entities to array of OperationDTO
   */
  async toDTOList(operations: Operation[]): Promise<OperationDTO[]> {
    const promises = operations.map(operation => this.toDTO(operation));
    return Promise.all(promises);
  }
} 