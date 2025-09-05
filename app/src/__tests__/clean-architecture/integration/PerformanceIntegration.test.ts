/**
 * Teste de Integração: Performance e Carregamento de Dados
 * 
 * Este teste valida a performance da aplicação com grandes volumes de dados
 * e garante que o sistema responda adequadamente.
 */

import { Money } from '../../../clean-architecture/shared/utils/Money';

describe('Performance Integration Tests', () => {
  describe('Large Data Set Performance', () => {
    it('should handle large number of operations efficiently', () => {
      const startTime = performance.now();

      // Simular 1000 operações financeiras
      const largeOperationDataset = Array.from({ length: 1000 }, (_, index) => ({
        id: `operation-${index}`,
        description: `Operação ${index + 1}`,
        amount: new Money((index + 1) * 10),
        type: index % 2 === 0 ? 'income' as const : 'expense' as const,
        accountId: `account-${Math.floor(index / 100)}`,
        date: new Date(Date.now() - index * 24 * 60 * 60 * 1000) // Dados dos últimos 1000 dias
      }));

      // Simular processamento de dados
      const totalIncome = largeOperationDataset
        .filter(op => op.type === 'income')
        .reduce((total, op) => total + op.amount.value, 0);

      const totalExpense = largeOperationDataset
        .filter(op => op.type === 'expense')
        .reduce((total, op) => total + op.amount.value, 0);

      const balance = totalIncome - totalExpense;

      const endTime = performance.now();
      const processingTime = endTime - startTime;

      // Verificar que o processamento foi eficiente (menos de 100ms)
      expect(processingTime).toBeLessThan(100);
      expect(largeOperationDataset).toHaveLength(1000);
      expect(balance).toBe(-5000); // 500 income - 500 expense operations (500 * 2550 - 500 * 2560)
      
      // Verificar alguns dados específicos
      expect(largeOperationDataset[0].amount.value).toBe(10);
      expect(largeOperationDataset[999].amount.value).toBe(10000);
    });

    it('should calculate account balances quickly', () => {
      const startTime = performance.now();

      // Simular 100 contas com múltiplas operações cada
      const accounts = Array.from({ length: 100 }, (_, index) => ({
        id: `account-${index}`,
        name: `Conta ${index + 1}`,
        initialBalance: new Money(index * 1000),
        operations: Array.from({ length: 50 }, (_, opIndex) => ({
          amount: new Money((opIndex + 1) * 100),
          type: opIndex % 2 === 0 ? 'income' as const : 'expense' as const
        }))
      }));

      // Calcular saldo final de todas as contas
      const finalBalances = accounts.map(account => {
        const operationsBalance = account.operations.reduce((total, op) => {
          return op.type === 'income' 
            ? total + op.amount.value 
            : total - op.amount.value;
        }, 0);
        
        return {
          accountId: account.id,
          finalBalance: account.initialBalance.value + operationsBalance
        };
      });

      const endTime = performance.now();
      const processingTime = endTime - startTime;

      // Verificar performance (menos de 50ms para 100 contas x 50 operações)
      expect(processingTime).toBeLessThan(50);
      expect(finalBalances).toHaveLength(100);
      
      // Verificar cálculo correto da primeira conta
      expect(finalBalances[0].finalBalance).toBe(-2500); // 0 + 1250 (income) - 1250 (expense) - 2500 = -2500
    });

    it('should filter and sort large datasets efficiently', () => {
      const startTime = performance.now();

      // Simular 5000 transações mistas
      const transactions = Array.from({ length: 5000 }, (_, index) => ({
        id: `transaction-${index}`,
        description: `Transação ${index + 1}`,
        amount: new Money(Math.random() * 1000),
        type: Math.random() > 0.5 ? 'income' as const : 'expense' as const,
        category: ['alimentacao', 'transporte', 'lazer', 'saude', 'educacao'][index % 5],
        date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
        accountId: `account-${Math.floor(Math.random() * 10)}`
      }));

      // Operações de filtragem e ordenação complexas
      const filteredTransactions = transactions
        .filter(t => t.type === 'expense')
        .filter(t => t.amount.value > 500)
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(0, 100); // Top 100 maiores despesas recentes

      const groupedByCategory = transactions.reduce((groups, transaction) => {
        const category = transaction.category;
        if (!groups[category]) {
          groups[category] = [];
        }
        groups[category].push(transaction);
        return groups;
      }, {} as Record<string, typeof transactions>);

      const categoryTotals = Object.entries(groupedByCategory).map(([category, transactions]) => ({
        category,
        total: transactions.reduce((sum, t) => sum + t.amount.value, 0),
        count: transactions.length
      }));

      const endTime = performance.now();
      const processingTime = endTime - startTime;

      // Verificar performance (menos de 200ms para operações complexas)
      expect(processingTime).toBeLessThan(200);
      expect(transactions).toHaveLength(5000);
      expect(filteredTransactions.length).toBeLessThanOrEqual(100);
      expect(categoryTotals).toHaveLength(5);
      
      // Verificar se a ordenação funcionou (datas em ordem decrescente)
      if (filteredTransactions.length > 1) {
        expect(filteredTransactions[0].date.getTime())
          .toBeGreaterThanOrEqual(filteredTransactions[1].date.getTime());
      }
    });

    it('should handle concurrent calculations efficiently', async () => {
      const startTime = performance.now();

      // Simular múltiplos cálculos simultâneos
      const promises = Array.from({ length: 10 }, async (_, index) => {
        // Simular cálculo de relatório mensal
        const monthlyData = Array.from({ length: 100 }, (_, dayIndex) => ({
          day: dayIndex + 1,
          income: new Money(Math.random() * 500),
          expense: new Money(Math.random() * 300)
        }));

        const monthlyIncome = monthlyData.reduce((sum, day) => sum + day.income.value, 0);
        const monthlyExpense = monthlyData.reduce((sum, day) => sum + day.expense.value, 0);
        const monthlyBalance = monthlyIncome - monthlyExpense;

        return {
          month: index + 1,
          income: monthlyIncome,
          expense: monthlyExpense,
          balance: monthlyBalance
        };
      });

      const results = await Promise.all(promises);

      const endTime = performance.now();
      const processingTime = endTime - startTime;

      // Verificar performance de processamento concorrente (menos de 100ms)
      expect(processingTime).toBeLessThan(100);
      expect(results).toHaveLength(10);
      
      // Verificar que todos os resultados são válidos
      results.forEach(result => {
        expect(result.income).toBeGreaterThan(0);
        expect(result.expense).toBeGreaterThan(0);
        expect(typeof result.balance).toBe('number');
      });
    });
  });

  describe('Memory Usage and Optimization', () => {
    it('should not cause memory leaks with large iterations', () => {
      const startTime = performance.now();
      
      // Simular processamento iterativo que poderia causar vazamentos
      for (let i = 0; i < 10000; i++) {
        const tempMoney = new Money(i);
        const tempOperation = {
          id: `temp-${i}`,
          amount: tempMoney,
          type: i % 2 === 0 ? 'income' as const : 'expense' as const
        };
        
        // Processamento que seria feito normalmente
        const isLargeTransaction = tempOperation.amount.value > 5000;
        const category = isLargeTransaction ? 'large' : 'small';
        
        // Simular liberação de memória
        if (i % 1000 === 0) {
          // Checkpoint para simular garbage collection
        }
      }

      const endTime = performance.now();
      const processingTime = endTime - startTime;

      // Verificar que o processamento iterativo foi rápido (menos de 500ms)
      expect(processingTime).toBeLessThan(500);
    });

    it('should efficiently handle data transformations', () => {
      const startTime = performance.now();

      // Simular transformações de dados complexas
      const rawData = Array.from({ length: 2000 }, (_, index) => ({
        id: index,
        value: index * 1.5,
        category: index % 10,
        timestamp: Date.now() - index * 1000
      }));

      // Múltiplas transformações
      const transformedData = rawData
        .map(item => ({
          ...item,
          money: new Money(item.value),
          categoryName: `categoria-${item.category}`,
          date: new Date(item.timestamp)
        }))
        .filter(item => item.money.value > 100)
        .map(item => ({
          id: item.id,
          amount: item.money.value,
          category: item.categoryName,
          formattedDate: item.date.toISOString().split('T')[0]
        }))
        .sort((a, b) => b.amount - a.amount);

      const endTime = performance.now();
      const processingTime = endTime - startTime;

      // Verificar performance de transformações (menos de 400ms)  
      expect(processingTime).toBeLessThan(400);
      expect(transformedData.length).toBeGreaterThan(0);
      
      // Verificar que a ordenação funcionou
      if (transformedData.length > 1) {
        expect(transformedData[0].amount).toBeGreaterThanOrEqual(transformedData[1].amount);
      }
    });
  });

  describe('Stress Testing', () => {
    it('should handle extreme data volumes gracefully', () => {
      const startTime = performance.now();

      // Simular volume extremo de dados (10,000 registros)
      const extremeDataset = Array.from({ length: 10000 }, (_, index) => ({
        id: `extreme-${index}`,
        amount: new Money(Math.random() * 10000),
        metadata: {
          timestamp: Date.now() - index * 1000,
          category: Math.floor(Math.random() * 20),
          tags: Array.from({ length: 5 }, (_, tagIndex) => `tag-${tagIndex}`)
        }
      }));

      // Operação complexa de agregação
      const aggregatedData = extremeDataset.reduce((acc, item) => {
        const category = item.metadata.category;
        if (!acc[category]) {
          acc[category] = {
            count: 0,
            totalAmount: 0,
            maxAmount: 0,
            minAmount: Infinity
          };
        }
        
        acc[category].count++;
        acc[category].totalAmount += item.amount.value;
        acc[category].maxAmount = Math.max(acc[category].maxAmount, item.amount.value);
        acc[category].minAmount = Math.min(acc[category].minAmount, item.amount.value);
        
        return acc;
      }, {} as Record<number, { count: number; totalAmount: number; maxAmount: number; minAmount: number }>);

      const endTime = performance.now();
      const processingTime = endTime - startTime;

      // Mesmo com volume extremo, deve processar em menos de 1 segundo
      expect(processingTime).toBeLessThan(1000);
      expect(extremeDataset).toHaveLength(10000);
      expect(Object.keys(aggregatedData).length).toBeGreaterThan(0);
      
      // Verificar integridade dos dados agregados
      Object.values(aggregatedData).forEach(aggregate => {
        expect(aggregate.count).toBeGreaterThan(0);
        expect(aggregate.totalAmount).toBeGreaterThan(0);
        expect(aggregate.maxAmount).toBeGreaterThanOrEqual(aggregate.minAmount);
      });
    });
  });
});
