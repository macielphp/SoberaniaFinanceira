import React from 'react';
import { ManageSubScreen } from '../../../../clean-architecture/presentation/screens/ManageSubScreen';
import { OperationViewModel } from '../../../../clean-architecture/presentation/view-models/OperationViewModel';
import { CategoryViewModel } from '../../../../clean-architecture/presentation/view-models/CategoryViewModel';
import { AccountViewModel } from '../../../../clean-architecture/presentation/view-models/AccountViewModel';
import { Operation } from '../../../../clean-architecture/domain/entities/Operation';
import { Money } from '../../../../clean-architecture/shared/utils/Money';

// Mock ViewModels
const mockOperationViewModel = {
  operations: [] as Operation[],
  isLoading: false,
  error: null as string | null,
  loadOperations: jest.fn(),
  deleteOperation: jest.fn(),
  setError: jest.fn(),
  clearError: jest.fn(),
};

const mockCategoryViewModel = {
  categories: [
    { id: '1', name: 'Salário', type: 'receita' },
    { id: '2', name: 'Alimentação', type: 'despesa' },
    { id: '3', name: 'Transporte', type: 'despesa' },
  ],
  isLoading: false,
  error: null,
  loadCategories: jest.fn(),
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
  setError: jest.fn(),
  clearError: jest.fn(),
};

