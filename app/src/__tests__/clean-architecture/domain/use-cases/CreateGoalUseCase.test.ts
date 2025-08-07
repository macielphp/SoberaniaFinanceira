// Tests for CreateGoalUseCase
import { CreateGoalUseCase } from '../../../../clean-architecture/domain/use-cases/CreateGoalUseCase';
import { IGoalRepository } from '../../../../clean-architecture/domain/repositories/IGoalRepository';
import { Goal } from '../../../../clean-architecture/domain/entities/Goal';
import { Money } from '../../../../clean-architecture/shared/utils/Money';

describe('CreateGoalUseCase', () => {
  let createGoalUseCase: CreateGoalUseCase;
  let mockGoalRepository: jest.Mocked<IGoalRepository>;

  beforeEach(() => {
    mockGoalRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      delete: jest.fn(),
      findByUserId: jest.fn(),
      findByType: jest.fn(),
      findByStatus: jest.fn(),
      findActive: jest.fn(),
      findByDateRange: jest.fn(),
      count: jest.fn(),
      countByUserId: jest.fn(),
      countActive: jest.fn(),
    };

    createGoalUseCase = new CreateGoalUseCase(mockGoalRepository);
  });

  it('should create a new goal successfully', async () => {
    const goalData = {
      description: 'Comprar casa',
      targetValue: new Money(500000, 'BRL'),
      startDate: new Date('2024-01-01'),
      endDate: new Date('2025-12-31'),
      monthlyIncome: new Money(8000, 'BRL'),
      fixedExpenses: new Money(3000, 'BRL'),
      availablePerMonth: new Money(2000, 'BRL'),
      importance: 'alta' as const,
      priority: 1,
      type: 'compra' as const,
      status: 'active' as const,
      userId: 'user1',
      strategy: 'Poupar mensalmente',
      monthlyContribution: new Money(2000, 'BRL'),
      numParcela: 25,
    };

    const createdGoal = new Goal({
      id: '1',
      description: 'Comprar casa',
      targetValue: new Money(500000, 'BRL'),
      startDate: new Date('2024-01-01'),
      endDate: new Date('2025-12-31'),
      monthlyIncome: new Money(8000, 'BRL'),
      fixedExpenses: new Money(3000, 'BRL'),
      availablePerMonth: new Money(2000, 'BRL'),
      importance: 'alta',
      priority: 1,
      type: 'compra',
      status: 'active',
      userId: 'user1',
      strategy: 'Poupar mensalmente',
      monthlyContribution: new Money(2000, 'BRL'),
      numParcela: 25,
      createdAt: new Date(),
    });

    mockGoalRepository.save.mockResolvedValue(createdGoal);

    const result = await createGoalUseCase.execute(goalData);

    expect(result).toBeInstanceOf(Goal);
    expect(result.description).toBe(goalData.description);
    expect(result.targetValue).toEqual(goalData.targetValue);
    expect(result.startDate).toEqual(goalData.startDate);
    expect(result.endDate).toEqual(goalData.endDate);
    expect(result.priority).toBe(goalData.priority);
    expect(result.type).toBe(goalData.type);
    expect(result.status).toBe(goalData.status);
    expect(result.userId).toBe(goalData.userId);
    expect(mockGoalRepository.save).toHaveBeenCalledWith(expect.any(Goal));
  });

  it('should throw error when description is empty', async () => {
    const goalData = {
      description: '',
      targetValue: new Money(500000, 'BRL'),
      startDate: new Date('2024-01-01'),
      endDate: new Date('2025-12-31'),
      monthlyIncome: new Money(8000, 'BRL'),
      fixedExpenses: new Money(3000, 'BRL'),
      availablePerMonth: new Money(2000, 'BRL'),
      importance: 'alta' as const,
      priority: 1,
      type: 'compra' as const,
      status: 'active' as const,
      userId: 'user1',
      strategy: 'Poupar mensalmente',
      monthlyContribution: new Money(2000, 'BRL'),
      numParcela: 25,
    };

    await expect(createGoalUseCase.execute(goalData)).rejects.toThrow(
      'Descrição do objetivo é obrigatória'
    );

    expect(mockGoalRepository.save).not.toHaveBeenCalled();
  });

  it('should throw error when target value is zero', async () => {
    const goalData = {
      description: 'Comprar casa',
      targetValue: new Money(0, 'BRL'),
      startDate: new Date('2024-01-01'),
      endDate: new Date('2025-12-31'),
      monthlyIncome: new Money(8000, 'BRL'),
      fixedExpenses: new Money(3000, 'BRL'),
      availablePerMonth: new Money(2000, 'BRL'),
      importance: 'alta' as const,
      priority: 1,
      type: 'compra' as const,
      status: 'active' as const,
      userId: 'user1',
      strategy: 'Poupar mensalmente',
      monthlyContribution: new Money(2000, 'BRL'),
      numParcela: 25,
    };

    await expect(createGoalUseCase.execute(goalData)).rejects.toThrow(
      'Valor alvo deve ser positivo'
    );

    expect(mockGoalRepository.save).not.toHaveBeenCalled();
  });

  it('should throw error when priority is invalid', async () => {
    const goalData = {
      description: 'Comprar casa',
      targetValue: new Money(500000, 'BRL'),
      startDate: new Date('2024-01-01'),
      endDate: new Date('2025-12-31'),
      monthlyIncome: new Money(8000, 'BRL'),
      fixedExpenses: new Money(3000, 'BRL'),
      availablePerMonth: new Money(2000, 'BRL'),
      importance: 'alta' as const,
      priority: 0,
      type: 'compra' as const,
      status: 'active' as const,
      userId: 'user1',
      strategy: 'Poupar mensalmente',
      monthlyContribution: new Money(2000, 'BRL'),
      numParcela: 25,
    };

    await expect(createGoalUseCase.execute(goalData)).rejects.toThrow(
      'Prioridade deve ser entre 1 e 5'
    );

    expect(mockGoalRepository.save).not.toHaveBeenCalled();
  });

  it('should throw error when goal type is invalid', async () => {
    const goalData = {
      description: 'Comprar casa',
      targetValue: new Money(500000, 'BRL'),
      startDate: new Date('2024-01-01'),
      endDate: new Date('2025-12-31'),
      monthlyIncome: new Money(8000, 'BRL'),
      fixedExpenses: new Money(3000, 'BRL'),
      availablePerMonth: new Money(2000, 'BRL'),
      importance: 'alta' as const,
      priority: 1,
      type: 'invalid' as any,
      status: 'active' as const,
      userId: 'user1',
      strategy: 'Poupar mensalmente',
      monthlyContribution: new Money(2000, 'BRL'),
      numParcela: 25,
    };

    await expect(createGoalUseCase.execute(goalData)).rejects.toThrow(
      'Tipo de objetivo inválido'
    );

    expect(mockGoalRepository.save).not.toHaveBeenCalled();
  });

  it('should throw error when repository save fails', async () => {
    const goalData = {
      description: 'Comprar casa',
      targetValue: new Money(500000, 'BRL'),
      startDate: new Date('2024-01-01'),
      endDate: new Date('2025-12-31'),
      monthlyIncome: new Money(8000, 'BRL'),
      fixedExpenses: new Money(3000, 'BRL'),
      availablePerMonth: new Money(2000, 'BRL'),
      importance: 'alta' as const,
      priority: 1,
      type: 'compra' as const,
      status: 'active' as const,
      userId: 'user1',
      strategy: 'Poupar mensalmente',
      monthlyContribution: new Money(2000, 'BRL'),
      numParcela: 25,
    };

    mockGoalRepository.save.mockRejectedValue(new Error('Database error'));

    await expect(createGoalUseCase.execute(goalData)).rejects.toThrow(
      'Erro ao salvar objetivo'
    );
  });
});