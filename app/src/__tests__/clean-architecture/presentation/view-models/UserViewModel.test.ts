import { UserViewModel } from '../../../../clean-architecture/presentation/view-models/UserViewModel';
import { User } from '../../../../clean-architecture/domain/entities/User';

// Mock dos Use Cases
const mockCreateUserUseCase = {
  execute: jest.fn(),
};

const mockUpdateUserUseCase = {
  execute: jest.fn(),
};

const mockDeleteUserUseCase = {
  execute: jest.fn(),
};

const mockGetUserUseCase = {
  execute: jest.fn(),
};

jest.mock('../../../../clean-architecture/domain/use-cases/CreateUserUseCase', () => ({
  CreateUserUseCase: jest.fn(() => mockCreateUserUseCase),
}));

jest.mock('../../../../clean-architecture/domain/use-cases/UpdateUserUseCase', () => ({
  UpdateUserUseCase: jest.fn(() => mockUpdateUserUseCase),
}));

jest.mock('../../../../clean-architecture/domain/use-cases/DeleteUserUseCase', () => ({
  DeleteUserUseCase: jest.fn(() => mockDeleteUserUseCase),
}));

jest.mock('../../../../clean-architecture/domain/use-cases/GetUserUseCase', () => ({
  GetUserUseCase: jest.fn(() => mockGetUserUseCase),
}));

