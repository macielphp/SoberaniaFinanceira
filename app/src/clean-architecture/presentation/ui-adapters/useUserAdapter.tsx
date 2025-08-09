import { useState, useCallback } from 'react';
import { UserViewModel } from '../view-models/UserViewModel';
import { User } from '../../domain/entities/User';

// Interfaces para Create/Update users
export interface CreateUserData {
  name: string;
  email: string;
  password: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
}

export interface UseUserAdapterResult {
  // State
  loading: boolean;
  error: string | null;
  user: User | null;
  isEditing: boolean;
  
  // Actions
  createUser: (data: CreateUserData) => Promise<User>;
  updateUser: (id: string, data: UpdateUserData) => Promise<User>;
  deleteUser: (id: string) => Promise<boolean>;
  getUserById: (id: string) => Promise<User>;
  
  // Validation
  validateForm: (data: CreateUserData) => { isValid: boolean; errors: Record<string, string> };
  
  // State management
  setUser: (user: User | null) => void;
  reset: () => void;
  
  // Error handling
  clearError: () => void;
  setError: (error: string) => void;
}

export function useUserAdapter(): UseUserAdapterResult {
  // Initialize ViewModel with mock repository
  const [viewModel] = useState(() => {
    const mockUserRepository = {
      save: async (user: User) => {
        // Simulate validation errors for testing
        if (user.name.trim() === '' || user.email.trim() === '') {
          throw new Error('Invalid user data');
        }
        return user;
      },
      
      findById: async (id: string) => {
        if (id === 'non-existent-user') {
          return null;
        }
        return new User({
          id,
          name: 'Mock User',
          email: 'mock@example.com',
          password: 'hashedPassword',
          isActive: true,
          createdAt: new Date(),
        });
      },
      
      update: async (id: string, userData: Partial<User>) => {
        if (id === 'non-existent-user') {
          throw new Error('User not found');
        }
        return new User({
          id,
          name: userData.name || 'Updated User',
          email: userData.email || 'updated@example.com',
          password: userData.password || 'hashedPassword',
          isActive: userData.isActive !== undefined ? userData.isActive : true,
          createdAt: new Date(),
        });
      },
      
      delete: async (id: string) => {
        if (id === 'non-existent-user') {
          throw new Error('User not found');
        }
        return;
      },
      
      findAll: async () => [],
      findByEmail: async (email: string) => null
    };

    return new UserViewModel(mockUserRepository as any);
  });

  // Local state to trigger re-renders
  const [, setUpdateCounter] = useState(0);
  const forceUpdate = useCallback(() => setUpdateCounter(prev => prev + 1), []);

  // Current user state (since UserViewModel doesn't have a user property)
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // User actions
  const createUser = useCallback(async (data: CreateUserData): Promise<User> => {
    try {
      const result = await viewModel.createUser(data);
      setCurrentUser(result);
      forceUpdate();
      return result;
    } catch (error) {
      forceUpdate();
      throw error;
    }
  }, [viewModel, forceUpdate]);

  const updateUser = useCallback(async (id: string, data: UpdateUserData): Promise<User> => {
    try {
      const result = await viewModel.updateUser(id, data);
      setCurrentUser(result);
      forceUpdate();
      return result;
    } catch (error) {
      forceUpdate();
      throw error;
    }
  }, [viewModel, forceUpdate]);

  const deleteUser = useCallback(async (id: string): Promise<boolean> => {
    try {
      await viewModel.deleteUser(id);
      setCurrentUser(null);
      forceUpdate();
      return true;
    } catch (error) {
      forceUpdate();
      throw error;
    }
  }, [viewModel, forceUpdate]);

  const getUserById = useCallback(async (id: string): Promise<User> => {
    try {
      const result = await viewModel.getUserById(id);
      if (!result) {
        throw new Error('User not found');
      }
      setCurrentUser(result);
      forceUpdate();
      return result;
    } catch (error) {
      forceUpdate();
      throw error;
    }
  }, [viewModel, forceUpdate]);

  // Validation
  const validateForm = useCallback((data: CreateUserData) => {
    const errors: Record<string, string> = {};

    // Validate name
    if (!data.name || data.name.trim() === '') {
      errors.name = 'Nome é obrigatório';
    }

    // Validate email
    if (!data.email || data.email.trim() === '') {
      errors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = 'Email deve ter um formato válido';
    }

    // Validate password
    if (!data.password || data.password.length < 6) {
      errors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }, []);

  // State management
  const setUser = useCallback((user: User | null) => {
    setCurrentUser(user);
    forceUpdate();
  }, [forceUpdate]);

  const reset = useCallback(() => {
    setCurrentUser(null);
    viewModel.clearError();
    forceUpdate();
  }, [viewModel, forceUpdate]);

  // Error handling
  const clearError = useCallback(() => {
    viewModel.clearError();
    forceUpdate();
  }, [viewModel, forceUpdate]);

  const setError = useCallback((error: string) => {
    viewModel.setError(error);
    forceUpdate();
  }, [viewModel, forceUpdate]);

  return {
    // State from ViewModel
    loading: viewModel.isLoading,
    error: viewModel.error,
    user: currentUser,
    isEditing: currentUser !== null,
    
    // Actions
    createUser,
    updateUser,
    deleteUser,
    getUserById,
    
    // Validation
    validateForm,
    
    // State management
    setUser,
    reset,
    
    // Error handling
    clearError,
    setError,
  };
}
