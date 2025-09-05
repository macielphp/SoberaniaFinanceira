// Screen: SettingsSubScreen
// Responsável por gerenciar o estado e lógica de apresentação para configurações do usuário
// Integra com UserViewModel e FeatureFlagManager

import { UserViewModel } from '../view-models/UserViewModel';
import { FeatureFlagManager } from '../../shared/feature-flags/FeatureFlags';
import { User } from '../../domain/entities/User';

// Types for settings data
export interface UserProfileData {
  name?: string;
  email?: string;
  password?: string;
}

export interface AppSettings {
  theme?: string;
  currency?: string;
  language?: string;
}

export interface ExportData {
  user: User;
  exportDate: Date;
  version: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export class SettingsSubScreen {
  constructor(
    private userViewModel: UserViewModel,
    private featureFlagManager: FeatureFlagManager
  ) {}

  // Getters
  getCurrentUser(): User | null {
    return this.userViewModel.getCurrentUser();
  }

  getFeatureFlags(): Record<string, boolean> {
    return this.featureFlagManager.getAllFlags();
  }

  getLoading(): boolean {
    return this.userViewModel.isLoading;
  }

  getError(): string | null {
    return this.userViewModel.error;
  }

  // User management
  async updateUserProfile(userId: string, data: UserProfileData): Promise<User> {
    try {
      this.userViewModel.setLoading(true);
      this.userViewModel.clearError();

      const result = await this.userViewModel.updateUser(userId, data);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar usuário';
      this.userViewModel.setError(errorMessage);
      throw error;
    } finally {
      this.userViewModel.setLoading(false);
    }
  }

  logout(): void {
    this.userViewModel.logout();
  }

  // Feature flags management
  isFeatureEnabled(flag: string): boolean {
    return this.featureFlagManager.isEnabled(flag as any);
  }

  enableFeature(flag: string): void {
    this.featureFlagManager.enable(flag as any);
  }

  disableFeature(flag: string): void {
    this.featureFlagManager.disable(flag as any);
  }

  enableCleanArchitecture(): void {
    this.featureFlagManager.enableCleanArchitecture();
  }

  // Backup and data management
  async exportUserData(): Promise<ExportData> {
    const currentUser = this.getCurrentUser();
    
    if (!currentUser) {
      const errorMessage = 'Usuário não está logado';
      this.userViewModel.setError(errorMessage);
      throw new Error(errorMessage);
    }

    return {
      user: currentUser,
      exportDate: new Date(),
      version: '1.0.0',
    };
  }

  async clearAllData(): Promise<boolean> {
    try {
      this.userViewModel.setLoading(true);
      this.userViewModel.clearError();

      const currentUser = this.getCurrentUser();
      
      if (!currentUser) {
        throw new Error('Usuário não está logado');
      }

      const result = await this.userViewModel.deleteUser(currentUser.id);
      
      if (result) {
        this.userViewModel.logout();
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao limpar dados';
      this.userViewModel.setError(errorMessage);
      throw error;
    } finally {
      this.userViewModel.setLoading(false);
    }
  }

  // Validation
  validateUserData(data: UserProfileData): ValidationResult {
    return this.userViewModel.validateForm(data as any);
  }

  // Error handling
  clearErrors(): void {
    this.userViewModel.clearError();
  }

  // Settings persistence
  async saveSettings(settings: AppSettings): Promise<void> {
    // This would typically interact with a storage service
    // For now, we'll just store in memory or use AsyncStorage
    // Implementation would depend on the storage strategy
    console.log('Saving settings:', settings);
  }

  async loadSettings(): Promise<AppSettings> {
    // This would typically load from a storage service
    // For now, we'll return default settings
    return {
      theme: 'light',
      currency: 'BRL',
      language: 'pt-BR',
    };
  }

  // Lifecycle
  async onMount(): Promise<void> {
    try {
      this.userViewModel.setLoading(true);
      this.userViewModel.clearError();

      // Load current user
      this.userViewModel.getCurrentUser();
      
      // Load feature flags
      this.featureFlagManager.getAllFlags();
      
      // Load app settings
      await this.loadSettings();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar configurações';
      this.userViewModel.setError(errorMessage);
    } finally {
      this.userViewModel.setLoading(false);
    }
  }
}

