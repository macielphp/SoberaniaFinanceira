# �� **DOCUMENTAÇÃO DETALHADA - ACCOUNTS.TSX**

## �� **VISÃO GERAL**

O arquivo `Accounts.tsx` é uma tela especializada para gerenciamento completo de contas financeiras. Implementa uma interface moderna e intuitiva para visualizar, filtrar, ordenar e gerenciar contas próprias, com foco na experiência do usuário e na segurança das operações.

---

## ��️ **ARQUITETURA E ESTRUTURA**

### **📦 Imports e Dependências**

```typescript
// React e React Native
import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  RefreshControl,
  Alert,
  Modal
} from 'react-native';

// Componentes de UI
import { Ionicons } from '@expo/vector-icons';

// Componentes internos
import Layout from '../../components/Layout/Layout';
import AccountCard from '../../components/AccountCard/AccountCard';
import AppModal from '../../components/AppModal/AppModal';

// Contextos e serviços
import { useFinance } from '../../contexts/FinanceContext';
import { AccountService, AccountBalance } from '../../services/AccountService';

// Tipos e estilos
import { Account } from '../../database/accounts';
import { colors, spacing, typography } from '../../styles/themes';
```

### **🎛️ Tipos e Interfaces**

```typescript
type SortOption = 'name' | 'balance' | 'type' | 'lastTransaction';
type FilterOption = 'all' | 'propria' | 'positive' | 'negative';

interface AccountsProps {
  navigation?: any;
}
```

---

## 🎯 **FUNCIONALIDADES PRINCIPAIS**

### **1. 📊 VISUALIZAÇÃO DE CONTAS**

#### ** Estados Principais**
```typescript
const [refreshing, setRefreshing] = useState(false);
const [sortBy, setSortBy] = useState<SortOption>('name');
const [filterBy, setFilterBy] = useState<FilterOption>('all');
const [showFilters, setShowFilters] = useState(false);
const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
const [showAccountDetails, setShowAccountDetails] = useState(false);
```

#### **💰 Cálculo de Saldos**
```typescript
const accountsBalance = AccountService.getAccountsBalance(accounts, operations);
// Calcular saldo total apenas das contas próprias
const ownAccounts = accounts.filter(account => account.type === 'propria');
const totalBalance = AccountService.getTotalBalance(ownAccounts, operations);
```

**Lógica de Filtragem:**
- **Foco em contas próprias**: Apenas contas do tipo 'propria' são exibidas
- **Cálculo de saldo total**: Soma dos saldos de todas as contas próprias
- **Exclusão de contas externas**: Contas externas não são consideradas para saldo total

---

### **2. �� SISTEMA DE FILTROS E ORDENAÇÃO**

#### **🔄 Função de Ordenação Inteligente**
```typescript
const getSortedAccounts = useCallback(() => {
  // Filtrar apenas contas próprias por padrão
  let sorted = accounts.filter(account => account.type === 'propria');

  // Aplicar filtros adicionais
  switch (filterBy) {
    case 'propria':
      // Já filtrado acima, manter todas as próprias
      break;
    case 'positive':
      sorted = sorted.filter(account => {
        const balance = accountsBalance.find(b => b.accountId === account.id);
        return balance && balance.currentBalance > 0;
      });
      break;
    case 'negative':
      sorted = sorted.filter(account => {
        const balance = accountsBalance.find(b => b.accountId === account.id);
        return balance && balance.currentBalance < 0;
      });
      break;
  }

  // Aplicar ordenação
  switch (sortBy) {
    case 'name':
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'balance':
      sorted.sort((a, b) => {
        const balanceA = accountsBalance.find(bal => bal.accountId === a.id)?.currentBalance || 0;
        const balanceB = accountsBalance.find(bal => bal.accountId === b.id)?.currentBalance || 0;
        return balanceB - balanceA; // Maior saldo primeiro
      });
      break;
    case 'type':
      sorted.sort((a, b) => a.type.localeCompare(b.type));
      break;
    case 'lastTransaction':
      sorted.sort((a, b) => {
        const lastA = accountsBalance.find(bal => bal.accountId === a.id)?.lastTransaction || '';
        const lastB = accountsBalance.find(bal => bal.accountId === b.id)?.lastTransaction || '';
        return new Date(lastB).getTime() - new Date(lastA).getTime();
      });
      break;
  }

  return sorted;
}, [accounts, accountsBalance, sortBy, filterBy]);
```

