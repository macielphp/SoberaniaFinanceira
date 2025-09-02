import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { RegisterScreen } from '../../../../clean-architecture/presentation/screens/RegisterScreen';
import { OperationViewModel } from '../../../../clean-architecture/presentation/view-models/OperationViewModel';
import { CategoryViewModel } from '../../../../clean-architecture/presentation/view-models/CategoryViewModel';
import { AccountViewModel } from '../../../../clean-architecture/presentation/view-models/AccountViewModel';

// Mock ViewModels
const mockOperationViewModel = {
  operations: [{ id: '1', description: 'Test Operation' }],
  isLoading: false,
  error: null,
  loadOperations: jest.fn(),
  createOperation: jest.fn(),
  updateOperation: jest.fn(),
  deleteOperation: jest.fn(),
  filterOperations: jest.fn(),
  setError: jest.fn(),
};

const mockCategoryViewModel = {
  categories: [],
  isLoading: false,
  error: null,
  loadCategories: jest.fn(),
  createCategory: jest.fn(),
  updateCategory: jest.fn(),
  deleteCategory: jest.fn(),
  setError: jest.fn(),
};

const mockAccountViewModel = {
  accounts: [],
  isLoading: false,
  error: null,
  getAllAccounts: jest.fn(),
  createAccount: jest.fn(),
  updateAccount: jest.fn(),
  deleteAccount: jest.fn(),
  clearError: jest.fn(),
};

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  setOptions: jest.fn(),
};

// Mock route
const mockRoute = {
  params: {},
};

