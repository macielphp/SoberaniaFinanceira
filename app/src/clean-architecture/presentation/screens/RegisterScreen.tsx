import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native';
import { RegisterScreenViewModel, ViewMode } from './RegisterScreenViewModel';
import { OperationViewModel } from '../view-models/OperationViewModel';
import { CategoryViewModel } from '../view-models/CategoryViewModel';
import { AccountViewModel } from '../view-models/AccountViewModel';
import { Operation } from '../../domain/entities/Operation';
import { Category } from '../../domain/entities/Category';
import { Account } from '../../domain/entities/Account';
import { Money } from '../../shared/utils/Money';   

interface RegisterScreenProps {
  navigation?: any;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const [registerScreenClass] = useState(() => new RegisterScreenViewModel(
    new OperationViewModel({} as any, {} as any, {} as any, {} as any, {} as any),
    new CategoryViewModel({} as any, {} as any, {} as any, {} as any, {} as any),
    new AccountViewModel({} as any)
  ));

  const [currentView, setCurrentView] = useState<ViewMode>('register');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      await registerScreenClass.onMount();
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, [registerScreenClass]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadData();
    } finally {
      setRefreshing(false);
    }
  }, [loadData]);

  const handleViewChange = useCallback((view: ViewMode) => {
    registerScreenClass.setCurrentView(view);
    setCurrentView(view);
  }, [registerScreenClass]);

  const handleOperationSubmit = useCallback(async () => {
    try {
      // Implementar lógica de submissão
      await registerScreenClass.handleOperationSuccess({});
    } catch (error) {
      console.error('Error submitting operation:', error);
    }
  }, [registerScreenClass]);

  const handleEditOperation = useCallback((operationId: string) => {
    registerScreenClass.handleEditOperation(operationId);
    setCurrentView('register');
  }, [registerScreenClass]);

  const handleDeleteOperation = useCallback(async (id: string, description: string) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Tem certeza que deseja excluir a operação "${description}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await registerScreenClass.handleDeleteOperation(id, description);
              await loadData();
            } catch (error) {
              console.error('Error deleting operation:', error);
            }
          },
        },
      ]
    );
  }, [registerScreenClass, loadData]);

  const handleCreateCategory = useCallback(() => {
    registerScreenClass.handleCreateCategory();
  }, [registerScreenClass]);

  const handleCreateAccount = useCallback(() => {
    registerScreenClass.handleCreateAccount();
  }, [registerScreenClass]);

  const formatMoney = (money: Money): string => {
    return money.format();
  };

  const renderNavigationTabs = () => (
    <View style={styles.navigationTabs}>
      <TouchableOpacity
        style={[styles.tab, currentView === 'register' && styles.activeTab]}
        onPress={() => handleViewChange('register')}
      >
        <Text style={[styles.tabText, currentView === 'register' && styles.activeTabText]}>
          Registrar
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, currentView === 'manage' && styles.activeTab]}
        onPress={() => handleViewChange('manage')}
      >
        <Text style={[styles.tabText, currentView === 'manage' && styles.activeTabText]}>
          Gerenciar
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, currentView === 'settings' && styles.activeTab]}
        onPress={() => handleViewChange('settings')}
      >
        <Text style={[styles.tabText, currentView === 'settings' && styles.activeTabText]}>
          Configurações
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, currentView === 'categories' && styles.activeTab]}
        onPress={() => handleViewChange('categories')}
      >
        <Text style={[styles.tabText, currentView === 'categories' && styles.activeTabText]}>
          Categorias
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, currentView === 'accounts' && styles.activeTab]}
        onPress={() => handleViewChange('accounts')}
      >
        <Text style={[styles.tabText, currentView === 'accounts' && styles.activeTabText]}>
          Contas
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderRegisterForm = () => (
    <ScrollView style={styles.content}>
      <Text style={styles.sectionTitle}>Natureza</Text>
      <View style={styles.radioGroup}>
        <TouchableOpacity style={styles.radioOption}>
          <Text style={styles.radioText}>Receita</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.radioOption}>
          <Text style={styles.radioText}>Despesa</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleOperationSubmit}
        testID="submit-operation-button"
      >
        <Text style={styles.submitButtonText}>Salvar Operação</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderManageView = () => (
    <ScrollView style={styles.content}>
      <Text style={styles.sectionTitle}>Operações</Text>
      <Text style={styles.sectionTitle}>Filtros</Text>
      
      <FlatList
        data={registerScreenClass.operationViewModel.operations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.operationItem}>
            <Text style={styles.operationText}>{item.details || 'Sem descrição'}</Text>
            <Text style={styles.operationValue}>{formatMoney(item.value)}</Text>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => handleEditOperation(item.id)}
              testID={`edit-operation-${item.id}`}
            >
              <Text style={styles.editButtonText}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteOperation(item.id, item.details || 'Sem descrição')}
              testID={`delete-operation-${item.id}`}
            >
              <Text style={styles.deleteButtonText}>Excluir</Text>
            </TouchableOpacity>
          </View>
        )}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />
    </ScrollView>
  );

  const renderSettingsView = () => (
    <ScrollView style={styles.content}>
      <Text style={styles.sectionTitle}>Configurações Gerais</Text>
    </ScrollView>
  );

  const renderCategoriesView = () => (
    <ScrollView style={styles.content}>
      <Text style={styles.sectionTitle}>Categorias</Text>
      <TouchableOpacity
        style={styles.createButton}
        onPress={handleCreateCategory}
      >
        <Text style={styles.createButtonText}>Nova Categoria</Text>
      </TouchableOpacity>
      
      <FlatList
        data={registerScreenClass.categoryViewModel.categories}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.categoryItem}>
            <Text style={styles.categoryText}>{item.name}</Text>
          </View>
        )}
      />
    </ScrollView>
  );

  const renderAccountsView = () => (
    <ScrollView style={styles.content}>
      <Text style={styles.sectionTitle}>Contas</Text>
      <TouchableOpacity
        style={styles.createButton}
        onPress={handleCreateAccount}
      >
        <Text style={styles.createButtonText}>Nova Conta</Text>
      </TouchableOpacity>
      
      <FlatList
        data={registerScreenClass.accountViewModel.accounts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.accountItem}>
            <Text style={styles.accountText}>{item.name}</Text>
            <Text style={styles.accountBalance}>{formatMoney(item.balance)}</Text>
          </View>
        )}
      />
    </ScrollView>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'register':
        return renderRegisterForm();
      case 'manage':
        return renderManageView();
      case 'settings':
        return renderSettingsView();
      case 'categories':
        return renderCategoriesView();
      case 'accounts':
        return renderAccountsView();
      default:
        return renderRegisterForm();
    }
  };

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#007AFF" testID="loading-indicator" />
      <Text style={styles.loadingText}>Carregando...</Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      {registerScreenClass.operationViewModel.error && (
        <Text style={styles.errorText}>{registerScreenClass.operationViewModel.error}</Text>
      )}
      {registerScreenClass.categoryViewModel.error && (
        <Text style={styles.errorText}>{registerScreenClass.categoryViewModel.error}</Text>
      )}
      {registerScreenClass.accountViewModel.error && (
        <Text style={styles.errorText}>{registerScreenClass.accountViewModel.error}</Text>
      )}
      <TouchableOpacity
        style={styles.retryButton}
        onPress={handleRefresh}
        testID="refresh-button"
      >
        <Text style={styles.retryButtonText}>Tentar Novamente</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return renderLoadingState();
  }

  if (registerScreenClass.operationViewModel.error || 
      registerScreenClass.categoryViewModel.error || 
      registerScreenClass.accountViewModel.error) {
    return renderErrorState();
  }

  return (
    <View style={styles.container}>
      {renderNavigationTabs()}
      {renderContent()}
    </View>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  navigationTabs: {
    flexDirection: 'row',
    backgroundColor: '#2a2a2a',
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 2,
  },
  activeTab: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    color: '#999',
    fontSize: 12,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  radioGroup: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  radioOption: {
    flex: 1,
    padding: 12,
    backgroundColor: '#2a2a2a',
    marginHorizontal: 4,
    borderRadius: 8,
    alignItems: 'center',
  },
  radioText: {
    color: '#fff',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  operationItem: {
    backgroundColor: '#2a2a2a',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  operationText: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
  },
  operationValue: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 16,
  },
  editButton: {
    backgroundColor: '#FF9500',
    padding: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    padding: 8,
    borderRadius: 4,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  createButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  categoryItem: {
    backgroundColor: '#2a2a2a',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  categoryText: {
    color: '#fff',
    fontSize: 16,
  },
  accountItem: {
    backgroundColor: '#2a2a2a',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accountText: {
    color: '#fff',
    fontSize: 16,
  },
  accountBalance: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 16,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
