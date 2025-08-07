import { UpdateUserUseCase } from '../../../../clean-architecture/domain/use-cases/UpdateUserUseCase';
import { IUserRepository } from '../../../../clean-architecture/domain/repositories/IUserRepository';
import { User, UserProps } from '../../../../clean-architecture/domain/entities/User';

describe('UpdateUserUseCase', () => {
  let updateUserUseCase: UpdateUserUseCase;
  let mockUserRepository: jest.Mocked<IUserRepository>;
  let mockUser: User;
  let updatedUser: User;

  beforeEach(() => {
    mockUserRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findByEmail: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    };

    updateUserUseCase = new UpdateUserUseCase(mockUserRepository);

    mockUser = new User({
      id: '1',
      name: 'João Silva',
      email: 'joao@example.com',
      password: 'hashedPassword123',
      isActive: true,
    });

    // Mock do usuário atualizado
    updatedUser = new User({
      id: '1',
      name: 'João Silva Atualizado',
      email: 'joao.novo@example.com',
      password: 'hashedPassword123',
      isActive: true,
    });
  });

  describe('execute', () => {
    it('should update an existing user successfully', async () => {
      // Arrange
      const userId = '1';
      const updateData: Partial<UserProps> = {
        name: 'João Silva Atualizado',
        email: 'joao.novo@example.com',
      };

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue(updatedUser);

      // Act
      const result = await updateUserUseCase.execute(userId, updateData);

      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockUserRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: userId,
          name: 'João Silva Atualizado',
          email: 'joao.novo@example.com',
        })
      );
      expect(result).toBeDefined();
      expect(result.id).toBe(userId);
      expect(result.name).toBe('João Silva Atualizado');
      expect(result.email).toBe('joao.novo@example.com');
    });

    it('should throw error when user is not found', async () => {
      // Arrange
      const userId = '999';
      const updateData: Partial<UserProps> = {
        name: 'Usuário Inexistente',
      };

      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(updateUserUseCase.execute(userId, updateData))
        .rejects
        .toThrow('User not found');

      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('should validate user data before updating', async () => {
      // Arrange
      const userId = '1';
      const invalidUpdateData: Partial<UserProps> = {
        email: 'email inválido', // Email inválido
      };

      mockUserRepository.findById.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(updateUserUseCase.execute(userId, invalidUpdateData))
        .rejects
        .toThrow('Invalid email format');

      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('should preserve existing properties when updating partial data', async () => {
      // Arrange
      const userId = '1';
      const updateData: Partial<UserProps> = {
        name: 'Novo Nome do Usuário',
      };

      const partiallyUpdatedUser = new User({
        id: '1',
        name: 'Novo Nome do Usuário',
        email: 'joao@example.com',
        password: 'hashedPassword123',
        isActive: true,
      });

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue(partiallyUpdatedUser);

      // Act
      const result = await updateUserUseCase.execute(userId, updateData);

      // Assert
      expect(result.name).toBe('Novo Nome do Usuário');
      expect(result.email).toBe('joao@example.com'); // Preservado
      expect(result.isActive).toBe(true); // Preservado
    });

    it('should handle repository errors gracefully', async () => {
      // Arrange
      const userId = '1';
      const updateData: Partial<UserProps> = {
        name: 'Test User',
      };

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.save.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(updateUserUseCase.execute(userId, updateData))
        .rejects
        .toThrow('Database error');
    });
  });
});
