// app\src\screens\Register\Register.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  Alert,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Category, Account } from '../../database/Index'
import { useFinance } from '../../contexts/FinanceContext';
import { useCategoriesAndAccounts } from '../../hooks/useCategoriesAndAccounts'
import { Operation } from '../../services/FinanceService';
import { OperationForm } from '../../components/OperationForm/OperationForm';
import { AccountForm } from '../../components/AccountForm/AccountForm';
import { CategoryForm } from '../../components/CategoryForm/CategoryForm';
import { MenuButton } from '../../components/MenuButton/MenuButton'
import Layout from '../../components/Layout/Layout';
import OperationCard from '../../components/OperationCard/OperationCard'
import GlobalStyles from '../../styles/Styles';
import { Filters } from '../../components/Filters/Filters'
import { Nature, State } from '../../services/FinanceService'

type ViewMode = 'menu' | 'register' | 'manage' | 'settings' | 'categories' | 'accounts';

export const Register: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewMode>('menu');
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | undefined>();
  const [editingCategory, setEditingCategory] = useState<Category | undefined>();
  const [editingOperation, setEditingOperation] = useState<Operation | undefined>();

  const [showFilters, setShowFilters] = useState(false);

  const [selectedNature, setSelectedNature] = useState<Nature | undefined>();
  const [selectedState, setSelectedState] = useState<State | undefined>();
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [selectedAccount, setSelectedAccount] = useState<string | undefined>();
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);


  const { operations, removeOperation, filterOperations } = useFinance();

   const {
    categories,
    accounts,
    loading,
    error,
    createCategory,
    editCategory,
    removeCategory,
    createAccount,
    editAccount,
    removeAccount,
    clearError,
    getCategoryNames,
    getAccountNames
  } = useCategoriesAndAccounts();

  // Variáveis para filtros
  const categoryNames = getCategoryNames();
  const accountNames = getAccountNames(); 

  const filteredOps = filterOperations({
    nature: selectedNature,
    state: selectedState,
    category: selectedCategory,
    account: selectedAccount,
    startDate: selectedStartDate?.toISOString().split('T')[0],
    endDate: selectedEndDate?.toISOString().split('T')[0],
  });

  const clearAllFilters = () => {
    setSelectedNature(undefined)
    setSelectedState(undefined);
    setSelectedCategory(undefined);
    setSelectedAccount(undefined);
    setSelectedStartDate(null);
    setSelectedEndDate(null);
  }

  const hasActiveFilters = selectedNature || selectedState || selectedCategory || selectedAccount || selectedStartDate || selectedEndDate;

  const handleSuccess = () => {
    // Se a operação está sendo editada, atualiza o estado
    if (editingOperation) {
      setEditingOperation(undefined);
      Alert.alert(
        'Sucesso!', 
        'Operação registrada com sucesso!',
        [
          { text: 'Registrar Outra', onPress: () => setCurrentView('register') },
          { text: 'Voltar ao Menu', onPress: () => setCurrentView('menu') }
        ]
      );
    } else {
      // Comportamento para nova operação
      Alert.alert(
        'Sucesso!',
        'Operação registrada com sucesso!',
        [
          {text: 'Registrar Outra', onPress: () => setCurrentView('register')},
          {text: 'Voltar ao Menu', onPress: () => setCurrentView('menu')}
        ]
      )
    }
  };

  const handleEditOperation = (operationId: string) => {
    const operation = operations.find(op => op.id === operationId);

    if (operation) {
      setEditingOperation(operation);
      setCurrentView('register');
    } else {
      Alert.alert('Error', 'Operação não encontrada');
    }
    
  };


  const handleDeleteOperation = (id: string, description: string) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Deseja realmente excluir a operação: ${description}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: async () => {
            try {
              await removeOperation(id);
              Alert.alert('Sucesso', 'Operação excluída com sucesso!');
            } catch (error) {
              Alert.alert('Erro', 'Falha ao excluir operação');
            }
          }
        }
      ]
    );
  };

  // Handlers para Account
  const handleCreateAccount = () => {
    setEditingAccount(undefined);
    setShowAccountForm(true);
  };

  const handleEditAccount = (account: Account) => {
    setEditingAccount(account);
    setShowAccountForm(true);
  };

  const handleAccountSubmit = async (name: string): Promise<boolean> => {
    try {
      if (editingAccount) {
        await editAccount(editingAccount.id, name);
      } else {
        await createAccount(name);
      }
      return true;
    } catch (error) {
      return false;
    }
  };

  const handleAccountCancel = () => {
    setShowAccountForm(false);
    setEditingAccount(undefined);
  };

  const handleDeleteAccount = (account: Account) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Deseja realmente excluir a conta: ${account.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: async () => {
            try {
              await removeAccount(account.id);
              Alert.alert('Sucesso', 'Conta excluída com sucesso!');
            } catch (error) {
              // Error is already handled by the hook
            }
          }
        }
      ]
    );
  };

  // Handlers para Category
  const handleCreateCategory = () => {
    setEditingCategory(undefined);
    setShowCategoryForm(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setShowCategoryForm(true);
  };

  const handleCategorySubmit = async (name: string): Promise<boolean> => {
    try {
      if (editingCategory) {
        await editCategory(editingCategory.id, name);
      } else {
        await createCategory(name);
      }
      return true;
    } catch (error) {
      return false;
    }
  };

  const handleCategoryCancel = () => {
    setShowCategoryForm(false);
    setEditingCategory(undefined);
  };

  const handleDeleteCategory = (category: Category) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Deseja realmente excluir a categoria: ${category.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: async () => {
            try {
              await removeCategory(category.id);
              Alert.alert('Sucesso', 'Categoria excluída com sucesso!');
            } catch (error) {
              // Error is already handled by the hook
            }
          }
        }
      ]
    );
  };
  const renderMenu = () => (
    <View style={styles.menuContainer}>
      <Text style={GlobalStyles.title}>Central de Operações</Text>
      <Text style={GlobalStyles.subtitle}>Escolha uma opção:</Text>
      <View>
        <MenuButton
          title="Registrar Operação"
          description="Adicionar nova receita ou despesa"
          iconName="add-circle"
          iconColor="#4CAF50"
          onPress={() => setCurrentView('register')}
        />
        <MenuButton
          title="Gerenciar Operações"
          description="Visualizar e editar operações existentes"
          iconName="list"
          iconColor="#2196F3"
          onPress={() => setCurrentView('manage')}
        />

        <MenuButton
          title="Configurações"
          description="Gerenciar categorias, contas e configurações"
          iconName="settings"
          iconColor="#FF9800"
          onPress={() => setCurrentView('settings')}
        />
      </View>
    </View>
  );

  const renderSettings = () => (
    <View style={styles.settingsContainer}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => setCurrentView('menu')}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
          <Text style={styles.backText}>Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configurações</Text>
      </View>

      <ScrollView style={styles.settingsContent}>
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Gerenciamento</Text>
          
          <MenuButton
            title="Categorias"
            description="Adicionar, editar ou remover categorias"
            iconName="pricetags"
            iconColor="#9C27B0"
            badge={categories.length.toString()}
            onPress={() => setCurrentView('categories')}
          />
          <MenuButton
            title="Contas"
            description="Gerenciar contas de origem e destino"
            iconName="card"
            iconColor="#2196F3"
            badge={accounts.length.toString()}
            onPress={() => setCurrentView('accounts')}
          />
        </View>

        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Outras Configurações</Text>
          
          <MenuButton 
            title="Backup"
            description="Exportar dados para backup"
            iconName="download"
            iconColor="#4CAF50"
            onPress={() => Alert.alert('Em breve', 'Funcionalidade em desenvolvimento')}
          />
         
          <MenuButton
            title="Moeda"
            description="Real brasileiro (BRL)"
            iconName="globe"
            iconColor="#FF5722"
            onPress={() => Alert.alert('Em breve', 'Funcionalidade em desenvolvimento')}
          />
        </View>
      </ScrollView>
    </View>
  );

  const renderCategories = () => (
    <View style={styles.managementContainer}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => setCurrentView('settings')}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
          <Text style={styles.backText}>Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gerenciar Categorias</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleCreateCategory}
        >
          <Ionicons name="add" size={24} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.itemsList}>
        {categories && categories.length > 0 ? (
          categories.map((category: Category) => (
            <View key={category.id} style={styles.itemCard}>
              <View style={styles.itemInfo}>
                <Ionicons name="pricetag" size={20} color="#9C27B0" />
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{category.name}</Text>
                  {category.isDefault && (
                    <Text style={styles.defaultBadge}>Padrão</Text>
                  )}
                </View>
              </View>
              <View style={styles.itemActions}>
                <TouchableOpacity 
                  style={styles.editButton}
                  onPress={() => handleEditCategory(category)}
                  disabled={category.isDefault}
                >
                  <Ionicons 
                    name="pencil" 
                    size={16} 
                    color={category.isDefault ? "#ccc" : "#2196F3"} 
                  />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={() => handleDeleteCategory(category)}
                  disabled={category.isDefault}
                >
                  <Ionicons 
                    name="trash" 
                    size={16} 
                    color={category.isDefault ? "#ccc" : "#F44336"} 
                  />
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="pricetags-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Nenhuma categoria encontrada</Text>
          </View>
        )}
      </ScrollView>

      {/* Modal para CategoryForm */}
      <Modal
        visible={showCategoryForm}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalBackground}>
          <CategoryForm
            category={editingCategory}
            onSubmit={handleCategorySubmit}
            onCancel={handleCategoryCancel}
            isEditing={!!editingCategory}
          />
        </View>
      </Modal>
    </View>
  );

  const renderAccounts = () => (
    <View style={styles.managementContainer}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => setCurrentView('settings')}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
          <Text style={styles.backText}>Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gerenciar Contas</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleCreateAccount}
        >
          <Ionicons name="add" size={24} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.itemsList}>
        {accounts && accounts.length > 0 ? (
          accounts.map((account: Account) => (
            <View key={account.id} style={styles.itemCard}>
              <View style={styles.itemInfo}>
                <Ionicons name="card" size={20} color="#2196F3" />
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{account.name}</Text>
                  {account.isDefault && (
                    <Text style={styles.defaultBadge}>Padrão</Text>
                  )}
                </View>
              </View>
              <View style={styles.itemActions}>
                <TouchableOpacity 
                  style={styles.editButton}
                  onPress={() => handleEditAccount(account)}
                  disabled={account.isDefault}
                >
                  <Ionicons 
                    name="pencil" 
                    size={16} 
                    color={account.isDefault ? "#ccc" : "#2196F3"} 
                  />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={() => handleDeleteAccount(account)}
                  disabled={account.isDefault}
                >
                  <Ionicons 
                    name="trash" 
                    size={16} 
                    color={account.isDefault ? "#ccc" : "#F44336"} 
                  />
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="card-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Nenhuma conta encontrada</Text>
          </View>
        )}
      </ScrollView>

      {/* Modal para AccountForm */}
      <Modal
        visible={showAccountForm}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalBackground}>
          <AccountForm
            account={editingAccount}
            onSubmit={handleAccountSubmit}
            onCancel={handleAccountCancel}
            isEditing={!!editingAccount}
          />
        </View>
      </Modal>
    </View>
  );

  const renderManageOperations = () => (
    <View style={styles.manageContainer}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => setCurrentView('menu')}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
          <Text style={styles.backText}>Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gerenciar Operações</Text>
      </View>

      {/* Botões de filtro e limpar */}
      <View style={styles.filterControls}>
        <TouchableOpacity
          style={[styles.filterButton, hasActiveFilters && styles.filterButtonActive]}
          onPress={() => setShowFilters(true)}
        >
          <Ionicons 
            name="filter" 
            size={16} 
            color={hasActiveFilters ? "#fff" : "#333"} 
          />
          <Text style={[styles.filterButtonText, hasActiveFilters && styles.filterButtonTextActive]}>
            Filtros {hasActiveFilters && `(${Object.values({
              selectedNature,
              selectedState,
              selectedCategory,
              selectedAccount,
              selectedStartDate,
              selectedEndDate
            }).filter(Boolean).length})`}
          </Text>
        </TouchableOpacity>

        {hasActiveFilters && (
          <TouchableOpacity
            style={styles.clearFiltersButton}
            onPress={clearAllFilters}
          >
            <Ionicons name="close-circle" size={16} color="#f44336" />
            <Text style={styles.clearFiltersText}>Limpar</Text>
          </TouchableOpacity>
        )}
      </View> 

      {/* Modal de filtros */}
      <Modal
        visible={showFilters}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtros</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowFilters(false)}
              >
                <Ionicons name='close' size={24} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              <Filters
                nature={selectedNature}
                setNature={setSelectedNature}
                state={selectedState}
                setState={setSelectedState}
                category={selectedCategory}
                setCategory={setSelectedCategory}
                account={selectedAccount}
                setAccount={setSelectedAccount}
                categories={categoryNames}
                accounts={accountNames}
                startDate={selectedStartDate}
                endDate={selectedEndDate}
                setStartDate={setSelectedStartDate}
                setEndDate={setSelectedEndDate}
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.clearFiltersButtonModal}
                onPress={clearAllFilters}
              >
                <Text style={styles.clearFiltersTextModal}>Limpar Filtros</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyFiltersButton}
                onPress={() => setShowFilters(false)}
              >
                <Text style={styles.applyFiltersText}>Aplicar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Lista de operações */}
      <ScrollView style={styles.operationsList}>
        {filteredOps.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>
              {hasActiveFilters
                ? "Nenhuma operação encontrada com os filtros aplicados"
                : "Nenhum operação encontrada"
              }
            </Text>
            {!hasActiveFilters && (
              <TouchableOpacity 
                style={styles.addFirstButton}
                onPress={() => setCurrentView('register')}
              >
                <Text style={styles.addFirstButtonText}>Registrar Primeira Operação</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <>
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsCount}>
                {filteredOps.length} operaç{filteredOps.length !== 1 ? 'ões' : 'ão'} encontrada{filteredOps.length !== 1 ? 's' : ''}
              </Text>
            </View>
            {filteredOps.map((operation) => (
              <OperationCard
                key={operation.id}
                operation={operation}
                onEdit={handleEditOperation}
                onDelete={handleDeleteOperation}
              />
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );

  const renderRegisterForm = () => (
    <View style={styles.formContainer}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => {
            setEditingOperation(undefined);
            setCurrentView('menu');
          }}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
          <Text style={styles.backText}>Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {editingOperation ? 'Atualizar Operação' : 'Nova Operação'}
        </Text>
      </View>
      <OperationForm 
        onSuccess={handleSuccess} 
        editOperation={editingOperation} 
      />
    </View>
  );

  // Clear error when changing views
  React.useEffect(() => {
    if (error) {
      clearError();
    }
    // Limpar operação em edição quando sair da tela de registro
    if (currentView !== 'register') {
      setEditingOperation(undefined);
    }
  }, [currentView, error, clearError]);

  return (
    <Layout>
      {currentView === 'menu' && renderMenu()}
      {currentView === 'register' && renderRegisterForm()}
      {currentView === 'manage' && renderManageOperations()}
      {currentView === 'settings' && renderSettings()}
      {currentView === 'categories' && renderCategories()}
      {currentView === 'accounts' && renderAccounts()}
    </Layout>
  );
};

const styles = StyleSheet.create({
  // Modal Styles
    modal: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
      margin: 0,
    },
    modalContent: {
      backgroundColor: '#fff',
      padding: 16,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      maxHeight: '80%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 12,
    },
    modalCloseButton: {
      padding: 5
    },
    modalFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: 20,
      borderTopWidth: 1,
      borderTopColor: '#eee',
      gap: 10,
    },
    clearFiltersButtonModal: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#f44336',
      alignItems: 'center',
    },
    clearFiltersTextModal: {
      color: '#f44336',
      fontWeight: '600',
      fontSize: 16,
    },
    applyFiltersButton:{
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 8,
      backgroundColor: '#2196F3',
      alignItems: 'center',
    },
    applyFiltersText: {
      color: '#fff',
      fontWeight: '600',
      fontSize: 16,

    },
    closeButton: {
      backgroundColor: '#f44336',
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 12,
    },
    closeButtonText: {
      color: 'white',
      fontWeight: '600',
    },

  // Menu Styles (existentes)
  menuContainer: {
    flex: 1,
    padding: 20,
    paddingTop: 30,
    backgroundColor: '#f5f5f5'
  },
  menuButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  buttonTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  buttonDescription: {
    fontSize: 14,
    color: '#666',
  },
  
  // Stats Styles (existentes)
  statsContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  statsText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  
  // Header Styles (existentes)
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  backText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  addButton: {
    padding: 8,
  },

  // Estilos dos controles de filtro
  filterControls: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    gap: 10,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    gap: 5,
  },
  filterButtonActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  filterButtonText: {
      color: '#333',
      fontWeight: '600',
      fontSize: 14,
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  clearFiltersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 5,
  },
  clearFiltersText: {
    fontSize: 14,
    color: '#f44336',
    fontWeight: '500',
  },

  // Form Container (existente)
  formContainer: {
    flex: 1,
  },
  
  // Settings Styles (novos)
  settingsContainer: {
    flex: 1,
  },
  settingsContent: {
    flex: 1,
    padding: 16,
  },
  settingsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  settingsItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  settingsItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingsItemText: {
    flex: 1,
    marginLeft: 12,
  },
  settingsItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  settingsItemDescription: {
    fontSize: 14,
    color: '#666',
  },
  settingsItemBadge: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2196F3',
  },
  
  // Management Styles (novos)
  managementContainer: {
    flex: 1,
  },
  itemsList: {
    flex: 1,
    padding: 16,
  },
  itemCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemDetails: {
    marginLeft: 10,
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  defaultBadge: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
    alignSelf: 'flex-start',
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    padding: 8,
    marginRight: 4,
  },
  deleteButton: {
    padding: 8,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
  },

  
  // Empty State (existente)
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 25,
    lineHeight: 24,
  },
  addFirstButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addFirstButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Estilos da lista de resultados
  resultsHeader: {
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  resultsCount: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },

  
  // Manage Operations Styles (existentes)
  manageContainer: {
    flex: 1,
  },
  operationsList: {
    flex: 1,
    padding: 16,
  },
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
});

export default Register;