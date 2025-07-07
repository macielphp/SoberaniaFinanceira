// Espaçamentos do Design System
const spacing = {
  xs: 4,    // 0.25rem
  sm: 8,    // 0.5rem
  md: 16,   // 1rem
  lg: 24,   // 1.5rem
  xl: 32,   // 2rem
  xxl: 48,  // 3rem
  xxxl: 64  // 4rem
};

const componentSpacing = {
  button: {
    horizontal: spacing.md,
    vertical: spacing.sm
  },
  card: {
    horizontal: spacing.md,
    vertical: spacing.md
  },
  form: {
    horizontal: spacing.md,
    vertical: spacing.lg
  },
  stackGap: spacing.sm,
  sectionGap: spacing.lg,
  screenPadding: spacing.md
};

export { spacing, componentSpacing };