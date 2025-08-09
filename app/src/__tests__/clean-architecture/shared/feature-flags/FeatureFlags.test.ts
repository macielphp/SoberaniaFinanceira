import { FeatureFlags, FeatureFlagManager } from '../../../../clean-architecture/shared/feature-flags/FeatureFlags';

describe('FeatureFlags', () => {
  let featureFlagManager: FeatureFlagManager;

  beforeEach(() => {
    featureFlagManager = new FeatureFlagManager();
  });

  describe('when initializing', () => {
    it('should have default flags disabled', () => {
      expect(featureFlagManager.isEnabled('USE_CLEAN_ARCHITECTURE_COMPONENTS')).toBe(false);
      expect(featureFlagManager.isEnabled('USE_CLEAN_OPERATION_FORM')).toBe(false);
      expect(featureFlagManager.isEnabled('USE_CLEAN_ACCOUNT_FORM')).toBe(false);
    });
  });

  describe('when enabling flags', () => {
    it('should enable specific feature flag', () => {
      featureFlagManager.enable('USE_CLEAN_ARCHITECTURE_COMPONENTS');
      
      expect(featureFlagManager.isEnabled('USE_CLEAN_ARCHITECTURE_COMPONENTS')).toBe(true);
      expect(featureFlagManager.isEnabled('USE_CLEAN_OPERATION_FORM')).toBe(false);
    });

    it('should enable multiple flags', () => {
      featureFlagManager.enable('USE_CLEAN_ARCHITECTURE_COMPONENTS');
      featureFlagManager.enable('USE_CLEAN_OPERATION_FORM');
      
      expect(featureFlagManager.isEnabled('USE_CLEAN_ARCHITECTURE_COMPONENTS')).toBe(true);
      expect(featureFlagManager.isEnabled('USE_CLEAN_OPERATION_FORM')).toBe(true);
    });
  });

  describe('when disabling flags', () => {
    it('should disable specific feature flag', () => {
      featureFlagManager.enable('USE_CLEAN_ARCHITECTURE_COMPONENTS');
      featureFlagManager.disable('USE_CLEAN_ARCHITECTURE_COMPONENTS');
      
      expect(featureFlagManager.isEnabled('USE_CLEAN_ARCHITECTURE_COMPONENTS')).toBe(false);
    });
  });

  describe('when checking unknown flag', () => {
    it('should return false for unknown flags', () => {
      expect(featureFlagManager.isEnabled('UNKNOWN_FLAG' as any)).toBe(false);
    });
  });

  describe('when enabling all clean architecture flags', () => {
    it('should enable all component flags', () => {
      featureFlagManager.enableCleanArchitecture();
      
      expect(featureFlagManager.isEnabled('USE_CLEAN_ARCHITECTURE_COMPONENTS')).toBe(true);
      expect(featureFlagManager.isEnabled('USE_CLEAN_OPERATION_FORM')).toBe(true);
      expect(featureFlagManager.isEnabled('USE_CLEAN_ACCOUNT_FORM')).toBe(true);
      expect(featureFlagManager.isEnabled('USE_CLEAN_CATEGORY_FORM')).toBe(true);
      expect(featureFlagManager.isEnabled('USE_CLEAN_GOAL_FORM')).toBe(true);
    });
  });

  describe('when getting all flags status', () => {
    it('should return current status of all flags', () => {
      featureFlagManager.enable('USE_CLEAN_OPERATION_FORM');
      
      const status = featureFlagManager.getAllFlags();
      
      expect(status.USE_CLEAN_ARCHITECTURE_COMPONENTS).toBe(false);
      expect(status.USE_CLEAN_OPERATION_FORM).toBe(true);
      expect(status.USE_CLEAN_ACCOUNT_FORM).toBe(false);
    });
  });

  describe('when migrating gradually', () => {
    it('should support gradual component migration', () => {
      // Fase 1: Habilitar apenas Operation Form
      featureFlagManager.enable('USE_CLEAN_OPERATION_FORM');
      expect(featureFlagManager.isEnabled('USE_CLEAN_OPERATION_FORM')).toBe(true);
      expect(featureFlagManager.isEnabled('USE_CLEAN_ACCOUNT_FORM')).toBe(false);
      
      // Fase 2: Adicionar Account Form
      featureFlagManager.enable('USE_CLEAN_ACCOUNT_FORM');
      expect(featureFlagManager.isEnabled('USE_CLEAN_OPERATION_FORM')).toBe(true);
      expect(featureFlagManager.isEnabled('USE_CLEAN_ACCOUNT_FORM')).toBe(true);
      
      // Fase 3: Habilitar todos os componentes
      featureFlagManager.enableCleanArchitecture();
      expect(featureFlagManager.isEnabled('USE_CLEAN_ARCHITECTURE_COMPONENTS')).toBe(true);
    });
  });
});
