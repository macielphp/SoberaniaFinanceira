// Use Case: DeleteGoalUseCase
// Responsável por deletar uma meta existente

import { IGoalRepository } from '../repositories/IGoalRepository';
import { Result, success, failure } from '../../shared/utils/Result';
import { EventBus } from '../../shared/events/EventBus';
import { DomainEventFactory } from '../events/DomainEvents';

// Output DTO for the use case result
export interface DeleteGoalResponse {
  deleted: boolean;
}

export class DeleteGoalUseCase {
  constructor(
    private goalRepository: IGoalRepository,
    private eventBus?: EventBus
  ) {}

  async execute(goalId: string): Promise<Result<DeleteGoalResponse, Error>> {
    try {
      // Validate goal ID
      if (!goalId || goalId.trim() === '') {
        return failure<DeleteGoalResponse, Error>(new Error('Goal ID cannot be empty'));
      }

      // Check if goal exists
      const existingGoal = await this.goalRepository.findById(goalId);
      if (!existingGoal) {
        return success<DeleteGoalResponse, Error>({ deleted: false });
      }

      // Delete goal from repository
      const deleted = await this.goalRepository.delete(goalId);
      
      // Publicar evento se EventBus estiver disponível e a meta foi deletada
      if (this.eventBus && deleted) {
        const event = DomainEventFactory.createGoalDeleted(goalId);
        this.eventBus.publish('GoalDeleted', event);
      }
      
      return success<DeleteGoalResponse, Error>({ deleted: deleted });
    } catch (error) {
      return failure<DeleteGoalResponse, Error>(
        new Error(`Failed to delete goal${error instanceof Error ? ': ' + error.message : ''}`)
      );
    }
  }
} 