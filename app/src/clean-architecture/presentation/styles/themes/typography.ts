// Tipografia do Design System
import colors from './colors';

const typography = {
  h1: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    lineHeight: 40,
    letterSpacing: -0.5,
    color: colors.text.primary
  },
  h2: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    lineHeight: 32,
    letterSpacing: -0.25,
    color: colors.text.primary
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
    color: colors.text.primary
  },
  h4: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
    color: colors.text.primary
  },
  body1: {
    fontSize: 16,
    fontWeight: 'normal' as const,
    lineHeight: 24,
    color: colors.text.primary
  },
  body2: {
    fontSize: 14,
    fontWeight: 'normal' as const,
    lineHeight: 20,
    color: colors.text.secondary
  },
  caption: {
    fontSize: 12,
    fontWeight: 'normal' as const,
    lineHeight: 16,
    color: colors.text.secondary
  },
  overline: {
    fontSize: 10,
    fontWeight: '600' as const,
    lineHeight: 16,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
    color: colors.text.secondary
  },
  currency: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    lineHeight: 24,
    fontFamily: 'monospace'
  }
};

export default typography;