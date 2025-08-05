// Tests for GetAccountsUseCase
import { GetAccountsUseCase } from '../../../../clean-architecture/domain/use-cases/GetAccountsUseCase';
import { IAccountRepository } from '../../../../clean-architecture/domain/repositories/IAccountRepository';
import { Account } from '../../../../clean-architecture/domain/entities/Account';
import { Money } from '../../../../clean-architecture/shared/utils/Money';

// Mock repository for testing
class MockAccountRepository implements IAccountRepository {
  private accounts: Account[] = [];

  async save(account: Account): Promise<Account> {
    this.accounts.push(account);
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

describe('GetAccountsUseCase', () => {
  let useCase: GetAccountsUseCase;
  let mockRepository: MockAccountRepository;

  beforeEach(() => {
    mockRepository = new MockAccountRepository();
    useCase = new GetAccountsUseCase(mockRepository);
  });

  describe('execute', () => {
    it('should return all accounts when no filters are provided', async () => {
      // Create test accounts
      const account1 = new Account({
        id: 'acc-1',
        name: 'Conta Principal',
        type: 'corrente',
        balance: new Money(1000, 'BRL'),
        description: 'Conta bancária principal'
      });

      const account2 = new Account({
        id: 'acc-2',
        name: 'Conta Poupança',
        type: 'poupanca',
        balance: new Money(500, 'BRL'),
        description: 'Conta poupança'
      });

      await mockRepository.save(account1);
      await mockRepository.save(account2);

      const result = await useCase.execute({});

      expect(result.isSuccess()).toBe(true);
      const accounts = result.getOrThrow().accounts;
      expect(accounts).toHaveLength(2);
      expect(accounts).toContainEqual(account1);
      expect(accounts).toContainEqual(account2);
    });

    it('should return empty array when no accounts exist', async () => {
      const result = await useCase.execute({});

      expect(result.isSuccess()).toBe(true);
      const accounts = result.getOrThrow().accounts;
      expect(accounts).toEqual([]);
    });

    it('should filter accounts by type', async () => {
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

      const account3 = new Account({
        id: 'acc-3',
        name: 'Cartão de Crédito',
        type: 'cartao_credito',
        balance: new Money(0, 'BRL')
      });

      await mockRepository.save(account1);
      await mockRepository.save(account2);
      await mockRepository.save(account3);

      const result = await useCase.execute({ type: 'corrente' });

      expect(result.isSuccess()).toBe(true);
      const accounts = result.getOrThrow().accounts;
      expect(accounts).toHaveLength(1);
      expect(accounts).toContainEqual(account1);
      expect(accounts).not.toContainEqual(account2);
      expect(accounts).not.toContainEqual(account3);
    });

    it('should filter accounts by name', async () => {
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

      const account3 = new Account({
        id: 'acc-3',
        name: 'Cartão de Crédito',
        type: 'cartao_credito',
        balance: new Money(0, 'BRL')
      });

      await mockRepository.save(account1);
      await mockRepository.save(account2);
      await mockRepository.save(account3);

      const result = await useCase.execute({ name: 'Principal' });

      expect(result.isSuccess()).toBe(true);
      const accounts = result.getOrThrow().accounts;
      expect(accounts).toHaveLength(1);
      expect(accounts).toContainEqual(account1);
      expect(accounts).not.toContainEqual(account2);
      expect(accounts).not.toContainEqual(account3);
    });

    it('should filter accounts by active status', async () => {
      const account1 = new Account({
        id: 'acc-1',
        name: 'Conta Principal',
        type: 'corrente',
        balance: new Money(1000, 'BRL'),
        isActive: true
      });

      const account2 = new Account({
        id: 'acc-2',
        name: 'Conta Inativa',
        type: 'corrente',
        balance: new Money(500, 'BRL'),
        isActive: false
      });

      await mockRepository.save(account1);
      await mockRepository.save(account2);

      const result = await useCase.execute({ activeOnly: true });

      expect(result.isSuccess()).toBe(true);
      const accounts = result.getOrThrow().accounts;
      expect(accounts).toHaveLength(1);
      expect(accounts).toContainEqual(account1);
      expect(accounts).not.toContainEqual(account2);
    });

    it('should combine multiple filters', async () => {
      const account1 = new Account({
        id: 'acc-1',
        name: 'Conta Principal',
        type: 'corrente',
        balance: new Money(1000, 'BRL'),
        isActive: true
      });

      const account2 = new Account({
        id: 'acc-2',
        name: 'Conta Poupança',
        type: 'poupanca',
        balance: new Money(500, 'BRL'),
        isActive: true
      });

      const account3 = new Account({
        id: 'acc-3',
        name: 'Conta Inativa',
        type: 'corrente',
        balance: new Money(200, 'BRL'),
        isActive: false
      });

      await mockRepository.save(account1);
      await mockRepository.save(account2);
      await mockRepository.save(account3);

      const result = await useCase.execute({ 
        type: 'corrente',
        activeOnly: true 
      });

      expect(result.isSuccess()).toBe(true);
      const accounts = result.getOrThrow().accounts;
      expect(accounts).toHaveLength(1);
      expect(accounts).toContainEqual(account1);
      expect(accounts).not.toContainEqual(account2);
      expect(accounts).not.toContainEqual(account3);
    });
  });

  describe('repository errors', () => {
    it('should handle repository findAll errors', async () => {
      // Create a mock repository that throws an error
      const errorRepository: IAccountRepository = {
        save: jest.fn(),
        findById: jest.fn(),
        findAll: jest.fn().mockRejectedValue(new Error('Database error')),
        findByName: jest.fn(),
        findByType: jest.fn(),
        findActive: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
        countActive: jest.fn()
      };

      const useCaseWithError = new GetAccountsUseCase(errorRepository);

      const result = await useCaseWithError.execute({});

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Failed to get accounts');
    });

    it('should handle repository findByType errors', async () => {
      const errorRepository: IAccountRepository = {
        save: jest.fn(),
        findById: jest.fn(),
        findAll: jest.fn(),
        findByName: jest.fn(),
        findByType: jest.fn().mockRejectedValue(new Error('Database error')),
        findActive: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
        countActive: jest.fn()
      };

      const useCaseWithError = new GetAccountsUseCase(errorRepository);

      const result = await useCaseWithError.execute({ type: 'corrente' });

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Failed to get accounts');
    });

    it('should handle repository findByName errors', async () => {
      const errorRepository: IAccountRepository = {
        save: jest.fn(),
        findById: jest.fn(),
        findAll: jest.fn(),
        findByName: jest.fn().mockRejectedValue(new Error('Database error')),
        findByType: jest.fn(),
        findActive: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
        countActive: jest.fn()
      };

      const useCaseWithError = new GetAccountsUseCase(errorRepository);

      const result = await useCaseWithError.execute({ name: 'Principal' });

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Failed to get accounts');
    });

    it('should handle repository findActive errors', async () => {
      const errorRepository: IAccountRepository = {
        save: jest.fn(),
        findById: jest.fn(),
        findAll: jest.fn(),
        findByName: jest.fn(),
        findByType: jest.fn(),
        findActive: jest.fn().mockRejectedValue(new Error('Database error')),
        delete: jest.fn(),
        count: jest.fn(),
        countActive: jest.fn()
      };

      const useCaseWithError = new GetAccountsUseCase(errorRepository);

      const result = await useCaseWithError.execute({ activeOnly: true });

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Failed to get accounts');
    });
  });
}); 