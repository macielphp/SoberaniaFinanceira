// Estilos de cards do Design System
import { StyleSheet } from 'react-native';
import colors from '../themes/colors';
import { componentSpacing, spacing } from '../themes/spacing';

const cardStyles = StyleSheet.create({
  base: {
    backgroundColor: colors.background.paper,
    borderRadius: 12,
    padding: componentSpacing.card.horizontal,
    marginBottom: spacing.sm,
    // Sombra básica
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  flat: {
    borderWidth: 1,
    borderColor: colors.gray[200],
    elevation: 0,
    shadowOpacity: 0,
  },
});

export default cardStyles;