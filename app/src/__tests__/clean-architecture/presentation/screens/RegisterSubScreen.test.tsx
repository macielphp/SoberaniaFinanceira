import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { RegisterSubScreen } from '../../../../clean-architecture/presentation/screens/RegisterSubScreen';
import { OperationViewModel } from '../../../../clean-architecture/presentation/view-models/OperationViewModel';
import { CategoryViewModel } from '../../../../clean-architecture/presentation/view-models/CategoryViewModel';
import { AccountViewModel } from '../../../../clean-architecture/presentation/view-models/AccountViewModel';
import { Operation } from '../../../../clean-architecture/domain/entities/Operation';
import { Money } from '../../../../clean-architecture/shared/utils/Money';

// Mock ViewModels
const mockOperationViewModel = {
  operation: null,
  operations: [],
  isLoading: false,
  error: null as string | null,
  isEditing: false,
  createOperation: jest.fn(),
  updateOperation: jest.fn(),
  loadOperation: jest.fn(),
  setOperation: jest.fn(),
  setLoading: jest.fn(),
  setError: jest.fn(),
  reset: jest.fn(),
  validateForm: jest.fn(),
  formatAmount: jest.fn(),
  getOperationSummary: jest.fn(),
};

const mockCategoryViewModel = {
  categories: [
    { id: '1', name: 'Salário', type: 'receita' },
    { id: '2', name: 'Alimentação', type: 'despesa' },
  ],
  isLoading: false,
  error: null,
  loadCategories: jest.fn(),
  createCategory: jest.fn(),
  updateCategory: jest.fn(),
  deleteCategory: jest.fn(),
  setError: jest.fn(),
};