describe('UserViewModel', () => {
  let userViewModel: UserViewModel;

  beforeEach(() => {
    jest.clearAllMocks();
    const mockUserRepository = {} as any;
    userViewModel = new UserViewModel(mockUserRepository);
  });

  describe('createUser', () => {
    it('should create user successfully', async () => {
      const userData = {
        name: 'João Silva',
        email: 'joao.silva@email.com',
        password: 'password123',
        isActive: true,
      };

      const createdUser = new User({
        id: 'user-1',
        name: userData.name,
        email: userData.email,
        password: userData.password,
        isActive: userData.isActive,
        createdAt: new Date(),
      });

      mockCreateUserUseCase.execute.mockResolvedValue(createdUser);

      const result = await userViewModel.createUser(userData);

      expect(mockCreateUserUseCase.execute).toHaveBeenCalledWith({
        name: userData.name,
        email: userData.email,
        password: userData.password,
      });
      expect(result).toEqual(createdUser);
      expect(userViewModel.loading).toBe(false);
      expect(userViewModel.error).toBeNull();
    });

    it('should handle creation error', async () => {
      const userData = {
        name: '',
        email: 'invalid-email',
        password: '123',
        isActive: true,
      };

      const error = new Error('Dados de usuário inválidos');
      mockCreateUserUseCase.execute.mockRejectedValue(error);

      await expect(userViewModel.createUser(userData)).rejects.toThrow('Dados de usuário inválidos');

      expect(userViewModel.loading).toBe(false);
      expect(userViewModel.error).toBe('Dados de usuário inválidos');
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const userId = 'user-1';
      const updateData = {
        name: 'João Silva Santos',
        email: 'joao.santos@email.com',
      };

      const updatedUser = new User({
        id: userId,
        name: 'João Silva Santos',
        email: 'joao.santos@email.com',
        password: 'password123',
        isActive: true,
        createdAt: new Date(),
      });

      mockUpdateUserUseCase.execute.mockResolvedValue(updatedUser);

      const result = await userViewModel.updateUser(userId, updateData);

      expect(mockUpdateUserUseCase.execute).toHaveBeenCalledWith(userId, updateData);
      expect(result).toEqual(updatedUser);
      expect(userViewModel.loading).toBe(false);
      expect(userViewModel.error).toBeNull();
    });

    it('should handle update error', async () => {
      const userId = 'user-1';
      const updateData = {
        email: 'invalid-email',
      };

      const error = new Error('Email inválido');
      mockUpdateUserUseCase.execute.mockRejectedValue(error);

      await expect(userViewModel.updateUser(userId, updateData)).rejects.toThrow('Email inválido');

      expect(userViewModel.loading).toBe(false);
      expect(userViewModel.error).toBe('Email inválido');
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      const userId = 'user-1';

      mockDeleteUserUseCase.execute.mockResolvedValue(undefined);

      const result = await userViewModel.deleteUser(userId);

      expect(mockDeleteUserUseCase.execute).toHaveBeenCalledWith(userId);
      expect(result).toBe(true);
      expect(userViewModel.loading).toBe(false);
      expect(userViewModel.error).toBeNull();
    });

    it('should handle deletion error', async () => {
      const userId = 'user-1';

      const error = new Error('Usuário não encontrado');
      mockDeleteUserUseCase.execute.mockRejectedValue(error);

      await expect(userViewModel.deleteUser(userId)).rejects.toThrow('Usuário não encontrado');

      expect(userViewModel.loading).toBe(false);
      expect(userViewModel.error).toBe('Usuário não encontrado');
    });
  });

  describe('getUserById', () => {
    it('should get user by id successfully', async () => {
      const userId = 'user-1';
      const user = new User({
        id: userId,
        name: 'João Silva',
        email: 'joao.silva@email.com',
        password: 'password123',
        isActive: true,
        createdAt: new Date(),
      });

      mockGetUserUseCase.execute.mockResolvedValue(user);

      const result = await userViewModel.getUserById(userId);

      expect(mockGetUserUseCase.execute).toHaveBeenCalledWith(userId);
      expect(result).toEqual(user);
      expect(userViewModel.loading).toBe(false);
      expect(userViewModel.error).toBeNull();
    });

    it('should handle get user error', async () => {
      const userId = 'user-1';

      const error = new Error('Usuário não encontrado');
      mockGetUserUseCase.execute.mockRejectedValue(error);

      await expect(userViewModel.getUserById(userId)).rejects.toThrow('Usuário não encontrado');

      expect(userViewModel.loading).toBe(false);
      expect(userViewModel.error).toBe('Usuário não encontrado');
    });
  });

  describe('validateForm', () => {
    it('should return true for valid user data', () => {
      const validData = {
        name: 'João Silva',
        email: 'joao.silva@email.com',
        password: 'password123',
        isActive: true,
      };

      const result = userViewModel.validateForm(validData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should return false for invalid name', () => {
      const invalidData = {
        name: '',
        email: 'joao.silva@email.com',
        password: 'password123',
        isActive: true,
      };

      const result = userViewModel.validateForm(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors.name).toBe('Nome é obrigatório');
    });

    it('should return false for invalid email', () => {
      const invalidData = {
        name: 'João Silva',
        email: 'invalid-email',
        password: 'password123',
        isActive: true,
      };

      const result = userViewModel.validateForm(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors.email).toBe('Email deve ter um formato válido');
    });

    it('should return false for weak password', () => {
      const invalidData = {
        name: 'João Silva',
        email: 'joao.silva@email.com',
        password: '123',
        isActive: true,
      };

      const result = userViewModel.validateForm(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors.password).toBe('Senha deve ter pelo menos 6 caracteres');
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user when set', () => {
      const user = new User({
        id: 'user-1',
        name: 'João Silva',
        email: 'joao.silva@email.com',
        password: 'password123',
        isActive: true,
        createdAt: new Date(),
      });

      userViewModel.setCurrentUser(user);
      expect(userViewModel.getCurrentUser()).toEqual(user);
    });

    it('should return null when no user is set', () => {
      expect(userViewModel.getCurrentUser()).toBeNull();
    });
  });

  describe('logout', () => {
    it('should clear current user', () => {
      const user = new User({
        id: 'user-1',
        name: 'João Silva',
        email: 'joao.silva@email.com',
        password: 'password123',
        isActive: true,
        createdAt: new Date(),
      });

      userViewModel.setCurrentUser(user);
      expect(userViewModel.getCurrentUser()).toEqual(user);

      userViewModel.logout();
      expect(userViewModel.getCurrentUser()).toBeNull();
    });
  });

  describe('state management', () => {
    it('should set loading state during operations', async () => {
      const userData = {
        name: 'João Silva',
        email: 'joao.silva@email.com',
        password: 'password123',
        isActive: true,
      };

      const createdUser = new User({
        id: 'user-1',
        name: userData.name,
        email: userData.email,
        password: userData.password,
        isActive: userData.isActive,
        createdAt: new Date(),
      });

      mockCreateUserUseCase.execute.mockResolvedValue(createdUser);

      // Simulate async operation
      const createPromise = userViewModel.createUser(userData);
      
      expect(userViewModel.loading).toBe(true);
      
      await createPromise;
      
      expect(userViewModel.loading).toBe(false);
    });

    it('should clear error when operation succeeds', async () => {
      // Set initial error
      userViewModel.setError('Erro anterior');

      const userData = {
        name: 'João Silva',
        email: 'joao.silva@email.com',
        password: 'password123',
        isActive: true,
      };

      const createdUser = new User({
        id: 'user-1',
        name: userData.name,
        email: userData.email,
        password: userData.password,
        isActive: userData.isActive,
        createdAt: new Date(),
      });

      mockCreateUserUseCase.execute.mockResolvedValue(createdUser);

      await userViewModel.createUser(userData);

      expect(userViewModel.error).toBeNull();
    });
  });
});