describe('RegisterScreen', () => {
  let registerScreen: RegisterScreen;

  beforeEach(() => {
    jest.clearAllMocks();
    
    registerScreen = new RegisterScreen(
      mockOperationViewModel as any,
      mockCategoryViewModel as any,
      mockAccountViewModel as any
    );
  });

  describe('initialization', () => {
    it('should initialize with default state', () => {
      expect(registerScreen.getCurrentView()).toBe('register');
      expect(registerScreen.getShowAccountForm()).toBe(false);
      expect(registerScreen.getShowCategoryForm()).toBe(false);
      expect(registerScreen.getEditingAccount()).toBeUndefined();
      expect(registerScreen.getEditingCategory()).toBeUndefined();
      expect(registerScreen.getEditingOperation()).toBeUndefined();
    });

    it('should load data on mount', async () => {
      await registerScreen.onMount();

      expect(mockOperationViewModel.loadOperations).toHaveBeenCalled();
      expect(mockCategoryViewModel.loadCategories).toHaveBeenCalled();
      expect(mockAccountViewModel.getAllAccounts).toHaveBeenCalled();
    });
  });

  describe('view navigation', () => {
    it('should change to register view', () => {
      registerScreen.setCurrentView('register');
      expect(registerScreen.getCurrentView()).toBe('register');
    });

    it('should change to manage view', () => {
      registerScreen.setCurrentView('manage');
      expect(registerScreen.getCurrentView()).toBe('manage');
    });

    it('should change to settings view', () => {
      registerScreen.setCurrentView('settings');
      expect(registerScreen.getCurrentView()).toBe('settings');
    });

    it('should change to categories view', () => {
      registerScreen.setCurrentView('categories');
      expect(registerScreen.getCurrentView()).toBe('categories');
    });

    it('should change to accounts view', () => {
      registerScreen.setCurrentView('accounts');
      expect(registerScreen.getCurrentView()).toBe('accounts');
    });
  });

  describe('operation management', () => {
    it('should handle operation success', () => {
      const mockOperation = { id: '1', description: 'Test Operation' };
      
      registerScreen.handleOperationSuccess(mockOperation);

      expect(registerScreen.getEditingOperation()).toBeUndefined();
      expect(registerScreen.getCurrentView()).toBe('register');
    });

    it('should handle edit operation', () => {
      const mockOperation = { id: '1', description: 'Test Operation' };
      
      registerScreen.handleEditOperation('1');

      expect(registerScreen.getEditingOperation()).toEqual(mockOperation);
      expect(registerScreen.getCurrentView()).toBe('register');
    });

    it('should handle delete operation', async () => {
      const mockOperation = { id: '1', description: 'Test Operation' };
      mockOperationViewModel.deleteOperation.mockResolvedValue({ isSuccess: () => true });

      await registerScreen.handleDeleteOperation('1', 'Test Operation');

      expect(mockOperationViewModel.deleteOperation).toHaveBeenCalledWith('1');
    });
  });

  describe('category management', () => {
    it('should handle create category', () => {
      registerScreen.handleCreateCategory();

      expect(registerScreen.getEditingCategory()).toBeUndefined();
      expect(registerScreen.getShowCategoryForm()).toBe(true);
    });

    it('should handle edit category', () => {
      const mockCategory = { id: '1', name: 'Test Category' };
      
      registerScreen.handleEditCategory(mockCategory);

      expect(registerScreen.getEditingCategory()).toEqual(mockCategory);
      expect(registerScreen.getShowCategoryForm()).toBe(true);
    });

    it('should handle category submit', async () => {
      mockCategoryViewModel.createCategory.mockResolvedValue({ isSuccess: () => true });

      const result = await registerScreen.handleCategorySubmit('Test Category', 'expense');

      expect(result).toBe(true);
      expect(mockCategoryViewModel.createCategory).toHaveBeenCalledWith({ name: 'Test Category', type: 'expense' });
    });

    it('should handle category cancel', () => {
      registerScreen.handleCategoryCancel();

      expect(registerScreen.getShowCategoryForm()).toBe(false);
      expect(registerScreen.getEditingCategory()).toBeUndefined();
    });

    it('should handle delete category', async () => {
      const mockCategory = { id: '1', name: 'Test Category' };
      mockCategoryViewModel.deleteCategory.mockResolvedValue({ isSuccess: () => true });

      await registerScreen.handleDeleteCategory(mockCategory);

      expect(mockCategoryViewModel.deleteCategory).toHaveBeenCalledWith('1');
    });
  });

  describe('account management', () => {
    it('should handle create account', () => {
      registerScreen.handleCreateAccount();

      expect(registerScreen.getEditingAccount()).toBeUndefined();
      expect(registerScreen.getShowAccountForm()).toBe(true);
    });

    it('should handle edit account', () => {
      const mockAccount = { id: '1', name: 'Test Account' };
      
      registerScreen.handleEditAccount(mockAccount);

      expect(registerScreen.getEditingAccount()).toEqual(mockAccount);
      expect(registerScreen.getShowAccountForm()).toBe(true);
    });

    it('should handle account submit', async () => {
      mockAccountViewModel.createAccount.mockResolvedValue({ isSuccess: () => true });

      const result = await registerScreen.handleAccountSubmit('Test Account', 'checking');

      expect(result).toBe(true);
      expect(mockAccountViewModel.createAccount).toHaveBeenCalledWith({ 
        name: 'Test Account', 
        type: 'checking', 
        balance: { value: 0, currency: 'BRL' } 
      });
    });

    it('should handle account cancel', () => {
      registerScreen.handleAccountCancel();

      expect(registerScreen.getShowAccountForm()).toBe(false);
      expect(registerScreen.getEditingAccount()).toBeUndefined();
    });

    it('should handle delete account', async () => {
      const mockAccount = { id: '1', name: 'Test Account' };
      mockAccountViewModel.deleteAccount.mockResolvedValue({ isSuccess: () => true });

      await registerScreen.handleDeleteAccount(mockAccount);

      expect(mockAccountViewModel.deleteAccount).toHaveBeenCalledWith('1');
    });
  });

  describe('filter management', () => {
    it('should clear all filters', () => {
      registerScreen.setSelectedNature('income');
      registerScreen.setSelectedCategory('Test Category');
      registerScreen.setSelectedAccount('Test Account');

      registerScreen.clearAllFilters();

      expect(registerScreen.getSelectedNature()).toBeUndefined();
      expect(registerScreen.getSelectedCategory()).toBeUndefined();
      expect(registerScreen.getSelectedAccount()).toBeUndefined();
    });

    it('should check if has active filters', () => {
      expect(registerScreen.hasActiveFilters()).toBe(false);

      registerScreen.setSelectedNature('income');
      expect(registerScreen.hasActiveFilters()).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should clear error when changing views', () => {
      registerScreen.setCurrentView('manage');

      expect(mockOperationViewModel.setError).toHaveBeenCalledWith(null);
      expect(mockCategoryViewModel.setError).toHaveBeenCalledWith(null);
      expect(mockAccountViewModel.clearError).toHaveBeenCalled();
    });

    it('should clear editing operation when leaving register view', () => {
      const mockOperation = { id: '1', description: 'Test Operation' };
      registerScreen.setEditingOperation(mockOperation);

      registerScreen.setCurrentView('manage');

      expect(registerScreen.getEditingOperation()).toBeUndefined();
    });
  });
});