const mockAccountViewModel = {
  accounts: [
    { id: '1', name: 'Conta Principal', type: 'checking', balance: { value: 1000, currency: 'BRL' } },
    { id: '2', name: 'Conta Poupança', type: 'savings', balance: { value: 5000, currency: 'BRL' } },
  ],
  isLoading: false,
  error: null,
  getAllAccounts: jest.fn(),
  createAccount: jest.fn(),
  updateAccount: jest.fn(),
  deleteAccount: jest.fn(),
  setError: jest.fn(),
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

describe('RegisterSubScreen', () => {
  let registerSubScreen: RegisterSubScreen;

  beforeEach(() => {
    jest.clearAllMocks();
    
    registerSubScreen = new RegisterSubScreen(
      mockOperationViewModel as any,
      mockCategoryViewModel as any,
      mockAccountViewModel as any
    );
  });

  describe('initialization', () => {
    it('should initialize with default state', () => {
      expect(registerSubScreen.getFormData()).toEqual({
        nature: 'receita',
        state: 'recebido',
        paymentMethod: 'Pix',
        sourceAccount: '',
        destinationAccount: '',
        date: expect.any(Date),
        value: { amount: 0, currency: 'BRL' },
        category: '',
        details: '',
      });
      expect(registerSubScreen.getIsEditing()).toBe(false);
      expect(registerSubScreen.getShowForm()).toBe(true);
    });

    it('should load data on mount', async () => {
      await registerSubScreen.onMount();

      expect(mockCategoryViewModel.loadCategories).toHaveBeenCalled();
      expect(mockAccountViewModel.getAllAccounts).toHaveBeenCalled();
    });
  });

  describe('form data management', () => {
    it('should update form data correctly', () => {
      const newData = {
        nature: 'despesa' as const,
        state: 'pagar' as const,
        paymentMethod: 'Cartão de crédito' as const,
        sourceAccount: 'Conta Principal',
        destinationAccount: 'Conta Secundária',
        date: new Date('2024-01-01'),
        value: { amount: 150.50, currency: 'BRL' },
        category: 'Alimentação',
        details: 'Compra no supermercado',
      };

      registerSubScreen.updateFormData(newData);

      expect(registerSubScreen.getFormData()).toEqual(newData);
    });

    it('should reset form data', () => {
      // First update some data
      registerSubScreen.updateFormData({
        nature: 'despesa' as const,
        category: 'Test',
        details: 'Test details',
      } as any);

      // Then reset
      registerSubScreen.resetForm();

      expect(registerSubScreen.getFormData().nature).toBe('receita');
      expect(registerSubScreen.getFormData().category).toBe('');
      expect(registerSubScreen.getFormData().details).toBe('');
    });
  });

  describe('operation submission', () => {
    it('should handle create operation successfully', async () => {
      const mockOperation = new Operation({
        id: '1',
        nature: 'receita',
        state: 'recebido',
        paymentMethod: 'Pix',
        sourceAccount: 'Conta Principal',
        destinationAccount: 'Conta Secundária',
        date: new Date('2024-01-01'),
        value: new Money(100, 'BRL'),
        category: 'Salário',
        details: 'Test operation',
      });

      mockOperationViewModel.createOperation.mockResolvedValue(mockOperation);

      // Update form data before submission
      registerSubScreen.updateFormData({
        nature: 'receita' as const,
        state: 'recebido' as const,
        paymentMethod: 'Pix' as const,
        sourceAccount: 'Conta Principal',
        destinationAccount: 'Conta Secundária',
        date: new Date('2024-01-01'),
        value: { amount: 100, currency: 'BRL' },
        category: 'Salário',
        details: 'Test operation',
      });

      const result = await registerSubScreen.handleSubmit();

      expect(result).toBe(true);
      expect(mockOperationViewModel.createOperation).toHaveBeenCalledWith({
        nature: 'receita',
        state: 'recebido',
        paymentMethod: 'Pix',
        sourceAccount: 'Conta Principal',
        destinationAccount: 'Conta Secundária',
        date: expect.any(Date),
        value: expect.any(Money),
        category: 'Salário',
        details: 'Test operation',
      });
      expect(registerSubScreen.getIsEditing()).toBe(false);
    });

    it('should handle update operation successfully', async () => {
      const mockOperation = new Operation({
        id: '1',
        nature: 'receita',
        state: 'recebido',
        paymentMethod: 'Pix',
        sourceAccount: 'Conta Principal',
        destinationAccount: 'Conta Secundária',
        date: new Date('2024-01-01'),
        value: new Money(100, 'BRL'),
        category: 'Salário',
        details: 'Updated operation',
      });

      registerSubScreen.setEditingOperation(mockOperation);
      mockOperationViewModel.updateOperation.mockResolvedValue(mockOperation);

      const result = await registerSubScreen.handleSubmit();

      expect(result).toBe(true);
      expect(mockOperationViewModel.updateOperation).toHaveBeenCalledWith({
        details: 'Updated operation',
      });
      expect(registerSubScreen.getIsEditing()).toBe(false);
    });

    it('should handle operation submission error', async () => {
      const error = new Error('Operation failed');
      mockOperationViewModel.createOperation.mockRejectedValue(error);

      const result = await registerSubScreen.handleSubmit();

      expect(result).toBe(false);
      expect(mockOperationViewModel.setError).toHaveBeenCalledWith('Operation failed');
    });
  });

  describe('form validation', () => {
    it('should validate form data correctly', () => {
      const validData = {
        nature: 'receita' as const,
        state: 'recebido' as const,
        paymentMethod: 'Pix' as const,
        sourceAccount: 'Conta Principal',
        destinationAccount: 'Conta Secundária',
        date: new Date(),
        value: { amount: 100, currency: 'BRL' },
        category: 'Salário',
        details: 'Test operation',
      };

      const validationResult = registerSubScreen.validateForm(validData);

      expect(validationResult.isValid).toBe(true);
      expect(validationResult.errors).toEqual({});
    });

    it('should show validation errors for invalid data', () => {
      const invalidData = {
        nature: '' as any,
        state: '' as any,
        paymentMethod: '' as any,
        sourceAccount: '',
        destinationAccount: '',
        date: new Date(),
        value: { amount: 0, currency: 'BRL' },
        category: '',
        details: '',
      };

      const validationResult = registerSubScreen.validateForm(invalidData);

      expect(validationResult.isValid).toBe(false);
      expect(validationResult.errors).toHaveProperty('nature');
      expect(validationResult.errors).toHaveProperty('state');
      expect(validationResult.errors).toHaveProperty('paymentMethod');
      expect(validationResult.errors).toHaveProperty('sourceAccount');
      expect(validationResult.errors).toHaveProperty('destinationAccount');
      expect(validationResult.errors).toHaveProperty('value');
      expect(validationResult.errors).toHaveProperty('category');
    });
  });

  describe('editing mode', () => {
    it('should set editing operation', () => {
      const mockOperation = new Operation({
        id: '1',
        nature: 'receita',
        state: 'recebido',
        paymentMethod: 'Pix',
        sourceAccount: 'Conta Principal',
        destinationAccount: 'Conta Secundária',
        date: new Date('2024-01-01'),
        value: new Money(100, 'BRL'),
        category: 'Salário',
        details: 'Test operation',
      });

      registerSubScreen.setEditingOperation(mockOperation);

      expect(registerSubScreen.getIsEditing()).toBe(true);
      expect(registerSubScreen.getFormData().category).toBe('Salário');
      expect(registerSubScreen.getFormData().details).toBe('Test operation');
    });

    it('should clear editing operation', () => {
      const mockOperation = new Operation({
        id: '1',
        nature: 'receita',  
        state: 'recebido',
        paymentMethod: 'Pix',
        sourceAccount: 'Conta Principal',
        destinationAccount: 'Conta Secundária',
        date: new Date('2024-01-01'),
        value: new Money(100, 'BRL'),
        category: 'Salário',
        details: 'Test operation',
      });

      registerSubScreen.setEditingOperation(mockOperation);
      registerSubScreen.clearEditingOperation();

      expect(registerSubScreen.getIsEditing()).toBe(false);
      expect(registerSubScreen.getFormData().category).toBe('');
      expect(registerSubScreen.getFormData().details).toBe('');
    });
  });

  describe('form visibility', () => {
    it('should toggle form visibility', () => {
      expect(registerSubScreen.getShowForm()).toBe(true);

      registerSubScreen.toggleForm();
      expect(registerSubScreen.getShowForm()).toBe(false);

      registerSubScreen.toggleForm();
      expect(registerSubScreen.getShowForm()).toBe(true);
    });

    it('should hide form', () => {
      registerSubScreen.hideForm();
      expect(registerSubScreen.getShowForm()).toBe(false);
    });

    it('should show form', () => {
      registerSubScreen.hideForm();
      registerSubScreen.displayForm();
      expect(registerSubScreen.getShowForm()).toBe(true);
    });
  });

  describe('data loading', () => {
    it('should load categories and accounts', async () => {
      await registerSubScreen.loadData();

      expect(mockCategoryViewModel.loadCategories).toHaveBeenCalled();
      expect(mockAccountViewModel.getAllAccounts).toHaveBeenCalled();
    });

    it('should handle data loading errors', async () => {
      const error = new Error('Load failed');
      mockCategoryViewModel.loadCategories.mockRejectedValue(error);

      await registerSubScreen.loadData();

      expect(mockCategoryViewModel.setError).toHaveBeenCalledWith('Load failed');
    });
  });

  describe('filter management', () => {
    it('should get filtered categories by type', () => {
      const incomeCategories = registerSubScreen.getCategoriesByType('income');
      const expenseCategories = registerSubScreen.getCategoriesByType('expense');

      expect(incomeCategories).toHaveLength(1);
      expect(incomeCategories[0].name).toBe('Salário');
      expect(expenseCategories).toHaveLength(1);
      expect(expenseCategories[0].name).toBe('Alimentação');
    });

    it('should get all accounts', () => {
      const accounts = registerSubScreen.getAllAccounts();

      expect(accounts).toHaveLength(2);
      expect(accounts[0].name).toBe('Conta Principal');
      expect(accounts[1].name).toBe('Conta Poupança');
    });
  });

  describe('error handling', () => {
    it('should clear errors', () => {
      registerSubScreen.clearErrors();

      expect(mockOperationViewModel.setError).toHaveBeenCalledWith(null);
      expect(mockCategoryViewModel.setError).toHaveBeenCalledWith(null);
      expect(mockAccountViewModel.clearError).toHaveBeenCalled();
    });

    it('should get loading state', () => {
      expect(registerSubScreen.getLoading()).toBe(false);

      mockOperationViewModel.isLoading = true;
      expect(registerSubScreen.getLoading()).toBe(true);
    });

    it('should get error state', () => {
      expect(registerSubScreen.getError()).toBeNull();

      mockOperationViewModel.error = 'Test error';
      expect(registerSubScreen.getError()).toBe('Test error');
    });
  });
});