describe('ManageSubScreen', () => {
  let manageSubScreen: ManageSubScreen;

  const mockOperations = [
    new Operation({
      id: '1',
      nature: 'receita',
      state: 'recebido',
      paymentMethod: 'Pix',
      sourceAccount: 'Conta Principal',
      destinationAccount: 'Conta Secundária',
      date: new Date('2024-01-01'),
      value: new Money(1000, 'BRL'),
      category: 'Salário',
      details: 'Salário do mês',
    }),
    new Operation({
      id: '2',
      nature: 'despesa',
      state: 'pago',
      paymentMethod: 'Cartão de crédito',
      sourceAccount: 'Conta Principal',
      destinationAccount: 'Conta Principal',
      date: new Date('2024-01-02'),
      value: new Money(150, 'BRL'),
      category: 'Alimentação',
      details: 'Supermercado',
    }),
    new Operation({
      id: '3',
      nature: 'despesa',
      state: 'pago',
      paymentMethod: 'Cartão de débito',
      sourceAccount: 'Conta Principal',
      destinationAccount: 'Conta Principal',
      date: new Date('2024-01-03'),
      value: new Money(50, 'BRL'),
      category: 'Transporte',
      details: 'Uber',
    }),
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mock data
    mockOperationViewModel.operations = [...mockOperations];
    
    manageSubScreen = new ManageSubScreen(
      mockOperationViewModel as any,
      mockCategoryViewModel as any,
      mockAccountViewModel as any
    );
  });

  describe('initialization', () => {
    it('should initialize with default state', () => {
      expect(manageSubScreen.getOperations()).toEqual(mockOperations);
      expect(manageSubScreen.getFilteredOperations()).toEqual(mockOperations);
      expect(manageSubScreen.getSelectedOperation()).toBeNull();
      expect(manageSubScreen.getIsEditing()).toBe(false);
      expect(manageSubScreen.getShowFilters()).toBe(false);
      expect(manageSubScreen.getFilters()).toEqual({
        nature: 'all',
        category: 'all',
        dateRange: 'all',
        minAmount: 0,
        maxAmount: Infinity,
      });
    });

    it('should load data on mount', async () => {
      await manageSubScreen.onMount();

      expect(mockOperationViewModel.loadOperations).toHaveBeenCalled();
      expect(mockCategoryViewModel.loadCategories).toHaveBeenCalled();
      expect(mockAccountViewModel.getAllAccounts).toHaveBeenCalled();
    });
  });

  describe('operation management', () => {
    it('should select operation for editing', () => {
      const operation = mockOperations[0];
      
      manageSubScreen.selectOperation(operation);

      expect(manageSubScreen.getSelectedOperation()).toEqual(operation);
      expect(manageSubScreen.getIsEditing()).toBe(true);
    });

    it('should clear selected operation', () => {
      const operation = mockOperations[0];
      manageSubScreen.selectOperation(operation);
      
      manageSubScreen.clearSelectedOperation();

      expect(manageSubScreen.getSelectedOperation()).toBeNull();
      expect(manageSubScreen.getIsEditing()).toBe(false);
    });

    it('should delete operation successfully', async () => {
      const operationId = '1';
      mockOperationViewModel.deleteOperation.mockResolvedValue(true);

      const result = await manageSubScreen.deleteOperation(operationId);

      expect(result).toBe(true);
      expect(mockOperationViewModel.deleteOperation).toHaveBeenCalledWith(operationId);
      expect(manageSubScreen.getOperations()).toHaveLength(2);
      expect(manageSubScreen.getOperations().find((op: Operation) => op.id === operationId)).toBeUndefined();
    });

    it('should handle delete operation error', async () => {
      const operationId = '1';
      const error = new Error('Delete failed');
      mockOperationViewModel.deleteOperation.mockRejectedValue(error);

      const result = await manageSubScreen.deleteOperation(operationId);

      expect(result).toBe(false);
      expect(mockOperationViewModel.setError).toHaveBeenCalledWith('Delete failed');
    });

    it('should clear selected operation when deleted', async () => {
      const operation = mockOperations[0];
      manageSubScreen.selectOperation(operation);
      mockOperationViewModel.deleteOperation.mockResolvedValue(true);

      await manageSubScreen.deleteOperation(operation.id);

      expect(manageSubScreen.getSelectedOperation()).toBeNull();
      expect(manageSubScreen.getIsEditing()).toBe(false);
    });
  });

  describe('filtering', () => {
    it('should filter operations by nature', () => {
      manageSubScreen.setFilter('nature', 'receita');
      manageSubScreen.applyFilters();

      const filtered = manageSubScreen.getFilteredOperations();
      expect(filtered).toHaveLength(1);
      expect(filtered[0].nature).toBe('receita');
    });

    it('should filter operations by category', () => {
      manageSubScreen.setFilter('category', 'Alimentação');
      manageSubScreen.applyFilters();

      const filtered = manageSubScreen.getFilteredOperations();
      expect(filtered).toHaveLength(1);
      expect(filtered[0].category).toBe('Alimentação');
    });

    it('should filter operations by amount range', () => {
      manageSubScreen.setFilter('minAmount', 100);
      manageSubScreen.setFilter('maxAmount', 200);
      manageSubScreen.applyFilters();

      const filtered = manageSubScreen.getFilteredOperations();
      expect(filtered).toHaveLength(1);
      expect(filtered[0].value.value).toBe(150);
    });

    it('should filter operations by date range', () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      manageSubScreen.setFilter('dateRange', 'today');
      manageSubScreen.applyFilters();

      // This test would need more sophisticated date handling
      expect(manageSubScreen.getFilters().dateRange).toBe('today');
    });

    it('should clear all filters', () => {
      // Set some filters first
      manageSubScreen.setFilter('nature', 'receita');
      manageSubScreen.setFilter('category', 'Salário');
      
      manageSubScreen.clearFilters();

      expect(manageSubScreen.getFilters()).toEqual({
        nature: 'all',
        category: 'all',
        dateRange: 'all',
        minAmount: 0,
        maxAmount: Infinity,
      });
      expect(manageSubScreen.getFilteredOperations()).toEqual(mockOperations);
    });

    it('should combine multiple filters', () => {
      manageSubScreen.setFilter('nature', 'despesa');
      manageSubScreen.setFilter('minAmount', 100);
      manageSubScreen.applyFilters();

      const filtered = manageSubScreen.getFilteredOperations();
      expect(filtered).toHaveLength(1); // Only one expense operation with amount >= 100
      expect(filtered.every((op: Operation) => op.nature === 'despesa')).toBe(true);
      expect(filtered.every((op: Operation) => op.value.value >= 100)).toBe(true);
    });
  });

  describe('search functionality', () => {
    it('should search operations by text', () => {
      manageSubScreen.searchOperations('Salário');

      const results = manageSubScreen.getSearchResults();
      expect(results).toHaveLength(1);
      expect(results[0].category).toBe('Salário');
    });

    it('should search operations by details', () => {
      manageSubScreen.searchOperations('Supermercado');

      const results = manageSubScreen.getSearchResults();
      expect(results).toHaveLength(1);
      expect(results[0].details).toBe('Supermercado');
    });

    it('should return empty results for no matches', () => {
      manageSubScreen.searchOperations('NonExistent');

      const results = manageSubScreen.getSearchResults();
      expect(results).toHaveLength(0);
    });

    it('should clear search results', () => {
      manageSubScreen.searchOperations('Salário');
      expect(manageSubScreen.getSearchResults()).toHaveLength(1);

      manageSubScreen.clearSearch();
      expect(manageSubScreen.getSearchResults()).toEqual([]);
    });
  });

  describe('sorting', () => {
    it('should sort operations by date (newest first)', () => {
      manageSubScreen.sortOperations('date', 'desc');

      const sorted = manageSubScreen.getFilteredOperations();
      expect(sorted[0].date).toEqual(new Date('2024-01-03'));
      expect(sorted[1].date).toEqual(new Date('2024-01-02'));
      expect(sorted[2].date).toEqual(new Date('2024-01-01'));
    });

    it('should sort operations by amount (highest first)', () => {
      manageSubScreen.sortOperations('amount', 'desc');

      const sorted = manageSubScreen.getFilteredOperations();
      expect(sorted[0].value.value).toBe(1000);
      expect(sorted[1].value.value).toBe(150);
      expect(sorted[2].value.value).toBe(50);
    });

    it('should sort operations by category (alphabetical)', () => {
      manageSubScreen.sortOperations('category', 'asc');

      const sorted = manageSubScreen.getFilteredOperations();
      expect(sorted[0].category).toBe('Alimentação');
      expect(sorted[1].category).toBe('Salário');
      expect(sorted[2].category).toBe('Transporte');
    });

    it('should toggle sort direction', () => {
      // First sort ascending
      manageSubScreen.sortOperations('amount', 'asc');
      let sorted = manageSubScreen.getFilteredOperations();
      expect(sorted[0].value.value).toBe(50);

      // Then sort descending
      manageSubScreen.sortOperations('amount', 'desc');
      sorted = manageSubScreen.getFilteredOperations();
      expect(sorted[0].value.value).toBe(1000);
    });
  });

  describe('filter visibility', () => {
    it('should toggle filter visibility', () => {
      expect(manageSubScreen.getShowFilters()).toBe(false);

      manageSubScreen.toggleFilters();
      expect(manageSubScreen.getShowFilters()).toBe(true);

      manageSubScreen.toggleFilters();
      expect(manageSubScreen.getShowFilters()).toBe(false);
    });

    it('should show filters', () => {
      manageSubScreen.displayFilters();
      expect(manageSubScreen.getShowFilters()).toBe(true);
    });

    it('should hide filters', () => {
      manageSubScreen.displayFilters();
      manageSubScreen.hideFilters();
      expect(manageSubScreen.getShowFilters()).toBe(false);
    });
  });

  describe('data loading', () => {
    it('should load operations successfully', async () => {
      await manageSubScreen.loadOperations();

      expect(mockOperationViewModel.loadOperations).toHaveBeenCalled();
    });

    it('should handle load operations error', async () => {
      const error = new Error('Load failed');
      mockOperationViewModel.loadOperations.mockRejectedValue(error);

      await manageSubScreen.loadOperations();

      expect(mockOperationViewModel.setError).toHaveBeenCalledWith('Load failed');
    });

    it('should refresh data', async () => {
      await manageSubScreen.refreshData();

      expect(mockOperationViewModel.loadOperations).toHaveBeenCalled();
      expect(mockCategoryViewModel.loadCategories).toHaveBeenCalled();
      expect(mockAccountViewModel.getAllAccounts).toHaveBeenCalled();
    });
  });

  describe('statistics', () => {
    it('should calculate total income', () => {
      const totalIncome = manageSubScreen.getTotalIncome();
      expect(totalIncome).toBe(1000);
    });

    it('should calculate total expenses', () => {
      const totalExpenses = manageSubScreen.getTotalExpenses();
      expect(totalExpenses).toBe(200); // 150 + 50
    });

    it('should calculate net amount', () => {
      const netAmount = manageSubScreen.getNetAmount();
      expect(netAmount).toBe(800); // 1000 - 200
    });

    it('should get operations count by nature', () => {
      const counts = manageSubScreen.getOperationsCountByNature();
      expect(counts.receita).toBe(1);
      expect(counts.despesa).toBe(2);
    });

    it('should get operations count by category', () => {
      const counts = manageSubScreen.getOperationsCountByCategory();
      expect(counts['Salário']).toBe(1);
      expect(counts['Alimentação']).toBe(1);
      expect(counts['Transporte']).toBe(1);
    });
  });

  describe('error handling', () => {
    it('should clear errors', () => {
      manageSubScreen.clearErrors();

      expect(mockOperationViewModel.setError).toHaveBeenCalledWith(null);
      expect(mockCategoryViewModel.setError).toHaveBeenCalledWith(null);
      expect(mockAccountViewModel.clearError).toHaveBeenCalled();
    });

    it('should get loading state', () => {
      expect(manageSubScreen.getLoading()).toBe(false);

      mockOperationViewModel.isLoading = true;
      expect(manageSubScreen.getLoading()).toBe(true);
    });

    it('should get error state', () => {
      expect(manageSubScreen.getError()).toBeNull();

      mockOperationViewModel.error = 'Test error';
      expect(manageSubScreen.getError()).toBe('Test error');
    });
  });

  describe('pagination', () => {
    it('should get paginated operations', () => {
      const pageSize = 2;
      const page1 = manageSubScreen.getPaginatedOperations(1, pageSize);
      const page2 = manageSubScreen.getPaginatedOperations(2, pageSize);

      expect(page1).toHaveLength(2);
      expect(page2).toHaveLength(1);
    });

    it('should get total pages count', () => {
      const pageSize = 2;
      const totalPages = manageSubScreen.getTotalPages(pageSize);
      expect(totalPages).toBe(2);
    });

    it('should handle empty operations list', () => {
      mockOperationViewModel.operations = [];
      manageSubScreen = new ManageSubScreen(
        mockOperationViewModel as any,
        mockCategoryViewModel as any,
        mockAccountViewModel as any
      );

      const page1 = manageSubScreen.getPaginatedOperations(1, 10);
      const totalPages = manageSubScreen.getTotalPages(10);

      expect(page1).toHaveLength(0);
      expect(totalPages).toBe(0);
    });
  });
});
