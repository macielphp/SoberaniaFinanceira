// Tests for DeleteAccountUseCase
import { DeleteAccountUseCase } from '../../../../clean-architecture/domain/use-cases/DeleteAccountUseCase';
import { IAccountRepository } from '../../../../clean-architecture/domain/repositories/IAccountRepository';
import { Account } from '../../../../clean-architecture/domain/entities/Account';
import { Money } from '../../../../clean-architecture/shared/utils/Money';

// Mock repository for testing
class MockAccountRepository implements IAccountRepository {
  private accounts: Account[] = [];

  async save(account: Account): Promise<Account> {
    const existingIndex = this.accounts.findIndex(acc => acc.id === account.id);
    if (existingIndex >= 0) {
      this.accounts[existingIndex] = account;
    } else {
      this.accounts.push(account);
    }
    return account;
  }

  async findById(id: string): Promise<Account | null> {
    return this.accounts.find(acc => acc.id === id) || null;
  }

  async findAll(): Promise<Account[]> {
    return [...this.accounts];
  }

  async findByName(name: string): Promise<Account[]> {
    return this.accounts.filter(acc => acc.name.toLowerCase().includes(name.toLowerCase()));
  }

  async findActive(): Promise<Account[]> {
    return this.accounts.filter(acc => acc.isActive);
  }

  async countActive(): Promise<number> {
    return this.accounts.filter(acc => acc.isActive).length;
  }

  async findByType(type: string): Promise<Account[]> {
    return this.accounts.filter(acc => acc.type === type);
  }

  async delete(id: string): Promise<boolean> {
    const index = this.accounts.findIndex(acc => acc.id === id);
    if (index >= 0) {
      this.accounts.splice(index, 1);
      return true;
    }
    return false;
  }

  async count(): Promise<number> {
    return this.accounts.length;
  }
}

describe('DeleteAccountUseCase', () => {
  let useCase: DeleteAccountUseCase;
  let mockRepository: MockAccountRepository;

  beforeEach(() => {
    mockRepository = new MockAccountRepository();
    useCase = new DeleteAccountUseCase(mockRepository);
  });

  describe('execute', () => {
    it('should delete an existing account successfully', async () => {
      // Create test account
      const account = new Account({
        id: 'acc-1',
        name: 'Conta Principal',
        type: 'corrente',
        balance: new Money(1000, 'BRL'),
        description: 'Conta bancária principal'
      });

      await mockRepository.save(account);

      // Verify account exists
      const existingAccount = await mockRepository.findById('acc-1');
      expect(existingAccount).toBeDefined();

      // Delete account
      const result = await useCase.execute({ id: 'acc-1' });

      expect(result.isSuccess()).toBe(true);
      expect(result.getOrThrow().deleted).toBe(true);

      // Verify account was deleted
      const deletedAccount = await mockRepository.findById('acc-1');
      expect(deletedAccount).toBeNull();
    });

    it('should fail when account does not exist', async () => {
      const result = await useCase.execute({ id: 'non-existent' });

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Account not found');
    });

    it('should return false when repository delete returns false', async () => {
      // Create a mock repository that returns false for delete
      const falseDeleteRepository: IAccountRepository = {
        save: jest.fn(),
        findById: jest.fn().mockResolvedValue(null),
        findAll: jest.fn(),
        findByName: jest.fn(),
        findByType: jest.fn(),
        findActive: jest.fn(),
        delete: jest.fn().mockResolvedValue(false),
        count: jest.fn(),
        countActive: jest.fn()
      };

      const useCaseWithFalseDelete = new DeleteAccountUseCase(falseDeleteRepository);

      const result = await useCaseWithFalseDelete.execute({ id: 'acc-1' });

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Account not found');
    });

    it('should handle multiple accounts correctly', async () => {
      // Create multiple accounts
      const account1 = new Account({
        id: 'acc-1',
        name: 'Conta Principal',
        type: 'corrente',
        balance: new Money(1000, 'BRL')
      });

      const account2 = new Account({
        id: 'acc-2',
        name: 'Conta Poupança',
        type: 'poupanca',
        balance: new Money(500, 'BRL')
      });

      await mockRepository.save(account1);
      await mockRepository.save(account2);

      // Verify both accounts exist
      expect(await mockRepository.count()).toBe(2);

      // Delete first account
      const result1 = await useCase.execute({ id: 'acc-1' });
      expect(result1.isSuccess()).toBe(true);
      expect(result1.getOrThrow().deleted).toBe(true);

      // Verify only first account was deleted
      expect(await mockRepository.findById('acc-1')).toBeNull();
      expect(await mockRepository.findById('acc-2')).toBeDefined();
      expect(await mockRepository.count()).toBe(1);

      // Delete second account
      const result2 = await useCase.execute({ id: 'acc-2' });
      expect(result2.isSuccess()).toBe(true);
      expect(result2.getOrThrow().deleted).toBe(true);

      // Verify both accounts were deleted
      expect(await mockRepository.findById('acc-2')).toBeNull();
      expect(await mockRepository.count()).toBe(0);
    });
  });

  describe('validation', () => {
    it('should fail when id is empty', async () => {
      const result = await useCase.execute({ id: '' });

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Account ID cannot be empty');
    });

    it('should fail when id is null', async () => {
      const result = await useCase.execute({ id: null as any });

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Account ID cannot be empty');
    });

    it('should fail when id is undefined', async () => {
      const result = await useCase.execute({ id: undefined as any });

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Account ID cannot be empty');
    });
  });

  describe('repository errors', () => {
    it('should handle repository findById errors', async () => {
      const errorRepository: IAccountRepository = {
        save: jest.fn(),
        findById: jest.fn().mockRejectedValue(new Error('Database error')),
        findAll: jest.fn(),
        findByName: jest.fn(),
        findByType: jest.fn(),
        findActive: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
        countActive: jest.fn()
      };

      const useCaseWithError = new DeleteAccountUseCase(errorRepository);

      const result = await useCaseWithError.execute({ id: 'acc-1' });

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Failed to delete account');
    });

    it('should handle repository delete errors', async () => {
      const account = new Account({
        id: 'acc-1',
        name: 'Conta Principal',
        type: 'corrente',
        balance: new Money(1000, 'BRL')
      });

      const errorRepository: IAccountRepository = {
        save: jest.fn(),
        findById: jest.fn().mockResolvedValue(account),
        findAll: jest.fn(),
        findByName: jest.fn(),
        findByType: jest.fn(),
        findActive: jest.fn(),
        delete: jest.fn().mockRejectedValue(new Error('Database error')),
        count: jest.fn(),
        countActive: jest.fn()
      };

      const useCaseWithError = new DeleteAccountUseCase(errorRepository);

      const result = await useCaseWithError.execute({ id: 'acc-1' });

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Failed to delete account');
    });
  });
}); 