// Tests for OperationMapper
import { OperationMapper } from '../../../../clean-architecture/data/mappers/OperationMapper';
import { Operation } from '../../../../clean-architecture/domain/entities/Operation';
import { OperationDTO } from '../../../../clean-architecture/data/dto/OperationDTO';
import { Money } from '../../../../clean-architecture/shared/utils/Money';

describe('OperationMapper', () => {
  let mapper: OperationMapper;

  beforeEach(() => {
    mapper = new OperationMapper();
  });

  describe('toDomain', () => {
    it('should map OperationDTO to Operation entity', () => {
      const operationDTO: OperationDTO = {
        id: 'op-123',
        user_id: 'user-1',
        nature: 'despesa',
        state: 'completed',
        paymentMethod: 'pix',
        sourceAccount: 'Conta Principal',
        destinationAccount: 'Supermercado',
        date: '2024-01-15T10:30:00.000Z',
        value: 150.50,
        category: 'Alimentação',
        details: 'Compra no supermercado',
        receipt: null,
        goal_id: null,
        createdAt: '2024-01-15T10:30:00.000Z'
      };

      const operation = mapper.toDomain(operationDTO);

      expect(operation).toBeInstanceOf(Operation);
      expect(operation.id).toBe('op-123');
      expect(operation.nature).toBe('despesa');
      expect(operation.state).toBe('pago');
      expect(operation.paymentMethod).toBe('Pix');
      expect(operation.sourceAccount).toBe('Conta Principal');
      expect(operation.destinationAccount).toBe('Supermercado');
      expect(operation.date).toEqual(new Date('2024-01-15T10:30:00.000Z'));
      expect(operation.value.value).toBe(150.50);
      expect(operation.category).toBe('Alimentação');
      expect(operation.details).toBe('Compra no supermercado');
      expect(operation.receipt).toBeUndefined();
    });

    it('should handle income operation', () => {
      const operationDTO: OperationDTO = {
        id: 'op-456',
        user_id: 'user-1',
        nature: 'receita',
        state: 'received',
        paymentMethod: 'transferencia',
        sourceAccount: 'Empresa',
        destinationAccount: 'Conta Principal',
        date: '2024-01-01T08:00:00.000Z',
        value: 5000,
        category: 'Salário',
        details: 'Salário mensal',
        receipt: null,
        goal_id: 'goal-123',
        createdAt: '2024-01-01T08:00:00.000Z'
      };

      const operation = mapper.toDomain(operationDTO);

      expect(operation.nature).toBe('receita');
      expect(operation.state).toBe('recebido');
      expect(operation.paymentMethod).toBe('Transferência bancária');
    });

    it('should handle receipt data', () => {
      const receiptData = new Uint8Array([1, 2, 3, 4, 5]);
      const operationDTO: OperationDTO = {
        id: 'op-789',
        user_id: 'user-1',
        nature: 'despesa',
        state: 'completed',
        paymentMethod: 'cartao',
        sourceAccount: 'Cartão de Crédito',
        destinationAccount: 'Farmácia',
        date: '2024-01-10T14:20:00.000Z',
        value: 89.90,
        category: 'Saúde',
        details: 'Compra de medicamentos',
        receipt: receiptData,
        goal_id: null,
        createdAt: '2024-01-10T14:20:00.000Z'
      };

      const operation = mapper.toDomain(operationDTO);

      expect(operation.receipt).toBeInstanceOf(Blob);
    });
  });

  describe('toDTO', () => {
    it('should map Operation entity to OperationDTO', async () => {
      const operation = new Operation({
        id: 'op-123',
        nature: 'despesa',
        state: 'pago',
        paymentMethod: 'Pix',
        sourceAccount: 'Conta Principal',
        destinationAccount: 'Supermercado',
        date: new Date('2024-01-15T10:30:00.000Z'),
        value: new Money(150.50, 'BRL'),
        category: 'Alimentação',
        details: 'Compra no supermercado',
        receipt: undefined
      });

      const operationDTO = await mapper.toDTO(operation);

      expect(operationDTO.id).toBe('op-123');
      expect(operationDTO.user_id).toBe('user-1');
      expect(operationDTO.nature).toBe('despesa');
      expect(operationDTO.state).toBe('completed');
      expect(operationDTO.paymentMethod).toBe('pix');
      expect(operationDTO.sourceAccount).toBe('Conta Principal');
      expect(operationDTO.destinationAccount).toBe('Supermercado');
      expect(operationDTO.date).toBe('2024-01-15T10:30:00.000Z');
      expect(operationDTO.value).toBe(150.50);
      expect(operationDTO.category).toBe('Alimentação');
      expect(operationDTO.details).toBe('Compra no supermercado');
      expect(operationDTO.receipt).toBeNull();
      expect(operationDTO.goal_id).toBeNull();
    });

    it('should handle income operation', async () => {
      const operation = new Operation({
        id: 'op-456',
        nature: 'receita',
        state: 'recebido',
        paymentMethod: 'Transferência bancária',
        sourceAccount: 'Empresa',
        destinationAccount: 'Conta Principal',
        date: new Date('2024-01-01T08:00:00.000Z'),
        value: new Money(5000, 'BRL'),
        category: 'Salário',
        details: 'Salário mensal',
        receipt: undefined
      });

      const operationDTO = await mapper.toDTO(operation);

      expect(operationDTO.nature).toBe('receita');
      expect(operationDTO.state).toBe('received');
      expect(operationDTO.paymentMethod).toBe('transferencia');
    });

    it('should handle receipt data', async () => {
      const receiptData = new Blob([new Uint8Array([1, 2, 3, 4, 5])]);
      const operation = new Operation({
        id: 'op-789',
        nature: 'despesa',
        state: 'pago',
        paymentMethod: 'Cartão de crédito',
        sourceAccount: 'Cartão de Crédito',
        destinationAccount: 'Farmácia',
        date: new Date('2024-01-10T14:20:00.000Z'),
        value: new Money(89.90, 'BRL'),
        category: 'Saúde',
        details: 'Compra de medicamentos',
        receipt: receiptData
      });

      const operationDTO = await mapper.toDTO(operation);

      expect(operationDTO.receipt).toBeInstanceOf(Uint8Array);
    });
  });

  describe('toDomainList', () => {
    it('should map array of OperationDTO to array of Operation entities', () => {
      const operationDTOs: OperationDTO[] = [
        {
          id: 'op-1',
          user_id: 'user-1',
          nature: 'despesa',
          state: 'completed',
          paymentMethod: 'pix',
          sourceAccount: 'Conta 1',
          destinationAccount: 'Loja 1',
          date: '2024-01-01T10:00:00.000Z',
          value: 100,
          category: 'Categoria 1',
          details: 'Operação 1',
          receipt: null,
          goal_id: null,
          createdAt: '2024-01-01T10:00:00.000Z'
        },
        {
          id: 'op-2',
          user_id: 'user-1',
          nature: 'receita',
          state: 'received',
          paymentMethod: 'transferencia',
          sourceAccount: 'Empresa',
          destinationAccount: 'Conta 1',
          date: '2024-01-02T08:00:00.000Z',
          value: 2000,
          category: 'Salário',
          details: 'Operação 2',
          receipt: null,
          goal_id: 'goal-1',
          createdAt: '2024-01-02T08:00:00.000Z'
        }
      ];

      const operations = mapper.toDomainList(operationDTOs);

      expect(operations).toHaveLength(2);
      expect(operations[0]).toBeInstanceOf(Operation);
      expect(operations[1]).toBeInstanceOf(Operation);
      expect(operations[0].category).toBe('Categoria 1');
      expect(operations[1].category).toBe('Salário');
    });

    it('should return empty array for empty input', () => {
      const operations = mapper.toDomainList([]);

      expect(operations).toHaveLength(0);
    });
  });

  describe('toDTOList', () => {
    it('should map array of Operation entities to array of OperationDTO', async () => {
      const operations = [
        new Operation({
          id: 'op-1',
          nature: 'despesa',
          state: 'pago',
          paymentMethod: 'Pix',
          sourceAccount: 'Conta 1',
          destinationAccount: 'Loja 1',
          date: new Date('2024-01-01T10:00:00.000Z'),
          value: new Money(100, 'BRL'),
          category: 'Categoria 1',
          details: 'Operação 1',
          receipt: undefined
        }),
        new Operation({
          id: 'op-2',
          nature: 'receita',
          state: 'recebido',
          paymentMethod: 'Transferência bancária',
          sourceAccount: 'Empresa',
          destinationAccount: 'Conta 1',
          date: new Date('2024-01-02T08:00:00.000Z'),
          value: new Money(2000, 'BRL'),
          category: 'Salário',
          details: 'Operação 2',
          receipt: undefined
        })
      ];

      const operationDTOs = await mapper.toDTOList(operations);

      expect(operationDTOs).toHaveLength(2);
      expect(operationDTOs[0].category).toBe('Categoria 1');
      expect(operationDTOs[1].category).toBe('Salário');
    });

    it('should return empty array for empty input', async () => {
      const operationDTOs = await mapper.toDTOList([]);

      expect(operationDTOs).toHaveLength(0);
    });
  });
}); 