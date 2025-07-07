// Estilos globais do Design System 
import { StyleSheet } from 'react-native';
import { colors, typography, spacing } from './themes';
import { shadowStyles } from './utils/shadows';

const GlobalStyles = StyleSheet.    create({
  // Containers
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  page: {
    backgroundColor: colors.background.paper,
    color: colors.text.primary,
    fontSize: typography.body1.fontSize,
    flex: 1,
  },
  // Tipografia
  title: {
    ...typography.h2,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  subTitle: {
    ...typography.h3,
    color: colors.text.primary,
  },
  description: {
    ...typography.body2,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  operationValue: {
    ...typography.currency,
  },
  // Cards
  cardContainer: {
    ...shadowStyles.elevation2,
    backgroundColor: colors.background.paper,
    borderRadius: 12,
    padding: spacing.lg,
    margin: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  // Utilitários
  marginBottom: {
    marginBottom: spacing.md,
  },
  paddingHorizontal: {
    paddingHorizontal: spacing.md,
  },
});

export default GlobalStyles;  