# 📊 Modelo de Dados - Sistema de Finanças Pessoais

## 🎯 Visão Geral

Este documento define o modelo de dados lógico do sistema de finanças pessoais, apresentando casos de uso práticos que demonstram como as operações financeiras são registradas e processadas no sistema.

---

## 🏗️ Estrutura Conceitual

### 📋 Entidades Principais

- **Operation (Operação)**: Registro de movimentação financeira
- **Account (Conta)**: Contas bancárias e formas de pagamento
- **Category (Categoria)**: Classificação das operações

### 🔄 Tipos de Operações

#### Por Natureza:
- **Receita**: Valores que entram nas contas
- **Despesa**: Valores que saem das contas

#### Por Estado:
- **Planejadas**: `receber`, `pagar`, `transferir`
- **Concluídas**: `recebido`, `pago`, `transferido`

#### Por Complexidade:
- **Simples**: Uma única operação registrada
- **Dupla**: Duas operações relacionadas (automáticas)

---

## 📝 Casos de Uso Detalhados

### 🔵 Caso 1: Despesa Simples - Cartão de Crédito

**Cenário**: João pagou no cartão de crédito para Pedro por uma peça de carro.

```
Operação: Despesa | Cartão de crédito | Automóvel | Pagar
```

#### 📊 Dados da Operação
- **Usuário**: João (conta-origem)
- **Beneficiário**: Pedro (conta-destino)
- **Forma de pagamento**: Cartão de crédito
- **Data**: Hoje
- **Categoria**: Automóvel
- **Estado**: Pagar
- **Valor**: R$ 500,00

#### 💡 Lógica do Sistema
- **Registro**: Operação única
- **Saldo**: Inalterado até mudança de estado
- **Transição**: `pagar` → `pago` (altera o saldo)

#### 🖥️ Interface do Usuário
- **Visualize**: Mostra R$ 500 em "Pagamentos pendentes"
- **Register**: Permite alterar estado na seção "Gerenciamento"
- **Saldo atual**: R$ 700 (R$ 1.200 - R$ 500 pendente)

#### 📋 Estrutura de Dados
```javascript
{
  id: "uuid-1",
  nature: "despesa",
  state: "pagar",
  paymentMethod: "Cartão de crédito",
  sourceAccount: "João",
  destinationAccount: "Pedro",
  date: "2024-01-15",
  value: -500.00,
  category: "Automóvel"
}
```

---

### 🔵 Caso 2: Movimentação Interna - Transferência PIX

**Cenário**: Pedro transferiu R$ 300 via PIX de sua conta PF para PJ.

```
Operação: Despesa e Receita | PIX | Movimentação interna | Transferido e Recebido
```

#### 📊 Dados da Operação
- **Conta origem**: Pessoa Física (saldo: R$ 500)
- **Conta destino**: Pessoa Jurídica (saldo: R$ 500)
- **Forma de pagamento**: PIX
- **Valor**: R$ 300,00
- **Estado**: Automático (transferido/recebido)

#### 💡 Lógica do Sistema
- **Registro**: Operação dupla automática
- **Saldo**: Alterado imediatamente
- **Operações "irmãs": Vinculadas por ID base

#### 🖥️ Interface do Usuário
- **Visualize**: Mostra transferências por período
- **Register**: Duas operações vinculadas visíveis
- **Saldo PF**: R$ 200 (R$ 500 - R$ 300)
- **Saldo PJ**: R$ 800 (R$ 500 + R$ 300)

#### 📋 Estrutura de Dados
```javascript
// Operação 1 - Saída da conta PF
{
  id: "uuid-base-1",
  nature: "despesa",
  state: "transferido",
  paymentMethod: "PIX",
  sourceAccount: "Conta PF",
  destinationAccount: "Conta PJ",
  date: "2024-01-15",
  value: -300.00,
  category: "Movimentação interna"
}

// Operação 2 - Entrada na conta PJ
{
  id: "uuid-base-2",
  nature: "receita",
  state: "recebido",
  paymentMethod: "PIX",
  sourceAccount: "Conta PF",
  destinationAccount: "Conta PJ",
  date: "2024-01-15",
  value: 300.00,
  category: "Movimentação interna"
}
```

---

### 🔵 Caso 3: Despesa Agendada - Aluguel

**Cenário**: Maria precisa pagar aluguel de R$ 1.000 em 18/10/2025.

```
Operação: Despesa | Transferência bancária | Aluguel | Pagar
```

