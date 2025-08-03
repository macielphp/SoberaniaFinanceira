import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Layout from '../../components/Layout/Layout';
import AccountsDashboard from '../../components/AccountsDashboard/AccountsDashboard';
import AlertsPanel from '../../components/AlertsPanel/AlertsPanel';
import { useFinance } from '../../contexts/FinanceContext';
import { colors, spacing, typography } from '../../styles/themes';
import { AlertService } from '../../services/AlertService';
import { AccountService } from '../../services/AccountService';

interface HomeProps {
  navigation?: any;
}

const Home: React.FC<HomeProps> = ({ navigation }) => {
  const { accounts, operations } = useFinance();

  // Calcular alertas
  const accountsBalance = AccountService.getAccountsBalance(accounts, operations);
  const alerts = AlertService.checkAllAccountAlerts(accounts, accountsBalance);

  const handleViewAllAccounts = () => {
    // Navegar para a tela de contas
    navigation?.navigate('Accounts');
  };

  const handleAddAccount = () => {
    // Navegar para adicionar conta
    navigation?.navigate('Register', { screen: 'accounts' });
  };

  const handleViewAllAlerts = () => {
    console.log('Ver todos os alertas');
  };

  const handleDismissAlert = (alertId: string) => {
    console.log('Dismiss alert:', alertId);
  };

  return (
    <Layout>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Bem-vindo!</Text>
          <Text style={styles.subtitle}>Gerencie suas finanças de forma inteligente</Text>
        </View>

        <AlertsPanel
          alerts={alerts}
          onViewAllAlerts={handleViewAllAlerts}
          onDismissAlert={handleDismissAlert}
          maxAlerts={3}
        />

        <AccountsDashboard
          accounts={accounts}
          operations={operations}
          onViewAllAccounts={handleViewAllAccounts}
          onAddAccount={handleAddAccount}
          maxCards={3}
          navigation={navigation}
        />

        {/* Outros componentes da Home podem ser adicionados aqui */}
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>Outros widgets da Home virão aqui</Text>
        </View>
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  header: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: typography.h1.fontSize,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.body1.fontSize,
    color: colors.text.secondary,
  },
  placeholder: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: typography.body1.fontSize,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
});

export default Home; 