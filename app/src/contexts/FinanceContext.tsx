// app\src\contexts\FinanceContext.tsx
import React, { createContext, useContext } from 'react';
import { useFinanceOperations } from '../hooks/useFinanceOperations';
import { useCategoriesAndAccounts } from '../hooks/useCategoriesAndAccounts';

type FinanceContextType = ReturnType<typeof useFinanceOperations> &
  ReturnType<typeof useCategoriesAndAccounts>;

const FinanceContext = createContext<FinanceContextType | null>(null);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const financeOperations = useFinanceOperations();
  const categoriesAndAccounts = useCategoriesAndAccounts();

  const combinedContext = {
    ...financeOperations,
    ...categoriesAndAccounts
  };

  return (
    <FinanceContext.Provider value={combinedContext}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance deve ser usado dentro de um FinanceProvider');
  }
  return context;
};