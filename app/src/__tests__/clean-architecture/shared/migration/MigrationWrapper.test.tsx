import React from 'react';
import { render } from '@testing-library/react-native';
import { View } from 'react-native';
import { MigrationWrapper } from '../../../../clean-architecture/shared/migration/MigrationWrapper';
import { FeatureFlagManager } from '../../../../clean-architecture/shared/feature-flags/FeatureFlags';

// Mock components with testID
const LegacyComponent = () => <View testID="legacy-component" />;
const CleanComponent = () => <View testID="clean-component" />;

describe('MigrationWrapper', () => {
  let featureFlagManager: FeatureFlagManager;

  beforeEach(() => {
    featureFlagManager = new FeatureFlagManager();
  });

  describe('when feature flag is disabled', () => {
    it('should render legacy component', () => {
      featureFlagManager.disable('USE_CLEAN_OPERATION_FORM');
      
      const { getByTestId, queryByTestId } = render(
        <MigrationWrapper
          featureFlag="USE_CLEAN_OPERATION_FORM"
          featureFlagManager={featureFlagManager}
          legacyComponent={<LegacyComponent />}
          cleanComponent={<CleanComponent />}
        />
      );

      expect(getByTestId('legacy-component')).toBeTruthy();
      expect(queryByTestId('clean-component')).toBeNull();
    });
  });

  describe('when feature flag is enabled', () => {
    it('should render clean architecture component', () => {
      featureFlagManager.enable('USE_CLEAN_OPERATION_FORM');
      
      const { getByTestId, queryByTestId } = render(
        <MigrationWrapper
          featureFlag="USE_CLEAN_OPERATION_FORM"
          featureFlagManager={featureFlagManager}
          legacyComponent={<LegacyComponent />}
          cleanComponent={<CleanComponent />}
        />
      );

      expect(getByTestId('clean-component')).toBeTruthy();
      expect(queryByTestId('legacy-component')).toBeNull();
    });
  });

  describe('with different feature flags', () => {
    it('should handle account form flag correctly', () => {
      featureFlagManager.enable('USE_CLEAN_ACCOUNT_FORM');
      
      const { getByTestId } = render(
        <MigrationWrapper
          featureFlag="USE_CLEAN_ACCOUNT_FORM"
          featureFlagManager={featureFlagManager}
          legacyComponent={<LegacyComponent />}
          cleanComponent={<CleanComponent />}
        />
      );

      expect(getByTestId('clean-component')).toBeTruthy();
    });

    it('should handle category form flag correctly', () => {
      featureFlagManager.disable('USE_CLEAN_CATEGORY_FORM');
      
      const { getByTestId } = render(
        <MigrationWrapper
          featureFlag="USE_CLEAN_CATEGORY_FORM"
          featureFlagManager={featureFlagManager}
          legacyComponent={<LegacyComponent />}
          cleanComponent={<CleanComponent />}
        />
      );

      expect(getByTestId('legacy-component')).toBeTruthy();
    });
  });

  describe('gradual migration scenario', () => {
    it('should support partial migration', () => {
      // Simular migração gradual: apenas Operation Form habilitado
      featureFlagManager.enable('USE_CLEAN_OPERATION_FORM');
      // Account Form ainda desabilitado
      featureFlagManager.disable('USE_CLEAN_ACCOUNT_FORM');

      // Operation Form usa Clean Architecture
      const { getByTestId: getOperationTestId } = render(
        <MigrationWrapper
          featureFlag="USE_CLEAN_OPERATION_FORM"
          featureFlagManager={featureFlagManager}
          legacyComponent={<View testID="legacy-operation" />}
          cleanComponent={<View testID="clean-operation" />}
        />
      );

      expect(getOperationTestId('clean-operation')).toBeTruthy();

      // Account Form ainda usa versão legada
      const { getByTestId: getAccountTestId } = render(
        <MigrationWrapper
          featureFlag="USE_CLEAN_ACCOUNT_FORM"
          featureFlagManager={featureFlagManager}
          legacyComponent={<View testID="legacy-account" />}
          cleanComponent={<View testID="clean-account" />}
        />
      );

      expect(getAccountTestId('legacy-account')).toBeTruthy();
    });
  });

  describe('error handling', () => {
    it('should fallback to legacy component on unknown flag', () => {
      const { getByTestId } = render(
        <MigrationWrapper
          featureFlag={'UNKNOWN_FLAG' as any}
          featureFlagManager={featureFlagManager}
          legacyComponent={<LegacyComponent />}
          cleanComponent={<CleanComponent />}
        />
      );

      expect(getByTestId('legacy-component')).toBeTruthy();
    });
  });
});
