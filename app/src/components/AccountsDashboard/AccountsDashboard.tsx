import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Account as CleanAccount, AccountType } from '../../clean-architecture/domain/entities/Account';
import { AccountService, AccountBalance } from '../../services/AccountService';
import { colors, spacing, typography } from '../../styles/themes';
import AccountCard from '../AccountCard/AccountCard';
import { useAccountViewModelAdapter } from '../../clean-architecture/presentation/ui-adapters/useAccountViewModelAdapter';

interface AccountsDashboardProps {
  operations?: any[];
  maxCards?: number;
  navigation?: any;
}

// Helper function to check if account is "propria" (own account)
const isPropriaAccount = (type: AccountType): boolean => {
  return type === 'corrente' || type === 'poupanca' || type === 'investimento' || type === 'dinheiro';
};

// Helper function to convert CleanAccount to old Account type for compatibility
const convertToOldAccount = (cleanAccount: CleanAccount) => {
  return {
    id: cleanAccount.id,
    name: cleanAccount.name,
    type: isPropriaAccount(cleanAccount.type) ? 'propria' : 'externa',
    saldo: isPropriaAccount(cleanAccount.type) ? cleanAccount.balance.value : undefined,
    isDefault: cleanAccount.isDefault,
    createdAt: cleanAccount.createdAt.toISOString(),
  };
};

export const AccountsDashboard: React.FC<AccountsDashboardProps> = ({
  operations = [],
  maxCards = 3,
  navigation,
}) => {
  const { accounts, loading, error } = useAccountViewModelAdapter();
  
  // Convert accounts for compatibility with AccountService
  const oldAccounts = accounts.map(convertToOldAccount);
  const accountsBalance = AccountService.getAccountsBalance(oldAccounts, operations);
  const totalBalance = AccountService.getTotalBalance(oldAccounts, operations);
  
  // Mostrar apenas contas próprias e limitar ao número máximo
  const ownAccounts = accounts.filter(account => isPropriaAccount(account.type)).slice(0, maxCards);
  const totalOwnAccounts = accounts.filter(account => isPropriaAccount(account.type)).length;
  const hasMoreAccounts = totalOwnAccounts > maxCards;

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Minhas Contas</Text>
        </View>
        <View style={styles.loadingState}>
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Minhas Contas</Text>
        </View>
        <View style={styles.errorState}>
          <Ionicons name="alert-circle" size={48} color={colors.error[500]} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </View>
    );
  }

  if (accounts.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Minhas Contas</Text>
          {navigation && (
            <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('Register', { screen: 'accounts' })}>
              <Ionicons name="add" size={20} color={colors.text.inverse} />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="card-outline" size={48} color={colors.gray[400]} />
          <Text style={styles.emptyText}>Nenhuma conta cadastrada</Text>
          {navigation && (
            <TouchableOpacity style={styles.addFirstButton} onPress={() => navigation.navigate('Register', { screen: 'accounts' })}>
              <Text style={styles.addFirstButtonText}>Adicionar Conta</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <Text style={styles.title}>Minhas Contas</Text>
          <Text style={styles.totalBalance}>
            Total: {AccountService.formatCurrency(totalBalance)}
          </Text>
        </View>
        <View style={styles.headerActions}>
          {navigation && (
            <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('Register', { screen: 'accounts' })}>
              <Ionicons name="add" size={20} color={colors.text.inverse} />
            </TouchableOpacity>
          )}
          {navigation && totalOwnAccounts > 0 && (
            <TouchableOpacity style={styles.viewAllButton} onPress={() => navigation.navigate('Accounts')}>
              <Text style={styles.viewAllText}>Ver Todas</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cardsContainer}
        testID="accounts-dashboard-scroll"
      >
        {ownAccounts.map((account) => {
          const balance = accountsBalance.find(b => b.accountId === account.id);
          return (
            <View key={account.id} style={styles.cardWrapper}>
              <AccountCard
                account={account}
                currentBalance={balance?.currentBalance || 0}
                monthlyVariation={balance?.monthlyVariation || 0}
                showActions={false}
              />
            </View>
          );
        })}
      </ScrollView>

      {hasMoreAccounts && navigation && (
        <TouchableOpacity style={styles.viewAllContainer} onPress={() => navigation.navigate('Accounts')}>
          <Text style={styles.viewAllText}>Ver todas as {totalOwnAccounts} contas próprias</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.primary[500]} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.default,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  titleSection: {
    flex: 1,
  },
  title: {
    fontSize: typography.h3.fontSize,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  totalBalance: {
    fontSize: typography.body2.fontSize,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  addButton: {
    backgroundColor: colors.primary[500],
    borderRadius: 8,
    padding: spacing.sm,
  },
  viewAllButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  viewAllText: {
    fontSize: typography.body2.fontSize,
    color: colors.primary[500],
    fontWeight: '600',
  },
  cardsContainer: {
    paddingRight: spacing.md,
  },
  cardWrapper: {
    width: 280,
    marginRight: spacing.sm,
  },
  loadingState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  loadingText: {
    fontSize: typography.body1.fontSize,
    color: colors.text.secondary,
  },
  errorState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  errorText: {
    fontSize: typography.body1.fontSize,
    color: colors.error[500],
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: {
    fontSize: typography.body1.fontSize,
    color: colors.text.secondary,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  addFirstButton: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  addFirstButtonText: {
    color: colors.text.inverse,
    fontSize: typography.body1.fontSize,
    fontWeight: '600',
  },
  viewAllContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    marginTop: spacing.md,
  },
});

export default AccountsDashboard; 