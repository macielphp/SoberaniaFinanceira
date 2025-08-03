import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Account } from '../../database/accounts';
import { AccountService, AccountBalance } from '../../services/AccountService';
import { colors, spacing, typography } from '../../styles/themes';
import AccountCard from '../AccountCard/AccountCard';

interface AccountsDashboardProps {
  accounts: Account[];
  operations: any[];
  onViewAllAccounts?: () => void;
  onAddAccount?: () => void;
  maxCards?: number;
  navigation?: any;
}

export const AccountsDashboard: React.FC<AccountsDashboardProps> = ({
  accounts,
  operations,
  onViewAllAccounts,
  onAddAccount,
  maxCards = 3,
  navigation,
}) => {
  const accountsBalance = AccountService.getAccountsBalance(accounts, operations);
  const totalBalance = AccountService.getTotalBalance(accounts, operations);
  
  // Mostrar apenas contas próprias e limitar ao número máximo
  const ownAccounts = accounts.filter(account => account.type === 'propria').slice(0, maxCards);
  const totalOwnAccounts = accounts.filter(account => account.type === 'propria').length;
  const hasMoreAccounts = totalOwnAccounts > maxCards;

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