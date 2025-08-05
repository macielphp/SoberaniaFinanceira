// Tests for Account Entity
import { Account } from '../../../clean-architecture/domain/entities/Account';
import { Money } from '../../../clean-architecture/shared/utils/Money';

describe('Account Entity', () => {
  describe('constructor', () => {
    it('should create account with valid data', () => {
      const account = new Account({
        id: 'account-1',
        name: 'Conta Principal',
        type: 'corrente',
        balance: new Money(1000, 'BRL'),
        isActive: true,
        description: 'Conta bancária principal',
        color: '#007AFF'
      });

      expect(account.id).toBe('account-1');
      expect(account.name).toBe('Conta Principal');
      expect(account.type).toBe('corrente');
      expect(account.balance).toEqual(new Money(1000, 'BRL'));
      expect(account.isActive).toBe(true);
      expect(account.description).toBe('Conta bancária principal');
      expect(account.color).toBe('#007AFF');
    });

    it('should create account with minimal required data', () => {
      const account = new Account({
        id: 'account-2',
        name: 'Conta Poupança',
        type: 'poupanca',
        balance: new Money(500, 'BRL')
      });

      expect(account.id).toBe('account-2');
      expect(account.name).toBe('Conta Poupança');
      expect(account.type).toBe('poupanca');
      expect(account.balance).toEqual(new Money(500, 'BRL'));
      expect(account.isActive).toBe(true); // default value
      expect(account.description).toBeUndefined();
      expect(account.color).toBeUndefined();
    });
  });

  describe('validation', () => {
    it('should throw error for empty name', () => {
      expect(() => {
        new Account({
          id: 'account-1',
          name: '',
          type: 'corrente',
          balance: new Money(1000, 'BRL')
        });
      }).toThrow('Account name cannot be empty');
    });

    it('should throw error for invalid account type', () => {
      expect(() => {
        new Account({
          id: 'account-1',
          name: 'Conta Teste',
          type: 'invalid' as any,
          balance: new Money(1000, 'BRL')
        });
      }).toThrow('Invalid account type: invalid');
    });

    it('should throw error for negative balance', () => {
      expect(() => {
        new Account({
          id: 'account-1',
          name: 'Conta Teste',
          type: 'corrente',
          balance: new Money(-1000, 'BRL')
        });
      }).toThrow('Amount cannot be negative');
    });
  });

  describe('business methods', () => {
    it('should check if account has sufficient balance', () => {
      const account = new Account({
        id: 'account-1',
        name: 'Conta Principal',
        type: 'corrente',
        balance: new Money(1000, 'BRL')
      });

      expect(account.hasSufficientBalance(new Money(500, 'BRL'))).toBe(true);
      expect(account.hasSufficientBalance(new Money(1000, 'BRL'))).toBe(true);
      expect(account.hasSufficientBalance(new Money(1500, 'BRL'))).toBe(false);
    });

    it('should add money to account', () => {
      const account = new Account({
        id: 'account-1',
        name: 'Conta Principal',
        type: 'corrente',
        balance: new Money(1000, 'BRL')
      });

      const updatedAccount = account.addMoney(new Money(500, 'BRL'));

      expect(updatedAccount.balance).toEqual(new Money(1500, 'BRL'));
      expect(account.balance).toEqual(new Money(1000, 'BRL')); // original unchanged
    });

    it('should subtract money from account', () => {
      const account = new Account({
        id: 'account-1',
        name: 'Conta Principal',
        type: 'corrente',
        balance: new Money(1000, 'BRL')
      });

      const updatedAccount = account.subtractMoney(new Money(300, 'BRL'));

      expect(updatedAccount.balance).toEqual(new Money(700, 'BRL'));
      expect(account.balance).toEqual(new Money(1000, 'BRL')); // original unchanged
    });

    it('should throw error when subtracting more than available balance', () => {
      const account = new Account({
        id: 'account-1',
        name: 'Conta Principal',
        type: 'corrente',
        balance: new Money(1000, 'BRL')
      });

      expect(() => {
        account.subtractMoney(new Money(1500, 'BRL'));
      }).toThrow('Insufficient balance');
    });

    it('should check if account is empty', () => {
      const emptyAccount = new Account({
        id: 'account-1',
        name: 'Conta Vazia',
        type: 'corrente',
        balance: new Money(0, 'BRL')
      });

      const nonEmptyAccount = new Account({
        id: 'account-2',
        name: 'Conta com Saldo',
        type: 'corrente',
        balance: new Money(100, 'BRL')
      });

      expect(emptyAccount.isEmpty()).toBe(true);
      expect(nonEmptyAccount.isEmpty()).toBe(false);
    });

    it('should check if account is active', () => {
      const activeAccount = new Account({
        id: 'account-1',
        name: 'Conta Ativa',
        type: 'corrente',
        balance: new Money(1000, 'BRL'),
        isActive: true
      });

      const inactiveAccount = new Account({
        id: 'account-2',
        name: 'Conta Inativa',
        type: 'corrente',
        balance: new Money(1000, 'BRL'),
        isActive: false
      });

      expect(activeAccount.isActive).toBe(true);
      expect(inactiveAccount.isActive).toBe(false);
    });
  });

  describe('account types', () => {
    it('should validate all account types', () => {
      const validTypes = ['corrente', 'poupanca', 'investimento', 'cartao_credito', 'dinheiro'];

      validTypes.forEach(type => {
        expect(() => {
          new Account({
            id: `account-${type}`,
            name: `Conta ${type}`,
            type: type as any,
            balance: new Money(1000, 'BRL')
          });
        }).not.toThrow();
      });
    });

    it('should identify credit card accounts', () => {
      const creditCardAccount = new Account({
        id: 'account-1',
        name: 'Cartão de Crédito',
        type: 'cartao_credito',
        balance: new Money(0, 'BRL')
      });

      const regularAccount = new Account({
        id: 'account-2',
        name: 'Conta Corrente',
        type: 'corrente',
        balance: new Money(1000, 'BRL')
      });

      expect(creditCardAccount.isCreditCard()).toBe(true);
      expect(regularAccount.isCreditCard()).toBe(false);
    });

    it('should identify cash accounts', () => {
      const cashAccount = new Account({
        id: 'account-1',
        name: 'Dinheiro',
        type: 'dinheiro',
        balance: new Money(500, 'BRL')
      });

      const regularAccount = new Account({
        id: 'account-2',
        name: 'Conta Corrente',
        type: 'corrente',
        balance: new Money(1000, 'BRL')
      });

      expect(cashAccount.isCash()).toBe(true);
      expect(regularAccount.isCash()).toBe(false);
    });
  });

  describe('equality', () => {
    it('should compare accounts by id', () => {
      const account1 = new Account({
        id: 'account-1',
        name: 'Conta 1',
        type: 'corrente',
        balance: new Money(1000, 'BRL')
      });

      const account2 = new Account({
        id: 'account-1',
        name: 'Conta 2',
        type: 'poupanca',
        balance: new Money(2000, 'BRL')
      });

      const account3 = new Account({
        id: 'account-3',
        name: 'Conta 3',
        type: 'corrente',
        balance: new Money(1000, 'BRL')
      });

      expect(account1.equals(account2)).toBe(true);
      expect(account1.equals(account3)).toBe(false);
    });
  });

  describe('serialization', () => {
    it('should serialize account to JSON', () => {
      const account = new Account({
        id: 'account-1',
        name: 'Conta Principal',
        type: 'corrente',
        balance: new Money(1000, 'BRL'),
        isActive: true,
        description: 'Conta bancária principal',
        color: '#007AFF'
      });

      const json = account.toJSON();

      expect(json).toEqual({
        id: 'account-1',
        name: 'Conta Principal',
        type: 'corrente',
        balance: 1000,
        isActive: true,
        description: 'Conta bancária principal',
        color: '#007AFF',
        createdAt: expect.any(String)
      });
    });
  });
}); 