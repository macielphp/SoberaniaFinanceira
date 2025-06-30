// Com badge
```tsx
<MenuButton
  title="Gerenciar Operações"
  description="Visualizar e editar operações existentes"
  iconName="list"
  iconColor="#2196F3"
  badge={operations.length}
  onPress={() => setCurrentView('manage')}
/>
```

// Sem chevron
```tsx
<MenuButton
  title="Backup Completo"
  description="Fazendo backup dos dados..."
  iconName="cloud-upload"
  iconColor="#666"
  showChevron={false}
  disabled={true}
  onPress={() => {}}
/>
```

// Com estilo customizado
```tsx
<MenuButton
  title="Operação Especial"
  description="Funcionalidade premium"
  iconName="star"
  iconColor="#FFD700"
  style={{ borderColor: '#FFD700', borderWidth: 2 }}
  onPress={() => handlePremiumFeature()}
/>
```

// Usando componentes pré-configurados
```tsx
<PrimaryMenuButton
  title="Ação Principal"
  description="Botão verde padrão"
  iconName="checkmark-circle"
  onPress={() => {}}
/>
```