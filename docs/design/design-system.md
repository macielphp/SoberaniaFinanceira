# Design System - Soberania Financeira (Clean Architecture + TDD)

## 🎨 Filosofia de Design

O design system do **Soberania Financeira** implementa **Clean Architecture** e **TDD** para priorizar:
- **Consistência**: Padrões visuais uniformes em toda a aplicação
- **Escalabilidade**: Componentes reutilizáveis e facilmente extensíveis
- **Manutenibilidade**: Código organizado e fácil de modificar
- **Acessibilidade**: Interfaces inclusivas para todos os usuários
- **Testabilidade**: Componentes puros e isolados para testes

## 🏗️ Estratégia de Estilização (Clean Architecture)

### Abordagem Híbrida Recomendada

Com base na **Clean Architecture**, recomendo uma **abordagem híbrida** que combina:

1. **GlobalStyles** para estilos compartilhados e padrões visuais
2. **Component-Level Styles** para estilos específicos e personalizações
3. **Theme System** para gerenciamento de cores, tipografia e espaçamentos

### Estrutura Proposta (Clean Architecture)

```
src/clean-architecture/presentation/
├── pure-components/          # 🎨 Componentes puros
│   ├── AlertCard.tsx
│   ├── BudgetCard.tsx
│   ├── GoalCard.tsx
│   ├── OperationForm.tsx
│   └── styles/              # Estilos dos componentes puros
│       ├── AlertCard.styles.ts
│       ├── BudgetCard.styles.ts
│       └── OperationForm.styles.ts
├── screens/                 # 📱 Telas (composição)
│   ├── HomeScreen.tsx
│   ├── RegisterScreen.tsx
│   └── styles/             # Estilos das telas
│       ├── HomeScreen.styles.ts
│       └── RegisterScreen.styles.ts
└── shared/                 # 🔧 Recursos compartilhados
    ├── theme/
    │   ├── colors.ts       # Paleta de cores
    │   ├── typography.ts   # Tipografia
    │   ├── spacing.ts      # Espaçamentos
    │   └── index.ts        # Exportação do tema
    ├── components/
    │   ├── buttons.ts      # Estilos de botões
    │   ├── cards.ts        # Estilos de cards
    │   ├── forms.ts        # Estilos de formulários
    │   └── index.ts        # Exportação dos componentes
    └── utils/
        ├── shadows.ts      # Sombras padronizadas
        └── dimensions.ts   # Dimensões e breakpoints
```

## 🎨 Paleta de Cores

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
    500: '#FF9800',  // Laranja (alertas/configurações)
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
    disabled: '#9E9E9E'
  }
};
```

## 🧪 Estratégia de Testes (TDD)

### 📋 Testes de Componentes Puros

```typescript
// AlertCard.test.tsx
describe('AlertCard', () => {
  it('should render alert with correct severity color', () => {
    const alert = {
      id: 'alert-123',
      type: 'low_balance',
      severity: 'warning',
      message: 'Saldo baixo',
      value: new Money(50, 'BRL')
    };
    
    render(<AlertCard alert={alert} onDismiss={jest.fn()} />);
    
    const card = screen.getByTestId('alert-card');
    expect(card).toHaveStyle({ borderLeftColor: colors.warning[500] });
  });

  it('should call onDismiss when dismiss button is pressed', () => {
    const onDismiss = jest.fn();
    const alert = { /* ... */ };
    
    render(<AlertCard alert={alert} onDismiss={onDismiss} />);
    
    const dismissButton = screen.getByTestId('dismiss-button');
    fireEvent.press(dismissButton);
    
    expect(onDismiss).toHaveBeenCalledWith(alert.id);
  });
});

