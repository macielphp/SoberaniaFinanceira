import React from 'react';
import { render } from '@testing-library/react-native';
import { View, Text } from 'react-native';
import { MigrationWrapper } from '../../../../clean-architecture/shared/migration/MigrationWrapper';
import { FeatureFlagManager } from '../../../../clean-architecture/shared/feature-flags/FeatureFlags';

// Componente Legacy simulado
const LegacyOperationForm = () => (
  <View testID="legacy-operation-form">
    <Text>Legacy Operation Form</Text>
  </View>
);

// Componente Clean Architecture
const CleanOperationForm = () => (
  <View testID="clean-operation-form">
    <Text>Clean Architecture Operation Form</Text>
  </View>
);

describe('ComponentMigrationExample - Gradual Migration', () => {
  let featureFlagManager: FeatureFlagManager;

  beforeEach(() => {
    featureFlagManager = new FeatureFlagManager();
  });

  describe('gradual rollout scenario', () => {
    it('should start with legacy component by default', () => {
      const { getByTestId, queryByTestId } = render(
        <MigrationWrapper
          featureFlag="USE_CLEAN_OPERATION_FORM"
          featureFlagManager={featureFlagManager}
          legacyComponent={<LegacyOperationForm />}
          cleanComponent={<CleanOperationForm />}
        />
      );

      expect(getByTestId('legacy-operation-form')).toBeTruthy();
      expect(queryByTestId('clean-operation-form')).toBeNull();
    });

    it('should switch to clean architecture when flag is enabled', () => {
      featureFlagManager.enable('USE_CLEAN_OPERATION_FORM');
      
      const { getByTestId, queryByTestId } = render(
        <MigrationWrapper
          featureFlag="USE_CLEAN_OPERATION_FORM"
          featureFlagManager={featureFlagManager}
          legacyComponent={<LegacyOperationForm />}
          cleanComponent={<CleanOperationForm />}
        />
      );

      expect(getByTestId('clean-operation-form')).toBeTruthy();
      expect(queryByTestId('legacy-operation-form')).toBeNull();
    });

    it('should support A/B testing scenario', () => {
      const featureFlagManagerA = new FeatureFlagManager();
      const featureFlagManagerB = new FeatureFlagManager();
      
      // Usuário A: legacy
      featureFlagManagerA.disable('USE_CLEAN_OPERATION_FORM');
      
      // Usuário B: clean architecture
      featureFlagManagerB.enable('USE_CLEAN_OPERATION_FORM');

      // Render para usuário A
      const { getByTestId: getByTestIdA } = render(
        <MigrationWrapper
          featureFlag="USE_CLEAN_OPERATION_FORM"
          featureFlagManager={featureFlagManagerA}
          legacyComponent={<LegacyOperationForm />}
          cleanComponent={<CleanOperationForm />}
        />
      );

      // Render para usuário B
      const { getByTestId: getByTestIdB } = render(
        <MigrationWrapper
          featureFlag="USE_CLEAN_OPERATION_FORM"
          featureFlagManager={featureFlagManagerB}
          legacyComponent={<LegacyOperationForm />}
          cleanComponent={<CleanOperationForm />}
        />
      );

      expect(getByTestIdA('legacy-operation-form')).toBeTruthy();
      expect(getByTestIdB('clean-operation-form')).toBeTruthy();
    });
  });

  describe('full migration scenario', () => {
    it('should support complete migration to clean architecture', () => {
      // Simular migração completa
      featureFlagManager.enableCleanArchitecture();
      
      const { getByTestId, queryByTestId } = render(
        <MigrationWrapper
          featureFlag="USE_CLEAN_OPERATION_FORM"
          featureFlagManager={featureFlagManager}
          legacyComponent={<LegacyOperationForm />}
          cleanComponent={<CleanOperationForm />}
        />
      );

      expect(getByTestId('clean-operation-form')).toBeTruthy();
      expect(queryByTestId('legacy-operation-form')).toBeNull();
    });

    it('should validate that all flags are enabled after full migration', () => {
      featureFlagManager.enableCleanArchitecture();
      
      const flags = featureFlagManager.getAllFlags();
      
      // Verificar que todas as flags estão habilitadas
      const flagEntries = Object.entries(flags);
      expect(flagEntries.length).toBeGreaterThan(0);
      
      flagEntries.forEach(([flagName, flagValue]) => {
        expect(flagValue).toBe(true);
      });
    });
  });
});
