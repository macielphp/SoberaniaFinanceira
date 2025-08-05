// Use Case: GetGoalsUseCase
// Responsável por buscar todas as metas do sistema

import { IGoalRepository } from '../repositories/IGoalRepository';
import { Goal } from '../entities/Goal';
import { Result, success, failure } from '../../shared/utils/Result';

// Response interface
export interface GetGoalsResponse {
  goals: Goal[];
  total: number;
}

export class GetGoalsUseCase {
  constructor(
    private goalRepository: IGoalRepository
  ) {}

  async execute(): Promise<Result<GetGoalsResponse, string>> {
    try {
      // Get all goals from repository
      const goals = await this.goalRepository.findAll();
      
      // Get total count
      const total = await this.goalRepository.count();

      return success<GetGoalsResponse, string>({
        goals,
        total
      });
    } catch (error) {
      return failure<GetGoalsResponse, string>('Failed to get goals');
    }
  }
} 