#### **🎛️ Opções de Filtro**
- **Todas**: Mostra todas as contas próprias
- **Próprias**: Filtro redundante (já é o padrão)
- **Saldo Positivo**: Apenas contas com saldo > 0
- **Saldo Negativo**: Apenas contas com saldo < 0

#### **📊 Opções de Ordenação**
- **Nome**: Ordem alfabética
- **Saldo**: Maior saldo primeiro
- **Tipo**: Ordem alfabética por tipo
- **Última Transação**: Mais recente primeiro

---

### **3. ✏️ SISTEMA DE EDIÇÃO SEGURO**

#### **🔒 Remoção de Funcionalidades Perigosas**
```typescript
// ANTES (removido por segurança):
// - Swipeable deprecated
// - Botão de excluir no swipe
// - Opção de excluir no menu de long press

// AGORA (implementação segura):
const handleEditAccount = (account: Account) => {
  console.log('Editar conta:', account.name);
  console.log('Navegando para Register com params:', { editingAccount: account });
  navigation?.navigate('Register', { 
    screen: 'accounts',
    params: { editingAccount: account }
  });
};
```

**Justificativas de Segurança:**
- **Prevenção de exclusão acidental**: Contas podem ter operações vinculadas
- **Integridade dos dados**: Exclusão pode quebrar relatórios
- **Experiência do usuário**: Foco na edição, não na exclusão

#### **🎯 Interface de Edição**
```typescript
{/* Botão de editar flutuante */}
<TouchableOpacity
  style={styles.editButton}
  onPress={() => handleEditAccount(account)}
>
  <Ionicons name="pencil" size={16} color={colors.primary[500]} />
</TouchableOpacity>
```

**Características:**
- **Posicionamento flutuante**: Canto superior direito de cada conta
- **Design elegante**: Sombra, borda e ícone de lápis
- **Acesso rápido**: Sem necessidade de swipe ou long press

---

### **4. �� INTERAÇÕES AVANÇADAS**

#### **�� Pull to Refresh**
```typescript
const onRefresh = useCallback(async () => {
  setRefreshing(true);
  // Simular atualização
  setTimeout(() => {
    setRefreshing(false);
  }, 1000);
}, []);

// Implementação no ScrollView
<ScrollView 
  style={styles.accountsList}
  refreshControl={
    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
  }
>
```

#### **�� Long Press Menu**
```typescript
const handleLongPress = (account: Account) => {
  Alert.alert(
    account.name,
    'Escolha uma ação:',
    [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Ver Detalhes', onPress: () => setSelectedAccount(account) },
      { text: 'Editar', onPress: () => handleEditAccount(account) },
      { text: 'Transferir', onPress: () => console.log('Transferir:', account.name) }
    ]
  );
};
```

**Opções Disponíveis:**
- **Ver Detalhes**: Abre modal com informações detalhadas
- **Editar**: Navega para tela de edição
- **Transferir**: Funcionalidade futura para transferência rápida

#### **⚡ Transferência Rápida**
```typescript
const handleQuickTransfer = (fromAccount: Account) => {
  const ownAccounts = accounts.filter(acc => acc.type === 'propria' && acc.id !== fromAccount.id);
  
  if (ownAccounts.length === 0) {
    Alert.alert('Aviso', 'Não há outras contas próprias para transferir');
    return;
  }

  Alert.alert(
    'Transferência Rápida',
    'Escolha a conta de destino:',
    [
      { text: 'Cancelar', style: 'cancel' },
      ...ownAccounts.map(account => ({
        text: account.name,
        onPress: () => {
          console.log(`Transferir de ${fromAccount.name} para ${account.name}`);
        }
      }))
    ]
  );
};
```

---

### **5. 🎨 INTERFACE DE USUÁRIO**

#### **📊 Header com Informações**
```typescript
{/* Header */}
<View style={styles.header}>
  <Text style={styles.title}>Minhas Contas Próprias</Text>
  <View style={styles.headerActions}>
    <TouchableOpacity 
      style={styles.filterButton}
      onPress={() => setShowFilters(true)}
    >
      <Ionicons name="filter" size={20} color={colors.primary[500]} />
    </TouchableOpacity>
    <TouchableOpacity 
      style={styles.addButton}
      onPress={() => navigation?.navigate('Register', { screen: 'accounts' })}
    >
      <Ionicons name="add" size={24} color={colors.text.inverse} />
    </TouchableOpacity>
  </View>
</View>
```

