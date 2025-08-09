import React from 'react';
import { FeatureFlags, IFeatureFlagManager } from '../feature-flags/FeatureFlags';

interface MigrationWrapperProps {
  featureFlag: FeatureFlags;
  featureFlagManager: IFeatureFlagManager;
  legacyComponent: React.ReactElement;
  cleanComponent: React.ReactElement;
}

export const MigrationWrapper: React.FC<MigrationWrapperProps> = ({
  featureFlag,
  featureFlagManager,
  legacyComponent,
  cleanComponent
}) => {
  const isCleanArchitectureEnabled = featureFlagManager.isEnabled(featureFlag);

  return isCleanArchitectureEnabled ? cleanComponent : legacyComponent;
};
