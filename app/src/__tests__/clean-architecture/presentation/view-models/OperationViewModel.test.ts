import { OperationViewModel } from '../../../../clean-architecture/presentation/view-models/OperationViewModel';
import { IOperationRepository } from '../../../../clean-architecture/domain/repositories/IOperationRepository';
import { Operation, OperationProps } from '../../../../clean-architecture/domain/entities/Operation';
import { Money } from '../../../../clean-architecture/shared/utils/Money';

describe('OperationViewModel', () => {
  let viewModel: OperationViewModel;
  let mockOperationRepository: jest.Mocked<IOperationRepository>;

  beforeEach(() => {
    mockOperationRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByAccount: jest.fn(),
      findByPeriod: jest.fn(),
      findByDateRange: jest.fn(),
      findByCategory: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    } as any;
    viewModel = new OperationViewModel(mockOperationRepository);
  });

  it('deve inicializar com lista de operações vazia', () => {
    expect(viewModel.operations).toEqual([]);
  });

  it('deve buscar todas as operações do repositório', async () => {
    const mockOperations = [
      new Operation({
        id: '1',
        nature: 'receita',
        state: 'recebido',
        paymentMethod: 'Pix',
        sourceAccount: 'acc1',
        destinationAccount: 'acc1',
        date: new Date(),
        value: new Money(100),
        category: 'cat1',
      }),
    ];
    mockOperationRepository.findAll.mockResolvedValue(mockOperations);
    await viewModel.loadOperations();
    expect(viewModel.operations).toEqual(mockOperations);
    expect(mockOperationRepository.findAll).toHaveBeenCalled();
  });

  it('deve criar uma nova operação e atualizar a lista', async () => {
    const operationProps: OperationProps = {
      id: '2',
      nature: 'despesa',
      state: 'pago',
      paymentMethod: 'Cartão de crédito',
      sourceAccount: 'acc2',
      destinationAccount: 'acc2',
      date: new Date(),
      value: new Money(250),
      category: 'cat2',
    };
    const newOperation = new Operation(operationProps);
    mockOperationRepository.save.mockResolvedValue(newOperation);
    mockOperationRepository.findAll.mockResolvedValue([newOperation]);
    await viewModel.createOperation(operationProps);
    expect(mockOperationRepository.save).toHaveBeenCalledWith(expect.any(Operation));
    expect(viewModel.operations).toEqual([newOperation]);
  });

  it('deve atualizar uma operação existente e atualizar a lista', async () => {
    const originalOperationProps: OperationProps = {
      id: '3',
      nature: 'receita',
      state: 'receber',
      paymentMethod: 'Pix',
      sourceAccount: 'acc3',
      destinationAccount: 'acc3',
      date: new Date(),
      value: new Money(500),
      category: 'cat3',
    };
    const updatedOperationProps: OperationProps = {
      ...originalOperationProps,
      state: 'recebido',
      value: new Money(600),
    };
    const updatedOperation = new Operation(updatedOperationProps);
    mockOperationRepository.save.mockResolvedValue(updatedOperation);
    mockOperationRepository.findAll.mockResolvedValue([updatedOperation]);
    await viewModel.updateOperation(updatedOperationProps);
    expect(mockOperationRepository.save).toHaveBeenCalledWith(expect.any(Operation));
    expect(viewModel.operations).toEqual([updatedOperation]);
  });

  it('deve remover uma operação pelo id e atualizar a lista', async () => {
    const operationId = '4';
    mockOperationRepository.delete.mockResolvedValue(true);
    mockOperationRepository.findAll.mockResolvedValue([]);
    await viewModel.deleteOperation(operationId);
    expect(mockOperationRepository.delete).toHaveBeenCalledWith(operationId);
    expect(viewModel.operations).toEqual([]);
  });
});