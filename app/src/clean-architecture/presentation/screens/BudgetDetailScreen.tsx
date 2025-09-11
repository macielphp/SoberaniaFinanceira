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
  onItemPress?: (budgetItem: BudgetItem) => void;
  onNavigateToEdit?: (budget: Budget) => void;
  onNavigateToAddItem?: (budget: Budget) => void;
  onNavigateToEditItem?: (budgetItem: BudgetItem) => void;
}

export const BudgetDetailScreen: React.FC<BudgetDetailScreenProps> = ({
  budgetId,
  onEdit,
  onDelete,
  onAddItem,
  onItemPress,
  onNavigateToEdit,
  onNavigateToAddItem,
  onNavigateToEditItem,
}) => {
  const [budgetViewModel] = useState(() => new BudgetViewModel({} as any));
  const [budgetItemViewModel] = useState(() => new BudgetItemViewModel({} as any, {} as any));
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
      const result = await budgetItemViewModel.getBudgetItemsByBudget(budgetId);
      if (result.isSuccess()) {
        setBudgetItems(result.getOrThrow().budgetItems);
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

  const handleEditBudget = useCallback(() => {
    const budget = budgetViewModel.getBudgetByIdSync(budgetId);
    if (budget) {
      onEdit?.(budget);
      onNavigateToEdit?.(budget);
    }
  }, [budgetViewModel, budgetId, onEdit, onNavigateToEdit]);

  const handleAddItem = useCallback(() => {
    const budget = budgetViewModel.getBudgetByIdSync(budgetId);
    if (budget) {
      onAddItem?.(budget);
      onNavigateToAddItem?.(budget);
    }
  }, [budgetViewModel, budgetId, onAddItem, onNavigateToAddItem]);

  const handleDeleteBudget = useCallback(() => {
    const budget = budgetViewModel.getBudgetByIdSync(budgetId);
    if (budget) {
      onDelete?.(budget);
    }
  }, [budgetViewModel, budgetId, onDelete]);

  const handleEditItem = useCallback((budgetItem: BudgetItem) => {
    onNavigateToEditItem?.(budgetItem);
  }, [onNavigateToEditItem]);

  const handleItemPress = useCallback((budgetItem: BudgetItem) => {
    onItemPress?.(budgetItem);
  }, [onItemPress]);

  const handleDeleteItem = useCallback(async (budgetItem: BudgetItem) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Tem certeza que deseja excluir o item "${budgetItem.categoryName}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              // Mock delete for now - in real implementation this would call the ViewModel
              console.log('Deleting budget item:', budgetItem.id);
              await loadBudgetData();
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir o item');
            }
          },
        },
      ]
    );
  }, [budgetItemViewModel, loadBudgetData]);

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

  const getProgressPercentage = (planned: Money, actual: Money): number => {
    if (planned.value === 0) return 0;
    return Math.min((actual.value / planned.value) * 100, 100);
  };

  const getProgressColor = (percentage: number): string => {
    if (percentage <= 80) return '#4caf50';
    if (percentage <= 100) return '#ff9800';
    return '#f44336';
  };

  const renderBudgetItem = ({ item }: { item: BudgetItem }) => {
    const actualValue = item.actualValue || new Money(0, 'BRL');
    const progressPercentage = getProgressPercentage(item.plannedValue, actualValue);
    const progressColor = getProgressColor(progressPercentage);
    
    return (
      <TouchableOpacity 
        style={styles.budgetItemCard}
        onPress={() => handleItemPress(item)}
        accessibilityLabel={`Item ${item.categoryName}`}
        accessibilityHint="Toque para ver detalhes do item"
      >
        <View style={styles.budgetItemHeader}>
          <Text style={styles.budgetItemCategory}>{item.categoryName}</Text>
          <View style={[styles.statusBadge, { backgroundColor: progressColor }]}>
            <Text style={styles.statusText}>{Math.round(progressPercentage)}%</Text>
          </View>
        </View>

        <View style={styles.budgetItemInfo}>
          <View style={styles.budgetItemValues}>
            <Text style={styles.budgetItemPlanned}>
              Planejado: {formatMoney(item.plannedValue)}
            </Text>
            <Text style={styles.budgetItemActual}>
              Realizado: {formatMoney(actualValue)}
            </Text>
          </View>
          
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${Math.min(progressPercentage, 100)}%`,
                  backgroundColor: progressColor 
                }
              ]} 
            />
          </View>
        </View>

        <View style={styles.budgetItemActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEditItem(item)}
            accessibilityLabel="Editar item"
            accessibilityHint="Toque para editar este item"
          >
            <Text style={styles.actionButtonText}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteItem(item)}
            accessibilityLabel="Excluir item"
            accessibilityHint="Toque para excluir este item"
          >
            <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Excluir</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>Nenhum item encontrado</Text>
      <Text style={styles.emptySubtitle}>Adicione itens ao seu orçamento para começar</Text>
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

  const totalPlanned = budgetItems.reduce((sum, item) => sum + item.plannedValue.value, 0);
  const totalActual = budgetItems.reduce((sum, item) => sum + (item.actualValue?.value || 0), 0);
  const totalProgress = totalPlanned > 0 ? (totalActual / totalPlanned) * 100 : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{budget.name}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={handleEditBudget}
            accessibilityLabel="Editar orçamento"
            accessibilityHint="Toque para editar este orçamento"
          >
            <Text style={styles.editButtonText}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteBudget}
            accessibilityLabel="Excluir orçamento"
            accessibilityHint="Toque para excluir este orçamento"
          >
            <Text style={styles.deleteButtonText}>Excluir</Text>
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
      </View>

      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Resumo</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryText}>
            Total Planejado: {formatMoney(new Money(totalPlanned, 'BRL'))}
          </Text>
          <Text style={styles.summaryText}>
            Total Realizado: {formatMoney(new Money(totalActual, 'BRL'))}
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${Math.min(totalProgress, 100)}%`,
                backgroundColor: getProgressColor(totalProgress)
              }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          Progresso Geral: {Math.round(totalProgress)}%
        </Text>
      </View>

      <View style={styles.itemsHeader}>
        <Text style={styles.itemsTitle}>Itens do Orçamento</Text>
        <TouchableOpacity
          style={styles.addItemButton}
          onPress={handleAddItem}
          accessibilityLabel="Adicionar item"
          accessibilityHint="Toque para adicionar um novo item"
        >
          <Text style={styles.addItemButtonText}>+ Adicionar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.itemsList}>
        {budgetItems.length > 0 ? (
          budgetItems.map((item) => (
            <View key={item.id}>
              {renderBudgetItem({ item })}
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
    flex: 1,
  },
  editButton: {
    backgroundColor: '#2196f3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  deleteButton: {
    backgroundColor: '#f44336',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2196f3',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  budgetPeriod: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  budgetType: {
    fontSize: 14,
    color: '#999',
  },
  summaryContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: '#666',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
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
  addItemButton: {
    backgroundColor: '#4caf50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addItemButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  itemsList: {
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
  budgetItemCategory: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  budgetItemInfo: {
    marginBottom: 12,
  },
  budgetItemValues: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  budgetItemPlanned: {
    fontSize: 14,
    color: '#666',
  },
  budgetItemActual: {
    fontSize: 14,
    color: '#666',
  },
  budgetItemActions: {
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
  actionButtonText: {
    fontSize: 12,
    color: '#666',
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
  addButton: {
    backgroundColor: '#4caf50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
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