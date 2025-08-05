// Use Case: GetGoalByIdUseCase
// Responsável por buscar uma meta específica por ID

import { IGoalRepository } from '../repositories/IGoalRepository';
import { Goal } from '../entities/Goal';
import { Result, success, failure } from '../../shared/utils/Result';

// Output DTO for the use case result
export interface GetGoalByIdResponse {
  goal: Goal | null;
}

export class GetGoalByIdUseCase {
  constructor(private goalRepository: IGoalRepository) {}

  async execute(goalId: string): Promise<Result<GetGoalByIdResponse, Error>> {
    try {
      // Validate goal ID
      if (!goalId || goalId.trim() === '') {
        return failure<GetGoalByIdResponse, Error>(new Error('Goal ID cannot be empty'));
      }

      // Find goal by ID
      const goal = await this.goalRepository.findById(goalId);
      
      return success<GetGoalByIdResponse, Error>({ goal });
    } catch (error) {
      return failure<GetGoalByIdResponse, Error>(
        new Error(`Failed to get goal${error instanceof Error ? ': ' + error.message : ''}`)
      );
    }
  }
} 