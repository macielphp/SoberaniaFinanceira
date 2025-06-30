// app\src\components\OperationCard\OperationCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Operation {
    id: string;
    category: string;
    date: string;
    nature: 'receita' | 'despesa';
    value: number;
    sourceAccount: string;
    destinationAccount: string;
    state: string;
    details?: string;
}

interface OperationCardProps {
    operation: Operation;
    onEdit: (operationId: string) => void;
    onDelete: (operationId: string, description: string) => void;
}

const OperationCard: React.FC<OperationCardProps> = ({
    operation,
    onEdit,
    onDelete
}) => {
    // Funções utilitárias para formatação movidas para dentro do componente
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR')
    };
    const handleEdit = () => {
        onEdit(operation.id);
    };
    const handleDelete = () => {
        onDelete(operation.id, operation.category);
    };

    return (
    <View style={styles.operationCard}>
        <View style={styles.operationHeader}>
            <View style={styles.operationInfo}>
                <Text style={styles.operationCategory}>{operation.category}</Text>
                <Text style={styles.operationDate}>{formatDate(operation.date)}</Text>
            </View>
            <View style={styles.operationActions}>
            <Text style={[
                styles.operationValue,
                operation.nature === 'receita' ? styles.positive : styles.negative
            ]}>
                {operation.nature === 'receita' ? '+' : '-'}{formatCurrency(operation.value)}
            </Text>
            </View>
        </View>
      
      <View style={styles.operationDetails}>
        <Text style={styles.operationAccount}>
          {operation.sourceAccount} → {operation.destinationAccount}
        </Text>
        <Text style={styles.operationState}>
          Status: {operation.state}
        </Text>
        {operation.details && (
        <Text style={styles.operationDescription}>
            {operation.details}
        </Text>
        )}
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handleEdit}
        >
            <Ionicons name="pencil" size={16} color="#2196F3" />
            <Text style={styles.actionButtonText}>Editar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteActionButton]}
          onPress={handleDelete}
        >
            <Ionicons name="trash" size={16} color="#F44336" />
            <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </View>
    )
}

export default OperationCard;

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
    operationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    operationInfo: {
        flex: 1,
    },
    operationCategory: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    operationDate: {
        fontSize: 14,
        color: '#666',
    },
    operationActions: {
        alignItems: 'flex-end',
    },
    operationValue: {
        fontSize: 18,
        fontWeight: 'bold',
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
    operationAccount: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    operationState: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    operationDescription: {
        fontSize: 14,
        color: '#666',
        fontStyle: 'italic',
    },
    cardActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 12,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        marginLeft: 8,
    },
    actionButtonText: {
        fontSize: 14,
        color: '#2196F3',
        marginLeft: 4,
    },
    deleteActionButton: {
        backgroundColor: '#fff5f5',
    },
    deleteButtonText: {
        color: '#F44336',
    },


})