#### **💰 Card de Saldo Total**
```typescript
{/* Total Balance */}
<View style={styles.totalBalanceCard}>
  <Text style={styles.totalBalanceLabel}>Saldo Total</Text>
  <Text style={[styles.totalBalanceValue, { 
    color: totalBalance >= 0 ? colors.success[600] : colors.error[600] 
  }]}>
    {AccountService.formatCurrency(totalBalance)}
  </Text>
  <Text style={styles.totalBalanceSubtitle}>
    {accounts.filter(a => a.type === 'propria').length} contas próprias
  </Text>
</View>
```

**Características:**
- **Cores dinâmicas**: Verde para saldo positivo, vermelho para negativo
- **Formatação monetária**: Usa `AccountService.formatCurrency()`
- **Contador de contas**: Mostra número total de contas próprias

---

### **6. 🔍 MODAL DE FILTROS**

#### **��️ Interface de Filtros**
```typescript
<AppModal
  visible={showFilters}
  onRequestClose={() => setShowFilters(false)}
  title="Filtros e Ordenação"
>
  <View style={styles.filtersContent}>
    <Text style={styles.filterSectionTitle}>Ordenar por:</Text>
    <View style={styles.filterOptions}>
      {[
        { key: 'name', label: 'Nome', icon: 'text' },
        { key: 'balance', label: 'Saldo', icon: 'cash' },
        { key: 'type', label: 'Tipo', icon: 'card' },
        { key: 'lastTransaction', label: 'Última Transação', icon: 'time' }
      ].map((option) => (
        <TouchableOpacity
          key={option.key}
          style={[
            styles.filterOption,
            sortBy === option.key && styles.filterOptionSelected
          ]}
          onPress={() => setSortBy(option.key as SortOption)}
        >
          <Ionicons name={option.icon as any} size={16} color={...} />
          <Text style={styles.filterOptionText}>{option.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
</AppModal>
```

**Funcionalidades:**
- **Seleção visual**: Estados ativos destacados
- **Ícones intuitivos**: Cada opção tem ícone representativo
- **Feedback imediato**: Mudanças aplicadas instantaneamente

---

### **7. 📋 MODAL DE DETALHES**

#### **�� Informações Detalhadas**
```typescript
<Modal
  visible={showAccountDetails}
  transparent
  animationType="slide"
  onRequestClose={() => setShowAccountDetails(false)}
>
  <View style={styles.modalOverlay}>
    <View style={styles.modalContent}>
      {selectedAccount && (
        <View>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{selectedAccount.name}</Text>
            <TouchableOpacity onPress={() => setShowAccountDetails(false)}>
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalBody}>
            <AccountCard account={selectedAccount} ... />
            
            {/* Detalhes adicionais */}
            <View style={styles.accountDetails}>
              <Text style={styles.detailsTitle}>Informações da Conta</Text>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Tipo:</Text>
                <Text style={styles.detailValue}>
                  {selectedAccount.type === 'propria' ? 'Própria' : 'Externa'}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Status:</Text>
                <Text style={styles.detailValue}>
                  {selectedAccount.isDefault ? 'Conta Padrão' : 'Conta Regular'}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Criada em:</Text>
                <Text style={styles.detailValue}>
                  {new Date(selectedAccount.createdAt).toLocaleDateString('pt-BR')}
                </Text>
              </View>
              
              {selectedAccount.type === 'propria' && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Saldo Inicial:</Text>
                  <Text style={styles.detailValue}>
                    {AccountService.formatCurrency(selectedAccount.saldo || 0)}
                  </Text>
                </View>
              )}
            </View>
            
            {/* Ações rápidas */}
            <View style={styles.quickActions}>
              <Text style={styles.detailsTitle}>Ações Rápidas</Text>
              
              <TouchableOpacity style={styles.quickActionButton}>
                <Ionicons name="swap-horizontal" size={20} color={colors.primary[500]} />
                <Text style={styles.quickActionText}>Transferir</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.quickActionButton}>
                <Ionicons name="time" size={20} color={colors.secondary[500]} />
                <Text style={styles.quickActionText}>Ver Histórico</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      )}
    </View>
  </View>
</Modal>
```

**Informações Exibidas:**
- **Dados básicos**: Nome, tipo, status
- **Informações temporais**: Data de criação
- **Dados financeiros**: Saldo inicial (apenas para contas próprias)
- **Ações rápidas**: Transferir e ver histórico

