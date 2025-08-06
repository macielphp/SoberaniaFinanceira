import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../styles/themes';
import { useOperationSummaryViewModelAdapter } from '../../clean-architecture/presentation/ui-adapters/useOperationSummaryViewModelAdapter';
import { AccountService } from '../../services/AccountService';

interface MonthlySummaryProps {
  selectedMonth?: Date;
  onMonthChange?: (date: Date) => void;
  onOperationPress?: (operationId: string) => void;
}

export const MonthlySummary: React.FC<MonthlySummaryProps> = ({
  selectedMonth = new Date(),
  onMonthChange,
  onOperationPress,
}) => {
  const {
    operations,
    categories,
    loading,
    error,
    getTotalIncomeForMonth,
    getTotalExpensesForMonth,
    getNetBalanceForMonth,
    getAccountSummary,
    getPeriodSummary,
    getExpensesByCategory,
    getIncomeByCategory,
  } = useOperationSummaryViewModelAdapter();

  const [refreshing, setRefreshing] = useState(false);

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  const formatCurrency = (value: number) => {
    return AccountService.formatCurrency(value);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // Implementar refresh dos dados
    setRefreshing(false);
  };

  const handleMonthChange = () => {
    // Implementar seletor de mês
    if (onMonthChange) {
      const newDate = new Date(selectedMonth);
      newDate.setMonth(newDate.getMonth() + 1);
      onMonthChange(newDate);
    }
  };

  const handleOperationPress = (operationId: string) => {
    if (onOperationPress) {
      onOperationPress(operationId);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={colors.error[500]} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </View>
    );
  }

  const totalIncome = getTotalIncomeForMonth(selectedMonth);
  const totalExpenses = getTotalExpensesForMonth(selectedMonth);
  const netBalance = getNetBalanceForMonth(selectedMonth);
  const startDate = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
  const endDate = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);
  const periodSummary = getPeriodSummary(startDate, endDate);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
      testID="monthly-summary-scroll"
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Resumo do Mês</Text>
        <TouchableOpacity style={styles.monthSelector} onPress={handleMonthChange}>
          <Text style={styles.monthText}>{formatMonthYear(selectedMonth)}</Text>
          <Ionicons name="chevron-down" size={16} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryCards}>
        <View style={styles.summaryCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="trending-up" size={24} color={colors.success[500]} />
            <Text style={styles.cardTitle}>Receitas</Text>
          </View>
          <Text style={[styles.cardValue, styles.positiveValue]}>
            {formatCurrency(totalIncome.value)}
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="trending-down" size={24} color={colors.error[500]} />
            <Text style={styles.cardTitle}>Despesas</Text>
          </View>
          <Text style={[styles.cardValue, styles.negativeValue]}>
            {formatCurrency(totalExpenses.value)}
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="wallet" size={24} color={colors.primary[500]} />
            <Text style={styles.cardTitle}>Saldo</Text>
          </View>
          <Text style={[styles.cardValue, netBalance.value >= 0 ? styles.positiveValue : styles.negativeValue]}>
            {formatCurrency(netBalance.value)}
          </Text>
        </View>
      </View>

      {/* Statistics */}
      <View style={styles.statisticsSection}>
        <Text style={styles.sectionTitle}>Estatísticas</Text>
        
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Total de Operações</Text>
          <Text style={styles.statValue}>{operations.length}</Text>
        </View>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Receitas</Text>
          <Text style={[styles.statValue, styles.positiveValue]}>
            {formatCurrency(totalIncome.value)}
          </Text>
        </View>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Despesas</Text>
          <Text style={[styles.statValue, styles.negativeValue]}>
            {formatCurrency(totalExpenses.value)}
          </Text>
        </View>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Saldo</Text>
          <Text style={[styles.statValue, netBalance.value >= 0 ? styles.positiveValue : styles.negativeValue]}>
            {formatCurrency(netBalance.value)}
          </Text>
        </View>
      </View>

      {/* Operations List */}
      {operations.length > 0 ? (
        <View style={styles.operationsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Operações</Text>
            <TouchableOpacity style={styles.filterButton}>
              <Ionicons name="filter" size={16} color={colors.primary[500]} />
              <Text style={styles.filterText}>Filtrar</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.operationsList} testID="operations-list">
            {operations.slice(0, 5).map((operation: any) => (
              <TouchableOpacity
                key={operation.id}
                style={styles.operationItem}
                onPress={() => handleOperationPress(operation.id)}
                testID={`operation-item-${operation.id}`}
              >
                <View style={styles.operationInfo}>
                  <Text style={styles.operationDescription}>
                    {operation.details || 'Sem descrição'}
                  </Text>
                  <Text style={styles.operationDate}>
                    {operation.date.toLocaleDateString('pt-BR')}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.operationValue,
                    operation.nature === 'receita' ? styles.positiveValue : styles.negativeValue,
                  ]}
                >
                  {operation.nature === 'receita' ? '+' : '-'}
                  {formatCurrency(operation.value.value)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="document-outline" size={48} color={colors.gray[400]} />
          <Text style={styles.emptyText}>Nenhuma operação encontrada</Text>
          <Text style={styles.emptySubtext}>
            Adicione operações para ver o resumo
          </Text>
        </View>
      )}

      {/* Chart Placeholder */}
      <View style={styles.chartSection} testID="monthly-chart">
        <Text style={styles.sectionTitle}>Distribuição</Text>
        <View style={styles.chartPlaceholder}>
          <Text style={styles.chartText}>Gráfico de distribuição</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  title: {
    fontSize: typography.h2.fontSize,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.gray[100],
    borderRadius: 8,
  },
  monthText: {
    fontSize: typography.body1.fontSize,
    color: colors.text.secondary,
    marginRight: spacing.xs,
  },
  summaryCards: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.sm,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.background.paper,
    borderRadius: 12,
    padding: spacing.md,
    shadowColor: colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cardTitle: {
    fontSize: typography.body2.fontSize,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
  cardValue: {
    fontSize: typography.h3.fontSize,
    fontWeight: 'bold',
  },
  positiveValue: {
    color: colors.success[500],
  },
  negativeValue: {
    color: colors.error[500],
  },
  statisticsSection: {
    padding: spacing.md,
    backgroundColor: colors.background.paper,
    margin: spacing.md,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  statLabel: {
    fontSize: typography.body1.fontSize,
    color: colors.text.secondary,
  },
  statValue: {
    fontSize: typography.body1.fontSize,
    fontWeight: '600',
    color: colors.text.primary,
  },
  operationsSection: {
    padding: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.primary[50],
    borderRadius: 6,
  },
  filterText: {
    fontSize: typography.body2.fontSize,
    color: colors.primary[500],
    marginLeft: spacing.xs,
  },
  operationsList: {
    gap: spacing.sm,
  },
  operationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.background.paper,
    borderRadius: 8,
  },
  operationInfo: {
    flex: 1,
  },
  operationDescription: {
    fontSize: typography.body1.fontSize,
    color: colors.text.primary,
    fontWeight: '500',
  },
  operationDate: {
    fontSize: typography.body2.fontSize,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  operationValue: {
    fontSize: typography.body1.fontSize,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    fontSize: typography.body1.fontSize,
    color: colors.text.secondary,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    fontSize: typography.body2.fontSize,
    color: colors.text.secondary,
  },
  chartSection: {
    padding: spacing.md,
  },
  chartPlaceholder: {
    backgroundColor: colors.gray[100],
    borderRadius: 8,
    padding: spacing.xl,
    alignItems: 'center',
  },
  chartText: {
    fontSize: typography.body2.fontSize,
    color: colors.text.secondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.body1.fontSize,
    color: colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorText: {
    fontSize: typography.body1.fontSize,
    color: colors.error[500],
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});

export default MonthlySummary; 