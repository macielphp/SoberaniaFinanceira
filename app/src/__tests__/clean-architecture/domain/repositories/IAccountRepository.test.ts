// Tests for IAccountRepository Interface
import { IAccountRepository } from '../../../../clean-architecture/domain/repositories/IAccountRepository';
import { Account } from '../../../../clean-architecture/domain/entities/Account';
import { Money } from '../../../../clean-architecture/shared/utils/Money';

// Mock implementation for testing
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

  async findActive(): Promise<Account[]> {
    return this.accounts.filter(acc => acc.isActive);
  }

  async findByType(type: string): Promise<Account[]> {
    return this.accounts.filter(acc => acc.type === type);
  }

  async findByName(name: string): Promise<Account[]> {
    return this.accounts.filter(acc => 
      acc.name.toLowerCase().includes(name.toLowerCase())
    );
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

  async countActive(): Promise<number> {
    return this.accounts.filter(acc => acc.isActive).length;
  }
}

describe('IAccountRepository', () => {
  let repository: IAccountRepository;

  beforeEach(() => {
    repository = new MockAccountRepository();
  });

  describe('save', () => {
    it('should save a new account', async () => {
      const account = new Account({
        id: 'acc-1',
        name: 'Conta Principal',
        type: 'corrente',
        balance: new Money(1000, 'BRL'),
        isActive: true,
        description: 'Conta bancária principal'
      });

      const savedAccount = await repository.save(account);
      expect(savedAccount).toEqual(account);
      
      const found = await repository.findById('acc-1');
      expect(found).toEqual(account);
    });

    it('should update an existing account', async () => {
      const account = new Account({
        id: 'acc-1',
        name: 'Conta Principal',
        type: 'corrente',
        balance: new Money(1000, 'BRL'),
        isActive: true
      });

      await repository.save(account);

      const updatedAccount = new Account({
        id: 'acc-1',
        name: 'Conta Principal Atualizada',
        type: 'corrente',
        balance: new Money(1500, 'BRL'),
        isActive: true
      });

      const saved = await repository.save(updatedAccount);
      expect(saved.name).toBe('Conta Principal Atualizada');
      expect(saved.balance.value).toBe(1500);
      
      const found = await repository.findById('acc-1');
      expect(found?.name).toBe('Conta Principal Atualizada');
    });
  });

  describe('findById', () => {
    it('should return account when found', async () => {
      const account = new Account({
        id: 'acc-1',
        name: 'Conta Principal',
        type: 'corrente',
        balance: new Money(1000, 'BRL')
      });

      await repository.save(account);
      const found = await repository.findById('acc-1');
      expect(found).toEqual(account);
    });

    it('should return null when account not found', async () => {
      const found = await repository.findById('non-existent');
      expect(found).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all accounts', async () => {
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

      await repository.save(account1);
      await repository.save(account2);

      const allAccounts = await repository.findAll();
      expect(allAccounts).toHaveLength(2);
      expect(allAccounts).toContainEqual(account1);
      expect(allAccounts).toContainEqual(account2);
    });

    it('should return empty array when no accounts exist', async () => {
      const allAccounts = await repository.findAll();
      expect(allAccounts).toEqual([]);
    });
  });

  describe('findActive', () => {
    it('should return only active accounts', async () => {
      const activeAccount = new Account({
        id: 'acc-1',
        name: 'Conta Ativa',
        type: 'corrente',
        balance: new Money(1000, 'BRL'),
        isActive: true
      });

      const inactiveAccount = new Account({
        id: 'acc-2',
        name: 'Conta Inativa',
        type: 'corrente',
        balance: new Money(500, 'BRL'),
        isActive: false
      });

      await repository.save(activeAccount);
      await repository.save(inactiveAccount);

      const activeAccounts = await repository.findActive();
      expect(activeAccounts).toHaveLength(1);
      expect(activeAccounts).toContainEqual(activeAccount);
      expect(activeAccounts).not.toContainEqual(inactiveAccount);
    });
  });

  describe('findByType', () => {
    it('should return accounts of specific type', async () => {
      const correnteAccount = new Account({
        id: 'acc-1',
        name: 'Conta Corrente',
        type: 'corrente',
        balance: new Money(1000, 'BRL')
      });

      const poupancaAccount = new Account({
        id: 'acc-2',
        name: 'Conta Poupança',
        type: 'poupanca',
        balance: new Money(500, 'BRL')
      });

      const investimentoAccount = new Account({
        id: 'acc-3',
        name: 'Conta Investimento',
        type: 'investimento',
        balance: new Money(2000, 'BRL')
      });

      await repository.save(correnteAccount);
      await repository.save(poupancaAccount);
      await repository.save(investimentoAccount);

      const correnteAccounts = await repository.findByType('corrente');
      expect(correnteAccounts).toHaveLength(1);
      expect(correnteAccounts).toContainEqual(correnteAccount);

      const poupancaAccounts = await repository.findByType('poupanca');
      expect(poupancaAccounts).toHaveLength(1);
      expect(poupancaAccounts).toContainEqual(poupancaAccount);
    });
  });

  describe('findByName', () => {
    it('should return accounts matching name pattern', async () => {
      const principalAccount = new Account({
        id: 'acc-1',
        name: 'Conta Principal',
        type: 'corrente',
        balance: new Money(1000, 'BRL')
      });

      const poupancaAccount = new Account({
        id: 'acc-2',
        name: 'Conta Poupança',
        type: 'poupanca',
        balance: new Money(500, 'BRL')
      });

      const secundariaAccount = new Account({
        id: 'acc-3',
        name: 'Conta Secundária',
        type: 'corrente',
        balance: new Money(300, 'BRL')
      });

      await repository.save(principalAccount);
      await repository.save(poupancaAccount);
      await repository.save(secundariaAccount);

      const contaAccounts = await repository.findByName('Conta');
      expect(contaAccounts).toHaveLength(3);

      const principalAccounts = await repository.findByName('Principal');
      expect(principalAccounts).toHaveLength(1);
      expect(principalAccounts).toContainEqual(principalAccount);
    });
  });

  describe('delete', () => {
    it('should delete account and return true', async () => {
      const account = new Account({
        id: 'acc-1',
        name: 'Conta Principal',
        type: 'corrente',
        balance: new Money(1000, 'BRL')
      });

      await repository.save(account);
      const deleted = await repository.delete('acc-1');
      expect(deleted).toBe(true);

      const found = await repository.findById('acc-1');
      expect(found).toBeNull();
    });

    it('should return false when account does not exist', async () => {
      const deleted = await repository.delete('non-existent');
      expect(deleted).toBe(false);
    });
  });

  describe('count', () => {
    it('should return correct count of accounts', async () => {
      expect(await repository.count()).toBe(0);

      const account1 = new Account({
        id: 'acc-1',
        name: 'Conta Principal',
        type: 'corrente',
        balance: new Money(1000, 'BRL')
      });

      await repository.save(account1);
      expect(await repository.count()).toBe(1);

      const account2 = new Account({
        id: 'acc-2',
        name: 'Conta Poupança',
        type: 'poupanca',
        balance: new Money(500, 'BRL')
      });

      await repository.save(account2);
      expect(await repository.count()).toBe(2);
    });
  });

  describe('countActive', () => {
    it('should return correct count of active accounts', async () => {
      expect(await repository.countActive()).toBe(0);

      const activeAccount = new Account({
        id: 'acc-1',
        name: 'Conta Ativa',
        type: 'corrente',
        balance: new Money(1000, 'BRL'),
        isActive: true
      });

      await repository.save(activeAccount);
      expect(await repository.countActive()).toBe(1);

      const inactiveAccount = new Account({
        id: 'acc-2',
        name: 'Conta Inativa',
        type: 'corrente',
        balance: new Money(500, 'BRL'),
        isActive: false
      });

      await repository.save(inactiveAccount);
      expect(await repository.countActive()).toBe(1); // Still 1 active
      expect(await repository.count()).toBe(2); // Total 2
    });
  });
}); 