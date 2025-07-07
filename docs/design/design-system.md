# Design System - Soberania Financeira

## Filosofia de Design

O design system do **Soberania Financeira** prioriza:
- **Consistência**: Padrões visuais uniformes em toda a aplicação
- **Escalabilidade**: Componentes reutilizáveis e facilmente extensíveis
- **Manutenibilidade**: Código organizado e fácil de modificar
- **Acessibilidade**: Interfaces inclusivas para todos os usuários

## Estratégia de Estilização

### Abordagem Híbrida Recomendada

Com base na análise do código atual, recomendo uma **abordagem híbrida** que combina:

1. **GlobalStyles** para estilos compartilhados e padrões visuais
2. **Component-Level Styles** para estilos específicos e personalizações
3. **Theme System** para gerenciamento de cores, tipografia e espaçamentos

### Estrutura Proposta

```
src/styles/
├── GlobalStyles.ts          # Estilos globais existentes (refatorado)
├── theme/
│   ├── colors.ts           # Paleta de cores
│   ├── typography.ts       # Tipografia
│   ├── spacing.ts          # Espaçamentos
│   └── index.ts           # Exportação do tema
├── components/
│   ├── buttons.ts          # Estilos de botões
│   ├── cards.ts           # Estilos de cards
│   ├── forms.ts           # Estilos de formulários
│   └── index.ts           # Exportação dos componentes
└── utils/
    ├── shadows.ts          # Sombras padronizadas
    └── dimensions.ts       # Dimensões e breakpoints
```

## Paleta de Cores

### Cores Principais

```typescript
export const colors = {
  primary: {
    50: '#E8F5E8',
    100: '#C8E6C8',
    500: '#4CAF50',  // Verde principal (receitas)
    600: '#43A047',
    700: '#388E3C',
    900: '#1B5E20'
  },
  secondary: {
    50: '#E3F2FD',
    100: '#BBDEFB',
    500: '#2196F3',  // Azul principal (navegação)
    600: '#1E88E5',
    700: '#1976D2',
    900: '#0D47A1'
  },
  error: {
    50: '#FFEBEE',
    100: '#FFCDD2',
    500: '#F44336',  // Vermelho (despesas/erros)
    600: '#E53935',
    700: '#D32F2F',
    900: '#B71C1C'
  },
  warning: {
    50: '#FFF3E0',
    500: '#FF9800',  // Laranja (configurações)
    600: '#FB8C00',
    700: '#F57C00'
  },
  success: {
    50: '#E8F5E8',
    500: '#4CAF50',
    600: '#43A047'
  },
  // Cores neutras
  gray: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#666666',
    700: '#424242',
    800: '#333333',
    900: '#212121'
  },
  // Cores semânticas
  background: {
    default: '#FFFFFF',
    paper: '#FAFAFA',
    disabled: '#F5F5F5'
  },
  text: {
    primary: '#333333',
    secondary: '#666666',
    disabled: '#BDBDBD',
    inverse: '#FFFFFF'
  }
};
```

### Cores Funcionais

```typescript
export const functionalColors = {
  revenue: colors.primary[500],      // Verde para receitas
  expense: colors.error[500],        // Vermelho para despesas
  pending: colors.warning[500],      // Laranja para pendente
  completed: colors.success[500],    // Verde para concluído
  cancelled: colors.gray[500],       // Cinza para cancelado
  
  // Estados
  hover: colors.gray[100],
  pressed: colors.gray[200],
  focused: colors.secondary[100],
  disabled: colors.gray[300]
};
```

## Tipografia

### Hierarquia de Textos

```typescript
export const typography = {
  // Títulos
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
  
  // Corpo do texto
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
  
  // Textos especiais
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
  
  // Valores monetários
  currency: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    lineHeight: 24,
    fontFamily: 'monospace'
  }
};
```

## Espaçamentos

### Sistema de Espaçamento Base-8

```typescript
export const spacing = {
  xs: 4,    // 0.25rem
  sm: 8,    // 0.5rem
  md: 16,   // 1rem
  lg: 24,   // 1.5rem
  xl: 32,   // 2rem
  xxl: 48,  // 3rem
  xxxl: 64  // 4rem
};

// Espaçamentos específicos para componentes
export const componentSpacing = {
  // Padding interno de componentes
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
  
  // Margens entre elementos
  stackGap: spacing.sm,      // 8px entre elementos em stack
  sectionGap: spacing.lg,    // 24px entre seções
  screenPadding: spacing.md  // 16px padding das telas
};
```

## Componentes Base

### Botões

```typescript
export const buttonStyles = {
  base: {
    borderRadius: 8,
    paddingHorizontal: componentSpacing.button.horizontal,
    paddingVertical: componentSpacing.button.vertical,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    flexDirection: 'row' as const,
    minHeight: 44 // Tamanho mínimo para acessibilidade
  },
  
  // Variações
  primary: {
    backgroundColor: colors.primary[500],
    ...shadowStyles.elevation2
  },
  secondary: {
    backgroundColor: colors.secondary[500],
    ...shadowStyles.elevation2
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary[500]
  },
  text: {
    backgroundColor: 'transparent',
    paddingHorizontal: spacing.sm
  },
  
  // Estados
  disabled: {
    backgroundColor: colors.gray[300],
    opacity: 0.6
  },
  pressed: {
    opacity: 0.8
  }
};
```

### Cards

