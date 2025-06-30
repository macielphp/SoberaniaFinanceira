// components/MenuButton/MenuButton.tsx - Versão Avançada
import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from './Index'

interface MenuButtonProps {
  title: string;
  description: string;
  iconName: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  onPress: () => void;
  disabled?: boolean;
  badge?: string | number;
  badgeColor?: string;
  showChevron?: boolean;
  style?: ViewStyle;
  testID?: string;
}

export const MenuButton: React.FC<MenuButtonProps> = ({
  title,
  description,
  iconName,
  iconColor,
  onPress,
  disabled = false,
  badge,
  badgeColor = '#2196F3',
  showChevron = true,
  style,
  testID
}) => {
  return (
    <TouchableOpacity 
      style={[styles.menuButton, disabled && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      testID={testID}
    >
      <View style={styles.buttonContent}>
        <Ionicons 
          name={iconName} 
          size={24} 
          color={disabled ? '#ccc' : iconColor} 
        />
        <View style={styles.buttonTextContainer}>
          <Text style={[styles.buttonTitle, disabled && styles.disabledText]}>
            {title}
          </Text>
          <Text style={[styles.buttonDescription, disabled && styles.disabledText]}>
            {description}
          </Text>
        </View>
        
        {/* Badge opcional */}
        {badge && (
          <View style={[styles.badge, { backgroundColor: badgeColor }]}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
        
        {/* Chevron opcional */}
        {showChevron && (
          <Ionicons 
            name="chevron-forward" 
            size={18} 
            color={disabled ? '#ccc' : '#666'} 
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

// Tipos para facilitar o uso
export type MenuButtonIconName = keyof typeof Ionicons.glyphMap;

// Componente pré-configurado para casos comuns
export const PrimaryMenuButton: React.FC<Omit<MenuButtonProps, 'iconColor'>> = (props) => (
  <MenuButton {...props} iconColor="#4CAF50" />
);

export const SecondaryMenuButton: React.FC<Omit<MenuButtonProps, 'iconColor'>> = (props) => (
  <MenuButton {...props} iconColor="#2196F3" />
);

export const WarningMenuButton: React.FC<Omit<MenuButtonProps, 'iconColor'>> = (props) => (
  <MenuButton {...props} iconColor="#FF9800" />
);