#### 📊 Dados da Operação
- **Valor**: R$ 1.000,00
- **Data**: 18/10/2025
- **Categoria**: Aluguel
- **Estado inicial**: Pagar
- **Estado final**: Pago (após confirmação)

#### 💡 Lógica do Sistema
- **Registro**: Operação única
- **Saldo**: Inalterado no estado `pagar`
- **Alteração**: Manual pelo usuário

#### 🖥️ Interface do Usuário
- **Visualize**: R$ 1.000 em "Pagamentos pendentes" para 18/10/2025
- **Register**: Localização e edição na seção "Gerenciamento"
- **Ação**: Mudança de estado `pagar` → `pago`

#### 📋 Estrutura de Dados
```javascript
// Estado inicial
{
  id: "uuid-3",
  nature: "despesa",
  state: "pagar",
  paymentMethod: "Transferência bancária",
  sourceAccount: "Maria",
  destinationAccount: "Imobiliária",
  date: "2025-10-18",
  value: -1000.00,
  category: "Aluguel"
}

// Estado final (após confirmação)
{
  id: "uuid-3",
  nature: "despesa",
  state: "pago",
  paymentMethod: "Transferência bancária",
  sourceAccount: "Maria",
  destinationAccount: "Imobiliária",
  date: "2025-10-18",
  value: -1000.00,
  category: "Aluguel"
}
```

**Variação - Receita Agendada:**
```javascript
{
  id: "uuid-3-receita",
  nature: "receita",
  state: "receber", // ou "recebido"
  paymentMethod: "Transferência bancária",
  sourceAccount: "Inquilino",
  destinationAccount: "Maria",
  date: "2025-10-18",
  value: 1000.00,
  category: "Aluguel"
}
```

---

### 🔵 Caso 4: Adiantamento com Dívida

**Cenário**: Carla recebeu R$ 40 da Kiti via PIX para pagar passagens de trem.

```
Operação: Receita e Despesa | PIX | Adiantamento | Recebido e Pagar
```

#### 📊 Dados da Operação
- **Valor recebido**: R$ 40,00 (imediato)
- **Valor a pagar**: R$ 40,00 (futuro)
- **Categoria**: Adiantamento
- **Relacionamento**: Operações vinculadas

#### 💡 Lógica do Sistema
- **Registro**: Operação dupla
- **Saldo**: Alterado pela receita, despesa pendente
- **Quitação**: Manual pelo usuário

#### 🖥️ Interface do Usuário
- **Visualize**: Mostra valor recebido e pendência
- **Register**: Permite quitar o adiantamento
- **Saldo**: Aumenta R$ 40, mas com dívida pendente

#### 📋 Estrutura de Dados
```javascript
// Operação 1 - Recebimento do adiantamento
{
  id: "uuid-4-1",
  nature: "receita",
  state: "recebido",
  paymentMethod: "PIX",
  sourceAccount: "Kiti",
  destinationAccount: "Carla",
  date: "2024-01-15",
  value: 40.00,
  category: "Adiantamento"
}

// Operação 2 - Dívida a pagar
{
  id: "uuid-4-2",
  nature: "despesa",
  state: "pagar",
  paymentMethod: "PIX",
  sourceAccount: "Carla",
  destinationAccount: "Kiti",
  date: "2024-01-15",
  value: -40.00,
  category: "Adiantamento"
}
```

**Variação - Carla pagou adiantamento:**
```javascript
// Operação 1 - Pagamento do adiantamento
{
  id: "uuid-4-inv-1",
  nature: "despesa",
  state: "pagar",
  paymentMethod: "PIX",
  sourceAccount: "Carla",
  destinationAccount: "Kiti",
  date: "2024-01-15",
  value: -40.00,
  category: "Adiantamento"
}

// Operação 2 - Direito a receber
{
  id: "uuid-4-inv-2",
  nature: "receita",
  state: "receber",
  paymentMethod: "PIX",
  sourceAccount: "Kiti",
  destinationAccount: "Carla",
  date: "2024-01-15",
  value: 40.00,
  category: "Adiantamento"
}
```

---

### 🔵 Caso 5: Reparação com Reposição

**Cenário**: Lucas recebeu R$ 50 da Ana (reparação) e comprou carregador por R$ 48.

```
Operação: Receita e Despesa | PIX | Reparação | Recebido e Pago
```

#### 📊 Dados da Operação
- **Valor recebido**: R$ 50,00 (da Ana)
- **Valor gasto**: R$ 48,00 (na loja)
- **Categoria**: Reparação
- **Resultado**: Lucas ficou com R$ 2,00

