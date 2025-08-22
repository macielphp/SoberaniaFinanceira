import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAccountViewModelAdapter } from '../ui-adapters/useAccountViewModelAdapter';
import { useOperationViewModelAdapter } from '../ui-adapters/useOperationViewModelAdapter';
import { useAlertViewModelAdapter } from '../ui-adapters/useAlertViewModelAdapter';

interface HomeScreenProps {
  navigation?: any;
}

// Mock de dados para AlertsPanel (fallback quando não há alertas reais)
const mockAlerts = [
  {
    id: '1',
    type: 'low_balance' as const,
    severity: 'warning' as const,
    title: 'Saldo baixo',
    message: 'Conta Corrente está com saldo baixo',
    accountId: '1'
  }
];

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  // Usar adapters reais da Clean Architecture
  const { 
    accounts, 
    loading: accountsLoading, 
    error: accountsError, 
    loadAccounts 
  } = useAccountViewModelAdapter();
  
  const { 
    operations, 
    loading: operationsLoading, 
    error: operationsError, 
    loadOperations 
  } = useOperationViewModelAdapter();

  const {
    alerts,
    loading: alertsLoading,
    error: alertsError,
    dismissAlert,
    activeAlerts
  } = useAlertViewModelAdapter();

  // Carregar dados quando o componente montar
  useEffect(() => {
    console.log('🏠 HomeScreen: Carregando dados...');
    loadAccounts();
    loadOperations();
    // Alerts são carregados automaticamente pelo adapter
  }, []);

  // Usar dados reais dos adapters, com fallback para mock se vazio
  const displayAccounts = accounts.length > 0 ? accounts : [
    { 
      id: '1', 
      name: 'Conta Corrente', 
      type: 'corrente' as const, 
      balance: { value: 2500.50 },
      isDefault: true,
      createdAt: new Date()
    },
    { 
      id: '2', 
      name: 'Poupança', 
      type: 'poupanca' as const, 
      balance: { value: 15000.00 },
      isDefault: false,
      createdAt: new Date()
    }
  ];

  const displayOperations = operations.length > 0 ? operations : [
    { id: '1', nature: 'receita' as const, value: { value: 3000 }, date: new Date(), details: 'Salário' },
    { id: '2', nature: 'despesa' as const, value: { value: 500 }, date: new Date(), details: 'Mercado' }
  ];

  const handleViewAllAccounts = () => {
    navigation?.navigate('Accounts');
  };

  const handleAddAccount = () => {
    navigation?.navigate('Register', { screen: 'accounts' });
  };

  const handleViewAllAlerts = () => {
    console.log('Ver todos os alertas');
  };

  const handleDismissAlert = async (alertId: string) => {
    try {
      await dismissAlert(alertId);
      console.log('Alert dismissed:', alertId);
    } catch (error) {
      console.error('Failed to dismiss alert:', error);
    }
  };

  const getAlertIcon = (alert: any) => {
    switch (alert.type) {
      case 'low_balance':
        return 'warning';
      case 'negative_balance':
        return 'alert-circle';
      case 'credit_limit':
        return 'card';
      default:
        return 'information-circle';
    }
  };

  const getAlertColor = (alert: any) => {
    return alert.severity === 'error' ? '#F44336' : '#FF9800';
  };

  // Mostrar loading se estiver carregando
  if (accountsLoading || operationsLoading || alertsLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.subtitle}>🔄 Carregando dados...</Text>
      </View>
    );
  }

  // Mostrar erro se houver
  if (accountsError || operationsError || alertsError) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.subtitle}>❌ Erro: {accountsError || operationsError || alertsError}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container} testID="home-screen">
      <ScrollView style={styles.scrollContainer}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Bem-vindo!</Text>
          <Text style={styles.subtitle}>Gerencie suas finanças de forma inteligente</Text>
        </View>

        {/* Alerts Panel */}
        {(activeAlerts.length > 0 || mockAlerts.length > 0) && (
          <View style={styles.alertsContainer}>
            <View style={styles.alertsHeader}>
              <View style={styles.alertsTitleSection}>
                <Text style={styles.alertsTitle}>🔔 Alertas</Text>
                <View style={styles.alertsBadge}>
                  <Text style={styles.alertsBadgeText}>{activeAlerts.length || mockAlerts.length}</Text>
                </View>
              </View>
              {(activeAlerts.length > 3 || mockAlerts.length > 3) && (
                <TouchableOpacity onPress={handleViewAllAlerts}>
                  <Text style={styles.viewAllText}>Ver Todos</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Mostrar alertas reais primeiro, depois mock se não houver reais */}
            {(activeAlerts.length > 0 ? activeAlerts : mockAlerts).slice(0, 3).map((alert) => {
              const isRealAlert = activeAlerts.length > 0 && 'message' in alert;
              const alertTitle = isRealAlert ? alert.message.split(' ').slice(0, 2).join(' ') : (alert as any).title;
              const alertMessage = isRealAlert ? alert.message : (alert as any).message;
              
              return (
                <View key={alert.id} style={styles.alertItem}>
                  <View style={styles.alertContent}>
                    <Text style={{fontSize: 24, color: getAlertColor(alert)}}>⚠️</Text>
                    <View style={styles.alertTextContainer}>
                      <Text style={styles.alertTitle}>{alertTitle}</Text>
                      <Text style={styles.alertMessage}>{alertMessage}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDismissAlert(alert.id)}
                    style={styles.dismissButton}
                  >
                    <Text style={{color: '#666666'}}>✕</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}

        {/* Accounts Dashboard */}
        <View style={styles.accountsContainer}>
          <View style={styles.accountsHeader}>
            <View style={styles.accountsTitleSection}>
              <Text style={styles.accountsTitle}>Minhas Contas</Text>
              <Text style={styles.accountsSubtitle}>
                {displayAccounts.length} conta{displayAccounts.length !== 1 ? 's' : ''}
              </Text>
            </View>
            <TouchableOpacity onPress={handleViewAllAccounts} style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>Ver Todas {'>'}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.accountsScroll}
            contentContainerStyle={styles.accountsScrollContent}
          >
            {displayAccounts.slice(0, 3).map((account) => (
              <View key={account.id} style={styles.accountCardWrapper}>
                <View style={styles.mockAccountCard}>
                  <Text style={styles.accountName}>{account.name}</Text>
                  <Text style={styles.accountBalance}>
                    R$ {account.balance.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </Text>
                  <Text style={styles.accountType}>{account.type}</Text>
                </View>
              </View>
            ))}
            {displayAccounts.length > 3 && (
              <TouchableOpacity onPress={handleViewAllAccounts} style={styles.moreAccountsCard}>
                <View style={styles.moreAccountsContent}>
                  <Text style={{fontSize: 32, color: '#4CAF50'}}>➕</Text>
                  <Text style={styles.moreAccountsText}>Ver mais</Text>
                  <Text style={styles.moreAccountsCount}>+{displayAccounts.length - 3}</Text>
                </View>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>

        {/* Placeholder para futuros widgets */}
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>Outros widgets da Home virão aqui</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
  
  // Header
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
  },

  // Alerts
  alertsContainer: {
    margin: 16,
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  alertsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  alertsTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginLeft: 8,
  },
  alertsBadge: {
    backgroundColor: '#FF9800',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  alertsBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  viewAllText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  alertContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  alertTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  alertMessage: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  dismissButton: {
    padding: 8,
  },

  // Accounts
  accountsContainer: {
    margin: 16,
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  accountsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  accountsTitleSection: {
    flex: 1,
  },
  accountsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  accountsSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Accounts scroll
  accountsScroll: {
    marginHorizontal: -8,
  },
  accountsScrollContent: {
    paddingHorizontal: 8,
  },
  accountCardWrapper: {
    marginHorizontal: 8,
    width: 280,
  },
  
  // Mock Account Card (temporário)
  mockAccountCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 120,
  },
  accountName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  accountBalance: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  accountType: {
    fontSize: 14,
    color: '#666666',
    textTransform: 'capitalize',
  },
  
  moreAccountsCard: {
    width: 280,
    height: 120,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    marginHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderStyle: 'dashed',
  },
  moreAccountsContent: {
    alignItems: 'center',
  },
  moreAccountsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
    marginTop: 8,
  },
  moreAccountsCount: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },

  // Placeholder
  placeholder: {
    padding: 24,
    alignItems: 'center',
    marginBottom: 32,
  },
  placeholderText: {
    fontSize: 16,
    color: '#666666',
    fontStyle: 'italic',
  },
});

export default HomeScreen;