// Tests for Budget Entity
import { Budget } from '../../../clean-architecture/domain/entities/Budget';
import { Money } from '../../../clean-architecture/shared/utils/Money';

describe('Budget Entity', () => {
  describe('constructor', () => {
    it('should create budget with valid data', () => {
      const budget = new Budget({
        id: 'budget-123',
        userId: 'user-456',
        name: 'Orçamento Janeiro 2024',
        startPeriod: new Date('2024-01-01'),
        endPeriod: new Date('2024-01-31'),
        type: 'manual',
        totalPlannedValue: new Money(5000, 'BRL'),
        isActive: true,
        status: 'active'
      });

      expect(budget.id).toBe('budget-123');
      expect(budget.userId).toBe('user-456');
      expect(budget.name).toBe('Orçamento Janeiro 2024');
      expect(budget.startPeriod).toEqual(new Date('2024-01-01'));
      expect(budget.endPeriod).toEqual(new Date('2024-01-31'));
      expect(budget.type).toBe('manual');
      expect(budget.totalPlannedValue).toEqual(new Money(5000, 'BRL'));
      expect(budget.isActive).toBe(true);
      expect(budget.status).toBe('active');
    });

    it('should create budget with minimal required data', () => {
      const budget = new Budget({
        id: 'budget-123',
        userId: 'user-456',
        name: 'Orçamento Teste',
        startPeriod: new Date('2024-01-01'),
        endPeriod: new Date('2024-01-31'),
        type: 'manual',
        totalPlannedValue: new Money(1000, 'BRL')
      });

      expect(budget.id).toBe('budget-123');
      expect(budget.userId).toBe('user-456');
      expect(budget.name).toBe('Orçamento Teste');
      expect(budget.isActive).toBe(true);
      expect(budget.status).toBe('active');
    });
  });

  describe('validation', () => {
    it('should throw error for empty name', () => {
      expect(() => {
        new Budget({
          id: 'budget-123',
          userId: 'user-456',
          name: '',
          startPeriod: new Date('2024-01-01'),
          endPeriod: new Date('2024-01-31'),
          type: 'manual',
          totalPlannedValue: new Money(1000, 'BRL')
        });
      }).toThrow('Budget name cannot be empty');
    });

    it('should throw error for whitespace name', () => {
      expect(() => {
        new Budget({
          id: 'budget-123',
          userId: 'user-456',
          name: '   ',
          startPeriod: new Date('2024-01-01'),
          endPeriod: new Date('2024-01-31'),
          type: 'manual',
          totalPlannedValue: new Money(1000, 'BRL')
        });
      }).toThrow('Budget name cannot be empty');
    });

    it('should throw error for invalid type', () => {
      expect(() => {
        new Budget({
          id: 'budget-123',
          userId: 'user-456',
          name: 'Orçamento Teste',
          startPeriod: new Date('2024-01-01'),
          endPeriod: new Date('2024-01-31'),
          type: 'invalid' as any,
          totalPlannedValue: new Money(1000, 'BRL')
        });
      }).toThrow('Invalid budget type: invalid');
    });

    it('should throw error for invalid status', () => {
      expect(() => {
        new Budget({
          id: 'budget-123',
          userId: 'user-456',
          name: 'Orçamento Teste',
          startPeriod: new Date('2024-01-01'),
          endPeriod: new Date('2024-01-31'),
          type: 'manual',
          totalPlannedValue: new Money(1000, 'BRL'),
          status: 'invalid' as any
        });
      }).toThrow('Invalid budget status: invalid');
    });

    it('should throw error for end period before start period', () => {
      expect(() => {
        new Budget({
          id: 'budget-123',
          userId: 'user-456',
          name: 'Orçamento Teste',
          startPeriod: new Date('2024-01-31'),
          endPeriod: new Date('2024-01-01'),
          type: 'manual',
          totalPlannedValue: new Money(1000, 'BRL')
        });
      }).toThrow('End period cannot be before start period');
    });

    it('should throw error for negative planned value', () => {
      expect(() => {
        new Budget({
          id: 'budget-123',
          userId: 'user-456',
          name: 'Orçamento Teste',
          startPeriod: new Date('2024-01-01'),
          endPeriod: new Date('2024-01-31'),
          type: 'manual',
          totalPlannedValue: new Money(-1000, 'BRL')
        });
      }).toThrow('Amount cannot be negative');
    });
  });

  describe('business methods', () => {
    it('should deactivate budget', () => {
      const budget = new Budget({
        id: 'budget-123',
        userId: 'user-456',
        name: 'Orçamento Teste',
        startPeriod: new Date('2024-01-01'),
        endPeriod: new Date('2024-01-31'),
        type: 'manual',
        totalPlannedValue: new Money(1000, 'BRL'),
        isActive: true,
        status: 'active'
      });

      const deactivatedBudget = budget.deactivate();

      expect(deactivatedBudget.isActive).toBe(false);
      expect(deactivatedBudget.status).toBe('inactive');
      expect(deactivatedBudget.id).toBe(budget.id);
    });

    it('should activate budget', () => {
      const budget = new Budget({
        id: 'budget-123',
        userId: 'user-456',
        name: 'Orçamento Teste',
        startPeriod: new Date('2024-01-01'),
        endPeriod: new Date('2024-01-31'),
        type: 'manual',
        totalPlannedValue: new Money(1000, 'BRL'),
        isActive: false,
        status: 'inactive'
      });

      const activatedBudget = budget.activate();

      expect(activatedBudget.isActive).toBe(true);
      expect(activatedBudget.status).toBe('active');
      expect(activatedBudget.id).toBe(budget.id);
    });

    it('should update total planned value', () => {
      const budget = new Budget({
        id: 'budget-123',
        userId: 'user-456',
        name: 'Orçamento Teste',
        startPeriod: new Date('2024-01-01'),
        endPeriod: new Date('2024-01-31'),
        type: 'manual',
        totalPlannedValue: new Money(1000, 'BRL')
      });

      const updatedBudget = budget.updateTotalPlannedValue(new Money(2000, 'BRL'));

      expect(updatedBudget.totalPlannedValue).toEqual(new Money(2000, 'BRL'));
      expect(updatedBudget.id).toBe(budget.id);
    });

    it('should throw error when updating with negative value', () => {
      const budget = new Budget({
        id: 'budget-123',
        userId: 'user-456',
        name: 'Orçamento Teste',
        startPeriod: new Date('2024-01-01'),
        endPeriod: new Date('2024-01-31'),
        type: 'manual',
        totalPlannedValue: new Money(1000, 'BRL')
      });

      expect(() => {
        budget.updateTotalPlannedValue(new Money(-500, 'BRL'));
      }).toThrow('Amount cannot be negative');
    });

    it('should check if budget is active', () => {
      const activeBudget = new Budget({
        id: 'budget-123',
        userId: 'user-456',
        name: 'Orçamento Ativo',
        startPeriod: new Date('2024-01-01'),
        endPeriod: new Date('2024-01-31'),
        type: 'manual',
        totalPlannedValue: new Money(1000, 'BRL'),
        isActive: true
      });

      const inactiveBudget = new Budget({
        id: 'budget-124',
        userId: 'user-456',
        name: 'Orçamento Inativo',
        startPeriod: new Date('2024-01-01'),
        endPeriod: new Date('2024-01-31'),
        type: 'manual',
        totalPlannedValue: new Money(1000, 'BRL'),
        isActive: false
      });

      expect(activeBudget.isActive).toBe(true);
      expect(inactiveBudget.isActive).toBe(false);
    });

    it('should get budget duration in days', () => {
      const budget = new Budget({
        id: 'budget-123',
        userId: 'user-456',
        name: 'Orçamento Teste',
        startPeriod: new Date('2024-01-01'),
        endPeriod: new Date('2024-01-31'),
        type: 'manual',
        totalPlannedValue: new Money(1000, 'BRL')
      });

      const duration = budget.getDurationInDays();

      expect(duration).toBe(30); // 31 days - 1 day = 30 days difference
    });
  });

  describe('immutability', () => {
    it('should return new instance when updating values', () => {
      const originalBudget = new Budget({
        id: 'budget-123',
        userId: 'user-456',
        name: 'Orçamento Original',
        startPeriod: new Date('2024-01-01'),
        endPeriod: new Date('2024-01-31'),
        type: 'manual',
        totalPlannedValue: new Money(1000, 'BRL')
      });

      const updatedBudget = originalBudget.updateTotalPlannedValue(new Money(2000, 'BRL'));

      expect(updatedBudget).not.toBe(originalBudget);
      expect(originalBudget.totalPlannedValue).toEqual(new Money(1000, 'BRL'));
      expect(updatedBudget.totalPlannedValue).toEqual(new Money(2000, 'BRL'));
    });
  });
});
