// Estilos de formulários do Design System
import { StyleSheet } from 'react-native';
import colors from '../themes/colors';
import { spacing, componentSpacing } from '../themes/spacing';
import typography from '../themes/typography';

const formStyles = StyleSheet.create({
  container: {
    padding: componentSpacing.form.horizontal,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
    backgroundColor: colors.background.default,
    minHeight: 44,
  },
  inputFocused: {
    borderColor: colors.secondary[500],
    borderWidth: 2,
  },
  inputError: {
    borderColor: colors.error[500],
  },
  label: {
    ...typography.body2,
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  errorText: {
    ...typography.caption,
    color: colors.error[500],
    marginTop: spacing.xs,
  },
});

export default formStyles;