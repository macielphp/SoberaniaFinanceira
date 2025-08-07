import { DeleteUserUseCase } from '../../../../clean-architecture/domain/use-cases/DeleteUserUseCase';
import { IUserRepository } from '../../../../clean-architecture/domain/repositories/IUserRepository';
import { User } from '../../../../clean-architecture/domain/entities/User';

describe('DeleteUserUseCase', () => {
  let deleteUserUseCase: DeleteUserUseCase;
  let mockUserRepository: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    mockUserRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findByEmail: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    };

    deleteUserUseCase = new DeleteUserUseCase(mockUserRepository);
  });

  it('should delete user successfully', async () => {
    const userId = '1';
    const mockUser = new User({
      id: '1',
      name: 'João Silva',
      email: 'joao@example.com',
      password: '123456',
      isActive: true,
      createdAt: new Date(),
    });

    mockUserRepository.findById.mockResolvedValue(mockUser);
    mockUserRepository.delete.mockResolvedValue(true);

    await deleteUserUseCase.execute(userId);

    expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
    expect(mockUserRepository.delete).toHaveBeenCalledWith(userId);
  });

  it('should throw error when user not found', async () => {
    const userId = '999';

    mockUserRepository.findById.mockResolvedValue(null);

    await expect(deleteUserUseCase.execute(userId)).rejects.toThrow(
      'Usuário não encontrado'
    );

    expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
    expect(mockUserRepository.delete).not.toHaveBeenCalled();
  });

  it('should throw error when user id is empty', async () => {
    const userId = '';

    await expect(deleteUserUseCase.execute(userId)).rejects.toThrow(
      'ID do usuário é obrigatório'
    );

    expect(mockUserRepository.findById).not.toHaveBeenCalled();
    expect(mockUserRepository.delete).not.toHaveBeenCalled();
  });

  it('should throw error when repository delete fails', async () => {
    const userId = '1';
    const mockUser = new User({
      id: '1',
      name: 'João Silva',
      email: 'joao@example.com',
      password: '123456',
      isActive: true,
      createdAt: new Date(),
    });

    mockUserRepository.findById.mockResolvedValue(mockUser);
    mockUserRepository.delete.mockRejectedValue(new Error('Database error'));

    await expect(deleteUserUseCase.execute(userId)).rejects.toThrow(
      'Erro ao deletar usuário'
    );
  });
});
