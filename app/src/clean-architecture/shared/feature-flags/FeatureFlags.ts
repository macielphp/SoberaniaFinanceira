export type FeatureFlags = 
  | 'USE_CLEAN_ARCHITECTURE_COMPONENTS'
  | 'USE_CLEAN_OPERATION_FORM'
  | 'USE_CLEAN_ACCOUNT_FORM'
  | 'USE_CLEAN_CATEGORY_FORM'
  | 'USE_CLEAN_GOAL_FORM'
  | 'USE_CLEAN_USER_FORM'
  | 'USE_CLEAN_ACCOUNT_CARD'
  | 'USE_CLEAN_OPERATION_CARD'
  | 'USE_CLEAN_HOME_SCREEN'
  | 'USE_CLEAN_REGISTER_SCREEN';

export interface IFeatureFlagManager {
  isEnabled(flag: FeatureFlags): boolean;
  enable(flag: FeatureFlags): void;
  disable(flag: FeatureFlags): void;
  enableCleanArchitecture(): void;
  getAllFlags(): Record<FeatureFlags, boolean>;
}

export class FeatureFlagManager implements IFeatureFlagManager {
  private flags: Map<FeatureFlags, boolean> = new Map();

  constructor() {
    this.initializeFlags();
  }

  private initializeFlags(): void {
    // Todas as flags começam desabilitadas
    const allFlags: FeatureFlags[] = [
      'USE_CLEAN_ARCHITECTURE_COMPONENTS',
      'USE_CLEAN_OPERATION_FORM',
      'USE_CLEAN_ACCOUNT_FORM',
      'USE_CLEAN_CATEGORY_FORM',
      'USE_CLEAN_GOAL_FORM',
      'USE_CLEAN_USER_FORM',
      'USE_CLEAN_ACCOUNT_CARD',
      'USE_CLEAN_OPERATION_CARD',
      'USE_CLEAN_HOME_SCREEN',
      'USE_CLEAN_REGISTER_SCREEN'
    ];

    allFlags.forEach(flag => {
      this.flags.set(flag, false);
    });
  }

  isEnabled(flag: FeatureFlags): boolean {
    return this.flags.get(flag) ?? false;
  }

  enable(flag: FeatureFlags): void {
    this.flags.set(flag, true);
  }

  disable(flag: FeatureFlags): void {
    this.flags.set(flag, false);
  }

  enableCleanArchitecture(): void {
    // Habilita todas as flags relacionadas à Clean Architecture
    const allFlags: FeatureFlags[] = [
      'USE_CLEAN_ARCHITECTURE_COMPONENTS',
      'USE_CLEAN_OPERATION_FORM',
      'USE_CLEAN_ACCOUNT_FORM',
      'USE_CLEAN_CATEGORY_FORM',
      'USE_CLEAN_GOAL_FORM',
      'USE_CLEAN_USER_FORM',
      'USE_CLEAN_ACCOUNT_CARD',
      'USE_CLEAN_OPERATION_CARD',
      'USE_CLEAN_HOME_SCREEN',
      'USE_CLEAN_REGISTER_SCREEN'
    ];

    allFlags.forEach(flag => {
      this.enable(flag);
    });
  }

  getAllFlags(): Record<FeatureFlags, boolean> {
    const result = {} as Record<FeatureFlags, boolean>;
    
    this.flags.forEach((value, key) => {
      result[key] = value;
    });

    return result;
  }
}

// Singleton instance for global access
export const featureFlagManager = new FeatureFlagManager();
