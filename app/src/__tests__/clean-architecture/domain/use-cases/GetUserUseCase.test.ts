import { GetUserUseCase } from '../../../../clean-architecture/domain/use-cases/GetUserUseCase';
import { IUserRepository } from '../../../../clean-architecture/domain/repositories/IUserRepository';
import { User } from '../../../../clean-architecture/domain/entities/User';

describe('GetUserUseCase', () => {
  let getUserUseCase: GetUserUseCase;
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

    getUserUseCase = new GetUserUseCase(mockUserRepository);
  });

  it('should get user by id successfully', async () => {
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

    const result = await getUserUseCase.execute(userId);

    expect(result).toBeInstanceOf(User);
    expect(result.id).toBe(userId);
    expect(result.name).toBe('João Silva');
    expect(result.email).toBe('joao@example.com');
    expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
  });

  it('should throw error when user not found', async () => {
    const userId = '999';

    mockUserRepository.findById.mockResolvedValue(null);

    await expect(getUserUseCase.execute(userId)).rejects.toThrow(
      'Usuário não encontrado'
    );

    expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
  });

  it('should throw error when repository fails', async () => {
    const userId = '1';

    mockUserRepository.findById.mockRejectedValue(new Error('Database error'));

    await expect(getUserUseCase.execute(userId)).rejects.toThrow(
      'Erro ao buscar usuário'
    );
  });
});
