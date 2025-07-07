// Estilos de botões do Design System
import { StyleSheet } from 'react-native';
import colors from '../themes/colors';
import { componentSpacing, spacing } from '../themes/spacing';

const buttonStyles = StyleSheet.create({
  base: {
    borderRadius: 8,
    paddingHorizontal: componentSpacing.button.horizontal,
    paddingVertical: componentSpacing.button.vertical,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    minHeight: 44,
  },
  primary: {
    backgroundColor: colors.primary[500],
  },
  secondary: {
    backgroundColor: colors.secondary[500],
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary[500],
  },
  text: {
    backgroundColor: 'transparent',
    paddingHorizontal: spacing.sm,
  },
  disabled: {
    backgroundColor: colors.gray[300],
    opacity: 0.6,
  },
  pressed: {
    opacity: 0.8,
  },
});

export default buttonStyles;