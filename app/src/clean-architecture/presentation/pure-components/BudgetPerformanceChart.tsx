// Pure Component: BudgetPerformanceChart
// Componente puro para exibir gráfico de performance de orçamento
// Segue Clean Architecture - sem lógica de negócio, apenas UI

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Budget } from '../../domain/entities/Budget';

export interface PerformanceData {
  month: string;
  planned: number;
  actual: number;
  percentage: number;
}

export interface BudgetPerformanceChartProps {
  budget: Budget;
  performanceData: PerformanceData[];
  onMonthSelect: (month: string) => void;
  loading?: boolean;
  error?: string | null;
}

export const BudgetPerformanceChart: React.FC<BudgetPerformanceChartProps> = ({
  budget,
  performanceData,
  onMonthSelect,
  loading = false,
  error = null,
}) => {
  const formatMoney = (amount: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  };

  const getPerformanceColor = (percentage: number): string => {
    if (percentage >= 100) return '#4caf50'; // Green
    if (percentage >= 80) return '#ff9800'; // Orange
    return '#f44336'; // Red
  };

  const getPerformanceStatus = (percentage: number): string => {
    if (percentage >= 100) return 'Excelente';
    if (percentage >= 90) return 'Bom';
    if (percentage >= 80) return 'Atenção';
    return 'Crítico';
  };

  const calculateAverage = (): number => {
    if (performanceData.length === 0) return 0;
    const sum = performanceData.reduce((acc, data) => acc + data.percentage, 0);
    return Math.round(sum / performanceData.length);
  };

  const getBestPerformance = (): PerformanceData | null => {
    if (performanceData.length === 0) return null;
    return performanceData.reduce((best, current) => 
      current.percentage > best.percentage ? current : best
    );
  };

  const getWorstPerformance = (): PerformanceData | null => {
    if (performanceData.length === 0) return null;
    return performanceData.reduce((worst, current) => 
      current.percentage < worst.percentage ? current : worst
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196f3" />
        <Text style={styles.loadingText}>Carregando dados...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (performanceData.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Nenhum dado de performance disponível</Text>
      </View>
    );
  }

  const average = calculateAverage();
  const best = getBestPerformance();
  const worst = getWorstPerformance();

  return (
    <View style={styles.container} testID="budget-performance-chart">
      <View style={styles.header}>
        <Text style={styles.title}>Performance do Orçamento</Text>
        <Text style={styles.budgetName}>{budget.name}</Text>
      </View>

      <View style={styles.statistics}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Média:</Text>
          <Text style={styles.statValue}>{average}%</Text>
        </View>
        {best && (
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Melhor:</Text>
            <Text style={styles.statValue}>{best.month} ({best.percentage}%)</Text>
          </View>
        )}
        {worst && (
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Pior:</Text>
            <Text style={styles.statValue}>{worst.month} ({worst.percentage}%)</Text>
          </View>
        )}
      </View>

      <ScrollView style={styles.chartContainer} horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.chart}>
          {performanceData.map((data, index) => (
            <TouchableOpacity
              key={index}
              style={styles.monthItem}
              onPress={() => onMonthSelect(data.month)}
              accessibilityLabel={`${data.month} - ${data.percentage}% do planejado`}
              accessibilityHint="Toque para ver detalhes do mês"
            >
              <View style={styles.monthHeader}>
                <Text style={styles.monthName}>{data.month}</Text>
                <View style={[styles.percentageBadge, { backgroundColor: getPerformanceColor(data.percentage) }]}>
                  <Text style={styles.percentageText}>{data.percentage}%</Text>
                </View>
              </View>

              <View style={styles.monthData}>
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Planejado:</Text>
                  <Text style={styles.dataValue}>{formatMoney(data.planned)}</Text>
                </View>
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Realizado:</Text>
                  <Text style={styles.dataValue}>{formatMoney(data.actual)}</Text>
                </View>
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Status:</Text>
                  <Text style={[styles.dataValue, { color: getPerformanceColor(data.percentage) }]}>
                    {getPerformanceStatus(data.percentage)}
                  </Text>
                </View>
              </View>

              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${Math.min(data.percentage, 100)}%`,
                      backgroundColor: getPerformanceColor(data.percentage)
                    }
                  ]} 
                />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  budgetName: {
    fontSize: 16,
    color: '#666',
  },
  statistics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingVertical: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  chartContainer: {
    marginHorizontal: -16,
  },
  chart: {
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  monthItem: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
    minWidth: 140,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  monthName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  percentageBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  percentageText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  monthData: {
    marginBottom: 8,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  dataLabel: {
    fontSize: 12,
    color: '#666',
  },
  dataValue: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  loadingContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 32,
    marginVertical: 8,
    marginHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  errorText: {
    color: '#f44336',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 32,
    marginVertical: 8,
    marginHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