---

## �� **SISTEMA DE ESTILOS**

### **📐 Estrutura de Estilos**

```typescript
const styles = StyleSheet.create({
  // Layout principal
  container: { 
    flex: 1, 
    backgroundColor: colors.background.default 
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  
  // Card de saldo total
  totalBalanceCard: {
    backgroundColor: colors.background.default,
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  // Container de item de conta
  accountItemContainer: {
    position: 'relative',
    marginBottom: spacing.sm,
  },
  
  // Botão de editar flutuante
  editButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.background.default,
    borderRadius: 20,
    padding: spacing.xs,
    shadowColor: colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  
  // Opções de filtro
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
    gap: spacing.xs,
  },
  filterOptionSelected: {
    backgroundColor: colors.primary[100],
  },
  
  // Modal de detalhes
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background.default,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
});
```

---

## 🔄 **FLUXOS DE DADOS**

### **📊 Fluxo de Carregamento**

1. **Inicialização** → Carrega contas e operações do contexto
2. **Cálculo de saldos** → `AccountService.getAccountsBalance()`
3. **Filtragem** → Apenas contas próprias
4. **Ordenação** → Aplicada conforme `sortBy`
5. **Renderização** → Lista de contas com saldos

### **🔍 Fluxo de Filtros**

1. **Abertura** → Modal de filtros
2. **Seleção** → Usuário escolhe filtro/ordenação
3. **Aplicação** → `getSortedAccounts()` recalcula
4. **Atualização** → Lista re-renderizada
5. **Fechamento** → Modal fechado

### **✏️ Fluxo de Edição**

1. **Clique** → Botão de editar
2. **Navegação** → Para tela Register com parâmetros
3. **Recebimento** → Tela Register captura `editingAccount`
4. **Configuração** → Formulário preenchido automaticamente
5. **Edição** → Usuário modifica dados
6. **Salvamento** → Dados atualizados no banco

---

## 🛡️ **VALIDAÇÕES E SEGURANÇA**

### **🔒 Medidas de Segurança**

1. **Exclusão Removida**: Não há opção de excluir contas
2. **Validação de Navegação**: Verificação de `navigation` antes de usar
3. **Filtros Seguros**: Apenas contas próprias exibidas
4. **Tratamento de Erros**: Logs detalhados para debug

### **📋 Validações de Dados**

```typescript
// Verificação de contas para transferência
const ownAccounts = accounts.filter(acc => acc.type === 'propria' && acc.id !== fromAccount.id);

if (ownAccounts.length === 0) {
  Alert.alert('Aviso', 'Não há outras contas próprias para transferir');
  return;
}

// Verificação de saldo para cores
color: totalBalance >= 0 ? colors.success[600] : colors.error[600]

// Verificação de tipo para informações
{selectedAccount.type === 'propria' ? 'Própria' : 'Externa'}
```

---

## 🔍 **PONTOS DE ATENÇÃO**

### **⚠️ Complexidade**

- **Estados múltiplos**: 8 estados principais
- **Lógica de filtros**: Combinação de filtros e ordenação
- **Navegação complexa**: Parâmetros entre telas

### **🔄 Performance**

- **useCallback**: Para `getSortedAccounts` e `onRefresh`
- **Filtros otimizados**: Apenas contas próprias processadas
- **Renderização condicional**: Estados vazios tratados

### **📱 UX/UI**

- **Feedback visual**: Estados de loading e vazio
- **Acessibilidade**: Botões com tamanhos adequados
- **Consistência**: Design alinhado com o sistema

---

## 🚀 **MELHORIAS SUGERIDAS**

1. **�� Cache de Saldos**: Implementar cache para evitar recálculos
2. **�� Busca**: Adicionar campo de busca por nome
3. **�� Gráficos**: Visualização de evolução de saldos
4. **🔔 Notificações**: Alertas para saldos baixos
5. **📱 Gestos**: Implementar gestos nativos mais avançados
6. **🧪 Testes**: Adicionar testes unitários e de integração

---

## �� **CONCLUSÃO**

O `Accounts.tsx` é um componente bem estruturado que oferece uma experiência completa de gerenciamento de contas. Sua arquitetura prioriza a segurança (removendo exclusões) e a usabilidade (interface intuitiva). A implementação de filtros, ordenação e interações avançadas torna a experiência do usuário rica e eficiente. O código está bem organizado, com separação clara de responsabilidades e estilos consistentes.