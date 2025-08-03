import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  RefreshControl,
  Alert,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Account } from '../../database/accounts';
import { AccountService, AccountBalance } from '../../services/AccountService';
import { colors, spacing, typography } from '../../styles/themes';
import AccountCard from '../../components/AccountCard/AccountCard';
import Layout from '../../components/Layout/Layout';
import { useFinance } from '../../contexts/FinanceContext';
import AppModal from '../../components/AppModal/AppModal';

type SortOption = 'name' | 'balance' | 'type' | 'lastTransaction';
type FilterOption = 'all' | 'propria' | 'positive' | 'negative';

interface AccountsProps {
  navigation?: any;
}

const Accounts: React.FC<AccountsProps> = ({ navigation }) => {
  const { accounts, operations, createAccount, editAccount } = useFinance();
  
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [showAccountDetails, setShowAccountDetails] = useState(false);

  const accountsBalance = AccountService.getAccountsBalance(accounts, operations);
  // Calcular saldo total apenas das contas próprias
  const ownAccounts = accounts.filter(account => account.type === 'propria');
  const totalBalance = AccountService.getTotalBalance(ownAccounts, operations);

  // Função para ordenar contas
  const getSortedAccounts = useCallback(() => {
    // Filtrar apenas contas próprias por padrão
    let sorted = accounts.filter(account => account.type === 'propria');

    // Aplicar filtros adicionais
    switch (filterBy) {
      case 'propria':
        // Já filtrado acima, manter todas as próprias
        break;
      case 'positive':
        sorted = sorted.filter(account => {
          const balance = accountsBalance.find(b => b.accountId === account.id);
          return balance && balance.currentBalance > 0;
        });
        break;
      case 'negative':
        sorted = sorted.filter(account => {
          const balance = accountsBalance.find(b => b.accountId === account.id);
          return balance && balance.currentBalance < 0;
        });
        break;
    }

    // Aplicar ordenação
    switch (sortBy) {
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'balance':
        sorted.sort((a, b) => {
          const balanceA = accountsBalance.find(bal => bal.accountId === a.id)?.currentBalance || 0;
          const balanceB = accountsBalance.find(bal => bal.accountId === b.id)?.currentBalance || 0;
          return balanceB - balanceA; // Maior saldo primeiro
        });
        break;
      case 'type':
        sorted.sort((a, b) => a.type.localeCompare(b.type));
        break;
      case 'lastTransaction':
        sorted.sort((a, b) => {
          const lastA = accountsBalance.find(bal => bal.accountId === a.id)?.lastTransaction || '';
          const lastB = accountsBalance.find(bal => bal.accountId === b.id)?.lastTransaction || '';
          return new Date(lastB).getTime() - new Date(lastA).getTime();
        });
        break;
    }

    return sorted;
  }, [accounts, accountsBalance, sortBy, filterBy]);

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simular atualização
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  // Swipe actions
  const handleEditAccount = (account: Account) => {
    // Navegar para edição na tela Register
    console.log('Editar conta:', account.name);
    console.log('Navegando para Register com params:', { editingAccount: account });
    navigation?.navigate('Register', { 
      screen: 'accounts',
      params: { editingAccount: account }
    });
  };

  // Long press menu
  const handleLongPress = (account: Account) => {
    Alert.alert(
      account.name,
      'Escolha uma ação:',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Ver Detalhes', onPress: () => setSelectedAccount(account) },
        { text: 'Editar', onPress: () => handleEditAccount(account) },
        { text: 'Transferir', onPress: () => console.log('Transferir:', account.name) }
      ]
    );
  };

  // Quick transfer
  const handleQuickTransfer = (fromAccount: Account) => {
    const ownAccounts = accounts.filter(acc => acc.type === 'propria' && acc.id !== fromAccount.id);
    
    if (ownAccounts.length === 0) {
      Alert.alert('Aviso', 'Não há outras contas próprias para transferir');
      return;
    }

    Alert.alert(
      'Transferência Rápida',
      'Escolha a conta de destino:',
      [
        { text: 'Cancelar', style: 'cancel' },
        ...ownAccounts.map(account => ({
          text: account.name,
          onPress: () => {
            // Navegar para tela de transferência
            console.log(`Transferir de ${fromAccount.name} para ${account.name}`);
          }
        }))
      ]
    );
  };

  const sortedAccounts = getSortedAccounts();

  return (
    <Layout>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Minhas Contas Próprias</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.filterButton}
              onPress={() => setShowFilters(true)}
            >
              <Ionicons name="filter" size={20} color={colors.primary[500]} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => navigation?.navigate('Register', { screen: 'accounts' })}
            >
              <Ionicons name="add" size={24} color={colors.text.inverse} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Total Balance */}
        <View style={styles.totalBalanceCard}>
          <Text style={styles.totalBalanceLabel}>Saldo Total</Text>
          <Text style={[styles.totalBalanceValue, { color: totalBalance >= 0 ? colors.success[600] : colors.error[600] }]}>
            {AccountService.formatCurrency(totalBalance)}
          </Text>
          <Text style={styles.totalBalanceSubtitle}>
            {accounts.filter(a => a.type === 'propria').length} contas próprias
          </Text>
        </View>

        {/* Accounts List */}
        <ScrollView 
          style={styles.accountsList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {sortedAccounts.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="card-outline" size={64} color={colors.gray[400]} />
              <Text style={styles.emptyText}>
                {filterBy === 'all' ? 'Nenhuma conta própria encontrada' : 'Nenhuma conta atende aos filtros'}
              </Text>
            </View>
          ) : (
            sortedAccounts.map((account) => {
              const balance = accountsBalance.find(b => b.accountId === account.id);
              
              return (
                <View key={account.id} style={styles.accountItemContainer}>
                  <TouchableOpacity
                    onPress={() => setSelectedAccount(account)}
                    onLongPress={() => handleLongPress(account)}
                    activeOpacity={0.7}
                    style={styles.accountCardContainer}
                  >
                    <AccountCard
                      account={account}
                      currentBalance={balance?.currentBalance || 0}
                      monthlyVariation={balance?.monthlyVariation || 0}
                      showActions={false}
                    />
                  </TouchableOpacity>
                  
                  {/* Botão de editar flutuante */}
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => handleEditAccount(account)}
                  >
                    <Ionicons name="pencil" size={16} color={colors.primary[500]} />
                  </TouchableOpacity>
                </View>
              );
            })
          )}
        </ScrollView>

        {/* Filters Modal */}
        <AppModal
          visible={showFilters}
          onRequestClose={() => setShowFilters(false)}
          title="Filtros e Ordenação"
        >
          <View style={styles.filtersContent}>
            <Text style={styles.filterSectionTitle}>Ordenar por:</Text>
            <View style={styles.filterOptions}>
              {[
                { key: 'name', label: 'Nome', icon: 'text' },
                { key: 'balance', label: 'Saldo', icon: 'cash' },
                { key: 'type', label: 'Tipo', icon: 'card' },
                { key: 'lastTransaction', label: 'Última Transação', icon: 'time' }
              ].map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.filterOption,
                    sortBy === option.key && styles.filterOptionSelected
                  ]}
                  onPress={() => setSortBy(option.key as SortOption)}
                >
                  <Ionicons 
                    name={option.icon as any} 
                    size={16} 
                    color={sortBy === option.key ? colors.primary[500] : colors.text.secondary} 
                  />
                  <Text style={[
                    styles.filterOptionText,
                    sortBy === option.key && styles.filterOptionTextSelected
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.filterSectionTitle}>Filtrar por:</Text>
            <View style={styles.filterOptions}>
              {[
                { key: 'all', label: 'Todas', icon: 'apps' },
                { key: 'propria', label: 'Próprias', icon: 'business' },
                { key: 'positive', label: 'Saldo Positivo', icon: 'trending-up' },
                { key: 'negative', label: 'Saldo Negativo', icon: 'trending-down' }
              ].map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.filterOption,
                    filterBy === option.key && styles.filterOptionSelected
                  ]}
                  onPress={() => setFilterBy(option.key as FilterOption)}
                >
                  <Ionicons 
                    name={option.icon as any} 
                    size={16} 
                    color={filterBy === option.key ? colors.primary[500] : colors.text.secondary} 
                  />
                  <Text style={[
                    styles.filterOptionText,
                    filterBy === option.key && styles.filterOptionTextSelected
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </AppModal>

        {/* Account Details Modal */}
        <Modal
          visible={showAccountDetails}
          transparent
          animationType="slide"
          onRequestClose={() => setShowAccountDetails(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {selectedAccount && (
                <View>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>{selectedAccount.name}</Text>
                    <TouchableOpacity onPress={() => setShowAccountDetails(false)}>
                      <Ionicons name="close" size={24} color={colors.text.primary} />
                    </TouchableOpacity>
                  </View>
                  
                  <ScrollView style={styles.modalBody}>
                    <AccountCard
                      account={selectedAccount}
                      currentBalance={accountsBalance.find(b => b.accountId === selectedAccount.id)?.currentBalance || 0}
                      monthlyVariation={accountsBalance.find(b => b.accountId === selectedAccount.id)?.monthlyVariation || 0}
                      showActions={true}
                      onEdit={() => {
                        setShowAccountDetails(false);
                        handleEditAccount(selectedAccount);
                      }}
                    />
                    
                    {/* Detalhes adicionais */}
                    <View style={styles.accountDetails}>
                      <Text style={styles.detailsTitle}>Informações da Conta</Text>
                      
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Tipo:</Text>
                        <Text style={styles.detailValue}>
                          {selectedAccount.type === 'propria' ? 'Própria' : 'Externa'}
                        </Text>
                      </View>
                      
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Status:</Text>
                        <Text style={styles.detailValue}>
                          {selectedAccount.isDefault ? 'Conta Padrão' : 'Conta Regular'}
                        </Text>
                      </View>
                      
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Criada em:</Text>
                        <Text style={styles.detailValue}>
                          {new Date(selectedAccount.createdAt).toLocaleDateString('pt-BR')}
                        </Text>
                      </View>
                      
                      {selectedAccount.type === 'propria' && (
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Saldo Inicial:</Text>
                          <Text style={styles.detailValue}>
                            {AccountService.formatCurrency(selectedAccount.saldo || 0)}
                          </Text>
                        </View>
                      )}
                    </View>
                    
                    {/* Ações rápidas */}
                    <View style={styles.quickActions}>
                      <Text style={styles.detailsTitle}>Ações Rápidas</Text>
                      
                      <TouchableOpacity 
                        style={styles.quickActionButton}
                        onPress={() => {
                          setShowAccountDetails(false);
                          handleQuickTransfer(selectedAccount);
                        }}
                      >
                        <Ionicons name="swap-horizontal" size={20} color={colors.primary[500]} />
                        <Text style={styles.quickActionText}>Transferir</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={styles.quickActionButton}
                        onPress={() => {
                          setShowAccountDetails(false);
                          console.log('Ver histórico:', selectedAccount.name);
                        }}
                      >
                        <Ionicons name="time" size={20} color={colors.secondary[500]} />
                        <Text style={styles.quickActionText}>Ver Histórico</Text>
                      </TouchableOpacity>
                    </View>
                  </ScrollView>
                </View>
              )}
            </View>
          </View>
        </Modal>
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  title: {
    fontSize: typography.h2.fontSize,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  filterButton: {
    padding: spacing.sm,
    borderRadius: 8,
    backgroundColor: colors.gray[100],
  },
  addButton: {
    backgroundColor: colors.primary[500],
    borderRadius: 8,
    padding: spacing.sm,
  },
  totalBalanceCard: {
    backgroundColor: colors.background.default,
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  totalBalanceLabel: {
    fontSize: typography.body1.fontSize,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  totalBalanceValue: {
    fontSize: typography.h1.fontSize,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  totalBalanceSubtitle: {
    fontSize: typography.caption.fontSize,
    color: colors.text.secondary,
  },
  accountsList: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: {
    fontSize: typography.body1.fontSize,
    color: colors.text.secondary,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  accountItemContainer: {
    position: 'relative',
    marginBottom: spacing.sm,
  },
  accountCardContainer: {
    flex: 1,
  },
  editButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.background.default,
    borderRadius: 20,
    padding: spacing.xs,
    shadowColor: colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  filtersContent: {
    padding: spacing.lg,
  },
  filterSectionTitle: {
    fontSize: typography.h4.fontSize,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
    gap: spacing.xs,
  },
  filterOptionSelected: {
    backgroundColor: colors.primary[100],
  },
  filterOptionText: {
    fontSize: typography.body2.fontSize,
    color: colors.text.secondary,
  },
  filterOptionTextSelected: {
    color: colors.primary[600],
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background.default,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  modalTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  modalBody: {
    padding: spacing.lg,
  },
  accountDetails: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.gray[50],
    borderRadius: 12,
  },
  detailsTitle: {
    fontSize: typography.h4.fontSize,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  detailLabel: {
    fontSize: typography.body2.fontSize,
    color: colors.text.secondary,
  },
  detailValue: {
    fontSize: typography.body2.fontSize,
    color: colors.text.primary,
    fontWeight: '500',
  },
  quickActions: {
    marginTop: spacing.lg,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.gray[50],
    borderRadius: 8,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  quickActionText: {
    fontSize: typography.body1.fontSize,
    color: colors.text.primary,
    fontWeight: '500',
  },
});

export default Accounts; 