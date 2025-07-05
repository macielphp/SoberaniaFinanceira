// app\src\hooks\useFinancialSummary.ts
import { useState, useEffect, useMemo } from 'react';
import { useFinanceOperations } from './useFinanceOperations';

interface MonthOption {
  label: string;
  value: string;
  year: number;
  month: number;
}

interface FinancialSummaryData {
  totalReceitas: number;
  totalDespesas: number;
  saldoLiquido: number;
  receitasPendentes: number;
  despesasPendentes: number;
  totalOperacoes: number;
  operacoesPendentes: number;
}

export const useFinancialSummary = () => {
  const { operations, loading } = useFinanceOperations();
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');

  // Gerar opções de meses baseado nas operações existentes
  const monthOptions = useMemo((): MonthOption[] => {
    const months = new Set<string>();
    const options: MonthOption[] = [
      { label: 'Todos os períodos', value: 'all', year: 0, month: 0 }
    ];

    operations.forEach(op => {
      const date = new Date(op.date);
      const year = date.getFullYear();
      const month = date.getMonth();
      const monthKey = `${year}-${month.toString().padStart(2, '0')}`;
      months.add(monthKey);
    });

    // Converter para array e ordenar
    const sortedMonths = Array.from(months).sort().reverse();
    
    sortedMonths.forEach(monthKey => {
      const [yearStr, monthStr] = monthKey.split('-');
      const year = parseInt(yearStr);
      const month = parseInt(monthStr);
      
      const monthNames = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
      ];
      
      options.push({
        label: `${monthNames[month]} ${year}`,
        value: monthKey,
        year,
        month
      });
    });

    return options;
  }, [operations]);

  // Calcular período baseado na seleção
  const getDateRange = (periodValue: string): { startDate?: string; endDate?: string } => {
    if (periodValue === 'all') {
      return {};
    }

    const [yearStr, monthStr] = periodValue.split('-');
    const year = parseInt(yearStr);
    const month = parseInt(monthStr);

    // Primeiro dia do mês
    const startDate = new Date(year, month, 1);
    // Último dia do mês
    const endDate = new Date(year, month + 1, 0);

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  };

  // Filtrar operações baseado no período selecionado
  const filteredOperations = useMemo(() => {
    const { startDate, endDate } = getDateRange(selectedPeriod);
    
    if (!startDate || !endDate) {
      return operations;
    }

    return operations.filter(op => {
      const opDate = new Date(op.date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Incluir o dia inteiro
      
      return opDate >= start && opDate <= end;
    });
  }, [operations, selectedPeriod]);

  // Calcular resumo financeiro
  const financialSummary = useMemo((): FinancialSummaryData => {
    // Receitas realizadas (recebidas)
    const totalReceitas = filteredOperations
      .filter(op => op.nature === 'receita' && op.state === 'recebido')
      .reduce((total, op) => total + Math.abs(op.value), 0);

    // Despesas realizadas (pagas)
    const totalDespesas = filteredOperations
      .filter(op => op.nature === 'despesa' && op.state === 'pago')
      .reduce((total, op) => total + Math.abs(op.value), 0);

    // Saldo líquido
    const saldoLiquido = totalReceitas - totalDespesas;

    // Operações pendentes
    const operacoesPendentes = filteredOperations.filter(op => 
      ['receber', 'pagar', 'transferir'].includes(op.state)
    );

    // Receitas pendentes
    const receitasPendentes = operacoesPendentes
      .filter(op => op.nature === 'receita')
      .reduce((total, op) => total + Math.abs(op.value), 0);

    // Despesas pendentes
    const despesasPendentes = operacoesPendentes
      .filter(op => op.nature === 'despesa')
      .reduce((total, op) => total + Math.abs(op.value), 0);

    return {
      totalReceitas,
      totalDespesas,
      saldoLiquido,
      receitasPendentes,
      despesasPendentes,
      totalOperacoes: filteredOperations.length,
      operacoesPendentes: operacoesPendentes.length
    };
  }, [filteredOperations]);

  // Função para formatar valor monetário
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Função para obter o label do período selecionado
  const getSelectedPeriodLabel = (): string => {
    const option = monthOptions.find(opt => opt.value === selectedPeriod);
    return option?.label || 'Período não encontrado';
  };

  // Função para calcular estatísticas por categoria
  const getCategoryStats = () => {
    const categoryStats = new Map<string, {
      receitas: number;
      despesas: number;
      total: number;
      operacoes: number;
    }>();

    filteredOperations
      .filter(op => ['recebido', 'pago'].includes(op.state))
      .forEach(op => {
        const category = op.category;
        const current = categoryStats.get(category) || {
          receitas: 0,
          despesas: 0,
          total: 0,
          operacoes: 0
        };

        if (op.nature === 'receita') {
          current.receitas += Math.abs(op.value);
        } else {
          current.despesas += Math.abs(op.value);
        }
        
        current.total += Math.abs(op.value);
        current.operacoes += 1;
        
        categoryStats.set(category, current);
      });

    // Converter para array e ordenar por total
    return Array.from(categoryStats.entries())
      .map(([category, stats]) => ({ category, ...stats }))
      .sort((a, b) => b.total - a.total);
  };

  return {
    // Dados
    financialSummary,
    monthOptions,
    selectedPeriod,
    loading,
    filteredOperations,
    
    // Funções
    setSelectedPeriod,
    formatCurrency,
    getSelectedPeriodLabel,
    getCategoryStats,
    
    // Utilitários
    getDateRange
  };
};