#### 💡 Lógica do Sistema
- **Registro**: Operação dupla
- **Primeiro**: Recebimento da reparação
- **Segundo**: Compra do item de reposição

#### 🖥️ Interface do Usuário
- **Visualize**: Mostra entrada e saída separadamente
- **Register**: Duas operações relacionadas por categoria
- **Saldo**: +R$ 50 -R$ 48 = +R$ 2

#### 📋 Estrutura de Dados
```javascript
// Operação 1 - Recebimento da reparação
{
  id: "uuid-5-1",
  nature: "receita",
  state: "recebido",
  paymentMethod: "PIX",
  sourceAccount: "Ana",
  destinationAccount: "Lucas",
  date: "2024-01-15",
  value: 50.00,
  category: "Reparação"
}

// Operação 2 - Compra do item de reposição
{
  id: "uuid-5-2",
  nature: "despesa",
  state: "pago",
  paymentMethod: "PIX",
  sourceAccount: "Lucas",
  destinationAccount: "TechPhone",
  date: "2024-01-15",
  value: -48.00,
  category: "Reparação"
}
```

**Variação - Lucas pagou reparação:**
```javascript
// Operação 1 - Pagamento da reparação
{
  id: "uuid-5-inv-1",
  nature: "despesa",
  state: "pagar",
  paymentMethod: "PIX",
  sourceAccount: "Lucas",
  destinationAccount: "Ana",
  date: "2024-01-15",
  value: -200.00,
  category: "Reparação"
}

// Não há operação 2 pois Lucas está pagando (não recebendo)
```

---

## 🔧 Regras de Negócio

### 📊 Cálculo de Saldo

```javascript
// Lógica de cálculo de saldo por conta
function calculateBalance(operations, account) {
  return operations
    .filter(op => {
      const isCompleted = ['recebido', 'pago', 'transferido'].includes(op.state);
      const affectsAccount = op.sourceAccount === account || op.destinationAccount === account;
      return isCompleted && affectsAccount;
    })
    .reduce((balance, op) => {
      if (op.sourceAccount === account) {
        // Saída: valor negativo
        return balance + (op.value < 0 ? op.value : -op.value);
      } else {
        // Entrada: valor positivo
        return balance + Math.abs(op.value);
      }
    }, 0);
}
```

### 🔄 Transições de Estado

| Estado Atual | Estados Possíveis | Descrição |
|--------------|-------------------|-----------|
| `receber` | `recebido` | Confirma recebimento |
| `pagar` | `pago` | Confirma pagamento |
| `transferir` | `transferido` | Confirma transferência |
| `recebido` | - | Estado final |
| `pago` | - | Estado final |
| `transferido` | - | Estado final |

### 🏷️ Categorias Especiais

#### Movimentação Interna
- Sempre gera **duas operações** automáticas
- Estados: `transferir/receber` → `transferido/recebido`
- Contas: origem e destino do mesmo usuário

#### Adiantamento
- Primeira operação: valor recebido/pago
- Segunda operação: obrigação de pagar/receber
- Quitação: manual pelo usuário

#### Reparação
- Para recebimento: gera operação de reposição
- Para pagamento: operação única
- Categoria mantém histórico do motivo

---

## 📋 Validações do Sistema

### ✅ Validações Obrigatórias

1. **Contas**: Origem e destino devem existir
2. **Valores**: Positivos na entrada, negativos na saída
3. **Datas**: Formato ISO (YYYY-MM-DD)
4. **Estados**: Compatíveis com a natureza da operação

### ⚠️ Validações de Negócio

1. **Movimentação Interna**: Origem ≠ Destino
2. **Datas Futuras**: Apenas para estados planejados
3. **Operações Duplas**: Devem manter consistência
4. **Exclusões**: Verificar dependências

---

## 🎯 Considerações Importantes

### 🔗 Relacionamentos
- Operações duplas compartilham ID base
- Categorias especiais têm lógicas próprias
- Estados controlam impacto no saldo

### 📊 Performance
- Índices em data, categoria e contas
- Consultas otimizadas por período
- Cálculos de saldo em tempo real

### 🛡️ Integridade
- Validações antes da persistência
- Transações para operações duplas
- Rollback em caso de falha

---

## 📖 Glossário

- **Operação**: Registro de movimentação financeira
- **Natureza**: Tipo da operação (receita/despesa)
- **Estado**: Situação atual da operação
- **Conta**: Origem ou destino dos valores
- **Categoria**: Classificação da operação
- **Operação Dupla**: Duas operações relacionadas
- **Saldo**: Valor atual de uma conta
- **Pendência**: Operação não concluída