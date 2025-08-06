// app\src\components\OperationCard\OperationCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Operation as CleanOperation } from '../../clean-architecture/domain/entities/Operation';
import { Account as CleanAccount } from '../../clean-architecture/domain/entities/Account';
import { Category as CleanCategory } from '../../clean-architecture/domain/entities/Category';
import GlobalStyles from '../../styles/Styles';

interface OperationCardProps {
  operation: CleanOperation;
  account?: CleanAccount | null;
  category?: CleanCategory | null;
  onEdit?: (operation: CleanOperation) => void;
  onDelete?: (operation: CleanOperation) => void;
  onPress?: (operation: CleanOperation) => void;
  onToggleStatus?: (operation: CleanOperation) => void;
  loading?: boolean;
}

const OperationCard: React.FC<OperationCardProps> = ({
  operation,
  account,
  category,
  onEdit,
  onDelete,
  onPress,
  onToggleStatus,
  loading = false,
}) => {
  // Funções utilitárias para formatação
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR');
  };

  const getStatusText = (state: string, nature: string) => {
    if (state === 'pago' || state === 'recebido') {
      return nature === 'receita' ? 'Recebido' : 'Pago';
    }
    return nature === 'receita' ? 'A Receber' : 'Pendente';
  };

  const getStatusColor = (state: string, nature: string) => {
    if (state === 'pago' || state === 'recebido') {
      return '#4CAF50'; // Verde
    }
    return '#FF9800'; // Laranja
  };

  const handleEdit = () => {
    if (!loading && onEdit) {
      onEdit(operation);
    }
  };

  const handleDelete = () => {
    if (!loading && onDelete) {
      Alert.alert(
        'Confirmar exclusão',
        `Deseja realmente excluir a operação "${operation.details || 'Operação'}?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Excluir', style: 'destructive', onPress: () => onDelete(operation) }
        ]
      );
    }
  };

  const handlePress = () => {
    if (!loading && onPress) {
      onPress(operation);
    }
  };

  const handleToggleStatus = () => {
    if (!loading && onToggleStatus) {
      onToggleStatus(operation);
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.operationCard, loading && styles.disabledCard]}
      onPress={handlePress}
      disabled={loading}
      testID={`operation-card-${operation.id}`}
    >
      <View style={styles.operationHeader}>
        <View style={styles.operationInfo}>
          <View style={styles.categorySection}>
            {category && (
              <View 
                style={[styles.categoryIndicator, { backgroundColor: '#FF6B6B' }]}
                testID={`category-indicator-${operation.id}`}
              />
            )}
            <Text style={styles.operationCategory}>
              {category?.name || 'Sem categoria'}
            </Text>
            <Ionicons 
              name="pricetag" 
              size={16} 
              color="#FF6B6B"
              testID={`category-icon-${operation.id}`}
            />
          </View>
          <Text style={styles.operationDate}>{formatDate(operation.date)}</Text>
        </View>
        <View style={styles.operationActions}>
          <Text style={[
            GlobalStyles.operationValue,
            operation.nature === 'receita' ? styles.positive : styles.negative
          ]}>
            {operation.nature === 'receita' ? '+' : '-'}{formatCurrency(operation.value.value)}
          </Text>
        </View>
      </View>
      
      <View style={styles.operationDetails}>
        <Text style={styles.operationDescription}>{operation.details || 'Sem descrição'}</Text>
        <Text style={styles.operationAccount}>
          {account?.name || 'Conta não encontrada'}
        </Text>
        <View style={styles.statusSection}>
          <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(operation.state, operation.nature) }]} />
          <Text style={styles.operationState}>
            {getStatusText(operation.state, operation.nature)}
          </Text>
          {operation.receipt && (
            <Ionicons 
              name="receipt" 
              size={16} 
              color="#2196F3"
              testID={`receipt-icon-${operation.id}`}
            />
          )}
        </View>
      </View>

      {!loading && (
        <View style={styles.cardActions}>
          {onToggleStatus && (
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleToggleStatus}
              testID={`toggle-status-${operation.id}`}
            >
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              <Text style={styles.actionButtonText}>Marcar</Text>
            </TouchableOpacity>
          )}
          
          {onEdit && (
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleEdit}
              testID={`edit-operation-${operation.id}`}
            >
              <Ionicons name="pencil" size={16} color="#2196F3" />
              <Text style={styles.actionButtonText}>Editar</Text>
            </TouchableOpacity>
          )}
          
          {onDelete && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.deleteActionButton]}
              onPress={handleDelete}
              testID={`delete-operation-${operation.id}`}
            >
              <Ionicons name="trash" size={16} color="#F44336" />
              <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Excluir</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {loading && (
        <View style={styles.loadingOverlay}>
          <Text style={styles.loadingText}>Processando...</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  operationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledCard: {
    opacity: 0.6,
  },
  operationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  operationInfo: {
    flex: 1,
  },
  categorySection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  operationCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  operationDate: {
    fontSize: 14,
    color: '#666',
  },
  operationActions: {
    alignItems: 'flex-end',
  },
  positive: {
    color: '#4CAF50',
  },
  negative: {
    color: '#F44336',
  },
  operationDetails: {
    marginBottom: 12,
  },
  operationDescription: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  operationAccount: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  statusSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  operationState: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#f5f5f5',
  },
  deleteActionButton: {
    backgroundColor: '#ffebee',
  },
  actionButtonText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  deleteButtonText: {
    color: '#F44336',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
  },
});

export default OperationCard;