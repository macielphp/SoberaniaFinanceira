// Tests for GoalMapper
import { GoalMapper } from '../../../../clean-architecture/data/mappers/GoalMapper';
import { Goal } from '../../../../clean-architecture/domain/entities/Goal';
import { GoalDTO } from '../../../../clean-architecture/data/dto/GoalDTO';
import { Money } from '../../../../clean-architecture/shared/utils/Money';

describe('GoalMapper', () => {
  let mapper: GoalMapper;

  beforeEach(() => {
    mapper = new GoalMapper();
  });

  describe('toDomain', () => {
    it('should map GoalDTO to Goal entity', () => {
      const goalDTO: GoalDTO = {
        id: 'goal-123',
        user_id: 'user-1',
        description: 'Fundo de emergência',
        type: 'economia',
        target_value: 15000,
        start_date: '2024-01-01T00:00:00.000Z',
        end_date: '2024-12-31T00:00:00.000Z',
        monthly_income: 8000,
        fixed_expenses: 3000,
        available_per_month: 2000,
        importance: 'alta',
        priority: 1,
        strategy: 'Poupar mensalmente',
        monthly_contribution: 1250,
        num_parcela: 12,
        status: 'active',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z'
      };

      const goal = mapper.toDomain(goalDTO);

      expect(goal).toBeInstanceOf(Goal);
      expect(goal.id).toBe('goal-123');
      expect(goal.description).toBe('Fundo de emergência');
      expect(goal.type).toBe('economia');
      expect(goal.targetValue.value).toBe(15000);
      expect(goal.startDate).toEqual(new Date('2024-01-01T00:00:00.000Z'));
      expect(goal.endDate).toEqual(new Date('2024-12-31T00:00:00.000Z'));
      expect(goal.monthlyIncome.value).toBe(8000);
      expect(goal.fixedExpenses.value).toBe(3000);
      expect(goal.availablePerMonth.value).toBe(2000);
      expect(goal.importance).toBe('alta');
      expect(goal.priority).toBe(1);
      expect(goal.monthlyContribution.value).toBe(1250);
      expect(goal.numParcela).toBe(12);
      expect(goal.status).toBe('active');
    });

    it('should handle compra type goal', () => {
      const goalDTO: GoalDTO = {
        id: 'goal-456',
        user_id: 'user-1',
        description: 'Compra de carro',
        type: 'compra',
        target_value: 50000,
        start_date: '2024-01-01T00:00:00.000Z',
        end_date: '2024-12-31T00:00:00.000Z',
        monthly_income: 8000,
        fixed_expenses: 3000,
        available_per_month: 2000,
        importance: 'média',
        priority: 2,
        strategy: undefined,
        monthly_contribution: 4167,
        num_parcela: 12,
        status: 'active',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z'
      };

      const goal = mapper.toDomain(goalDTO);

      expect(goal.type).toBe('compra');
      expect(goal.importance).toBe('média');
      expect(goal.priority).toBe(2);
    });
  });

  describe('toDTO', () => {
    it('should map Goal entity to GoalDTO', () => {
      const goal = new Goal({
        id: 'goal-123',
        description: 'Fundo de emergência',
        type: 'economia',
        targetValue: new Money(15000, 'BRL'),
        startDate: new Date('2024-01-01T00:00:00.000Z'),
        endDate: new Date('2024-12-31T00:00:00.000Z'),
        monthlyIncome: new Money(8000, 'BRL'),
        fixedExpenses: new Money(3000, 'BRL'),
        availablePerMonth: new Money(2000, 'BRL'),
        importance: 'alta',
        priority: 1,
        monthlyContribution: new Money(1250, 'BRL'),
        numParcela: 12,
        status: 'active',
        userId: 'user-1'
      });

      const goalDTO = mapper.toDTO(goal);

      expect(goalDTO.id).toBe('goal-123');
      expect(goalDTO.user_id).toBe('user-1');
      expect(goalDTO.description).toBe('Fundo de emergência');
      expect(goalDTO.type).toBe('economia');
      expect(goalDTO.target_value).toBe(15000);
      expect(goalDTO.start_date).toBe('2024-01-01T00:00:00.000Z');
      expect(goalDTO.end_date).toBe('2024-12-31T00:00:00.000Z');
      expect(goalDTO.monthly_income).toBe(8000);
      expect(goalDTO.fixed_expenses).toBe(3000);
      expect(goalDTO.available_per_month).toBe(2000);
      expect(goalDTO.importance).toBe('alta');
      expect(goalDTO.priority).toBe(1);
      expect(goalDTO.monthly_contribution).toBe(1250);
      expect(goalDTO.num_parcela).toBe(12);
      expect(goalDTO.status).toBe('active');
    });

    it('should handle compra type goal', () => {
      const goal = new Goal({
        id: 'goal-456',
        description: 'Compra de carro',
        type: 'compra',
        targetValue: new Money(50000, 'BRL'),
        startDate: new Date('2024-01-01T00:00:00.000Z'),
        endDate: new Date('2024-12-31T00:00:00.000Z'),
        monthlyIncome: new Money(8000, 'BRL'),
        fixedExpenses: new Money(3000, 'BRL'),
        availablePerMonth: new Money(2000, 'BRL'),
        importance: 'média',
        priority: 2,
        monthlyContribution: new Money(4167, 'BRL'),
        numParcela: 12,
        status: 'active',
        userId: 'user-1'
      });

      const goalDTO = mapper.toDTO(goal);

      expect(goalDTO.type).toBe('compra');
      expect(goalDTO.importance).toBe('média');
      expect(goalDTO.priority).toBe(2);
    });
  });

  describe('toDomainList', () => {
    it('should map array of GoalDTO to array of Goal entities', () => {
      const goalDTOs: GoalDTO[] = [
        {
          id: 'goal-1',
          user_id: 'user-1',
          description: 'Meta 1',
          type: 'economia',
          target_value: 10000,
          start_date: '2024-01-01T00:00:00.000Z',
          end_date: '2024-12-31T00:00:00.000Z',
          monthly_income: 8000,
          fixed_expenses: 3000,
          available_per_month: 2000,
          importance: 'alta',
          priority: 1,
          strategy: undefined,
          monthly_contribution: 833,
          num_parcela: 12,
          status: 'active',
          created_at: '2024-01-01T00:00:00.000Z',
          updated_at: '2024-01-01T00:00:00.000Z'
        },
        {
          id: 'goal-2',
          user_id: 'user-1',
          description: 'Meta 2',
          type: 'compra',
          target_value: 20000,
          start_date: '2024-01-01T00:00:00.000Z',
          end_date: '2024-12-31T00:00:00.000Z',
          monthly_income: 8000,
          fixed_expenses: 3000,
          available_per_month: 2000,
          importance: 'média',
          priority: 2,
          strategy: undefined,
          monthly_contribution: 1667,
          num_parcela: 12,
          status: 'active',
          created_at: '2024-01-01T00:00:00.000Z',
          updated_at: '2024-01-01T00:00:00.000Z'
        }
      ];

      const goals = mapper.toDomainList(goalDTOs);

      expect(goals).toHaveLength(2);
      expect(goals[0]).toBeInstanceOf(Goal);
      expect(goals[1]).toBeInstanceOf(Goal);
      expect(goals[0].description).toBe('Meta 1');
      expect(goals[1].description).toBe('Meta 2');
    });

    it('should return empty array for empty input', () => {
      const goals = mapper.toDomainList([]);

      expect(goals).toHaveLength(0);
    });
  });

  describe('toDTOList', () => {
    it('should map array of Goal entities to array of GoalDTO', () => {
      const goals = [
        new Goal({
          id: 'goal-1',
          description: 'Meta 1',
          type: 'economia',
          targetValue: new Money(10000, 'BRL'),
          startDate: new Date('2024-01-01T00:00:00.000Z'),
          endDate: new Date('2024-12-31T00:00:00.000Z'),
          monthlyIncome: new Money(8000, 'BRL'),
          fixedExpenses: new Money(3000, 'BRL'),
          availablePerMonth: new Money(2000, 'BRL'),
          importance: 'alta',
          priority: 1,
          monthlyContribution: new Money(833, 'BRL'),
          numParcela: 12,
          status: 'active',
          userId: 'user-1'
        }),
        new Goal({
          id: 'goal-2',
          description: 'Meta 2',
          type: 'compra',
          targetValue: new Money(20000, 'BRL'),
          startDate: new Date('2024-01-01T00:00:00.000Z'),
          endDate: new Date('2024-12-31T00:00:00.000Z'),
          monthlyIncome: new Money(8000, 'BRL'),
          fixedExpenses: new Money(3000, 'BRL'),
          availablePerMonth: new Money(2000, 'BRL'),
          importance: 'média',
          priority: 2,
          monthlyContribution: new Money(1667, 'BRL'),
          numParcela: 12,
          status: 'active',
          userId: 'user-1'
        })
      ];

      const goalDTOs = mapper.toDTOList(goals);

      expect(goalDTOs).toHaveLength(2);
      expect(goalDTOs[0].description).toBe('Meta 1');
      expect(goalDTOs[1].description).toBe('Meta 2');
    });

    it('should return empty array for empty input', () => {
      const goalDTOs = mapper.toDTOList([]);

      expect(goalDTOs).toHaveLength(0);
    });
  });
}); 