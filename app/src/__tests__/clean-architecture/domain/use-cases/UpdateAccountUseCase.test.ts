// Tests for UpdateAccountUseCase
import { UpdateAccountUseCase } from '../../../../clean-architecture/domain/use-cases/UpdateAccountUseCase';
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

describe('UpdateAccountUseCase', () => {
  let useCase: UpdateAccountUseCase;
  let mockRepository: MockAccountRepository;

  beforeEach(() => {
    mockRepository = new MockAccountRepository();
    useCase = new UpdateAccountUseCase(mockRepository);
  });

  describe('execute', () => {
    it('should update an existing account successfully', async () => {
      // Create initial account
      const initialAccount = new Account({
        id: 'acc-1',
        name: 'Conta Principal',
        type: 'corrente',
        balance: new Money(1000, 'BRL'),
        description: 'Conta bancária principal'
      });

      await mockRepository.save(initialAccount);

      // Update data
      const updateData = {
        id: 'acc-1',
        name: 'Conta Principal Atualizada',
        type: 'corrente' as const,
        balance: new Money(1500, 'BRL'),
        description: 'Conta bancária principal atualizada',
        color: '#FF0000'
      };

      const result = await useCase.execute(updateData);

      expect(result.isSuccess()).toBe(true);
      const updatedAccount = result.getOrThrow().account;
      
      expect(updatedAccount.id).toBe('acc-1');
      expect(updatedAccount.name).toBe('Conta Principal Atualizada');
      expect(updatedAccount.type).toBe('corrente');
      expect(updatedAccount.balance).toEqual(new Money(1500, 'BRL'));
      expect(updatedAccount.description).toBe('Conta bancária principal atualizada');
      expect(updatedAccount.color).toBe('#FF0000');
    });

    it('should fail when account does not exist', async () => {
      const updateData = {
        id: 'non-existent',
        name: 'Conta Atualizada',
        type: 'corrente' as const,
        balance: new Money(1500, 'BRL')
      };

      const result = await useCase.execute(updateData);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Account not found');
    });

    it('should update only provided fields', async () => {
      // Create initial account
      const initialAccount = new Account({
        id: 'acc-1',
        name: 'Conta Principal',
        type: 'corrente',
        balance: new Money(1000, 'BRL'),
        description: 'Conta bancária principal',
        color: '#0000FF'
      });

      await mockRepository.save(initialAccount);

      // Update only name
      const updateData = {
        id: 'acc-1',
        name: 'Conta Principal Atualizada',
        type: 'corrente' as const,
        balance: new Money(1000, 'BRL')
      };

      const result = await useCase.execute(updateData);

      expect(result.isSuccess()).toBe(true);
      const updatedAccount = result.getOrThrow().account;
      
      expect(updatedAccount.name).toBe('Conta Principal Atualizada');
      expect(updatedAccount.description).toBe('Conta bancária principal'); // Should remain unchanged
      expect(updatedAccount.color).toBe('#0000FF'); // Should remain unchanged
    });

    it('should preserve account ID and creation date', async () => {
      const initialDate = new Date('2024-01-15');
      const initialAccount = new Account({
        id: 'acc-1',
        name: 'Conta Principal',
        type: 'corrente',
        balance: new Money(1000, 'BRL'),
        createdAt: initialDate
      });

      await mockRepository.save(initialAccount);

      const updateData = {
        id: 'acc-1',
        name: 'Conta Principal Atualizada',
        type: 'corrente' as const,
        balance: new Money(1500, 'BRL')
      };

      const result = await useCase.execute(updateData);

      expect(result.isSuccess()).toBe(true);
      const updatedAccount = result.getOrThrow().account;
      
      expect(updatedAccount.id).toBe('acc-1');
      expect(updatedAccount.createdAt).toEqual(initialAccount.createdAt);
    });
  });

  describe('validation', () => {
    it('should fail when name is empty', async () => {
      const initialAccount = new Account({
        id: 'acc-1',
        name: 'Conta Principal',
        type: 'corrente',
        balance: new Money(1000, 'BRL')
      });

      await mockRepository.save(initialAccount);

      const updateData = {
        id: 'acc-1',
        name: '',
        type: 'corrente' as const,
        balance: new Money(1500, 'BRL')
      };

      const result = await useCase.execute(updateData);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Account name cannot be empty');
    });

    it('should fail when type is empty', async () => {
      const initialAccount = new Account({
        id: 'acc-1',
        name: 'Conta Principal',
        type: 'corrente',
        balance: new Money(1000, 'BRL')
      });

      await mockRepository.save(initialAccount);

      const updateData = {
        id: 'acc-1',
        name: 'Conta Principal',
        type: '' as any,
        balance: new Money(1500, 'BRL')
      };

      const result = await useCase.execute(updateData);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Account type cannot be empty');
    });

    it('should fail when type is invalid', async () => {
      const initialAccount = new Account({
        id: 'acc-1',
        name: 'Conta Principal',
        type: 'corrente',
        balance: new Money(1000, 'BRL')
      });

      await mockRepository.save(initialAccount);

      const updateData = {
        id: 'acc-1',
        name: 'Conta Principal',
        type: 'Invalid Type' as any,
        balance: new Money(1500, 'BRL')
      };

      const result = await useCase.execute(updateData);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Invalid account type');
    });

    it('should fail when balance is negative', async () => {
      const initialAccount = new Account({
        id: 'acc-1',
        name: 'Conta Principal',
        type: 'corrente',
        balance: new Money(1000, 'BRL')
      });

      await mockRepository.save(initialAccount);

      // Create a mock Money object that simulates negative balance
      const negativeBalance = {
        value: -100,
        currency: 'BRL'
      };

      const updateData = {
        id: 'acc-1',
        name: 'Conta Principal',
        type: 'corrente' as const,
        balance: negativeBalance as any
      };

      const result = await useCase.execute(updateData);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Account balance cannot be negative');
    });

    it('should fail when account name already exists for different account', async () => {
      // Create first account
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

      // Try to update second account with first account's name
      const updateData = {
        id: 'acc-2',
        name: 'Conta Principal', // Same name as account1
        type: 'poupanca' as const,
        balance: new Money(500, 'BRL')
      };

      const result = await useCase.execute(updateData);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Account with this name already exists');
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

      const useCaseWithError = new UpdateAccountUseCase(errorRepository);

      const updateData = {
        id: 'acc-1',
        name: 'Conta Principal',
        type: 'corrente' as const,
        balance: new Money(1500, 'BRL')
      };

      const result = await useCaseWithError.execute(updateData);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Failed to update account');
    });

    it('should handle repository save errors', async () => {
      const initialAccount = new Account({
        id: 'acc-1',
        name: 'Conta Principal',
        type: 'corrente',
        balance: new Money(1000, 'BRL')
      });

      const errorRepository: IAccountRepository = {
        save: jest.fn().mockRejectedValue(new Error('Database error')),
        findById: jest.fn().mockResolvedValue(initialAccount),
        findAll: jest.fn(),
        findByName: jest.fn(),
        findByType: jest.fn(),
        findActive: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
        countActive: jest.fn()
      };

      const useCaseWithError = new UpdateAccountUseCase(errorRepository);

      const updateData = {
        id: 'acc-1',
        name: 'Conta Principal Atualizada',
        type: 'corrente' as const,
        balance: new Money(1500, 'BRL')
      };

      const result = await useCaseWithError.execute(updateData);

      expect(result.isFailure()).toBe(true);
      expect(() => result.getOrThrow()).toThrow('Failed to update account');
    });
  });
}); 