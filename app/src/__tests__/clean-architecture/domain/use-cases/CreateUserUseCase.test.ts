import { CreateUserUseCase } from '../../../../clean-architecture/domain/use-cases/CreateUserUseCase';
import { IUserRepository } from '../../../../clean-architecture/domain/repositories/IUserRepository';
import { User } from '../../../../clean-architecture/domain/entities/User';

describe('CreateUserUseCase', () => {
  let createUserUseCase: CreateUserUseCase;
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

    createUserUseCase = new CreateUserUseCase(mockUserRepository);
  });

  it('should create a new user successfully', async () => {
    const userData = {
      name: 'João Silva',
      email: 'joao@example.com',
      password: '123456',
    };

    const createdUser = new User({
      id: '1',
      name: 'João Silva',
      email: 'joao@example.com',
      password: '123456',
      isActive: true,
      createdAt: new Date(),
    });

    mockUserRepository.save.mockResolvedValue(createdUser);
    mockUserRepository.findByEmail.mockResolvedValue(null);

    const result = await createUserUseCase.execute(userData);

    expect(result).toBeInstanceOf(User);
    expect(result.name).toBe(userData.name);
    expect(result.email).toBe(userData.email);
    expect(result.isActive).toBe(true);
    expect(mockUserRepository.save).toHaveBeenCalledWith(expect.any(User));
  });

  it('should throw error when name is empty', async () => {
    const userData = {
      name: '',
      email: 'joao@example.com',
      password: '123456',
    };

    await expect(createUserUseCase.execute(userData)).rejects.toThrow(
      'Nome do usuário é obrigatório'
    );

    expect(mockUserRepository.save).not.toHaveBeenCalled();
  });

  it('should throw error when email is invalid', async () => {
    const userData = {
      name: 'João Silva',
      email: 'invalid-email',
      password: '123456',
    };

    await expect(createUserUseCase.execute(userData)).rejects.toThrow(
      'Formato de email inválido'
    );

    expect(mockUserRepository.save).not.toHaveBeenCalled();
  });

  it('should throw error when password is too short', async () => {
    const userData = {
      name: 'João Silva',
      email: 'joao@example.com',
      password: '123',
    };

    await expect(createUserUseCase.execute(userData)).rejects.toThrow(
      'Senha deve ter pelo menos 6 caracteres'
    );

    expect(mockUserRepository.save).not.toHaveBeenCalled();
  });

  it('should throw error when email already exists', async () => {
    const userData = {
      name: 'João Silva',
      email: 'joao@example.com',
      password: '123456',
    };

    const existingUser = new User({
      id: '1',
      name: 'João Silva',
      email: 'joao@example.com',
      password: '123456',
      isActive: true,
      createdAt: new Date(),
    });

    mockUserRepository.findByEmail.mockResolvedValue(existingUser);

    await expect(createUserUseCase.execute(userData)).rejects.toThrow(
      'Email já está em uso'
    );

    expect(mockUserRepository.save).not.toHaveBeenCalled();
  });

  it('should throw error when repository save fails', async () => {
    const userData = {
      name: 'João Silva',
      email: 'joao@example.com',
      password: '123456',
    };

    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockUserRepository.save.mockRejectedValue(new Error('Database error'));

    await expect(createUserUseCase.execute(userData)).rejects.toThrow(
      'Erro ao salvar usuário'
    );
  });
});
