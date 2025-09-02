import { useState, useCallback } from 'react';
import { OperationViewModel } from '../view-models/OperationViewModel';
import { Operation } from '../../domain/entities/Operation';
import { Money } from '../../shared/utils/Money';

// Interfaces para Create/Update operações
export interface CreateOperationData {
  nature: 'receita' | 'despesa';
  state: 'receber' | 'recebido' | 'pagar' | 'pago';
  paymentMethod: 'Cartão de débito' | 'Cartão de crédito' | 'Pix' | 'TED' | 'Estorno' | 'Transferência bancária';
  sourceAccount: string;
  destinationAccount: string;
  date: Date;
  value: Money;
  category: string;
  details?: string;
}

export interface UpdateOperationData {
  nature?: 'receita' | 'despesa';
  state?: 'receber' | 'recebido' | 'pagar' | 'pago';
  paymentMethod?: 'Cartão de débito' | 'Cartão de crédito' | 'Pix' | 'TED' | 'Estorno' | 'Transferência bancária';
  sourceAccount?: string;
  destinationAccount?: string;
  date?: Date;
  value?: Money;
  category?: string;
  details?: string;
}

export interface UseOperationAdapterResult {
  // State
  loading: boolean;
  error: string | null;
  operation: Operation | null;
  isEditing: boolean;
  
  // Actions
  createOperation: (data: CreateOperationData) => Promise<Operation>;
  updateOperation: (data: UpdateOperationData) => Promise<Operation>;
  loadOperation: (id: string) => Promise<Operation>;
  deleteOperation: (id: string) => Promise<void>;
  setOperation: (operation: Operation | null) => void;
  reset: () => void;
  
  // Validation
  validateForm: (data: CreateOperationData) => { isValid: boolean; errors: Record<string, string> };
  
  // Formatting and summary
  formatAmount: (amount: Money) => string;
  getOperationSummary: () => any;
  
  // Error handling
  clearError: () => void;
  setError: (error: string) => void;
}

export function useOperationAdapter(): UseOperationAdapterResult {
  // Initialize ViewModel - precisa dos Use Cases mockados para funcionar
  const [viewModel] = useState(() => {
    // Mocks dos Use Cases
    const mockCreateUseCase = {
      execute: async (data: CreateOperationData) => {
        const operation = new Operation({
          id: 'mock-id',
          ...data,
        });
        return operation;
      }
    };

    const mockUpdateUseCase = {
      execute: async (id: string, data: UpdateOperationData) => {
        const operation = new Operation({
          id,
          nature: data.nature || 'receita',
          state: data.state || 'recebido',
          paymentMethod: data.paymentMethod || 'Pix',
          sourceAccount: data.sourceAccount || 'account-1',
          destinationAccount: data.destinationAccount || 'account-2',
          date: data.date || new Date(),
          value: data.value || new Money(100),
          category: data.category || 'category-1',
          details: data.details || '',
        });
        return operation;
      }
    };

    const mockGetByIdUseCase = {
      execute: async (id: string) => {
        const operation = new Operation({
          id,
          nature: 'receita',
          state: 'recebido',
          paymentMethod: 'Pix',
          sourceAccount: 'account-1',
          destinationAccount: 'account-2',
          date: new Date(),
          value: new Money(100),
          category: 'category-1',
          details: 'Mock operation',
        });
        return operation;
      }
    };

    const mockGetOperationsUseCase = {
      execute: async () => ({
        match: (onSuccess: any) => onSuccess({ operations: [] })
      })
    };

    const mockDeleteUseCase = {
      execute: async (id: string) => {
        // Mock delete operation
        return Promise.resolve();
      }
    };

    return new OperationViewModel(
      mockCreateUseCase,
      mockUpdateUseCase,
      mockGetByIdUseCase,
      mockGetOperationsUseCase,
      mockDeleteUseCase
    );
  });

  // Local state to trigger re-renders
  const [, setUpdateCounter] = useState(0);
  const forceUpdate = useCallback(() => setUpdateCounter(prev => prev + 1), []);

  // Operation actions
  const createOperation = useCallback(async (data: CreateOperationData): Promise<Operation> => {
    try {
      const result = await viewModel.createOperation(data);
      forceUpdate();
      return result;
    } catch (error) {
      forceUpdate();
      throw error;
    }
  }, [viewModel, forceUpdate]);

  const updateOperation = useCallback(async (data: UpdateOperationData): Promise<Operation> => {
    try {
      const result = await viewModel.updateOperation(data);
      forceUpdate();
      return result;
    } catch (error) {
      forceUpdate();
      throw error;
    }
  }, [viewModel, forceUpdate]);

  const loadOperation = useCallback(async (id: string): Promise<Operation> => {
    try {
      const result = await viewModel.loadOperation(id);
      forceUpdate();
      return result;
    } catch (error) {
      forceUpdate();
      throw error;
    }
  }, [viewModel, forceUpdate]);

  const deleteOperation = useCallback(async (id: string): Promise<void> => {
    try {
      await viewModel.deleteOperation(id);
      forceUpdate();
    } catch (error) {
      forceUpdate();
      throw error;
    }
  }, [viewModel, forceUpdate]);

  const setOperation = useCallback((operation: Operation | null) => {
    viewModel.setOperation(operation);
    forceUpdate();
  }, [viewModel, forceUpdate]);

  const reset = useCallback(() => {
    viewModel.reset();
    forceUpdate();
  }, [viewModel, forceUpdate]);

  // Validation
  const validateForm = useCallback((data: CreateOperationData) => {
    return viewModel.validateForm(data);
  }, [viewModel]);

  // Formatting and summary
  const formatAmount = useCallback((amount: Money): string => {
    return viewModel.formatAmount(amount);
  }, [viewModel]);

  const getOperationSummary = useCallback(() => {
    return viewModel.getOperationSummary();
  }, [viewModel]);

  // Error handling
  const clearError = useCallback(() => {
    viewModel.setError(null);
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
    operation: viewModel.operation,
    isEditing: viewModel.isEditing,
    
    // Actions
    createOperation,
    updateOperation,
    loadOperation,
    deleteOperation,
    setOperation,
    reset,
    
    // Validation
    validateForm,
    
    // Formatting and summary
    formatAmount,
    getOperationSummary,
    
    // Error handling
    clearError,
    setError,
  };
}
