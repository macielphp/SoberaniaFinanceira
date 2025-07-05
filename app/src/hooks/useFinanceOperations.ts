// app\src\hooks\useFinanceOperations.ts
import { useState, useEffect } from 'react';
import { Operation } from '../services/FinanceService';
import { FinanceService } from '../services/FinanceService';
import { 
  getAllOperations, 
  insertOperation, 
  updateOperation as updateOperationDB,
  deleteOperation, 
  setupDatabase 
} from '../database/Index';

export const useFinanceOperations = () => {
  const [operations, setOperations] = useState<Operation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const financeService = new FinanceService();

  const filterOperations = ({
    nature, 
    state,
    category,
    account,
    startDate,
    endDate
  } : {
    nature?: Operation['nature'];
    state?: Operation['state'];
    category?: string;
    account?: string;
    startDate?: string;
    endDate?: string;
  }): Operation[] => {
    let filtered = [...operations];

    if (nature) {
      filtered = filtered.filter(op => op.nature === nature);
    }

    if (state) {
      filtered = filtered.filter(op => op.state === state); 
    }

    if (category) {
      filtered = filtered.filter(op => 
        op.category && op.category === category
      );
    }

    if (account) {
      filtered = filtered.filter(op =>
        op.sourceAccount === account || op.destinationAccount === account
      )
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      filtered = filtered.filter(op => {
        const opDate = new Date(op.date);
        return opDate >= start && opDate <= end;
      })
    }
    return filtered;
  }

  // Carregar operações
  const loadOperations = async () => {
    try {
      setLoading(true);
      const data = await getAllOperations();
      setOperations(data);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar operações');
    } finally {
      setLoading(false);
    }
  };

  // Criar operação simples
  const createSimpleOperation = async (operationData: Omit<Operation, 'id'>): Promise<Operation> => {
    try {
      const newOperation = financeService.createSimpleOperation(operationData);
      await insertOperation(newOperation);
      await loadOperations(); // Recarrega a lista
      return newOperation;
    } catch (err) {
      setError('Erro ao criar operação');
      throw err;
    }
  };

  // Criar operação dupla
  const createDoubleOperation = async (operationData: Omit<Operation, 'id' | 'state'>): Promise<Operation[]> => {
    try {
      const operations = financeService.createDoubleOperation(operationData);
      await Promise.all(operations.map(op => insertOperation(op)));
      await loadOperations(); // Recarrega a lista
      return operations;
    } catch (err) {
      setError('Erro ao criar operação dupla');
      throw err;
    }
  };

  // Atualizar operação existente (para edição completa)
  const updateOperation = async (operationData: Partial<Operation> & { id: string }): Promise<Operation> => {
    try {
      // Buscar a operação atual para manter dados não alterados
      const currentOperation = operations.find(op => op.id === operationData.id);
      if (!currentOperation) {
        throw new Error('Operação não encontrada');
      }

      // Criar operação atualizada mantendo dados existentes
      const updatedOperation: Operation = {
        ...currentOperation,
        ...operationData,
        id: operationData.id // Garantir que o ID está presente
      };

      await updateOperationDB(updatedOperation);
      await loadOperations(); // Recarrega a lista
      return updatedOperation;
    } catch (err) {
      setError('Erro ao atualizar operação');
      throw err;
    }
  };

  // Atualizar estado da operação
  const updateOperationState = async (operation: Operation, newState: Operation['state']): Promise<Operation> => {
    try {
      const updatedOperation = financeService.updateOperationState(operation, newState);
      await updateOperationDB(updatedOperation);
      await loadOperations(); // Recarrega a lista
      return updatedOperation;
    } catch (err) {
      setError('Erro ao atualizar estado da operação');
      throw err;
    }
  };

  // Remover operação
  const removeOperation = async (id: string): Promise<void> => {
    try {
      await deleteOperation(id);
      await loadOperations(); // Recarrega a lista
    } catch (err) {
      setError('Erro ao remover operação');
      throw err;
    }
  };

  // Inicializar banco de dados e carregar operações
  useEffect(() => {
    setupDatabase().then(() => loadOperations());
  }, []);

  return {
    operations,
    loading,
    error,
    createSimpleOperation,
    createDoubleOperation,
    updateOperation,
    updateOperationState,
    removeOperation,
    reloadOperations: loadOperations,
    filterOperations
  };
};