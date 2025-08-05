// Tests for CreateAccountUseCase
import { CreateAccountUseCase } from '../../../../clean-architecture/domain/use-cases/CreateAccountUseCase';
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

describe('CreateAccountUseCase', () => {
  let useCase: CreateAccountUseCase;
  let mockRepository: MockAccountRepository;

  beforeEach(() => {
    mockRepository = new MockAccountRepository();
    useCase = new CreateAccountUseCase(mockRepository);
  });

  describe('execute', () => {
    it('should create a new account successfully', async () => {
      const accountData = {
        name: 'Conta Principal',
        type: 'corrente' as const,
        balance: new Money(1000, 'BRL'),
        description: 'Conta bancária principal'
      };

      const result = await useCase.execute(accountData);

      expect(result.isSuccess()).toBe(true);
      expect(result.getOrThrow().account).toBeInstanceOf(Account);
      
      const account = result.getOrThrow().account;
      expect(account.name).toBe('Conta Principal');
      expect(account.type).toBe('corrente');
      expect(account.balance).toEqual(new Money(1000, 'BRL'));
      expect(account.description).toBe('Conta bancária principal');
      expect(account.id).toBeDefined();
      expect(account.createdAt).toBeInstanceOf(Date);
    });

    it('should create account with minimal required data', async () => {
      const accountData = {
        name: 'Conta Poupança',
        type: 'poupanca' as const,
        balance: new Money(500, 'BRL')
      };

      const result = await useCase.execute(accountData);

      expect(result.isSuccess()).toBe(true);
      expect(result.getOrThrow().account).toBeInstanceOf(Account);
      
      const account = result.getOrThrow().account;
      expect(account.name).toBe('Conta Poupança');
      expect(account.type).toBe('poupanca');
      expect(account.balance).toEqual(new Money(500, 'BRL'));
      expect(account.description).toBeUndefined();
    });

    it('should save account to repository', async () => {
      const accountData = {
        name: 'Conta Principal',
        type: 'corrente' as const,
        balance: new Money(1000, 'BRL')
      };

      const result = await useCase.execute(accountData);
      const account = result.getOrThrow().account;

      // Verify account was saved to repository
      const savedAccount = await mockRepository.findById(account.id);
      expect(savedAccount).toEqual(account);
    });

    it('should generate unique ID for each account', async () => {
      const accountData1 = {
        name: 'Conta Principal',
        type: 'corrente' as const,
        balance: new Money(1000, 'BRL')
      };

      const accountData2 = {
        name: 'Conta Poupança',
        type: 'poupanca' as const,
        balance: new Money(500, 'BRL')
      };

      const result1 = await useCase.execute(accountData1);
      const result2 = await useCase.execute(accountData2);

      const account1 = result1.getOrThrow().account;
      const account2 = result2.getOrThrow().account;

      expect(account1.id).not.toBe(account2.id);
    });
  });

  describe('validation', () => {
    it('should fail when name is empty', async () => {
      const accountData = {
        name: '',
        type: 'corrente' as const,
        balance: new Money(1000, 'BRL')
      };

      const result = await useCase.execute(accountData);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Account name cannot be empty');
    });

    it('should fail when type is empty', async () => {
      const accountData = {
        name: 'Conta Principal',
        type: '' as any,
        balance: new Money(1000, 'BRL')
      };

      const result = await useCase.execute(accountData);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Account type cannot be empty');
    });

    it('should fail when type is invalid', async () => {
      const accountData = {
        name: 'Conta Principal',
        type: 'Invalid Type' as any,
        balance: new Money(1000, 'BRL')
      };

      const result = await useCase.execute(accountData);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Invalid account type');
    });

    it('should fail when balance is negative', async () => {
      // Create a mock Money object that simulates negative balance
      const negativeBalance = {
        value: -100,
        currency: 'BRL'
      };

      const accountData = {
        name: 'Conta Principal',
        type: 'corrente' as const,
        balance: negativeBalance as any
      };

      const result = await useCase.execute(accountData);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Account balance cannot be negative');
    });

    it('should fail when account name already exists', async () => {
      const accountData = {
        name: 'Conta Principal',
        type: 'corrente' as const,
        balance: new Money(1000, 'BRL')
      };

      // Create first account
      await useCase.execute(accountData);

      // Try to create second account with same name
      const result = await useCase.execute(accountData);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Account with this name already exists');
    });
  });

  describe('repository errors', () => {
    it('should handle repository save errors', async () => {
      // Create a mock repository that throws an error
      const errorRepository: IAccountRepository = {
        save: jest.fn().mockRejectedValue(new Error('Database error')),
        findById: jest.fn(),
        findAll: jest.fn(),
        findByName: jest.fn(),
        findByType: jest.fn(),
        findActive: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
        countActive: jest.fn()
      };

      const useCaseWithError = new CreateAccountUseCase(errorRepository);

      const accountData = {
        name: 'Conta Principal',
        type: 'corrente' as const,
        balance: new Money(1000, 'BRL')
      };

      const result = await useCaseWithError.execute(accountData);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Failed to create account');
    });

    it('should handle repository findByName errors', async () => {
      // Create a mock repository that throws an error on findByName
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

      const useCaseWithError = new CreateAccountUseCase(errorRepository);

      const accountData = {
        name: 'Conta Principal',
        type: 'corrente' as const,
        balance: new Money(1000, 'BRL')
      };

      const result = await useCaseWithError.execute(accountData);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Failed to create account');
    });
  });
}); 