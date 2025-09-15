import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native';
import { RegisterScreenViewModel, ViewMode } from './RegisterScreenViewModel';
import { OperationViewModel } from '../view-models/OperationViewModel';
import CategoryViewModel from '../view-models/CategoryViewModel';
import { AccountViewModel } from '../view-models/AccountViewModel';
import { container } from '../../shared/di/Container';
import { Money } from '../../shared/utils/Money';   

interface RegisterScreenProps {
  navigation?: any;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  console.log('🚀 RegisterScreen: Iniciando renderização...');
  
  const [registerScreenClass] = useState(() => {
    console.log('🔧 RegisterScreen: Criando RegisterScreenViewModel...');
    try {
      const operationViewModel = container.resolve<OperationViewModel>('OperationViewModel');
      console.log('✅ RegisterScreen: OperationViewModel resolvido:', !!operationViewModel);
      
      const categoryViewModel = container.resolve<CategoryViewModel>('CategoryViewModel');
      console.log('✅ RegisterScreen: CategoryViewModel resolvido:', !!categoryViewModel);
      
      const accountViewModel = container.resolve<AccountViewModel>('AccountViewModel');
      console.log('✅ RegisterScreen: AccountViewModel resolvido:', !!accountViewModel);
      
      const viewModel = new RegisterScreenViewModel(operationViewModel, categoryViewModel, accountViewModel);
      console.log('✅ RegisterScreen: RegisterScreenViewModel criado com sucesso');
      return viewModel;
    } catch (error) {
      console.error('❌ RegisterScreen: Erro ao criar RegisterScreenViewModel:', error);
      throw error;
    }
  });

  const [currentView, setCurrentView] = useState<ViewMode>('register');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = useCallback(async () => {
    console.log('🔄 RegisterScreen: Iniciando carregamento de dados...');
    setLoading(true);
    try {
      console.log('📊 RegisterScreen: Chamando registerScreenClass.onMount()...');
      await registerScreenClass.onMount();
      console.log('✅ RegisterScreen: Dados carregados com sucesso');
    } catch (error) {
      console.error('❌ RegisterScreen: Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
      console.log('🏁 RegisterScreen: Carregamento finalizado');
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

  const getFormData = useCallback(() => {
    const operationViewModel = registerScreenClass.operationViewModel;
    
    // Converter dados do formulário para CreateOperationData
    const formData = {
      nature: operationViewModel.operationType === 'income' ? 'receita' as const : 'despesa' as const,
      state: operationViewModel.operationType === 'income' ? 'receber' as const : 'pagar' as const,
      paymentMethod: 'Pix' as const, // Por enquanto fixo
      sourceAccount: operationViewModel.selectedAccount?.name || '',
      destinationAccount: operationViewModel.selectedAccount?.name || '',
      date: new Date(operationViewModel.date || new Date()),
      value: new Money(parseFloat(operationViewModel.amount) || 0, 'BRL'),
      category: operationViewModel.selectedCategory?.name || '',
      details: operationViewModel.description || ''
    };
    
    return formData;
  }, [registerScreenClass]);

  const handleOperationSubmit = useCallback(async () => {
    try {
      const formData = getFormData();
      
      // Validar formulário usando o OperationViewModel
      const validationResult = registerScreenClass.operationViewModel.validateForm(formData);
      
      if (!validationResult.isValid) {
        const errorMessages = Object.values(validationResult.errors).join('\n');
        Alert.alert('Erro', errorMessages);
        return;
      }
      
      // Se validação passou, criar operação
      await registerScreenClass.operationViewModel.createOperation(formData);
      Alert.alert('Sucesso', 'Operação salva com sucesso!');
      
      // Limpar formulário
      registerScreenClass.operationViewModel.reset();
      
    } catch (error) {
      console.error('Error submitting operation:', error);
      Alert.alert('Erro', error instanceof Error ? error.message : 'Erro ao salvar operação');
    }
  }, [registerScreenClass, getFormData]);

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
    // Por enquanto, mostrar um alert simples para testar
    Alert.alert('Nova Categoria', 'Nome da Categoria\nCor');
  }, [registerScreenClass]);

  const handleCreateAccount = useCallback(() => {
    registerScreenClass.handleCreateAccount();
    // Por enquanto, mostrar um alert simples para testar
    Alert.alert('Nova Conta', 'Nome da Conta\nTipo');
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
        <TouchableOpacity 
          style={[styles.radioOption, registerScreenClass.operationViewModel.operationType === 'income' && styles.selectedRadioOption]}
          onPress={() => registerScreenClass.operationViewModel.setOperationType('income')}
        >
          <Text style={[styles.radioText, registerScreenClass.operationViewModel.operationType === 'income' && styles.selectedRadioText]}>
            Receita
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.radioOption, registerScreenClass.operationViewModel.operationType === 'expense' && styles.selectedRadioOption]}
          onPress={() => registerScreenClass.operationViewModel.setOperationType('expense')}
        >
          <Text style={[styles.radioText, registerScreenClass.operationViewModel.operationType === 'expense' && styles.selectedRadioText]}>
            Despesa
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Valor</Text>
      <TextInput
        style={styles.input}
        placeholder="0,00"
        value={registerScreenClass.operationViewModel.amount}
        onChangeText={registerScreenClass.operationViewModel.setAmount}
        keyboardType="numeric"
        testID="amount-input"
      />

      <Text style={styles.sectionTitle}>Descrição</Text>
      <TextInput
        style={styles.input}
        placeholder="Descrição da operação"
        value={registerScreenClass.operationViewModel.description}
        onChangeText={registerScreenClass.operationViewModel.setDescription}
        testID="description-input"
      />

      <Text style={styles.sectionTitle}>Categoria</Text>
      <TouchableOpacity style={styles.pickerButton} testID="category-picker">
        <Text style={styles.pickerButtonText}>
          {registerScreenClass.operationViewModel.selectedCategory?.name || 'Selecionar Categoria'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Conta</Text>
      <TouchableOpacity style={styles.pickerButton} testID="account-picker">
        <Text style={styles.pickerButtonText}>
          {registerScreenClass.operationViewModel.selectedAccount?.name || 'Selecionar Conta'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Data</Text>
      <TextInput
        style={styles.input}
        placeholder="DD/MM/AAAA"
        value={registerScreenClass.operationViewModel.date}
        onChangeText={registerScreenClass.operationViewModel.setDate}
        testID="date-input"
      />

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
    <View style={styles.content}>
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
        style={styles.flatList}
      />
    </View>
  );

  const renderSettingsView = () => (
    <ScrollView style={styles.content}>
      <Text style={styles.sectionTitle}>Configurações Gerais</Text>
    </ScrollView>
  );

  const renderCategoriesView = () => (
    <View style={styles.content}>
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
        style={styles.flatList}
      />
    </View>
  );

  const renderAccountsView = () => (
    <View style={styles.content}>
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
        style={styles.flatList}
      />
    </View>
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
  selectedRadioOption: {
    backgroundColor: '#007AFF',
  },
  selectedRadioText: {
    color: '#fff',
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#2a2a2a',
    color: '#fff',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 16,
  },
  pickerButton: {
    backgroundColor: '#2a2a2a',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  pickerButtonText: {
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
  flatList: {
    flex: 1,
  },
});
