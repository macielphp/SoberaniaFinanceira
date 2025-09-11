import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';

import { Money } from '../../shared/utils/Money';
import { BudgetPerformanceViewModel } from '../view-models/BudgetPerformanceViewModel';
// Utility functions
const formatMoney = (money: Money): string => {
  return money.format();
};

export interface BudgetPerformanceScreenProps {
  budgetId: string;
  onNavigateBack?: () => void;
  onNavigateToBudget?: (budgetId: string) => void;
  onNavigateToCategory?: (categoryId: string) => void;
}

export const BudgetPerformanceScreen: React.FC<BudgetPerformanceScreenProps> = ({
  budgetId,
  onNavigateBack,
  onNavigateToBudget,
  onNavigateToCategory,
}) => {
  const [budgetPerformanceViewModel] = useState(() => new BudgetPerformanceViewModel({} as any, {} as any, {} as any));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [performanceResult, categoryResult] = await Promise.all([
        budgetPerformanceViewModel.analyzeBudgetPerformance(budgetId),
        budgetPerformanceViewModel.analyzeCategoryPerformance(budgetId),
      ]);

      // Results are already processed by the ViewModel methods
      // No need to check isFailure() as they throw errors directly
    } catch (err) {
      setError('Erro ao carregar dados de performance');
    } finally {
      setLoading(false);
    }
  }, [budgetPerformanceViewModel, budgetId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    return () => {
      budgetPerformanceViewModel.clearError();
    };
  }, [budgetPerformanceViewModel]);

  const handleRefresh = useCallback(() => {
    loadData();
  }, [loadData]);

  const handleRetry = useCallback(() => {
    loadData();
  }, [loadData]);

  const handleCategoryPress = useCallback((categoryName: string) => {
    if (onNavigateToCategory) {
      onNavigateToCategory(categoryName);
    }
  }, [onNavigateToCategory]);

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#007AFF" testID="loading-indicator" />
      <Text style={styles.loadingText}>Carregando performance...</Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorTitle}>Erro ao carregar dados</Text>
      <Text style={styles.errorMessage}>
        {budgetPerformanceViewModel.error || error || 'Ocorreu um erro inesperado'}
      </Text>
      <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
        <Text style={styles.retryButtonText}>Tentar Novamente</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>Nenhum dado de performance encontrado</Text>
      <Text style={styles.emptyMessage}>Tente novamente mais tarde</Text>
      <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
        <Text style={styles.retryButtonText}>Tentar Novamente</Text>
      </TouchableOpacity>
    </View>
  );

  const renderPerformanceCard = () => {
    const performance = budgetPerformanceViewModel.performanceAnalysis;
    if (!performance) return null;

    return (
      <View style={styles.performanceCard} accessibilityLabel="Performance do orçamento">
        <Text style={styles.cardTitle}>Performance Geral</Text>
        <View style={styles.performanceMetrics}>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Performance:</Text>
            <Text style={styles.metricValue}>{performance.overallPercentage}%</Text>
          </View>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Planejado:</Text>
            <Text style={styles.metricValue}>R$ {performance.totalPlanned.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>
          </View>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Realizado:</Text>
            <Text style={styles.metricValue}>R$ {performance.totalActual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>
          </View>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Status:</Text>
            <Text style={[styles.metricValue, performance.isOnTrack ? styles.successText : styles.errorText]}>
              {performance.isOnTrack ? 'No caminho certo' : 'Fora do orçamento'}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderCategoryPerformance = () => {
    const categories = budgetPerformanceViewModel.categoryPerformance;
    if (!categories || categories.length === 0) return null;

    return (
      <View style={styles.section} accessibilityLabel="Lista de categorias">
        <Text style={styles.sectionTitle}>Performance por Categoria</Text>
        {categories.map((category, index) => (
          <TouchableOpacity
            key={index}
            style={styles.categoryCard}
            onPress={() => handleCategoryPress(category.categoryName)}
            accessibilityLabel={`Performance da categoria ${category.categoryName}`}
            accessibilityHint="Toque para ver detalhes da categoria"
          >
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryName}>{category.categoryName}</Text>
              <Text style={styles.categoryPercentage}>{category.percentage}%</Text>
            </View>
            <View style={styles.categoryMetrics}>
              <Text style={styles.categoryMetric}>
                Planejado: R$ {category.plannedValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </Text>
              <Text style={styles.categoryMetric}>
                Realizado: R$ {category.actualValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </Text>
              <Text style={[styles.categoryMetric, category.variance >= 0 ? styles.successText : styles.errorText]}>
                Variação: R$ {category.variance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderRecommendations = () => {
    // Recommendations not implemented in ViewModel yet
    return null;
  };

  const renderStatistics = () => {
    // Statistics not implemented in ViewModel yet
    return null;
  };

  if (loading) {
    return renderLoadingState();
  }

  if (budgetPerformanceViewModel.error || error) {
    return renderErrorState();
  }

  if (!budgetPerformanceViewModel.performanceAnalysis && 
      (!budgetPerformanceViewModel.categoryPerformance || budgetPerformanceViewModel.categoryPerformance.length === 0)) {
    return renderEmptyState();
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Performance do Orçamento</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
          <Text style={styles.refreshButtonText}>Atualizar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderPerformanceCard()}
        {renderCategoryPerformance()}
        {renderRecommendations()}
        {renderStatistics()}
      </ScrollView>
    </View>
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
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f44336',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  performanceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  performanceMetrics: {
    gap: 12,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 16,
    color: '#666',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  categoryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  categoryPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  categoryMetrics: {
    gap: 8,
  },
  categoryMetric: {
    fontSize: 14,
    color: '#666',
  },
  recommendationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  recommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityHigh: {
    backgroundColor: '#ffebee',
  },
  priorityMedium: {
    backgroundColor: '#fff3e0',
  },
  priorityLow: {
    backgroundColor: '#e8f5e8',
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  recommendationDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  recommendationImpact: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  statisticsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statisticRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statisticLabel: {
    fontSize: 16,
    color: '#666',
  },
  statisticValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  successText: {
    color: '#4caf50',
  },
  errorText: {
    color: '#f44336',
  },
});
