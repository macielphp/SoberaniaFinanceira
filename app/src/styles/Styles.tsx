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
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
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
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: colors.text.primary,
  },
  modalContent: {
    backgroundColor: colors.background.default,
    padding: spacing.lg,
    borderTopLeftRadius: spacing.md,
    borderTopRightRadius: spacing.md,
  },
  modalBody: {
    marginBottom: spacing.sm,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    gap: 10,
  },
  modalCloseButton: {
    padding: spacing.sm,
  },
  modalOption: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.gray[100],
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
});

export default GlobalStyles;  