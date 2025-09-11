import React from 'react';

export const createBottomTabNavigator = () => ({
  Navigator: ({ children }: { children: React.ReactNode }) => children,
  Screen: ({ children }: { children: React.ReactNode }) => children,
});
