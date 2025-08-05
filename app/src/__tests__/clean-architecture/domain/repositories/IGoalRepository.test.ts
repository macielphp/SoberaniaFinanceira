// Tests for IGoalRepository Interface
import { IGoalRepository } from '../../../../clean-architecture/domain/repositories/IGoalRepository';
import { Goal } from '../../../../clean-architecture/domain/entities/Goal';
import { Money } from '../../../../clean-architecture/shared/utils/Money';

// Mock implementation for testing
class MockGoalRepository implements IGoalRepository {
  private goals: Goal[] = [];

  async save(goal: Goal): Promise<Goal> {
    const existingIndex = this.goals.findIndex(g => g.id === goal.id);
    if (existingIndex >= 0) {
      this.goals[existingIndex] = goal;
    } else {
      this.goals.push(goal);
    }
    return goal;
  }

  async findById(id: string): Promise<Goal | null> {
    return this.goals.find(g => g.id === id) || null;
  }

  async findAll(): Promise<Goal[]> {
    return [...this.goals];
  }

  async findByUserId(userId: string): Promise<Goal[]> {
    return this.goals.filter(g => g.userId === userId);
  }

  async findByType(type: string): Promise<Goal[]> {
    return this.goals.filter(g => g.type === type);
  }

  async findByStatus(status: string): Promise<Goal[]> {
    return this.goals.filter(g => g.status === status);
  }

