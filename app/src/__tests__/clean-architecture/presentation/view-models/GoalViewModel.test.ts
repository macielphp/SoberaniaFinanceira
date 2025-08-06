import { GoalViewModel } from '../../../../clean-architecture/presentation/view-models/GoalViewModel';
import { IGoalRepository } from '../../../../clean-architecture/domain/repositories/IGoalRepository';
import { Goal, GoalProps } from '../../../../clean-architecture/domain/entities/Goal';
import { Money } from '../../../../clean-architecture/shared/utils/Money';

describe('GoalViewModel', () => {
  let viewModel: GoalViewModel;
  let mockGoalRepository: jest.Mocked<IGoalRepository>;

  beforeEach(() => {
    mockGoalRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findByType: jest.fn(),
      findByStatus: jest.fn(),
      findActive: jest.fn(),
      findByDateRange: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      countByUserId: jest.fn(),
      countActive: jest.fn(),
    } as any;
    viewModel = new GoalViewModel(mockGoalRepository);
  });

  it('deve inicializar com lista de metas vazia', () => {
    expect(viewModel.goals).toEqual([]);
  });

  it('deve buscar todas as metas do repositório', async () => {
    const mockGoals = [
      new Goal({
        id: '1',
        userId: 'user1',
        description: 'Meta 1',
        type: 'economia',
        targetValue: new Money(1000),
        startDate: new Date(),
        endDate: new Date(Date.now() + 1000 * 60 * 60 * 24),
        monthlyIncome: new Money(500),
        fixedExpenses: new Money(200),
        availablePerMonth: new Money(300),
        importance: 'alta',
        priority: 1,
        strategy: undefined,
        monthlyContribution: new Money(100),
        numParcela: 10,
        status: 'active',
      }),
    ];
    mockGoalRepository.findAll.mockResolvedValue(mockGoals);
    await viewModel.loadGoals();
    expect(viewModel.goals).toEqual(mockGoals);
    expect(mockGoalRepository.findAll).toHaveBeenCalled();
  });

  it('deve criar uma nova meta e atualizar a lista', async () => {
    const goalProps: GoalProps = {
      id: '2',
      userId: 'user2',
      description: 'Nova Meta',
      type: 'compra',
      targetValue: new Money(2000),
      startDate: new Date(),
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      monthlyIncome: new Money(1000),
      fixedExpenses: new Money(400),
      availablePerMonth: new Money(600),
      importance: 'média',
      priority: 2,
      strategy: 'guardar',
      monthlyContribution: new Money(200),
      numParcela: 10,
      status: 'active',
    };
    const newGoal = new Goal(goalProps);
    mockGoalRepository.save.mockResolvedValue(newGoal);
    mockGoalRepository.findAll.mockResolvedValue([newGoal]);
    await viewModel.createGoal(goalProps);
    expect(mockGoalRepository.save).toHaveBeenCalledWith(expect.any(Goal));
    expect(viewModel.goals).toEqual([newGoal]);
  });

  it('deve atualizar uma meta existente e atualizar a lista', async () => {
    const originalGoalProps: GoalProps = {
      id: '3',
      userId: 'user3',
      description: 'Meta Original',
      type: 'economia',
      targetValue: new Money(1500),
      startDate: new Date(),
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10),
      monthlyIncome: new Money(700),
      fixedExpenses: new Money(300),
      availablePerMonth: new Money(400),
      importance: 'baixa',
      priority: 3,
      strategy: undefined,
      monthlyContribution: new Money(150),
      numParcela: 10,
      status: 'active',
    };
    const updatedGoalProps: GoalProps = {
      ...originalGoalProps,
      description: 'Meta Atualizada',
      targetValue: new Money(2000),
      importance: 'alta',
    };
    const updatedGoal = new Goal(updatedGoalProps);
    mockGoalRepository.save.mockResolvedValue(updatedGoal);
    mockGoalRepository.findAll.mockResolvedValue([updatedGoal]);
    await viewModel.updateGoal(updatedGoalProps);
    expect(mockGoalRepository.save).toHaveBeenCalledWith(expect.any(Goal));
    expect(viewModel.goals).toEqual([updatedGoal]);
  });

  it('deve remover uma meta pelo id e atualizar a lista', async () => {
    const goalId = '4';
    mockGoalRepository.delete.mockResolvedValue(true);
    mockGoalRepository.findAll.mockResolvedValue([]);
    await viewModel.deleteGoal(goalId);
    expect(mockGoalRepository.delete).toHaveBeenCalledWith(goalId);
    expect(viewModel.goals).toEqual([]);
  });
});