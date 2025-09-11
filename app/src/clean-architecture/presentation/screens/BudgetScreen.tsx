// Screen: BudgetScreen
// Tela principal para gerenciamento de orçamentos
// Segue Clean Architecture - conecta UI aos ViewModels

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { BudgetViewModel } from '../view-models/BudgetViewModel';
import { Budget } from '../../domain/entities/Budget';
import { Money } from '../../shared/utils/Money';

interface BudgetScreenProps {
  userId?: string;
  onNavigateToCreate?: () => void;
  onNavigateToDetail?: (budget: Budget) => void;
  onNavigateToEdit?: (budget: Budget) => void;
}

export const BudgetScreen: React.FC<BudgetScreenProps> = ({
  userId = 'user1',
  onNavigateToCreate,
  onNavigateToDetail,
  onNavigateToEdit,
}) => {
  const [budgetViewModel] = useState(() => new BudgetViewModel({} as any));
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [filterType, setFilterType] = useState<'all' | 'manual'>('all');
  const [refreshing, setRefreshing] = useState(false);

  // Load budgets on mount
  useEffect(() => {
    loadBudgets();
    
    // Cleanup on unmount
    return () => {
      budgetViewModel.clearError();
    };
  }, []);

  const loadBudgets = useCallback(async () => {
    try {
      await budgetViewModel.loadBudgets(userId);
    } catch (error) {
      console.error('Error loading budgets:', error);
    }
  }, [budgetViewModel, userId]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadBudgets();
    setRefreshing(false);
  }, [loadBudgets]);

  const handleCreateBudget = useCallback(() => {
    onNavigateToCreate?.();
  }, [onNavigateToCreate]);

  const handleBudgetPress = useCallback((budget: Budget) => {
    onNavigateToDetail?.(budget);
  }, [onNavigateToDetail]);

  const handleEditBudget = useCallback((budget: Budget) => {
    onNavigateToEdit?.(budget);
  }, [onNavigateToEdit]);

  const handleDeleteBudget = useCallback(async (budget: Budget) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Tem certeza que deseja excluir o orçamento "${budget.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await budgetViewModel.deleteBudget(budget.id);
              await loadBudgets();
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir o orçamento');
            }
          },
        },
      ]
    );
  }, [budgetViewModel, loadBudgets]);

  const handleRetry = useCallback(() => {
    loadBudgets();
  }, [loadBudgets]);

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('pt-BR');
  };

  const formatMoney = (money: Money): string => {
    return money.format();
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'inactive': return 'Inativo';
      case 'expired': return 'Expirado';
      default: return status;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active': return '#4caf50';
      case 'inactive': return '#ff9800';
      case 'expired': return '#f44336';
      default: return '#757575';
    }
  };

  const getFilteredBudgets = (): Budget[] => {
    let filtered = budgetViewModel.budgets;

    if (filterStatus !== 'all') {
      filtered = budgetViewModel.getBudgetsByStatus(filterStatus);
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(budget => budget.type === filterType);
    }

    return filtered;
  };

  const renderBudgetCard = ({ item: budget }: { item: Budget }) => (
    <TouchableOpacity
      style={styles.budgetCard}
      onPress={() => handleBudgetPress(budget)}
      accessibilityLabel={`Orçamento ${budget.name}`}
      accessibilityHint="Toque para ver detalhes do orçamento"
    >
      <View style={styles.budgetHeader}>
        <Text style={styles.budgetName}>{budget.name}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(budget.status) }]}>
          <Text style={styles.statusText}>{getStatusText(budget.status)}</Text>
        </View>
      </View>

      <View style={styles.budgetInfo}>
        <Text style={styles.budgetValue}>{formatMoney(budget.totalPlannedValue)}</Text>
        <Text style={styles.budgetPeriod}>
          {formatDate(budget.startPeriod)} - {formatDate(budget.endPeriod)}
        </Text>
        <Text style={styles.budgetType}>{budget.type === 'manual' ? 'Manual' : budget.type}</Text>
      </View>

      <View style={styles.budgetActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleEditBudget(budget)}
          accessibilityLabel="Editar orçamento"
          accessibilityHint="Toque para editar este orçamento"
        >
          <Text style={styles.actionButtonText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteBudget(budget)}
          accessibilityLabel="Excluir orçamento"
          accessibilityHint="Toque para excluir este orçamento"
        >
          <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>Nenhum orçamento encontrado</Text>
      <Text style={styles.emptySubtitle}>Crie seu primeiro orçamento para começar</Text>
      <TouchableOpacity style={styles.createButton} onPress={handleCreateBudget}>
        <Text style={styles.createButtonText}>Criar Orçamento</Text>
      </TouchableOpacity>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>{budgetViewModel.error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
        <Text style={styles.retryButtonText}>Tentar Novamente</Text>
      </TouchableOpacity>
    </View>
  );

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#2196f3" testID="loading-indicator" />
      <Text style={styles.loadingText}>Carregando orçamentos...</Text>
    </View>
  );

  const renderStatistics = () => (
    <View style={styles.statisticsContainer}>
      <Text style={styles.statisticsTitle}>Estatísticas</Text>
      <View style={styles.statisticsRow}>
        <Text style={styles.statisticText}>
          Total de Orçamentos: {budgetViewModel.getBudgetsCount()}
        </Text>
        <Text style={styles.statisticText}>
          Orçamentos Ativos: {budgetViewModel.getActiveBudgetsCount()}
        </Text>
      </View>
      <Text style={styles.statisticText}>
        Valor Total Planejado: {formatMoney(new Money(budgetViewModel.getTotalPlannedValue(), 'BRL'))}
      </Text>
      {!budgetViewModel.hasActiveBudgets() && (
        <Text style={styles.warningText}>Nenhum orçamento ativo</Text>
      )}
    </View>
  );

  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      <Text style={styles.filtersTitle}>Filtros</Text>
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterButton, filterStatus === 'all' && styles.activeFilter]}
          onPress={() => setFilterStatus('all')}
        >
          <Text style={[styles.filterButtonText, filterStatus === 'all' && styles.activeFilterText]}>
            Todos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filterStatus === 'active' && styles.activeFilter]}
          onPress={() => setFilterStatus('active')}
        >
          <Text style={[styles.filterButtonText, filterStatus === 'active' && styles.activeFilterText]}>
            Ativos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filterStatus === 'inactive' && styles.activeFilter]}
          onPress={() => setFilterStatus('inactive')}
        >
          <Text style={[styles.filterButtonText, filterStatus === 'inactive' && styles.activeFilterText]}>
            Inativos
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterButton, filterType === 'all' && styles.activeFilter]}
          onPress={() => setFilterType('all')}
        >
          <Text style={[styles.filterButtonText, filterType === 'all' && styles.activeFilterText]}>
            Todos os Tipos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filterType === 'manual' && styles.activeFilter]}
          onPress={() => setFilterType('manual')}
        >
          <Text style={[styles.filterButtonText, filterType === 'manual' && styles.activeFilterText]}>
            Manual
          </Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.clearFiltersButton}
        onPress={() => {
          setFilterStatus('all');
          setFilterType('all');
        }}
      >
        <Text style={styles.clearFiltersButtonText}>Limpar Filtros</Text>
      </TouchableOpacity>
    </View>
  );

  if (budgetViewModel.loading && !refreshing) {
    return renderLoadingState();
  }

  if (budgetViewModel.error) {
    return renderErrorState();
  }

  const filteredBudgets = getFilteredBudgets();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Orçamentos</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateBudget}
          accessibilityLabel="Criar novo orçamento"
          accessibilityHint="Toque para criar um novo orçamento"
        >
          <Text style={styles.createButtonText}>Novo Orçamento</Text>
        </TouchableOpacity>
      </View>

      {renderStatistics()}
      {renderFilters()}

      <View style={styles.budgetList} testID="budget-list" accessibilityLabel="Lista de orçamentos">
        {filteredBudgets.length > 0 ? (
          filteredBudgets.map((budget) => (
            <View key={budget.id}>
              {renderBudgetCard({ item: budget })}
            </View>
          ))
        ) : (
          renderEmptyState()
        )}
      </View>
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
  createButton: {
    backgroundColor: '#2196f3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  statisticsContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
  },
  statisticsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  statisticsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  statisticText: {
    fontSize: 14,
    color: '#666',
  },
  warningText: {
    fontSize: 14,
    color: '#ff9800',
    fontWeight: 'bold',
  },
  filtersContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
  },
  filtersTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: '#f0f0f0',
  },
  activeFilter: {
    backgroundColor: '#2196f3',
  },
  filterButtonText: {
    fontSize: 12,
    color: '#666',
  },
  activeFilterText: {
    color: '#fff',
  },
  clearFiltersButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  clearFiltersButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: 'bold',
  },
  budgetList: {
    flex: 1,
    padding: 16,
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  budgetCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  budgetName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  budgetInfo: {
    marginBottom: 12,
  },
  budgetValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2196f3',
    marginBottom: 4,
  },
  budgetPeriod: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  budgetType: {
    fontSize: 12,
    color: '#999',
  },
  budgetActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
    backgroundColor: '#f0f0f0',
  },
  deleteButton: {
    backgroundColor: '#ffebee',
  },
  actionButtonText: {
    fontSize: 12,
    color: '#666',
  },
  deleteButtonText: {
    color: '#f44336',
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
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  errorText: {
    fontSize: 16,
    color: '#f44336',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#2196f3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
