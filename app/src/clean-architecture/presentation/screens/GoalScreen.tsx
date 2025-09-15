// Screen: GoalScreen
// Tela principal para gerenciamento de metas
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
import { GoalViewModel } from '../view-models/GoalViewModel';
import { Goal } from '../../domain/entities/Goal';
import { Money } from '../../shared/utils/Money';
import { container } from '../../shared/di/Container';

interface GoalScreenProps {
  userId?: string;
  onNavigateToCreate?: () => void;
  onNavigateToEdit?: (goal: Goal) => void;
  onNavigateToDetail?: (goal: Goal) => void;
}

export const GoalScreen: React.FC<GoalScreenProps> = ({
  userId = 'user1',
  onNavigateToCreate,
  onNavigateToEdit,
  onNavigateToDetail,
}) => {
  const [goalViewModel] = useState(() => container.resolve<GoalViewModel>('GoalViewModel'));

  // Load goals on mount
  useEffect(() => {
    loadGoals();
    
    // Cleanup on unmount
    return () => {
      goalViewModel.clearError();
    };
  }, []);

  const loadGoals = useCallback(async () => {
    try {
      await goalViewModel.getAllGoals();
    } catch (error) {
      console.error('Erro ao carregar metas:', error);
    }
  }, [goalViewModel]);

  const handleCreateGoal = useCallback(() => {
    onNavigateToCreate?.();
  }, [onNavigateToCreate]);

  const handleEditGoal = useCallback((goal: Goal) => {
    onNavigateToEdit?.(goal);
  }, [onNavigateToEdit]);

  const handleRetry = useCallback(() => {
    goalViewModel.clearError();
    loadGoals();
  }, [goalViewModel, loadGoals]);

  const formatMoney = (money: Money): string => {
    return `R$ ${money.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  const getGoalTypeLabel = (type: string): string => {
    const typeLabels: { [key: string]: string } = {
      'economia': 'Economia',
      'compra': 'Compra',
    };
    return typeLabels[type] || type;
  };

  const getGoalStatusLabel = (status: string): string => {
    const statusLabels: { [key: string]: string } = {
      'active': 'Ativa',
      'completed': 'Concluída',
      'paused': 'Pausada',
      'cancelled': 'Cancelada',
    };
    return statusLabels[status] || status;
  };

  const getGoalImportanceLabel = (importance: string): string => {
    const importanceLabels: { [key: string]: string } = {
      'baixa': 'Baixa',
      'média': 'Média',
      'alta': 'Alta',
    };
    return importanceLabels[importance] || importance;
  };

  const renderGoalItem = ({ item }: { item: Goal }) => (
    <TouchableOpacity
      style={styles.goalItem}
      onPress={() => handleEditGoal(item)}
      accessibilityLabel={`Meta ${item.description}`}
      accessibilityHint="Toque para editar esta meta"
    >
      <View style={styles.goalHeader}>
        <Text style={styles.goalDescription}>{item.description}</Text>
        <View style={styles.goalStatusBadge}>
          <Text style={styles.goalStatusText}>{getGoalStatusLabel(item.status || 'active')}</Text>
        </View>
      </View>
      <Text style={styles.goalType}>{getGoalTypeLabel(item.type)}</Text>
      <Text style={styles.goalTargetValue}>Meta: {formatMoney(item.targetValue)}</Text>
      <Text style={styles.goalContribution}>Contribuição mensal: {formatMoney(item.monthlyContribution)}</Text>
      <View style={styles.goalFooter}>
        <Text style={styles.goalImportance}>Prioridade: {getGoalImportanceLabel(item.importance)}</Text>
        <Text style={styles.goalParcela}>{item.numParcela} parcelas</Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>Nenhuma meta encontrada</Text>
      <Text style={styles.emptyStateSubtext}>
        Crie sua primeira meta para começar a planejar suas finanças
      </Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorState}>
      <Text style={styles.errorText}>{goalViewModel.error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
        <Text style={styles.retryButtonText}>Tentar novamente</Text>
      </TouchableOpacity>
    </View>
  );

  const renderLoadingState = () => (
    <View style={styles.loadingState}>
      <ActivityIndicator size="large" color="#007AFF" testID="loading-indicator" />
      <Text style={styles.loadingText}>Carregando metas...</Text>
    </View>
  );

  if (goalViewModel.loading && goalViewModel.goals.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Metas</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={handleCreateGoal}
            accessibilityLabel="Criar nova meta"
            accessibilityHint="Toque para criar uma nova meta"
          >
            <Text style={styles.createButtonText}>Nova Meta</Text>
          </TouchableOpacity>
        </View>
        {renderLoadingState()}
      </View>
    );
  }

  if (goalViewModel.error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Metas</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={handleCreateGoal}
            accessibilityLabel="Criar nova meta"
            accessibilityHint="Toque para criar uma nova meta"
          >
            <Text style={styles.createButtonText}>Nova Meta</Text>
          </TouchableOpacity>
        </View>
        {renderErrorState()}
      </View>
    );
  }

  return (
    <View style={styles.container} testID="goal-screen">
      <View style={styles.header}>
        <Text style={styles.title}>Metas</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateGoal}
          accessibilityLabel="Criar nova meta"
          accessibilityHint="Toque para criar uma nova meta"
        >
          <Text style={styles.createButtonText}>Nova Meta</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={goalViewModel.goals}
        renderItem={renderGoalItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        testID="goal-list"
        accessibilityLabel="Lista de metas"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E5E9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  createButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  goalItem: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalDescription: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    flex: 1,
  },
  goalStatusBadge: {
    backgroundColor: '#34C759',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  goalStatusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  goalType: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  goalTargetValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  goalContribution: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalImportance: {
    fontSize: 12,
    color: '#8E8E93',
  },
  goalParcela: {
    fontSize: 12,
    color: '#8E8E93',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
  },
  errorState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 16,
  },
});
