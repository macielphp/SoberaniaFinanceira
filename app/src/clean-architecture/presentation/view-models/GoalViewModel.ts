import { IGoalRepository } from '../../domain/repositories/IGoalRepository';
import { Goal, GoalProps } from '../../domain/entities/Goal';

export class GoalViewModel {
  public goals: Goal[] = [];
  private goalRepository: IGoalRepository;

  constructor(goalRepository: IGoalRepository) {
    this.goalRepository = goalRepository;
  }

  async loadGoals(): Promise<void> {
    this.goals = await this.goalRepository.findAll();
  }

  async createGoal(goalProps: GoalProps): Promise<void> {
    const goal = new Goal(goalProps);
    await this.goalRepository.save(goal);
    this.goals = await this.goalRepository.findAll();
  }

  async updateGoal(goalProps: GoalProps): Promise<void> {
    const goal = new Goal(goalProps);
    await this.goalRepository.save(goal);
    this.goals = await this.goalRepository.findAll();
  }

  async deleteGoal(goalId: string): Promise<void> {
    await this.goalRepository.delete(goalId);
    this.goals = await this.goalRepository.findAll();
  }
}