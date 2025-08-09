import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Account, AccountType } from '../../domain/entities/Account';

interface AccountCardProps {
  account: Account;
  onEdit: (account: Account) => void;
  onDelete: (accountId: string) => void;
  onViewTransactions: (accountId: string) => void;
  disabled?: boolean;
}

export const AccountCard: React.FC<AccountCardProps> = ({
  account,
  onEdit,
  onDelete,
  onViewTransactions,
  disabled = false
}) => {
  const formatAccountType = (type: AccountType): string => {
    const typeMap: Record<AccountType, string> = {
      'corrente': 'Corrente',
      'poupanca': 'Poupança',
      'investimento': 'Investimento',
      'cartao_credito': 'Cartão de Crédito',
      'dinheiro': 'Dinheiro'
    };
    return typeMap[type];
  };

  const getBalanceColor = (balance: number): string => {
    if (balance > 0) return '#2E7D32'; // green
    if (balance < 0) return '#D32F2F'; // red
    return '#757575'; // gray/grey
  };

  const handleEdit = () => {
    if (!disabled) {
      onEdit(account);
    }
  };

  const handleDelete = () => {
    if (!disabled) {
      onDelete(account.id);
    }
  };

  const handleViewTransactions = () => {
    if (!disabled) {
      onViewTransactions(account.id);
    }
  };

  return (
    <View 
      style={[styles.container, disabled && styles.disabled]}
      testID={`account-card-${account.id}`}
      accessibilityLabel={`Cartão da conta ${account.name}`}
    >
      <View style={styles.header}>
        <Text style={styles.accountName}>{account.name}</Text>
        <Text style={styles.accountType}>{formatAccountType(account.type)}</Text>
      </View>
      
      <View style={styles.balanceContainer}>
        <Text 
          style={[styles.balance, { color: getBalanceColor(account.balance.value) }]}
          testID={`account-balance-${account.id}`}
        >
          {account.balance.format()}
        </Text>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton, disabled && styles.disabledButton]}
          onPress={handleEdit}
          testID={`account-edit-button-${account.id}`}
          accessibilityLabel="Editar conta"
          disabled={disabled}
        >
          <Text style={[styles.actionButtonText, styles.editButtonText]}>Editar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton, disabled && styles.disabledButton]}
          onPress={handleDelete}
          testID={`account-delete-button-${account.id}`}
          accessibilityLabel="Excluir conta"
          disabled={disabled}
        >
          <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Excluir</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.viewButton, disabled && styles.disabledButton]}
          onPress={handleViewTransactions}
          testID={`account-transactions-button-${account.id}`}
          accessibilityLabel="Ver transações da conta"
          disabled={disabled}
        >
          <Text style={[styles.actionButtonText, styles.viewButtonText]}>Ver Transações</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  disabled: {
    opacity: 0.6,
  },
  header: {
    marginBottom: 12,
  },
  accountName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  accountType: {
    fontSize: 14,
    color: '#666666',
  },
  balanceContainer: {
    marginBottom: 16,
  },
  balance: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  editButton: {
    backgroundColor: '#E3F2FD',
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  deleteButton: {
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: '#F44336',
  },
  viewButton: {
    backgroundColor: '#F3E5F5',
    borderWidth: 1,
    borderColor: '#9C27B0',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  editButtonText: {
    color: '#2196F3',
  },
  deleteButtonText: {
    color: '#F44336',
  },
  viewButtonText: {
    color: '#9C27B0',
  },
});
