// Use Case: UpdateGoalUseCase
// Responsável por atualizar uma meta existente

import { IGoalRepository } from '../repositories/IGoalRepository';
import { Goal, GoalProps } from '../entities/Goal';

export class UpdateGoalUseCase {
  constructor(private goalRepository: IGoalRepository) {}

  async execute(goalId: string, updateData: Partial<GoalProps>): Promise<Goal> {
    // Buscar meta existente
    const existingGoal = await this.goalRepository.findById(goalId);
    if (!existingGoal) {
      throw new Error('Goal not found');
    }

    // Validar dados de atualização
    this.validateUpdateData(updateData);

    // Criar nova meta com dados atualizados
    const updatedGoalProps: GoalProps = {
      id: goalId,
      userId: updateData.userId || existingGoal.userId,
      description: updateData.description || existingGoal.description,
      type: updateData.type || existingGoal.type,
      targetValue: updateData.targetValue || existingGoal.targetValue,
      startDate: updateData.startDate || existingGoal.startDate,
      endDate: updateData.endDate || existingGoal.endDate,
      monthlyIncome: updateData.monthlyIncome || existingGoal.monthlyIncome,
      fixedExpenses: updateData.fixedExpenses || existingGoal.fixedExpenses,
      availablePerMonth: updateData.availablePerMonth || existingGoal.availablePerMonth,
      importance: updateData.importance || existingGoal.importance,
      priority: updateData.priority || existingGoal.priority,
      monthlyContribution: updateData.monthlyContribution || existingGoal.monthlyContribution,
      numParcela: updateData.numParcela || existingGoal.numParcela,
      status: updateData.status || existingGoal.status,
    };

    const updatedGoal = new Goal(updatedGoalProps);

    // Salvar meta atualizada
    const savedGoal = await this.goalRepository.save(updatedGoal);
    return savedGoal;
  }

  private validateUpdateData(updateData: Partial<GoalProps>): void {
    if (updateData.description !== undefined && updateData.description.trim() === '') {
      throw new Error('Goal description cannot be empty');
    }

    if (updateData.priority !== undefined && (updateData.priority < 1 || updateData.priority > 5)) {
      throw new Error('Priority must be between 1 and 5');
    }

    if (updateData.targetValue !== undefined && updateData.targetValue.value <= 0) {
      throw new Error('Target value must be greater than zero');
    }
  }
} 