// BudgetCard.test.tsx
describe('BudgetCard', () => {
  it('should display budget performance correctly', () => {
    const budget = {
      id: 'budget-123',
      name: 'Orçamento Janeiro',
      totalPlannedValue: new Money(5000, 'BRL'),
      totalActualValue: new Money(4500, 'BRL')
    };
    
    render(<BudgetCard budget={budget} onPress={jest.fn()} />);
    
    expect(screen.getByText('Orçamento Janeiro')).toBeInTheDocument();
    expect(screen.getByText('R$ 5.000,00')).toBeInTheDocument();
    expect(screen.getByText('90%')).toBeInTheDocument(); // 4500/5000
  });
});
```

### 📋 Testes de Estilos

```typescript
// AlertCard.styles.test.ts
describe('AlertCard Styles', () => {
  it('should have correct warning styles', () => {
    const styles = getAlertCardStyles('warning');
    
    expect(styles.container.borderLeftColor).toBe(colors.warning[500]);
    expect(styles.icon.color).toBe(colors.warning[500]);
  });

  it('should have correct error styles', () => {
    const styles = getAlertCardStyles('error');
    
    expect(styles.container.borderLeftColor).toBe(colors.error[500]);
    expect(styles.icon.color).toBe(colors.error[500]);
  });
});
```

## 🎨 Componentes Puros (Clean Architecture)

### 📱 AlertCard Component

```typescript
// AlertCard.tsx
export const AlertCard: React.FC<AlertCardProps> = ({
  alert,
  onDismiss,
  onPress
}) => {
  const styles = useAlertCardStyles(alert.severity);
  
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={() => onPress?.(alert.id)}
      testID="alert-card"
    >
      <View style={styles.content}>
        <Text style={styles.icon}>{getAlertIcon(alert.type)}</Text>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{alert.message}</Text>
          <Text style={styles.value}>
            R$ {alert.value.format()}
          </Text>
        </View>
      </View>
      <TouchableOpacity 
        style={styles.dismissButton}
        onPress={() => onDismiss(alert.id)}
        testID="dismiss-button"
      >
        <Text style={styles.dismissText}>✕</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

// AlertCard.styles.ts
export const useAlertCardStyles = (severity: AlertSeverity) => {
  const baseStyles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: colors.background.paper,
      borderRadius: 8,
      borderLeftWidth: 4,
      marginVertical: 4,
      shadowColor: colors.gray[900],
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    icon: {
      fontSize: 24,
      marginRight: 12,
    },
    textContainer: {
      flex: 1,
    },
    title: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text.primary,
      marginBottom: 2,
    },
    value: {
      fontSize: 14,
      color: colors.text.secondary,
      fontFamily: 'monospace',
    },
    dismissButton: {
      padding: 8,
    },
    dismissText: {
      fontSize: 16,
      color: colors.text.secondary,
    },
  });

  const severityStyles = {
    warning: {
      container: {
        borderLeftColor: colors.warning[500],
      },
      icon: {
        color: colors.warning[500],
      },
    },
    error: {
      container: {
        borderLeftColor: colors.error[500],
      },
      icon: {
        color: colors.error[500],
      },
    },
  };

  return {
    ...baseStyles,
    container: [baseStyles.container, severityStyles[severity].container],
    icon: [baseStyles.icon, severityStyles[severity].icon],
  };
};
```

### 📱 BudgetCard Component

```typescript
// BudgetCard.tsx
export const BudgetCard: React.FC<BudgetCardProps> = ({
  budget,
  onPress,
  onEdit,
  onDelete
}) => {
  const styles = useBudgetCardStyles();
  const performance = calculateBudgetPerformance(budget);
  
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={() => onPress?.(budget.id)}
      testID="budget-card"
    >
      <View style={styles.header}>
        <Text style={styles.name}>{budget.name}</Text>
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => onEdit?.(budget.id)}>
            <Text style={styles.actionText}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onDelete?.(budget.id)}>
            <Text style={styles.actionText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.content}>
        <View style={styles.valueRow}>
          <Text style={styles.label}>Planejado:</Text>
          <Text style={styles.value}>
            R$ {budget.totalPlannedValue.format()}
          </Text>
        </View>
        
        <View style={styles.valueRow}>
          <Text style={styles.label}>Realizado:</Text>
          <Text style={styles.value}>
            R$ {budget.totalActualValue?.format() || '0,00'}
          </Text>
        </View>
        
        <View style={styles.performanceRow}>
          <Text style={styles.performanceLabel}>Performance:</Text>
          <Text style={[
            styles.performanceValue,
            { color: performance.color }
          ]}>
            {performance.percentage}%
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};
```

## 🔧 Tema Compartilhado

### 🎨 Theme Provider

```typescript
// theme/index.ts
export const theme = {
  colors,
  typography: {
    h1: { fontSize: 32, fontWeight: 'bold' },
    h2: { fontSize: 24, fontWeight: '600' },
    h3: { fontSize: 20, fontWeight: '600' },
    body: { fontSize: 16, fontWeight: 'normal' },
    caption: { fontSize: 14, fontWeight: 'normal' },
    button: { fontSize: 16, fontWeight: '600' },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
  },
  shadows: {
    sm: {
      shadowColor: colors.gray[900],
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: colors.gray[900],
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    lg: {
      shadowColor: colors.gray[900],
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5,
    },
  },
};

// ThemeProvider.tsx
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

// useTheme.ts
export const useTheme = () => {
  const theme = useContext(ThemeContext);
  if (!theme) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return theme;
};
```

## 📱 Responsividade

### 📐 Breakpoints

```typescript
// dimensions.ts
export const dimensions = {
  screen: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  breakpoints: {
    small: 375,
    medium: 768,
    large: 1024,
  },
  isSmallScreen: () => Dimensions.get('window').width < 375,
  isMediumScreen: () => Dimensions.get('window').width >= 375 && Dimensions.get('window').width < 768,
  isLargeScreen: () => Dimensions.get('window').width >= 768,
};
```

### 📱 Componentes Responsivos

```typescript
// ResponsiveCard.tsx
export const ResponsiveCard: React.FC<ResponsiveCardProps> = ({ children, style }) => {
  const theme = useTheme();
  const isLargeScreen = dimensions.isLargeScreen();
  
  const responsiveStyles = StyleSheet.create({
    container: {
      backgroundColor: colors.background.paper,
      borderRadius: theme.borderRadius.lg,
      padding: isLargeScreen ? theme.spacing.xl : theme.spacing.lg,
      margin: isLargeScreen ? theme.spacing.lg : theme.spacing.md,
      ...theme.shadows.md,
      ...style,
    },
  });
  
  return (
    <View style={responsiveStyles.container}>
      {children}
    </View>
  );
};
```

## 🧪 Testes de Design System

### 📋 Testes de Tema

```typescript
// theme.test.ts
describe('Theme', () => {
  it('should have consistent color palette', () => {
    expect(colors.primary[500]).toBe('#4CAF50');
    expect(colors.error[500]).toBe('#F44336');
    expect(colors.warning[500]).toBe('#FF9800');
  });

  it('should have proper typography scale', () => {
    expect(theme.typography.h1.fontSize).toBe(32);
    expect(theme.typography.body.fontSize).toBe(16);
    expect(theme.typography.caption.fontSize).toBe(14);
  });

  it('should have consistent spacing scale', () => {
    expect(theme.spacing.xs).toBe(4);
    expect(theme.spacing.md).toBe(16);
    expect(theme.spacing.xl).toBe(32);
  });
});
```

### 📋 Testes de Responsividade

```typescript
// ResponsiveCard.test.tsx
describe('ResponsiveCard', () => {
  it('should apply large screen styles when screen is wide', () => {
    // Mock large screen
    Dimensions.get = jest.fn().mockReturnValue({ width: 1024, height: 768 });
    
    render(<ResponsiveCard>Content</ResponsiveCard>);
    
    const card = screen.getByTestId('responsive-card');
    expect(card).toHaveStyle({ padding: 32 }); // xl spacing
  });

  it('should apply small screen styles when screen is narrow', () => {
    // Mock small screen
    Dimensions.get = jest.fn().mockReturnValue({ width: 375, height: 667 });
    
    render(<ResponsiveCard>Content</ResponsiveCard>);
    
    const card = screen.getByTestId('responsive-card');
    expect(card).toHaveStyle({ padding: 24 }); // lg spacing
  });
});
```

## 📊 Status da Implementação

### ✅ Concluído
- **Paleta de Cores**: Definida e documentada
- **Tema Base**: Estrutura criada
- **Componentes Puros**: AlertCard, BudgetCard implementados
- **Testes**: Estratégia de testes definida

### 🚧 Em Andamento
- **Tema Provider**: Implementação completa
- **Componentes Responsivos**: Implementação
- **Testes de Design**: Implementação completa

### 📋 Próximos Passos
1. Implementar ThemeProvider completo
2. Criar todos os componentes puros
3. Implementar testes de design system
4. Documentar padrões de uso

## 📚 Documentação Relacionada

- [System Architecture](../architecture/system-architecture.md) - Arquitetura geral
- [UI Components](./ui-components.md) - Componentes específicos
- [Screens Wireframes](./screens-wireframes.md) - Wireframes das telas
- [Clean Architecture Guide](../clean_architecture/5-step%20of%20understanding) - Guia detalhado
