import React from 'react';

export const NavigationContainer = ({ children }: { children: React.ReactNode }) => children;
export const useNavigation = () => ({
  navigate: jest.fn(),
  goBack: jest.fn(),
  reset: jest.fn(),
  setParams: jest.fn(),
  dispatch: jest.fn(),
  canGoBack: jest.fn(),
  isFocused: jest.fn(),
  addListener: jest.fn(),
  removeListener: jest.fn(),
});
export const useRoute = () => ({
  key: 'test-route',
  name: 'Test',
  params: {},
});
export const useFocusEffect = jest.fn();
export const useIsFocused = () => true;
