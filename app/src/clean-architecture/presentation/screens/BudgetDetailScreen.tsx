// Screen: BudgetDetailScreen
// Tela de detalhes de um orçamento específico
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
} from 'react-native';
import { BudgetViewModel } from '../view-models/BudgetViewModel';
import { BudgetItemViewModel } from '../view-models/BudgetItemViewModel';
import { Budget } from '../../domain/entities/Budget';
import { BudgetItem } from '../../domain/entities/BudgetItem';
import { Money } from '../../shared/utils/Money';

interface BudgetDetailScreenProps {
  budgetId: string;
  onEdit?: (budget: Budget) => void;
  onDelete?: (budget: Budget) => void;
  onAddItem?: (budget: Budget) => void;
  onItemPress?: (item: BudgetItem) => void;
}

export const BudgetDetailScreen: React.FC<BudgetDetailScreenProps> = ({
  budgetId,
  onEdit,
  onDelete,
  onAddItem,
  onItemPress,
}) => {
  const [budgetViewModel] = useState(() => new BudgetViewModel({} as any));
  const [budgetItemViewModel] = useState(() => new BudgetItemViewModel({} as any));
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load budget and items on mount
  useEffect(() => {
    loadBudgetData();
    
    // Cleanup on unmount
    return () => {
      budgetViewModel.clearError();
    };
  }, [budgetId]);

  const loadBudgetData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load budget
      const budget = budgetViewModel.getBudgetByIdSync(budgetId);
      if (!budget) {
        setError('Orçamento não encontrado');
        return;
      }

      // Load budget items
      const result = await budgetItemViewModel.getBudgetItems(budgetId);
      if (result.isSuccess()) {
        setBudgetItems(result.getOrThrow());
      } else {
        setError('Erro ao carregar itens do orçamento');
      }
    } catch (error) {
      console.error('Error loading budget data:', error);
      setError('Erro ao carregar dados do orçamento');
    } finally {
      setLoading(false);
    }
  }, [budgetViewModel, budgetItemViewModel, budgetId]);

  const handleEdit = useCallback(() => {
    const budget = budgetViewModel.getBudgetByIdSync(budgetId);
    if (budget) {
      onEdit?.(budget);
    }
  }, [budgetViewModel, budgetId, onEdit]);

  const handleDelete = useCallback(() => {
    const budget = budgetViewModel.getBudgetByIdSync(budgetId);
    if (budget) {
      Alert.alert(
        'Confirmar Exclusão',
        `Tem certeza que deseja excluir o orçamento "${budget.name}"?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Excluir',
            style: 'destructive',
            onPress: () => onDelete?.(budget),
          },
        ]
      );
    }
  }, [budgetViewModel, budgetId, onDelete]);

  const handleAddItem = useCallback(() => {
    const budget = budgetViewModel.getBudgetByIdSync(budgetId);
    if (budget) {
      onAddItem?.(budget);
    }
  }, [budgetViewModel, budgetId, onAddItem]);

  const handleItemPress = useCallback((item: BudgetItem) => {
    onItemPress?.(item);
  }, [onItemPress]);

  const handleRetry = useCallback(() => {
    loadBudgetData();
  }, [loadBudgetData]);

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

  const getItemStatusText = (item: BudgetItem): string => {
    if (!item.actualValue) return 'Sem dados';
    if (item.isOverBudget()) return 'Acima do orçamento';
    if (item.isUnderBudget()) return 'Dentro do orçamento';
    return 'No orçamento';
  };

  const getItemStatusColor = (item: BudgetItem): string => {
    if (!item.actualValue) return '#757575';
    if (item.isOverBudget()) return '#f44336';
    if (item.isUnderBudget()) return '#4caf50';
    return '#2196f3';
  };

  const calculateTotalPlanned = (): Money => {
    return budgetItems.reduce((total, item) => {
      return new Money(total.value + item.plannedValue.value, 'BRL');
    }, new Money(0, 'BRL'));
  };

  const calculateTotalActual = (): Money => {
    return budgetItems.reduce((total, item) => {
      const actualValue = item.actualValue?.value || 0;
      return new Money(total.value + actualValue, 'BRL');
    }, new Money(0, 'BRL'));
  };

  const calculateProgress = (): number => {
    const totalPlanned = calculateTotalPlanned().value;
    const totalActual = calculateTotalActual().value;
    
    if (totalPlanned === 0) return 0;
    return Math.round((totalActual / totalPlanned) * 100);
  };

  const renderBudgetItem = ({ item }: { item: BudgetItem }) => (
    <TouchableOpacity
      style={styles.budgetItemCard}
      onPress={() => handleItemPress(item)}
      accessibilityLabel={`Item do orçamento ${item.categoryName}`}
      accessibilityHint="Toque para ver detalhes do item"
    >
      <View style={styles.budgetItemHeader}>
        <Text style={styles.budgetItemName}>{item.categoryName}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getItemStatusColor(item) }]}>
          <Text style={styles.statusText}>{getItemStatusText(item)}</Text>
        </View>
      </View>

      <View style={styles.budgetItemInfo}>
        <View style={styles.budgetItemValues}>
          <Text style={styles.budgetItemValue}>
            Planejado: {formatMoney(item.plannedValue)}
          </Text>
          {item.actualValue && (
            <Text style={styles.budgetItemValue}>
              Realizado: {formatMoney(item.actualValue)}
            </Text>
          )}
        </View>
        
        {item.actualValue && (
          <Text style={styles.budgetItemPercentage}>
            {item.calculatePercentageCompletion()}%
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>Nenhum item encontrado</Text>
      <Text style={styles.emptySubtitle}>Adicione itens ao seu orçamento</Text>
      <TouchableOpacity style={styles.addButton} onPress={handleAddItem}>
        <Text style={styles.addButtonText}>Adicionar Item</Text>
      </TouchableOpacity>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
        <Text style={styles.retryButtonText}>Tentar Novamente</Text>
      </TouchableOpacity>
    </View>
  );

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#2196f3" testID="loading-indicator" />
      <Text style={styles.loadingText}>Carregando orçamento...</Text>
    </View>
  );

  if (loading) {
    return renderLoadingState();
  }

  if (error) {
    return renderErrorState();
  }

  const budget = budgetViewModel.getBudgetByIdSync(budgetId);
  if (!budget) {
    return renderErrorState();
  }

  const totalPlanned = calculateTotalPlanned();
  const totalActual = calculateTotalActual();
  const progress = calculateProgress();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{budget.name}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleEdit}
            accessibilityLabel="Editar orçamento"
            accessibilityHint="Toque para editar este orçamento"
          >
            <Text style={styles.actionButtonText}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDelete}
            accessibilityLabel="Excluir orçamento"
            accessibilityHint="Toque para excluir este orçamento"
          >
            <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Excluir</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.budgetInfo}>
        <View style={styles.budgetHeader}>
          <Text style={styles.budgetValue}>{formatMoney(budget.totalPlannedValue)}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(budget.status) }]}>
            <Text style={styles.statusText}>{getStatusText(budget.status)}</Text>
          </View>
        </View>

        <Text style={styles.budgetPeriod}>
          {formatDate(budget.startPeriod)} - {formatDate(budget.endPeriod)}
        </Text>
        <Text style={styles.budgetType}>{budget.type === 'manual' ? 'Manual' : budget.type}</Text>
        <Text style={styles.budgetProgress}>Progresso: {progress}%</Text>
      </View>

      <View style={styles.statisticsContainer}>
        <Text style={styles.statisticsTitle}>Estatísticas</Text>
        <View style={styles.statisticsRow}>
          <Text style={styles.statisticText}>
            Total Planejado: {formatMoney(totalPlanned)}
          </Text>
          <Text style={styles.statisticText}>
            Total Realizado: {formatMoney(totalActual)}
          </Text>
        </View>
        <Text style={styles.statisticText}>
          Diferença: {formatMoney(new Money(totalPlanned.value - totalActual.value, 'BRL'))}
        </Text>
        <Text style={styles.statisticText}>
          Performance: {progress}%
        </Text>
      </View>

      <View style={styles.itemsHeader}>
        <Text style={styles.itemsTitle}>Itens do Orçamento</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddItem}
          accessibilityLabel="Adicionar item ao orçamento"
          accessibilityHint="Toque para adicionar um novo item ao orçamento"
        >
          <Text style={styles.addButtonText}>Adicionar Item</Text>
        </TouchableOpacity>
      </View>

      {budgetItems.length > 0 ? (
        <FlatList
          data={budgetItems}
          renderItem={renderBudgetItem}
          keyExtractor={(item) => item.id}
          style={styles.budgetItemsList}
          testID="budget-items-list"
          accessibilityLabel="Lista de itens do orçamento"
          removeClippedSubviews={false}
          initialNumToRender={10}
        />
      ) : (
        <View style={styles.budgetItemsList}>
          {renderEmptyState()}
        </View>
      )}
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
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
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
  budgetInfo: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  budgetValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196f3',
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
  budgetPeriod: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  budgetType: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  budgetProgress: {
    fontSize: 14,
    color: '#2196f3',
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
  itemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  itemsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#2196f3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  budgetItemsList: {
    flex: 1,
    padding: 16,
  },
  budgetItemCard: {
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
  budgetItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  budgetItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  budgetItemInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  budgetItemValues: {
    flex: 1,
  },
  budgetItemValue: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  budgetItemPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196f3',
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
