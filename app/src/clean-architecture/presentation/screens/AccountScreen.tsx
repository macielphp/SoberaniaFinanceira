// Screen: AccountScreen
// Tela principal para gerenciamento de contas
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
import { AccountViewModel } from '../view-models/AccountViewModel';
import { Account } from '../../domain/entities/Account';
import { Money } from '../../shared/utils/Money';

interface AccountScreenProps {
  userId?: string;
  onNavigateToCreate?: () => void;
  onNavigateToEdit?: (account: Account) => void;
  onNavigateToDetail?: (account: Account) => void;
}

export const AccountScreen: React.FC<AccountScreenProps> = ({
  userId = 'user1',
  onNavigateToCreate,
  onNavigateToEdit,
  onNavigateToDetail,
}) => {
  const [accountViewModel] = useState(() => new AccountViewModel({} as any));

  // Load accounts on mount
  useEffect(() => {
    loadAccounts();
    
    // Cleanup on unmount
    return () => {
      accountViewModel.clearError();
    };
  }, []);

  const loadAccounts = useCallback(async () => {
    try {
      await accountViewModel.getAllAccounts();
    } catch (error) {
      console.error('Erro ao carregar contas:', error);
    }
  }, [accountViewModel]);


  const handleCreateAccount = useCallback(() => {
    onNavigateToCreate?.();
  }, [onNavigateToCreate]);

  const handleEditAccount = useCallback((account: Account) => {
    onNavigateToEdit?.(account);
  }, [onNavigateToEdit]);

  const handleRetry = useCallback(() => {
    accountViewModel.clearError();
    loadAccounts();
  }, [accountViewModel, loadAccounts]);

  const formatMoney = (money: Money): string => {
    return `R$ ${money.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  const getAccountTypeLabel = (type: string): string => {
    const typeLabels: { [key: string]: string } = {
      'corrente': 'Conta Corrente',
      'poupanca': 'Poupança',
      'investimento': 'Investimento',
      'cartao_credito': 'Cartão de Crédito',
      'dinheiro': 'Dinheiro',
    };
    return typeLabels[type] || type;
  };

  const renderAccountItem = ({ item }: { item: Account }) => (
    <TouchableOpacity
      style={styles.accountItem}
      onPress={() => handleEditAccount(item)}
      accessibilityLabel={`Conta ${item.name}`}
      accessibilityHint="Toque para editar esta conta"
    >
      <View style={styles.accountHeader}>
        <Text style={styles.accountName}>{item.name}</Text>
        {item.isDefault && (
          <Text style={styles.defaultBadge}>Padrão</Text>
        )}
      </View>
      <Text style={styles.accountType}>{getAccountTypeLabel(item.type)}</Text>
      <Text style={styles.accountBalance}>{formatMoney(item.balance)}</Text>
      {item.description && (
        <Text style={styles.accountDescription}>{item.description}</Text>
      )}
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>Nenhuma conta encontrada</Text>
      <Text style={styles.emptyStateSubtext}>
        Crie sua primeira conta para começar a gerenciar suas finanças
      </Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorState}>
      <Text style={styles.errorText}>{accountViewModel.error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
        <Text style={styles.retryButtonText}>Tentar novamente</Text>
      </TouchableOpacity>
    </View>
  );

  const renderLoadingState = () => (
    <View style={styles.loadingState}>
      <ActivityIndicator size="large" color="#007AFF" testID="loading-indicator" />
      <Text style={styles.loadingText}>Carregando contas...</Text>
    </View>
  );

  if (accountViewModel.loading && accountViewModel.accounts.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Contas</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={handleCreateAccount}
            accessibilityLabel="Criar nova conta"
            accessibilityHint="Toque para criar uma nova conta"
          >
            <Text style={styles.createButtonText}>Nova Conta</Text>
          </TouchableOpacity>
        </View>
        {renderLoadingState()}
      </View>
    );
  }

  if (accountViewModel.error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Contas</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={handleCreateAccount}
            accessibilityLabel="Criar nova conta"
            accessibilityHint="Toque para criar uma nova conta"
          >
            <Text style={styles.createButtonText}>Nova Conta</Text>
          </TouchableOpacity>
        </View>
        {renderErrorState()}
      </View>
    );
  }

  return (
    <View style={styles.container} testID="account-screen">
      <View style={styles.header}>
        <Text style={styles.title}>Contas</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateAccount}
          accessibilityLabel="Criar nova conta"
          accessibilityHint="Toque para criar uma nova conta"
        >
          <Text style={styles.createButtonText}>Nova Conta</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={accountViewModel.accounts}
        renderItem={renderAccountItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        testID="account-list"
        accessibilityLabel="Lista de contas"
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
  accountItem: {
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
  accountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  accountName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    flex: 1,
  },
  defaultBadge: {
    backgroundColor: '#34C759',
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  accountType: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  accountBalance: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  accountDescription: {
    fontSize: 14,
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
