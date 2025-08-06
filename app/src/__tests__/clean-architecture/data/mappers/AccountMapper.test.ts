// Tests for AccountMapper
import { AccountMapper } from '../../../../clean-architecture/data/mappers/AccountMapper';
import { Account } from '../../../../clean-architecture/domain/entities/Account';
import { AccountDTO } from '../../../../clean-architecture/data/dto/AccountDTO';
import { Money } from '../../../../clean-architecture/shared/utils/Money';

describe('AccountMapper', () => {
  let mapper: AccountMapper;

  beforeEach(() => {
    mapper = new AccountMapper();
  });

  describe('toDomain', () => {
    it('should map AccountDTO to Account entity', () => {
      const accountDTO: AccountDTO = {
        id: 'acc-123',
        name: 'Conta Principal',
        type: 'propria',
        saldo: 5000,
        isDefault: true,
        createdAt: '2024-01-01T00:00:00.000Z'
      };

      const account = mapper.toDomain(accountDTO);

      expect(account).toBeInstanceOf(Account);
      expect(account.id).toBe('acc-123');
      expect(account.name).toBe('Conta Principal');
      expect(account.type).toBe('corrente');
      expect(account.balance.value).toBe(5000);
      expect(account.isActive).toBe(true);
      expect(account.createdAt).toEqual(new Date('2024-01-01T00:00:00.000Z'));
      expect(account.isDefault).toBe(true);
    });

    it('should handle external account without balance', () => {
      const accountDTO: AccountDTO = {
        id: 'acc-456',
        name: 'Cartão de Crédito',
        type: 'externa',
        saldo: undefined,
        isDefault: false,
        createdAt: '2024-01-01T00:00:00.000Z'
      };

      const account = mapper.toDomain(accountDTO);

      expect(account.type).toBe('cartao_credito');
      expect(account.balance.value).toBe(0); // External accounts have 0 balance
    });

    it('should handle null balance as 0', () => {
      const accountDTO: AccountDTO = {
        id: 'acc-789',
        name: 'Conta Teste',
        type: 'propria',
        saldo: null as any,
        isDefault: false,
        createdAt: '2024-01-01T00:00:00.000Z'
      };

      const account = mapper.toDomain(accountDTO);

      expect(account.balance.value).toBe(0);
    });
  });

  describe('toDTO', () => {
    it('should map Account entity to AccountDTO', () => {
      const account = new Account({
        id: 'acc-123',
        name: 'Conta Principal',
        type: 'corrente',
        balance: new Money(5000, 'BRL'),
        isActive: true,
        isDefault: true,
        createdAt: new Date('2024-01-01T00:00:00.000Z')
      });

      const accountDTO = mapper.toDTO(account);

      expect(accountDTO.id).toBe('acc-123');
      expect(accountDTO.name).toBe('Conta Principal');
      expect(accountDTO.type).toBe('propria');
      expect(accountDTO.saldo).toBe(5000);
      expect(accountDTO.isDefault).toBe(true);
      expect(accountDTO.createdAt).toBe('2024-01-01T00:00:00.000Z');
    });

    it('should handle external account', () => {
      const account = new Account({
        id: 'acc-456',
        name: 'Cartão de Crédito',
        type: 'cartao_credito',
        balance: new Money(0, 'BRL'),
        isActive: false,
        createdAt: new Date('2024-01-01T00:00:00.000Z')
      });

      const accountDTO = mapper.toDTO(account);

      expect(accountDTO.type).toBe('externa');
      expect(accountDTO.saldo).toBe(null); // External accounts have null balance
    });
  });

  describe('toDomainList', () => {
    it('should map array of AccountDTO to array of Account entities', () => {
      const accountDTOs: AccountDTO[] = [
        {
          id: 'acc-1',
          name: 'Conta 1',
          type: 'propria',
          saldo: 1000,
          isDefault: true,
          createdAt: '2024-01-01T00:00:00.000Z'
        },
        {
          id: 'acc-2',
          name: 'Conta 2',
          type: 'externa',
          saldo: undefined,
          isDefault: false,
          createdAt: '2024-01-02T00:00:00.000Z'
        }
      ];

      const accounts = mapper.toDomainList(accountDTOs);

      expect(accounts).toHaveLength(2);
      expect(accounts[0]).toBeInstanceOf(Account);
      expect(accounts[1]).toBeInstanceOf(Account);
      expect(accounts[0].name).toBe('Conta 1');
      expect(accounts[1].name).toBe('Conta 2');
    });

    it('should return empty array for empty input', () => {
      const accounts = mapper.toDomainList([]);

      expect(accounts).toHaveLength(0);
    });
  });

  describe('toDTOList', () => {
    it('should map array of Account entities to array of AccountDTO', () => {
      const accounts = [
        new Account({
          id: 'acc-1',
          name: 'Conta 1',
          type: 'corrente',
          balance: new Money(1000, 'BRL'),
          isActive: true,
          createdAt: new Date('2024-01-01T00:00:00.000Z')
        }),
        new Account({
          id: 'acc-2',
          name: 'Conta 2',
          type: 'cartao_credito',
          balance: new Money(0, 'BRL'),
          isActive: false,
          createdAt: new Date('2024-01-02T00:00:00.000Z')
        })
      ];

      const accountDTOs = mapper.toDTOList(accounts);

      expect(accountDTOs).toHaveLength(2);
      expect(accountDTOs[0].name).toBe('Conta 1');
      expect(accountDTOs[1].name).toBe('Conta 2');
    });

    it('should return empty array for empty input', () => {
      const accountDTOs = mapper.toDTOList([]);

      expect(accountDTOs).toHaveLength(0);
    });
  });
}); 