  async findActive(): Promise<Goal[]> {
    return this.goals.filter(g => g.isActive());
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Goal[]> {
    return this.goals.filter(g => 
      g.startDate >= startDate && g.endDate <= endDate
    );
  }

  async delete(id: string): Promise<boolean> {
    const index = this.goals.findIndex(g => g.id === id);
    if (index >= 0) {
      this.goals.splice(index, 1);
      return true;
    }
    return false;
  }

  async count(): Promise<number> {
    return this.goals.length;
  }

  async countByUserId(userId: string): Promise<number> {
    return this.goals.filter(g => g.userId === userId).length;
  }

  async countActive(): Promise<number> {
    return this.goals.filter(g => g.isActive()).length;
  }
}

describe('IGoalRepository', () => {
  let repository: IGoalRepository;

  beforeEach(() => {
    repository = new MockGoalRepository();
  });

  describe('save', () => {
    it('should save a new goal', async () => {
      const goal = new Goal({
        id: 'goal-1',
        userId: 'user-1',
        description: 'Comprar um carro',
        type: 'compra',
        targetValue: new Money(50000, 'BRL'),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        monthlyIncome: new Money(5000, 'BRL'),
        fixedExpenses: new Money(2000, 'BRL'),
        availablePerMonth: new Money(3000, 'BRL'),
        importance: 'alta',
        priority: 1,
        monthlyContribution: new Money(1500, 'BRL'),
        numParcela: 12
      });

      const savedGoal = await repository.save(goal);
      expect(savedGoal).toEqual(goal);
      
      const found = await repository.findById('goal-1');
      expect(found).toEqual(goal);
    });

    it('should update an existing goal', async () => {
      const goal = new Goal({
        id: 'goal-1',
        userId: 'user-1',
        description: 'Comprar um carro',
        type: 'compra',
        targetValue: new Money(50000, 'BRL'),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        monthlyIncome: new Money(5000, 'BRL'),
        fixedExpenses: new Money(2000, 'BRL'),
        availablePerMonth: new Money(3000, 'BRL'),
        importance: 'alta',
        priority: 1,
        monthlyContribution: new Money(1500, 'BRL'),
        numParcela: 12
      });

      await repository.save(goal);

      const updatedGoal = new Goal({
        id: 'goal-1',
        userId: 'user-1',
        description: 'Comprar um carro atualizado',
        type: 'compra',
        targetValue: new Money(60000, 'BRL'),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        monthlyIncome: new Money(5000, 'BRL'),
        fixedExpenses: new Money(2000, 'BRL'),
        availablePerMonth: new Money(3000, 'BRL'),
        importance: 'alta',
        priority: 1,
        monthlyContribution: new Money(1500, 'BRL'),
        numParcela: 12
      });

      const saved = await repository.save(updatedGoal);
      expect(saved.description).toBe('Comprar um carro atualizado');
      expect(saved.targetValue.value).toBe(60000);
      
      const found = await repository.findById('goal-1');
      expect(found?.description).toBe('Comprar um carro atualizado');
    });
  });

  describe('findById', () => {
    it('should return goal when found', async () => {
      const goal = new Goal({
        id: 'goal-1',
        userId: 'user-1',
        description: 'Comprar um carro',
        type: 'compra',
        targetValue: new Money(50000, 'BRL'),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        monthlyIncome: new Money(5000, 'BRL'),
        fixedExpenses: new Money(2000, 'BRL'),
        availablePerMonth: new Money(3000, 'BRL'),
        importance: 'alta',
        priority: 1,
        monthlyContribution: new Money(1500, 'BRL'),
        numParcela: 12
      });

      await repository.save(goal);
      const found = await repository.findById('goal-1');
      expect(found).toEqual(goal);
    });

    it('should return null when goal not found', async () => {
      const found = await repository.findById('non-existent');
      expect(found).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all goals', async () => {
      const goal1 = new Goal({
        id: 'goal-1',
        userId: 'user-1',
        description: 'Comprar um carro',
        type: 'compra',
        targetValue: new Money(50000, 'BRL'),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        monthlyIncome: new Money(5000, 'BRL'),
        fixedExpenses: new Money(2000, 'BRL'),
        availablePerMonth: new Money(3000, 'BRL'),
        importance: 'alta',
        priority: 1,
        monthlyContribution: new Money(1500, 'BRL'),
        numParcela: 12
      });

      const goal2 = new Goal({
        id: 'goal-2',
        userId: 'user-1',
        description: 'Economizar para emergências',
        type: 'economia',
        targetValue: new Money(10000, 'BRL'),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-06-30'),
        monthlyIncome: new Money(3000, 'BRL'),
        fixedExpenses: new Money(1500, 'BRL'),
        availablePerMonth: new Money(1500, 'BRL'),
        importance: 'média',
        priority: 2,
        monthlyContribution: new Money(500, 'BRL'),
        numParcela: 6
      });

      await repository.save(goal1);
      await repository.save(goal2);

      const allGoals = await repository.findAll();
      expect(allGoals).toHaveLength(2);
      expect(allGoals).toContainEqual(goal1);
      expect(allGoals).toContainEqual(goal2);
    });

    it('should return empty array when no goals exist', async () => {
      const allGoals = await repository.findAll();
      expect(allGoals).toEqual([]);
    });
  });

  describe('findByUserId', () => {
    it('should return goals for specific user', async () => {
      const user1Goal = new Goal({
        id: 'goal-1',
        userId: 'user-1',
        description: 'Comprar um carro',
        type: 'compra',
        targetValue: new Money(50000, 'BRL'),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        monthlyIncome: new Money(5000, 'BRL'),
        fixedExpenses: new Money(2000, 'BRL'),
        availablePerMonth: new Money(3000, 'BRL'),
        importance: 'alta',
        priority: 1,
        monthlyContribution: new Money(1500, 'BRL'),
        numParcela: 12
      });

      const user2Goal = new Goal({
        id: 'goal-2',
        userId: 'user-2',
        description: 'Economizar para emergências',
        type: 'economia',
        targetValue: new Money(10000, 'BRL'),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-06-30'),
        monthlyIncome: new Money(3000, 'BRL'),
        fixedExpenses: new Money(1500, 'BRL'),
        availablePerMonth: new Money(1500, 'BRL'),
        importance: 'média',
        priority: 2,
        monthlyContribution: new Money(500, 'BRL'),
        numParcela: 6
      });

      await repository.save(user1Goal);
      await repository.save(user2Goal);

      const user1Goals = await repository.findByUserId('user-1');
      expect(user1Goals).toHaveLength(1);
      expect(user1Goals).toContainEqual(user1Goal);
      expect(user1Goals).not.toContainEqual(user2Goal);
    });
  });

  describe('findByType', () => {
    it('should return goals of specific type', async () => {
      const compraGoal = new Goal({
        id: 'goal-1',
        userId: 'user-1',
        description: 'Comprar um carro',
        type: 'compra',
        targetValue: new Money(50000, 'BRL'),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        monthlyIncome: new Money(5000, 'BRL'),
        fixedExpenses: new Money(2000, 'BRL'),
        availablePerMonth: new Money(3000, 'BRL'),
        importance: 'alta',
        priority: 1,
        monthlyContribution: new Money(1500, 'BRL'),
        numParcela: 12
      });

      const economiaGoal = new Goal({
        id: 'goal-2',
        userId: 'user-1',
        description: 'Economizar para emergências',
        type: 'economia',
        targetValue: new Money(10000, 'BRL'),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-06-30'),
        monthlyIncome: new Money(3000, 'BRL'),
        fixedExpenses: new Money(1500, 'BRL'),
        availablePerMonth: new Money(1500, 'BRL'),
        importance: 'média',
        priority: 2,
        monthlyContribution: new Money(500, 'BRL'),
        numParcela: 6
      });

      await repository.save(compraGoal);
      await repository.save(economiaGoal);

      const compraGoals = await repository.findByType('compra');
      expect(compraGoals).toHaveLength(1);
      expect(compraGoals).toContainEqual(compraGoal);

      const economiaGoals = await repository.findByType('economia');
      expect(economiaGoals).toHaveLength(1);
      expect(economiaGoals).toContainEqual(economiaGoal);
    });
  });

  describe('findByStatus', () => {
    it('should return goals of specific status', async () => {
      const activeGoal = new Goal({
        id: 'goal-1',
        userId: 'user-1',
        description: 'Comprar um carro',
        type: 'compra',
        targetValue: new Money(50000, 'BRL'),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        monthlyIncome: new Money(5000, 'BRL'),
        fixedExpenses: new Money(2000, 'BRL'),
        availablePerMonth: new Money(3000, 'BRL'),
        importance: 'alta',
        priority: 1,
        monthlyContribution: new Money(1500, 'BRL'),
        numParcela: 12,
        status: 'active'
      });

      const completedGoal = new Goal({
        id: 'goal-2',
        userId: 'user-1',
        description: 'Economizar para emergências',
        type: 'economia',
        targetValue: new Money(10000, 'BRL'),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-06-30'),
        monthlyIncome: new Money(3000, 'BRL'),
        fixedExpenses: new Money(1500, 'BRL'),
        availablePerMonth: new Money(1500, 'BRL'),
        importance: 'média',
        priority: 2,
        monthlyContribution: new Money(500, 'BRL'),
        numParcela: 6,
        status: 'completed'
      });

      await repository.save(activeGoal);
      await repository.save(completedGoal);

      const activeGoals = await repository.findByStatus('active');
      expect(activeGoals).toHaveLength(1);
      expect(activeGoals).toContainEqual(activeGoal);

      const completedGoals = await repository.findByStatus('completed');
      expect(completedGoals).toHaveLength(1);
      expect(completedGoals).toContainEqual(completedGoal);
    });
  });

  describe('findActive', () => {
    it('should return only active goals', async () => {
      const activeGoal = new Goal({
        id: 'goal-1',
        userId: 'user-1',
        description: 'Comprar um carro',
        type: 'compra',
        targetValue: new Money(50000, 'BRL'),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        monthlyIncome: new Money(5000, 'BRL'),
        fixedExpenses: new Money(2000, 'BRL'),
        availablePerMonth: new Money(3000, 'BRL'),
        importance: 'alta',
        priority: 1,
        monthlyContribution: new Money(1500, 'BRL'),
        numParcela: 12,
        status: 'active'
      });

      const completedGoal = new Goal({
        id: 'goal-2',
        userId: 'user-1',
        description: 'Economizar para emergências',
        type: 'economia',
        targetValue: new Money(10000, 'BRL'),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-06-30'),
        monthlyIncome: new Money(3000, 'BRL'),
        fixedExpenses: new Money(1500, 'BRL'),
        availablePerMonth: new Money(1500, 'BRL'),
        importance: 'média',
        priority: 2,
        monthlyContribution: new Money(500, 'BRL'),
        numParcela: 6,
        status: 'completed'
      });

      await repository.save(activeGoal);
      await repository.save(completedGoal);

      const activeGoals = await repository.findActive();
      expect(activeGoals).toHaveLength(1);
      expect(activeGoals).toContainEqual(activeGoal);
      expect(activeGoals).not.toContainEqual(completedGoal);
    });
  });

  describe('findByDateRange', () => {
    it('should return goals within date range', async () => {
      const goal1 = new Goal({
        id: 'goal-1',
        userId: 'user-1',
        description: 'Comprar um carro',
        type: 'compra',
        targetValue: new Money(50000, 'BRL'),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-06-30'),
        monthlyIncome: new Money(5000, 'BRL'),
        fixedExpenses: new Money(2000, 'BRL'),
        availablePerMonth: new Money(3000, 'BRL'),
        importance: 'alta',
        priority: 1,
        monthlyContribution: new Money(1500, 'BRL'),
        numParcela: 12
      });

      const goal2 = new Goal({
        id: 'goal-2',
        userId: 'user-1',
        description: 'Economizar para emergências',
        type: 'economia',
        targetValue: new Money(10000, 'BRL'),
        startDate: new Date('2024-07-01'),
        endDate: new Date('2024-12-31'),
        monthlyIncome: new Money(3000, 'BRL'),
        fixedExpenses: new Money(1500, 'BRL'),
        availablePerMonth: new Money(1500, 'BRL'),
        importance: 'média',
        priority: 2,
        monthlyContribution: new Money(500, 'BRL'),
        numParcela: 6
      });

      await repository.save(goal1);
      await repository.save(goal2);

      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-06-30');
      const goalsInRange = await repository.findByDateRange(startDate, endDate);

      expect(goalsInRange).toHaveLength(1);
      expect(goalsInRange).toContainEqual(goal1);
      expect(goalsInRange).not.toContainEqual(goal2);
    });
  });

  describe('delete', () => {
    it('should delete goal and return true', async () => {
      const goal = new Goal({
        id: 'goal-1',
        userId: 'user-1',
        description: 'Comprar um carro',
        type: 'compra',
        targetValue: new Money(50000, 'BRL'),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        monthlyIncome: new Money(5000, 'BRL'),
        fixedExpenses: new Money(2000, 'BRL'),
        availablePerMonth: new Money(3000, 'BRL'),
        importance: 'alta',
        priority: 1,
        monthlyContribution: new Money(1500, 'BRL'),
        numParcela: 12
      });

      await repository.save(goal);
      const deleted = await repository.delete('goal-1');
      expect(deleted).toBe(true);

      const found = await repository.findById('goal-1');
      expect(found).toBeNull();
    });

    it('should return false when goal does not exist', async () => {
      const deleted = await repository.delete('non-existent');
      expect(deleted).toBe(false);
    });
  });

  describe('count', () => {
    it('should return correct count of goals', async () => {
      expect(await repository.count()).toBe(0);

      const goal1 = new Goal({
        id: 'goal-1',
        userId: 'user-1',
        description: 'Comprar um carro',
        type: 'compra',
        targetValue: new Money(50000, 'BRL'),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        monthlyIncome: new Money(5000, 'BRL'),
        fixedExpenses: new Money(2000, 'BRL'),
        availablePerMonth: new Money(3000, 'BRL'),
        importance: 'alta',
        priority: 1,
        monthlyContribution: new Money(1500, 'BRL'),
        numParcela: 12
      });

      await repository.save(goal1);
      expect(await repository.count()).toBe(1);

      const goal2 = new Goal({
        id: 'goal-2',
        userId: 'user-1',
        description: 'Economizar para emergências',
        type: 'economia',
        targetValue: new Money(10000, 'BRL'),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-06-30'),
        monthlyIncome: new Money(3000, 'BRL'),
        fixedExpenses: new Money(1500, 'BRL'),
        availablePerMonth: new Money(1500, 'BRL'),
        importance: 'média',
        priority: 2,
        monthlyContribution: new Money(500, 'BRL'),
        numParcela: 6
      });

      await repository.save(goal2);
      expect(await repository.count()).toBe(2);
    });
  });

  describe('countByUserId', () => {
    it('should return correct count of goals by user', async () => {
      expect(await repository.countByUserId('user-1')).toBe(0);
      expect(await repository.countByUserId('user-2')).toBe(0);

      const user1Goal = new Goal({
        id: 'goal-1',
        userId: 'user-1',
        description: 'Comprar um carro',
        type: 'compra',
        targetValue: new Money(50000, 'BRL'),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        monthlyIncome: new Money(5000, 'BRL'),
        fixedExpenses: new Money(2000, 'BRL'),
        availablePerMonth: new Money(3000, 'BRL'),
        importance: 'alta',
        priority: 1,
        monthlyContribution: new Money(1500, 'BRL'),
        numParcela: 12
      });

      await repository.save(user1Goal);
      expect(await repository.countByUserId('user-1')).toBe(1);
      expect(await repository.countByUserId('user-2')).toBe(0);

      const user2Goal = new Goal({
        id: 'goal-2',
        userId: 'user-2',
        description: 'Economizar para emergências',
        type: 'economia',
        targetValue: new Money(10000, 'BRL'),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-06-30'),
        monthlyIncome: new Money(3000, 'BRL'),
        fixedExpenses: new Money(1500, 'BRL'),
        availablePerMonth: new Money(1500, 'BRL'),
        importance: 'média',
        priority: 2,
        monthlyContribution: new Money(500, 'BRL'),
        numParcela: 6
      });

      await repository.save(user2Goal);
      expect(await repository.countByUserId('user-1')).toBe(1);
      expect(await repository.countByUserId('user-2')).toBe(1);
    });
  });

  describe('countActive', () => {
    it('should return correct count of active goals', async () => {
      expect(await repository.countActive()).toBe(0);

      const activeGoal = new Goal({
        id: 'goal-1',
        userId: 'user-1',
        description: 'Comprar um carro',
        type: 'compra',
        targetValue: new Money(50000, 'BRL'),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        monthlyIncome: new Money(5000, 'BRL'),
        fixedExpenses: new Money(2000, 'BRL'),
        availablePerMonth: new Money(3000, 'BRL'),
        importance: 'alta',
        priority: 1,
        monthlyContribution: new Money(1500, 'BRL'),
        numParcela: 12,
        status: 'active'
      });

      await repository.save(activeGoal);
      expect(await repository.countActive()).toBe(1);

      const completedGoal = new Goal({
        id: 'goal-2',
        userId: 'user-1',
        description: 'Economizar para emergências',
        type: 'economia',
        targetValue: new Money(10000, 'BRL'),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-06-30'),
        monthlyIncome: new Money(3000, 'BRL'),
        fixedExpenses: new Money(1500, 'BRL'),
        availablePerMonth: new Money(1500, 'BRL'),
        importance: 'média',
        priority: 2,
        monthlyContribution: new Money(500, 'BRL'),
        numParcela: 6,
        status: 'completed'
      });

      await repository.save(completedGoal);
      expect(await repository.countActive()).toBe(1); // Still 1 active
      expect(await repository.count()).toBe(2); // Total 2
    });
  });
}); 