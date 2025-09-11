import React from 'react';

export const Ionicons = ({ name, size, color }: { name: string; size: number; color: string }) => 
  React.createElement('View', { testID: `icon-${name}` });
