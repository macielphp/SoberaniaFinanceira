// Tests for GetAccountByIdUseCase
import { GetAccountByIdUseCase } from '../../../../clean-architecture/domain/use-cases/GetAccountByIdUseCase';
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

describe('GetAccountByIdUseCase', () => {
  let useCase: GetAccountByIdUseCase;
  let mockRepository: MockAccountRepository;

  beforeEach(() => {
    mockRepository = new MockAccountRepository();
    useCase = new GetAccountByIdUseCase(mockRepository);
  });

  describe('execute', () => {
    it('should return an existing account by ID', async () => {
      // Create test account
      const account = new Account({
        id: 'acc-1',
        name: 'Conta Principal',
        type: 'corrente',
        balance: new Money(1000, 'BRL'),
        description: 'Conta bancária principal',
        color: '#FF0000'
      });

      await mockRepository.save(account);

      const result = await useCase.execute({ id: 'acc-1' });

      expect(result.isSuccess()).toBe(true);
      const foundAccount = result.getOrThrow().account;
      expect(foundAccount).toEqual(account);
      expect(foundAccount).not.toBeNull();
      if (foundAccount) {
        expect(foundAccount.id).toBe('acc-1');
        expect(foundAccount.name).toBe('Conta Principal');
        expect(foundAccount.type).toBe('corrente');
        expect(foundAccount.balance).toEqual(new Money(1000, 'BRL'));
        expect(foundAccount.description).toBe('Conta bancária principal');
        expect(foundAccount.color).toBe('#FF0000');
      }
    });

    it('should return null when account does not exist', async () => {
      const result = await useCase.execute({ id: 'non-existent' });

      expect(result.isSuccess()).toBe(true);
      expect(result.getOrThrow().account).toBeNull();
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

      // Get first account
      const result1 = await useCase.execute({ id: 'acc-1' });
      expect(result1.isSuccess()).toBe(true);
      expect(result1.getOrThrow().account).toEqual(account1);

      // Get second account
      const result2 = await useCase.execute({ id: 'acc-2' });
      expect(result2.isSuccess()).toBe(true);
      expect(result2.getOrThrow().account).toEqual(account2);

      // Get non-existent account
      const result3 = await useCase.execute({ id: 'acc-3' });
      expect(result3.isSuccess()).toBe(true);
      expect(result3.getOrThrow().account).toBeNull();
    });

    it('should return account with minimal data', async () => {
      const account = new Account({
        id: 'acc-1',
        name: 'Conta Principal',
        type: 'corrente',
        balance: new Money(1000, 'BRL')
        // No description or color
      });

      await mockRepository.save(account);

      const result = await useCase.execute({ id: 'acc-1' });

      expect(result.isSuccess()).toBe(true);
      const foundAccount = result.getOrThrow().account;
      expect(foundAccount).toEqual(account);
      expect(foundAccount).not.toBeNull();
      if (foundAccount) {
        expect(foundAccount.description).toBeUndefined();
        expect(foundAccount.color).toBeUndefined();
      }
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

      const useCaseWithError = new GetAccountByIdUseCase(errorRepository);

      const result = await useCaseWithError.execute({ id: 'acc-1' });

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Failed to get account');
    });
  });
}); 