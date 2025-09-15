import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator,
  Alert 
} from 'react-native';
import { OperationSummaryViewModel } from '../view-models/OperationSummaryViewModel';
import CategoryViewModel from '../view-models/CategoryViewModel';
import { Money } from '../../shared/utils/Money';

export const VisualizeScreen: React.FC = () => {
  const [operationSummaryViewModel] = useState(() => new OperationSummaryViewModel({} as any, {} as any));
  const [categoryViewModel] = useState(() => new CategoryViewModel({} as any, {} as any, {} as any, {} as any, {} as any));
  const [selectedPeriod, setSelectedPeriod] = useState<string>('lastMonth');
  const [selectedNature, setSelectedNature] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await Promise.all([
        operationSummaryViewModel.loadOperations(),
        categoryViewModel.loadCategories()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadData();
    } finally {
      setRefreshing(false);
    }
  };

  const handlePeriodFilter = async (period: string) => {
    setSelectedPeriod(period);
    try {
      operationSummaryViewModel.selectedPeriod = period;
      await operationSummaryViewModel.loadOperations();
    } catch (error) {
      console.error('Error filtering by period:', error);
    }
  };

  const handleNatureFilter = async (nature: string) => {
    setSelectedNature(nature);
    try {
      // Filtrar operações por natureza
      const filteredOps = operationSummaryViewModel.operations.filter(op => 
        nature === 'all' || op.nature === nature
      );
      operationSummaryViewModel.operations = filteredOps;
    } catch (error) {
      console.error('Error filtering by nature:', error);
    }
  };

  const handleDateRangeFilter = async (startDate: Date, endDate: Date) => {
    try {
      // Filtrar operações por período
      const filteredOps = operationSummaryViewModel.operations.filter(op => 
        op.date >= startDate && op.date <= endDate
      );
      operationSummaryViewModel.operations = filteredOps;
    } catch (error) {
      console.error('Error filtering by date range:', error);
    }
  };

  const getTotalIncome = (): Money => {
    const summary = operationSummaryViewModel.getSummary();
    return new Money(summary.totalIncome);
  };

  const getTotalExpenses = (): Money => {
    const summary = operationSummaryViewModel.getSummary();
    return new Money(summary.totalExpenses);
  };

  const getBalance = (): Money => {
    const summary = operationSummaryViewModel.getSummary();
    return new Money(summary.netBalance);
  };

  const getCategoryStats = () => {
    // Implementar lógica de estatísticas por categoria
    const operations = operationSummaryViewModel.operations;
    const categoryMap = new Map<string, { amount: number; count: number }>();
    
    operations.forEach(op => {
      const category = op.category;
      const amount = op.value.value;
      
      if (categoryMap.has(category)) {
        const existing = categoryMap.get(category)!;
        existing.amount += amount;
        existing.count += 1;
      } else {
        categoryMap.set(category, { amount, count: 1 });
      }
    });
    
    return Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      amount: data.amount,
      percentage: (data.amount / operations.reduce((sum, op) => sum + op.value.value, 0)) * 100
    }));
  };

  const formatMoney = (money: Money): string => {
    return money.toString();
  };

  if (operationSummaryViewModel.loading || categoryViewModel.isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator testID="loading-indicator" size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Carregando dados...</Text>
      </View>
    );
  }

  if (operationSummaryViewModel.error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{operationSummaryViewModel.error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadData}>
          <Text style={styles.retryButtonText}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} testID="visualize-screen">
      <View style={styles.header}>
        <Text style={styles.title}>Visualizar Finanças</Text>
        <TouchableOpacity 
          style={styles.refreshButton} 
          onPress={handleRefresh}
          testID="refresh-button"
        >
          <Text style={styles.refreshButtonText}>Atualizar</Text>
        </TouchableOpacity>
      </View>

      {/* Filtros */}
      <View style={styles.section} testID="filter-section">
        <Text style={styles.sectionTitle}>Filtros</Text>
        
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Período</Text>
          <View style={styles.filterButtons}>
            {[
              { key: 'lastMonth', label: 'Último mês' },
              { key: 'last3Months', label: 'Últimos 3 meses' },
              { key: 'last6Months', label: 'Últimos 6 meses' },
              { key: 'lastYear', label: 'Último ano' },
              { key: 'all', label: 'Todos' }
            ].map(({ key, label }) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.filterButton,
                  selectedPeriod === key && styles.filterButtonActive
                ]}
                onPress={() => handlePeriodFilter(key)}
              >
                <Text style={[
                  styles.filterButtonText,
                  selectedPeriod === key && styles.filterButtonTextActive
                ]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Natureza</Text>
          <View style={styles.filterButtons}>
            {[
              { key: 'receita', label: 'Receitas' },
              { key: 'despesa', label: 'Despesas' },
              { key: 'all', label: 'Todas' }
            ].map(({ key, label }) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.filterButton,
                  selectedNature === key && styles.filterButtonActive
                ]}
                onPress={() => handleNatureFilter(key)}
              >
                <Text style={[
                  styles.filterButtonText,
                  selectedNature === key && styles.filterButtonTextActive
                ]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={styles.dateRangeButton}
          onPress={() => {
            // Simular seleção de data
            const startDate = new Date('2024-01-01');
            const endDate = new Date('2024-01-31');
            handleDateRangeFilter(startDate, endDate);
          }}
          testID="date-range-button"
        >
          <Text style={styles.dateRangeButtonText}>Filtrar por Data</Text>
        </TouchableOpacity>
      </View>

      {/* Estatísticas */}
      <View style={styles.section} testID="statistics-section">
        <Text style={styles.sectionTitle}>Estatísticas</Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total de Receitas</Text>
            <Text style={[styles.statValue, styles.incomeValue]}>
              {formatMoney(getTotalIncome())}
            </Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total de Despesas</Text>
            <Text style={[styles.statValue, styles.expenseValue]}>
              {formatMoney(getTotalExpenses())}
            </Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Saldo</Text>
            <Text style={[
              styles.statValue,
              getBalance().value >= 0 ? styles.incomeValue : styles.expenseValue
            ]}>
              {formatMoney(getBalance())}
            </Text>
          </View>
        </View>
      </View>

      {/* Gráficos */}
      <View style={styles.section} testID="charts-section">
        <Text style={styles.sectionTitle}>Gráficos</Text>
        
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Por Categoria</Text>
          <View style={styles.chartPlaceholder}>
            <Text style={styles.chartPlaceholderText}>
              Gráfico de categorias será implementado aqui
            </Text>
          </View>
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Por Natureza</Text>
          <View style={styles.chartPlaceholder}>
            <Text style={styles.chartPlaceholderText}>
              Gráfico de natureza será implementado aqui
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  refreshButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  filterGroup: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  dateRangeButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  dateRangeButtonText: {
    fontSize: 16,
    color: '#333',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  incomeValue: {
    color: '#28a745',
  },
  expenseValue: {
    color: '#dc3545',
  },
  chartContainer: {
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  chartPlaceholder: {
    height: 200,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  chartPlaceholderText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: 'center',
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