```typescript
export const cardStyles = {
  base: {
    backgroundColor: colors.background.paper,
    borderRadius: 12,
    padding: componentSpacing.card.horizontal,
    marginBottom: spacing.sm,
    ...shadowStyles.elevation2
  },
  
  // Variações
  elevated: {
    ...shadowStyles.elevation4
  },
  flat: {
    borderWidth: 1,
    borderColor: colors.gray[200],
    elevation: 0,
    shadowOpacity: 0
  }
};
```

### Formulários

```typescript
export const formStyles = {
  container: {
    padding: componentSpacing.form.horizontal
  },
  
  input: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
    backgroundColor: colors.background.default,
    minHeight: 44
  },
  
  inputFocused: {
    borderColor: colors.secondary[500],
    borderWidth: 2
  },
  
  inputError: {
    borderColor: colors.error[500]
  },
  
  label: {
    ...typography.body2,
    marginBottom: spacing.xs,
    fontWeight: '600'
  },
  
  errorText: {
    ...typography.caption,
    color: colors.error[500],
    marginTop: spacing.xs
  }
};
```

## Sombras e Elevações

```typescript
export const shadowStyles = {
  elevation1: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1
  },
  elevation2: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  elevation3: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3
  },
  elevation4: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4
  }
};
```

## GlobalStyles Refatorado

### Estrutura Proposta para GlobalStyles.ts

```typescript
import { StyleSheet } from 'react-native';
import { colors, typography, spacing, shadowStyles } from './theme';

export const GlobalStyles = StyleSheet.create({
  // Containers
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  
  screenContainer: {
    flex: 1,
    padding: spacing.md,
    backgroundColor: colors.background.default,
  },
  
  // Tipografia
  title: {
    ...typography.h2,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  
  subtitle: {
    ...typography.h3,
    marginBottom: spacing.md,
  },
  
  description: {
    ...typography.body2,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  
  // Textos específicos
  operationValue: {
    ...typography.currency,
  },
  
  // Layouts
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  column: {
    flexDirection: 'column',
  },
  
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  spaceBetween: {
    justifyContent: 'space-between',
  },
  
  // Cards e componentes
  card: {
    ...cardStyles.base,
  },
  
  // Estados
  disabled: {
    opacity: 0.6,
  },
  
  // Utilitários
  marginBottom: {
    marginBottom: spacing.md,
  },
  
  paddingHorizontal: {
    paddingHorizontal: spacing.md,
  },
});
```

## Convenções de Uso

### 1. Prioridade de Estilos

1. **GlobalStyles**: Para estilos comuns e reutilizáveis
2. **Theme Objects**: Para valores sistemáticos (cores, tipografia, espaçamentos)
3. **Component Styles**: Para estilos específicos do componente
4. **Inline Styles**: Apenas para valores dinâmicos ou casos excepcionais

### 2. Nomenclatura

```typescript
// ✅ Bom
const styles = StyleSheet.create({
  container: { /* ... */ },
  header: { /* ... */ },
  actionButton: { /* ... */ }
});

// ❌ Evitar
const styles = StyleSheet.create({
  view1: { /* ... */ },
  btn: { /* ... */ },
  redText: { /* ... */ } // Usar cores do tema
});
```

### 3. Exemplo de Uso no Componente

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GlobalStyles } from '../../styles/GlobalStyles';
import { colors, spacing, typography } from '../../styles/theme';

export const ExampleComponent: React.FC = () => {
  return (
    <View style={[GlobalStyles.container, styles.customContainer]}>
      <Text style={GlobalStyles.title}>Título</Text>
      <Text style={styles.customText}>Texto personalizado</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  customContainer: {
    paddingTop: spacing.xl,
  },
  customText: {
    ...typography.body1,
    color: colors.primary[600],
  },
});
```

## Responsividade

### Breakpoints

```typescript
export const breakpoints = {
  sm: 320,  // Telas pequenas
  md: 768,  // Tablets
  lg: 1024, // Tablets grandes
  xl: 1200  // Desktop (se aplicável)
};
```

### Uso Responsivo

```typescript
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const isSmallScreen = width < breakpoints.md;

const styles = StyleSheet.create({
  container: {
    padding: isSmallScreen ? spacing.sm : spacing.md,
  },
});
```

## Acessibilidade

### Diretrizes

1. **Tamanho Mínimo**: Elementos tocáveis devem ter pelo menos 44px
2. **Contraste**: Seguir WCAG 2.1 (mínimo 4.5:1 para textos)
3. **Semântica**: Usar cores + ícones/texto para comunicar estado
4. **Densidade**: Espaçamento adequado entre elementos

### Cores Acessíveis

```typescript
// Combinações testadas para contraste adequado
export const accessibleCombinations = {
  primaryOnWhite: {
    background: colors.background.default,
    text: colors.primary[700] // Contraste 4.5:1+
  },
  errorOnWhite: {
    background: colors.background.default,
    text: colors.error[700] // Contraste 4.5:1+
  }
};
```

## Implementação Gradual

### Fase 1: Refatoração do GlobalStyles
1. Mover valores hardcoded para o tema
2. Criar tokens de design consistentes
3. Padronizar espaçamentos e cores

### Fase 2: Componentização
1. Criar biblioteca de componentes base
2. Implementar variações dos componentes
3. Documentar padrões de uso

### Fase 3: Otimização
1. Implementar tema dinâmico (dark/light)
2. Adicionar animações padronizadas
3. Melhorar responsividade

## Ferramentas Recomendadas

### Desenvolvimento
- **React Native Debugger**: Para inspecionar estilos
- **Flipper**: Para debug de performance
- **Storybook**: Para documentação de componentes

### Design
- **Figma**: Para tokens de design
- **Zeplin**: Para specs de desenvolvimento
- **Contrast Checker**: Para validação de acessibilidade
