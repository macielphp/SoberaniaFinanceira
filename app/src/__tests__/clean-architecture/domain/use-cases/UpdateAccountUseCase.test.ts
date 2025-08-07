// Tests for UpdateAccountUseCase
import { UpdateAccountUseCase } from '../../../../clean-architecture/domain/use-cases/UpdateAccountUseCase';
import { IAccountRepository } from '../../../../clean-architecture/domain/repositories/IAccountRepository';
import { Account, AccountProps } from '../../../../clean-architecture/domain/entities/Account';
import { Money } from '../../../../clean-architecture/shared/utils/Money';

describe('UpdateAccountUseCase', () => {
  let updateAccountUseCase: UpdateAccountUseCase;
  let mockAccountRepository: jest.Mocked<IAccountRepository>;
  let mockAccount: Account;
  let updatedAccount: Account;

  beforeEach(() => {
    mockAccountRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findByType: jest.fn(),
      findByName: jest.fn(),
      findActive: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      countActive: jest.fn(),
    };

    updateAccountUseCase = new UpdateAccountUseCase(mockAccountRepository);

    mockAccount = new Account({
      id: '1',
      name: 'Conta Principal',
      type: 'corrente',
      balance: new Money(1000, 'BRL'),
      description: 'Conta bancária principal',
      color: '#FF0000',
    });

    // Mock da conta atualizada
    updatedAccount = new Account({
      id: '1',
      name: 'Conta Principal Atualizada',
      type: 'corrente',
      balance: new Money(1500, 'BRL'),
      description: 'Conta bancária principal atualizada',
      color: '#00FF00',
    });
  });

  describe('execute', () => {
    it('should update an existing account successfully', async () => {
      // Arrange
      const accountId = '1';
      const updateData: Partial<AccountProps> = {
        name: 'Conta Principal Atualizada',
        balance: new Money(1500, 'BRL'),
        description: 'Conta bancária principal atualizada',
        color: '#00FF00',
      };

      mockAccountRepository.findById.mockResolvedValue(mockAccount);
      mockAccountRepository.save.mockResolvedValue(updatedAccount);

      // Act
      const result = await updateAccountUseCase.execute(accountId, updateData);

      // Assert
      expect(mockAccountRepository.findById).toHaveBeenCalledWith(accountId);
      expect(mockAccountRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: accountId,
          name: 'Conta Principal Atualizada',
          balance: new Money(1500, 'BRL'),
          description: 'Conta bancária principal atualizada',
          color: '#00FF00',
        })
      );
      expect(result).toBeDefined();
      expect(result.id).toBe(accountId);
      expect(result.name).toBe('Conta Principal Atualizada');
      expect(result.balance.value).toBe(1500);
    });

    it('should throw error when account is not found', async () => {
      // Arrange
      const accountId = '999';
      const updateData: Partial<AccountProps> = {
        description: 'Conta Inexistente',
      };

      mockAccountRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(updateAccountUseCase.execute(accountId, updateData))
        .rejects
        .toThrow('Account not found');

      expect(mockAccountRepository.findById).toHaveBeenCalledWith(accountId);
      expect(mockAccountRepository.save).not.toHaveBeenCalled();
    });

    it('should validate account data before updating', async () => {
      // Arrange
      const accountId = '1';
      const invalidUpdateData: Partial<AccountProps> = {
        type: 'tipo inválido' as any, // Tipo inválido
      };

      mockAccountRepository.findById.mockResolvedValue(mockAccount);

      // Act & Assert
      await expect(updateAccountUseCase.execute(accountId, invalidUpdateData))
        .rejects
        .toThrow('Invalid account type');

      expect(mockAccountRepository.findById).toHaveBeenCalledWith(accountId);
      expect(mockAccountRepository.save).not.toHaveBeenCalled();
    });

    it('should preserve existing properties when updating partial data', async () => {
      // Arrange
      const accountId = '1';
      const updateData: Partial<AccountProps> = {
        description: 'Nova descrição da conta',
      };

      const partiallyUpdatedAccount = new Account({
        id: '1',
        name: 'Conta Principal',
        type: 'corrente',
        balance: new Money(1000, 'BRL'),
        description: 'Nova descrição da conta',
        color: '#FF0000',
      });

      mockAccountRepository.findById.mockResolvedValue(mockAccount);
      mockAccountRepository.save.mockResolvedValue(partiallyUpdatedAccount);

      // Act
      const result = await updateAccountUseCase.execute(accountId, updateData);

      // Assert
      expect(result.description).toBe('Nova descrição da conta');
      expect(result.balance.value).toBe(1000); // Preservado
      expect(result.name).toBe('Conta Principal'); // Preservado
      expect(result.type).toBe('corrente'); // Preservado
    });

    it('should handle repository errors gracefully', async () => {
      // Arrange
      const accountId = '1';
      const updateData: Partial<AccountProps> = {
        description: 'Test Account',
      };

      mockAccountRepository.findById.mockResolvedValue(mockAccount);
      mockAccountRepository.save.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(updateAccountUseCase.execute(accountId, updateData))
        .rejects
        .toThrow('Database error');
    });
  });
}); 