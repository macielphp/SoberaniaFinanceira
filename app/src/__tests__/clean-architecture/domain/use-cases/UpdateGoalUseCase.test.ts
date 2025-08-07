// Tests for UpdateGoalUseCase
import { UpdateGoalUseCase } from '../../../../clean-architecture/domain/use-cases/UpdateGoalUseCase';
import { IGoalRepository } from '../../../../clean-architecture/domain/repositories/IGoalRepository';
import { Goal, GoalProps } from '../../../../clean-architecture/domain/entities/Goal';
import { Money } from '../../../../clean-architecture/shared/utils/Money';

describe('UpdateGoalUseCase', () => {
  let updateGoalUseCase: UpdateGoalUseCase;
  let mockGoalRepository: jest.Mocked<IGoalRepository>;
  let mockGoal: Goal;
  let updatedGoal: Goal;

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

    updateGoalUseCase = new UpdateGoalUseCase(mockGoalRepository);

    mockGoal = new Goal({
      id: '1',
      userId: 'user-1',
      description: 'Viagem para Europa',
      type: 'economia',
      targetValue: new Money(50000, 'BRL'),
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      monthlyIncome: new Money(8000, 'BRL'),
      fixedExpenses: new Money(3000, 'BRL'),
      availablePerMonth: new Money(2000, 'BRL'),
      importance: 'alta',
      priority: 1,
      monthlyContribution: new Money(1500, 'BRL'),
      numParcela: 24,
      status: 'active',
    });

    // Mock do goal atualizado
    updatedGoal = new Goal({
      id: '1',
      userId: 'user-1',
      description: 'Viagem para Europa Atualizada',
      type: 'economia',
      targetValue: new Money(60000, 'BRL'),
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      monthlyIncome: new Money(8000, 'BRL'),
      fixedExpenses: new Money(3000, 'BRL'),
      availablePerMonth: new Money(2000, 'BRL'),
      importance: 'alta',
      priority: 2,
      monthlyContribution: new Money(1500, 'BRL'),
      numParcela: 24,
      status: 'active',
    });
  });

  describe('execute', () => {
    it('should update an existing goal successfully', async () => {
      // Arrange
      const goalId = '1';
      const updateData: Partial<GoalProps> = {
        description: 'Viagem para Europa Atualizada',
        targetValue: new Money(60000, 'BRL'),
        priority: 2,
      };

      mockGoalRepository.findById.mockResolvedValue(mockGoal);
      mockGoalRepository.save.mockResolvedValue(updatedGoal);

      // Act
      const result = await updateGoalUseCase.execute(goalId, updateData);

      // Assert
      expect(mockGoalRepository.findById).toHaveBeenCalledWith(goalId);
      expect(mockGoalRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: goalId,
          description: 'Viagem para Europa Atualizada',
          targetValue: new Money(60000, 'BRL'),
          priority: 2,
        })
      );
      expect(result).toBeDefined();
      expect(result.id).toBe(goalId);
      expect(result.description).toBe('Viagem para Europa Atualizada');
    });

    it('should throw error when goal is not found', async () => {
      // Arrange
      const goalId = '999';
      const updateData: Partial<GoalProps> = {
        description: 'Meta Inexistente',
      };

      mockGoalRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(updateGoalUseCase.execute(goalId, updateData))
        .rejects
        .toThrow('Goal not found');

      expect(mockGoalRepository.findById).toHaveBeenCalledWith(goalId);
      expect(mockGoalRepository.save).not.toHaveBeenCalled();
    });

    it('should validate goal data before updating', async () => {
      // Arrange
      const goalId = '1';
      const invalidUpdateData: Partial<GoalProps> = {
        description: '', // Descrição vazia é inválida
      };

      mockGoalRepository.findById.mockResolvedValue(mockGoal);

      // Act & Assert
      await expect(updateGoalUseCase.execute(goalId, invalidUpdateData))
        .rejects
        .toThrow('Goal description cannot be empty');

      expect(mockGoalRepository.findById).toHaveBeenCalledWith(goalId);
      expect(mockGoalRepository.save).not.toHaveBeenCalled();
    });

    it('should preserve existing properties when updating partial data', async () => {
      // Arrange
      const goalId = '1';
      const updateData: Partial<GoalProps> = {
        description: 'Novo Nome da Meta',
      };

      const partiallyUpdatedGoal = new Goal({
        id: '1',
        userId: 'user-1',
        description: 'Novo Nome da Meta',
        type: 'economia',
        targetValue: new Money(50000, 'BRL'),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        monthlyIncome: new Money(8000, 'BRL'),
        fixedExpenses: new Money(3000, 'BRL'),
        availablePerMonth: new Money(2000, 'BRL'),
        importance: 'alta',
        priority: 1,
        monthlyContribution: new Money(1500, 'BRL'),
        numParcela: 24,
        status: 'active',
      });

      mockGoalRepository.findById.mockResolvedValue(mockGoal);
      mockGoalRepository.save.mockResolvedValue(partiallyUpdatedGoal);

      // Act
      const result = await updateGoalUseCase.execute(goalId, updateData);

      // Assert
      expect(result.description).toBe('Novo Nome da Meta');
      expect(result.targetValue.value).toBe(50000); // Preservado
      expect(result.priority).toBe(1); // Preservado
      expect(result.status).toBe('active'); // Preservado
    });

    it('should handle repository errors gracefully', async () => {
      // Arrange
      const goalId = '1';
      const updateData: Partial<GoalProps> = {
        description: 'Test Goal',
      };

      mockGoalRepository.findById.mockResolvedValue(mockGoal);
      mockGoalRepository.save.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(updateGoalUseCase.execute(goalId, updateData))
        .rejects
        .toThrow('Database error');
    });
  });
}); 