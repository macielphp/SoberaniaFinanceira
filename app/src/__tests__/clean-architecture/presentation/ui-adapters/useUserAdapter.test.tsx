import { renderHook, act } from '@testing-library/react-native';
import { useUserAdapter } from '../../../../clean-architecture/presentation/ui-adapters/useUserAdapter';
import { User } from '../../../../clean-architecture/domain/entities/User';

describe('useUserAdapter', () => {
  describe('initialization', () => {
    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useUserAdapter());

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.user).toBeNull();
      expect(result.current.isEditing).toBe(false);
    });
  });

  describe('createUser', () => {
    it('should create user successfully', async () => {
      const userData = {
        name: 'João Silva',
        email: 'joao@exemplo.com',
        password: 'senha123',
      };

      const { result } = renderHook(() => useUserAdapter());

      let createdUser;
      await act(async () => {
        createdUser = await result.current.createUser(userData);
      });

      expect(createdUser).toBeDefined();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle creation error', async () => {
      const userData = {
        name: '',
        email: 'invalid-email',
        password: '123', // Very short password
      };

      const { result } = renderHook(() => useUserAdapter());

      await act(async () => {
        try {
          await result.current.createUser(userData);
        } catch (e) {
          // Expected error due to invalid data
        }
      });

      expect(result.current.error).toBeTruthy();
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const userId = 'user-1';
      const updateData = {
        name: 'João Silva Atualizado',
        email: 'joao.atualizado@exemplo.com',
      };

      const { result } = renderHook(() => useUserAdapter());

      let updatedUser;
      await act(async () => {
        updatedUser = await result.current.updateUser(userId, updateData);
      });

      expect(updatedUser).toBeDefined();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle update error', async () => {
      const userId = 'user-1';
      const updateData = {
        name: '',
        email: 'invalid-email',
      };

      const { result } = renderHook(() => useUserAdapter());

      await act(async () => {
        try {
          await result.current.updateUser(userId, updateData);
        } catch (e) {
          // Expected error
        }
      });

      expect(result.current.error).toBeTruthy();
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      const userId = 'user-1';

      const { result } = renderHook(() => useUserAdapter());

      let deleteResult;
      await act(async () => {
        deleteResult = await result.current.deleteUser(userId);
      });

      expect(deleteResult).toBe(true);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle deletion error', async () => {
      const userId = 'non-existent-user';

      const { result } = renderHook(() => useUserAdapter());

      await act(async () => {
        try {
          await result.current.deleteUser(userId);
        } catch (e) {
          // Expected error
        }
      });

      expect(result.current.error).toBeTruthy();
    });
  });

  describe('getUserById', () => {
    it('should get user by id successfully', async () => {
      const userId = 'user-1';

      const { result } = renderHook(() => useUserAdapter());

      let returnedUser: User | undefined;
      await act(async () => {
        returnedUser = await result.current.getUserById(userId);
      });

      expect(returnedUser).toBeDefined();
      expect(returnedUser!.id).toBe(userId);
    });
  });

  describe('validation', () => {
    it('should validate form data', () => {
      const validData = {
        name: 'João Silva',
        email: 'joao@exemplo.com',
        password: 'senha123',
      };

      const { result } = renderHook(() => useUserAdapter());

      const validation = result.current.validateForm(validData);

      expect(validation.isValid).toBe(true);
      expect(Object.keys(validation.errors)).toHaveLength(0);
    });

    it('should return validation errors for invalid data', () => {
      const invalidData = {
        name: '',
        email: 'invalid-email',
        password: '123',
      };

      const { result } = renderHook(() => useUserAdapter());

      const validation = result.current.validateForm(invalidData);

      expect(validation.isValid).toBe(false);
      expect(Object.keys(validation.errors).length).toBeGreaterThan(0);
    });
  });

  describe('error handling', () => {
    it('should clear error', () => {
      const { result } = renderHook(() => useUserAdapter());

      act(() => {
        result.current.setError('Some error');
      });

      expect(result.current.error).toBe('Some error');

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });

    it('should set custom error', () => {
      const { result } = renderHook(() => useUserAdapter());

      act(() => {
        result.current.setError('Custom error');
      });

      expect(result.current.error).toBe('Custom error');
    });
  });

  describe('state management', () => {
    it('should set user', () => {
      const { result } = renderHook(() => useUserAdapter());

      const user = new User({
        id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        isActive: true,
        createdAt: new Date(),
      });

      act(() => {
        result.current.setUser(user);
      });

      expect(result.current.user).toEqual(user);
      expect(result.current.isEditing).toBe(true);
    });

    it('should clear user when set to null', () => {
      const { result } = renderHook(() => useUserAdapter());

      act(() => {
        result.current.setUser(null);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isEditing).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all state', () => {
      const { result } = renderHook(() => useUserAdapter());

      // First set some state
      const user = new User({
        id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        isActive: true,
        createdAt: new Date(),
      });

      act(() => {
        result.current.setUser(user);
        result.current.setError('Some error');
      });

      expect(result.current.user).toBeDefined();
      expect(result.current.error).toBe('Some error');

      act(() => {
        result.current.reset();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.isEditing).toBe(false);
    });
  });

  describe('loading state', () => {
    it('should reflect loading state changes', () => {
      const { result } = renderHook(() => useUserAdapter());

      expect(result.current.loading).toBe(false);

      // Loading state would be managed internally by the adapter
      // This test verifies the state is accessible
    });
  });

  describe('user state', () => {
    it('should reflect user from view model', () => {
      const { result } = renderHook(() => useUserAdapter());

      expect(result.current.user).toBeNull();
      // After loading, user would be populated
    });
  });
});
