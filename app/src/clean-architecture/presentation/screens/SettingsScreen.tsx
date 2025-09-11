import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator,
  Alert 
} from 'react-native';
import { SettingsSubScreen } from './SettingsSubScreen';
import { UserViewModel } from '../view-models/UserViewModel';
import { FeatureFlagManager } from '../../shared/feature-flags/FeatureFlags';
import { User } from '../../domain/entities/User';
import { AppSettings, UserProfileData } from './SettingsSubScreen';

export const SettingsScreen: React.FC = () => {
  const [settingsSubScreen] = useState(() => new SettingsSubScreen(
    new UserViewModel({} as any),
    new FeatureFlagManager()
  ));
  const [user, setUser] = useState<User | null>(null);
  const [appSettings, setAppSettings] = useState<AppSettings>({
    theme: 'light',
    currency: 'BRL',
    language: 'pt-BR',
  });
  const [featureFlags, setFeatureFlags] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // useEffect(() => {
  //   loadData();
  // }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await settingsSubScreen.onMount();
      
      const currentUser = settingsSubScreen.getCurrentUser();
      const flags = settingsSubScreen.getFeatureFlags();
      const settings = await settingsSubScreen.loadSettings();
      
      setUser(currentUser);
      setFeatureFlags(flags);
      setAppSettings(settings);
    } catch (error) {
      console.error('Error loading settings:', error);
      setError('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await loadData();
  };

  const handleEditProfile = async () => {
    if (!user) return;
    
    try {
      const updatedUser = await settingsSubScreen.updateUserProfile(user.id, {
        name: user.name,
        email: user.email,
      });
      setUser(updatedUser);
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
    } catch (error) {
      Alert.alert('Erro', 'Erro ao atualizar perfil');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sair', 
          style: 'destructive',
          onPress: () => {
            settingsSubScreen.logout();
            setUser(null);
          }
        },
      ]
    );
  };

  const handleThemeChange = async () => {
    const newTheme = appSettings.theme === 'light' ? 'dark' : 'light';
    const newSettings = { ...appSettings, theme: newTheme };
    
    try {
      await settingsSubScreen.saveSettings(newSettings);
      setAppSettings(newSettings);
    } catch (error) {
      Alert.alert('Erro', 'Erro ao alterar tema');
    }
  };

  const handleFeatureToggle = async (flag: string) => {
    try {
      if (settingsSubScreen.isFeatureEnabled(flag)) {
        settingsSubScreen.disableFeature(flag);
      } else {
        settingsSubScreen.enableFeature(flag);
      }
      
      const flags = settingsSubScreen.getFeatureFlags();
      setFeatureFlags(flags);
    } catch (error) {
      Alert.alert('Erro', 'Erro ao alterar funcionalidade');
    }
  };

  const handleExportData = async () => {
    try {
      const exportData = await settingsSubScreen.exportUserData();
      Alert.alert('Sucesso', `Dados exportados: ${exportData.version}`);
    } catch (error) {
      Alert.alert('Erro', 'Erro ao exportar dados');
    }
  };

  const handleClearAllData = () => {
    Alert.alert(
      'Limpar Dados',
      'Tem certeza que deseja apagar todos os dados? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Apagar Tudo', 
          style: 'destructive',
          onPress: async () => {
            try {
              await settingsSubScreen.clearAllData();
              setUser(null);
              Alert.alert('Sucesso', 'Todos os dados foram apagados!');
            } catch (error) {
              Alert.alert('Erro', 'Erro ao apagar dados');
            }
          }
        },
      ]
    );
  };

  const handleSaveSettings = async () => {
    try {
      await settingsSubScreen.saveSettings(appSettings);
      Alert.alert('Sucesso', 'Configurações salvas com sucesso!');
    } catch (error) {
      Alert.alert('Erro', 'Erro ao salvar configurações');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" testID="loading-indicator" />
        <Text style={styles.loadingText}>Carregando configurações...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadData}>
          <Text style={styles.retryButtonText}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} testID="settings-screen">
      <View style={styles.header}>
        <Text style={styles.title}>Configurações</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh} testID="refresh-button">
          <Text style={styles.refreshButtonText}>Atualizar</Text>
        </TouchableOpacity>
      </View>

      {/* User Profile Section */}
      <View style={styles.section} testID="user-profile-section">
        <Text style={styles.sectionTitle}>Perfil do Usuário</Text>
        
        {user ? (
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            
            <View style={styles.userActions}>
              <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
                <Text style={styles.editButtonText}>Editar Perfil</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutButtonText}>Sair</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <Text style={styles.noUserText}>Usuário não logado</Text>
        )}
      </View>

      {/* App Settings Section */}
      <View style={styles.section} testID="app-settings-section">
        <Text style={styles.sectionTitle}>Configurações do App</Text>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Tema</Text>
          <TouchableOpacity style={styles.settingValue} onPress={handleThemeChange}>
            <Text style={styles.settingValueText}>
              {appSettings.theme === 'light' ? 'Claro' : 'Escuro'}
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Moeda</Text>
          <Text style={styles.settingValueText}>{appSettings.currency}</Text>
        </View>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Idioma</Text>
          <Text style={styles.settingValueText}>{appSettings.language}</Text>
        </View>
        
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveSettings}>
          <Text style={styles.saveButtonText}>Salvar Configurações</Text>
        </TouchableOpacity>
      </View>

      {/* Feature Flags Section */}
      <View style={styles.section} testID="feature-flags-section">
        <Text style={styles.sectionTitle}>Funcionalidades</Text>
        
        {Object.entries(featureFlags).map(([flag, enabled]) => (
          <View key={flag} style={styles.settingItem}>
            <Text style={styles.settingLabel}>
              {flag === 'CLEAN_ARCHITECTURE' ? 'Clean Architecture' : 
               flag === 'NEW_UI' ? 'Nova Interface' : flag}
            </Text>
            <TouchableOpacity 
              style={styles.settingValue} 
              onPress={() => handleFeatureToggle(flag)}
            >
              <Text style={styles.settingValueText}>
                {enabled ? 'Ativado' : 'Desativado'}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Data Management Section */}
      <View style={styles.section} testID="data-management-section">
        <Text style={styles.sectionTitle}>Gerenciamento de Dados</Text>
        
        <TouchableOpacity style={styles.exportButton} onPress={handleExportData}>
          <Text style={styles.exportButtonText}>Exportar Dados</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.dangerButton} onPress={handleClearAllData}>
          <Text style={styles.dangerButtonText}>Limpar Todos os Dados</Text>
        </TouchableOpacity>
        
        <Text style={styles.warningText}>
          ⚠️ A ação de limpar dados é irreversível
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#2196f3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  refreshButton: {
    backgroundColor: '#2196f3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  userActions: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    backgroundColor: '#4caf50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  editButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#f44336',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  noUserText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  settingValue: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  settingValueText: {
    fontSize: 14,
    color: '#666',
  },
  saveButton: {
    backgroundColor: '#2196f3',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  exportButton: {
    backgroundColor: '#4caf50',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  exportButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  dangerButton: {
    backgroundColor: '#f44336',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  dangerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  warningText: {
    fontSize: 14,
    color: '#ff9800',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
