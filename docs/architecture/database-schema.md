<!-- docs\architecture\database-schema.md -->
# 🗄️ Database Schema

## 📋 Visão Geral

O sistema de finanças pessoais utiliza SQLite com três tabelas principais:
- **operations**: Registra todas as movimentações financeiras
- **categories**: Armazena as categorias de transações
- **accounts**: Gerencia as contas bancárias e formas de pagamento
- **budget**: Registra e gerencia o orçamento do usuário.
- **goals**: Registra e gerencia as metas do usuário.
-- **projection**: Registrar e gerencia as projeções.

---

## 🏗️ Estrutura das Tabelas

### 📊 Tabela: `operations`

Tabela principal que armazena todas as movimentações financeiras do usuário.

```sql
CREATE TABLE IF NOT EXISTS operations (
    id TEXT PRIMARY KEY,
    nature TEXT NOT NULL,
    state TEXT NOT NULL,
    paymentMethod TEXT NOT NULL,
    sourceAccount TEXT NOT NULL,
    destinationAccount TEXT NOT NULL,
    date TEXT NOT NULL,
    value REAL NOT NULL,
    category TEXT NOT NULL,
    details TEXT,
    receipt BLOB,
    project TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);
```

#### 🔸 Campos da Tabela Operations

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | TEXT | ✅ | Identificador único da operação |
| `nature` | TEXT | ✅ | Tipo da movimentação: **receita** ou **despesa** |
| `state` | TEXT | ✅ | Status da operação: **receber**, **recebido**, **pagar**, **pago**, **transferir**, **transferido** |
| `paymentMethod` | TEXT | ✅ | Forma de pagamento utilizada |
| `sourceAccount` | TEXT | ✅ | Conta de origem da transação |
| `destinationAccount` | TEXT | ✅ | Conta de destino da transação |
| `date` | TEXT | ✅ | Data da operação (formato ISO) |
| `value` | REAL | ✅ | Valor da operação (positivo para receita, negativo para despesa) |
| `category` | TEXT | ✅ | Categoria da operação |
| `details` | TEXT | ❌ | Detalhes adicionais sobre a operação |
| `receipt` | BLOB | ❌ | Recibo da transação (imagem em formato binário) |
| `project` | TEXT | ❌ | Projeto pessoal associado à operação |
| `createdAt` | TEXT | ✅ | Data/hora de criação do registro |

#### 📋 Regras de Negócio - Operations

##### 🔸 Nature (Natureza)
- **receita**: Valores que entram nas suas contas
- **despesa**: Valores que saem das suas contas

##### 🔸 State (Estado)
- **receber**: Aguardando recebimento (nature = receita)
- **recebido**: Valor já recebido (nature = receita)
- **pagar**: Aguardando pagamento (nature = despesa)
- **pago**: Valor já pago (nature = despesa)
- **transferir**: Aguardando transferência entre contas próprias (nature = despesa)
- **transferido**: Transferência entre contas próprias concluída (nature = despesa)

##### 🔸 PaymentMethod (Forma de Pagamento)
Valores fixos aceitos:
1. Cartão de débito
2. Cartão de crédito
3. Pix
4. TED
5. Estorno
6. Transferência bancária

##### 🔸 Value (Valor)
- **Receitas**: Valores positivos
- **Despesas**: Valores negativos
- Precisão até centavos sem arredondamento

---

### 🏷️ Tabela: `categories`

Armazena as categorias disponíveis para classificar as operações.

```sql
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    isDefault INTEGER NOT NULL DEFAULT 0,
    createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);
```

#### 🔸 Campos da Tabela Categories

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | TEXT | ✅ | Identificador único da categoria |
| `name` | TEXT | ✅ | Nome da categoria (único) |
| `isDefault` | INTEGER | ✅ | Se é categoria padrão (1) ou criada pelo usuário (0) |
| `createdAt` | TEXT | ✅ | Data/hora de criação |

#### 📋 Categorias Padrão

As seguintes categorias são inseridas automaticamente:

1. **Reparação** - Pagamentos para reparar ou repor bens danificados
2. **Adiantamento-pessoal** - Pagamentos feitos por terceiros com posterior reembolso
3. **Movimentação interna** - Transferências entre contas próprias
4. **Alimento-supermercado** - Compras em supermercados
5. **Aluguel** - Pagamentos de aluguel
6. **Energia-elétrica** - Contas de luz
7. **Saneamento-básico** - Contas de água e esgoto
8. **Presente** - Gastos com presentes
9. **Doação** - Valores doados
10. **Transporte-público** - Gastos com transporte público
11. **Uber** - Corridas de aplicativo
12. **Combustível** - Gastos com combustível
13. **Salário-CLT** - Salário de trabalho CLT
14. **PLR/Comissão** - Participação nos lucros e comissões
15. **Adiantamento-salário-CLT** - Adiantamentos salariais
16. **Vale-refeição** - Benefício vale-refeição
17. **Vale-alimentação** - Benefício vale-alimentação
18. **Cashback** - Valores de cashback
19. **Internet-e-plano-residência/móvel** - Contas de internet e telefone
20. **Lanche-rápido** - Gastos com lanches
21. **Vestuário** - Gastos com roupas
22. **Costura-roupa** - Serviços de costura
23. **Curso-superior** - Gastos com ensino superior
24. **Curso-técnico** - Gastos com cursos técnicos
25. **Curso-profissionalizante** - Gastos com cursos profissionalizantes
26. **Livro** - Compra de livros
27. **Dentista** - Gastos com dentista
28. **Remédio** - Gastos com medicamentos
29. **Oftalmologista** - Gastos com oftalmologista
30. **Óculos-de-grau** - Gastos com óculos
31. **Suplemento-vitaminas** - Gastos com suplementos
32. **Gás-cozinha** - Gastos com gás de cozinha
33. **Financiamento** - Parcelas de financiamento
34. **Consórcio** - Parcelas de consórcio
35. **Dívida** - Pagamentos de dívidas
36. **Assinatura-digital-pessoal** - Assinaturas digitais pessoais
37. **Assinatura-digital-profissional** - Assinaturas digitais profissionais
38. **Acessório-celular** - Acessórios para celular
39. **Bolsa-valores** - Investimentos em ações
40. **Criptomoedas** - Investimentos em criptomoedas
41. **Renda-fixa** - Investimentos em renda fixa

#### 📋 Regras Especiais de Categorias

##### 🔄 Movimentação Interna
- Sempre gera **duas operações**: uma despesa (saída) e uma receita (entrada)
- Mesma data, mesmo valor (positivo/negativo)
- Estados: **transferir/receber** (planejado) ou **transferido/recebido** (concluído)

##### 💰 Adiantamento
- Gera **duas operações**: despesa inicial e receita posterior
- Estado: **receber** até o reembolso, **recebido** após quitação

##### 🔧 Reparação
- Envolve pagamento para reparar ou repor bens danificados
- Pode gerar entrada por reposição + saída pela compra

---

### 🏦 Tabela: `accounts`

Gerencia as contas bancárias e formas de pagamento do usuário.

```sql
CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    isDefault INTEGER NOT NULL DEFAULT 0,
    createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);
```

#### 🔸 Campos da Tabela Accounts

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | TEXT | ✅ | Identificador único da conta |
| `name` | TEXT | ✅ | Nome da conta (único) |
| `isDefault` | INTEGER | ✅ | Se é conta padrão (1) ou criada pelo usuário (0) |
| `createdAt` | TEXT | ✅ | Data/hora de criação |

#### 📋 Contas Padrão

As seguintes contas são inseridas automaticamente:

1. **Conta Corrente** - Conta corrente tradicional
2. **Poupança** - Conta poupança
3. **Carteira-física** - Dinheiro em espécie
4. **Cartão de Crédito** - Operações no cartão de crédito
5. **Conta Digital** - Contas digitais (Nubank, Inter, etc.)
6. **Investimentos** - Contas de investimento

---

## 📊 Índices de Performance

### Índices da Tabela Operations
```sql
CREATE INDEX IF NOT EXISTS idx_date ON operations (date);
CREATE INDEX IF NOT EXISTS idx_category ON operations (category);
CREATE INDEX IF NOT EXISTS idx_source_account ON operations (sourceAccount);
CREATE INDEX IF NOT EXISTS idx_destination_account ON operations (destinationAccount);
```

### Índices das Tabelas Categories e Accounts
```sql
CREATE INDEX IF NOT EXISTS idx_category_name ON categories (name);
CREATE INDEX IF NOT EXISTS idx_account_name ON accounts (name);
```

---

## 🔒 Restrições e Validações

### Restrições de Integridade
- **Categorias**: Nome único, não pode ser deletada se estiver em uso
- **Contas**: Nome único, não pode ser deletada se estiver em uso
- **Operações**: Todos os campos obrigatórios devem ser preenchidos

### Validações de Negócio
- **Categorias padrão**: Não podem ser editadas ou deletadas
- **Contas padrão**: Não podem ser editadas ou deletadas
- **Valores**: Devem ser numéricos com precisão de centavos
- **Datas**: Devem estar no formato ISO (YYYY-MM-DD)
- **States**: Devem corresponder à natureza da operação

---

## 🔄 Relacionamentos

### Operations → Categories
- Campo `category` referencia `categories.name`
- Relacionamento: N:1 (muitas operações para uma categoria)

### Operations → Accounts
- Campo `sourceAccount` referencia `accounts.name`
- Campo `destinationAccount` referencia `accounts.name`
- Relacionamento: N:1 (muitas operações para uma conta)

---

## 📝 Observações Técnicas

### Armazenamento de Recibos
- Campo `receipt` armazena imagens em formato BLOB
- Suporte a conversão de Blob para Uint8Array
- Tratamento especial para diferentes tipos de dados de imagem

### Geração de IDs
- **Operations**: Gerado pela aplicação
- **Categories**: Formato `cat-{timestamp}-{random}`
- **Accounts**: Formato `acc-{timestamp}-{random}`
- **Padrão**: IDs padrão usam prefixo `default-{name}`

### Considerações de Performance
- Índices otimizados para consultas frequentes
- Ordenação padrão por data (DESC) e criação (DESC)
- Consultas específicas por período, categoria e conta

## Tabela: `budget`


### 🔸 Campos da Tabela Budget


### 📋 Regras de Negócio - Budget

- Cada orçamento pode ser mensal, trimestral, anual, etc.
- O orçamento é dividido por categorias (ver Plan.md para exemplos).
- O sistema calcula indicadores de performance: superávit, déficit, equilibrado.
- Percentuais e valores absolutos são calculados conforme detalhado em [Plan.md](../../app/src/screens/Plan/Plan.md#34-sistema-de-indicadores).

> Para exemplos de uso e lógica de negócio, veja [Plan.md - Orçamento](../../app/src/screens/Plan/Plan.md#3-módulo-de-orçamento)

---

## Tabela: `goal`

```sql
CREATE TABLE IF NOT EXISTS goal (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    description TEXT NOT NULL,
    target_value REAL NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    monthly_income REAL NOT NULL,
    fixed_expenses REAL NOT NULL,
    available_per_month REAL NOT NULL,
    importance TEXT NOT NULL,
    priority INTEGER CHECK(priority >= 1 AND priority <= 5),
    strategy TEXT,
    monthly_contribution REAL NOT NULL,
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'completed', 'paused', 'cancelled')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

### 🔸 Campos da Tabela Goal

| Campo                   | Tipo   | Obrigatório | Descrição                                      |
|-------------------------|--------|-------------|------------------------------------------------|
| `id`                    | TEXT   | ✅          | Identificador único da meta                     |
| `user_id`               | TEXT   | ✅          | Usuário dono da meta                            |
| `description`           | TEXT   | ✅          | Descrição da meta                               |
| `target_value`          | REAL   | ✅          | Valor total a ser atingido                      |
| `start_date`            | TEXT   | ✅          | Data de início da meta (ISO)                    |
| `end_date`              | TEXT   | ✅          | Data limite para atingir a meta (ISO)           |
| `monthly_income`        | REAL   | ✅          | Renda mensal do usuário                         |
| `fixed_expenses`        | REAL   | ✅          | Gastos mensais fixos                            |
| `available_per_month`   | REAL   | ✅          | Valor disponível para a meta por mês            |
| `importance`            | TEXT   | ✅          | Justificativa/importância da meta               |
| `priority`              | INT    | ✅          | Prioridade (1 a 5)                              |
| `strategy`              | TEXT   | ❌          | Estratégia para atingir a meta                  |
| `monthly_contribution`  | REAL   | ✅          | Valor mensal destinado à meta                   |
| `status`                | TEXT   | ❌          | Status da meta (active, completed, etc.)        |
| `created_at`            | TEXT   | ✅          | Data/hora de criação                            |
| `updated_at`            | TEXT   | ✅          | Data/hora de atualização                        |

1. **Descrição da Meta (Específico)**
   - Tipo: Texto livre
   - Exemplos: "Economizar para emergência", "Quitar financiamento do carro", "Investir para aposentadoria"
   - Validação: Obrigatório, máximo 200 caracteres

2. **Valor Monetário (Mensurável)**
   - Tipo: Numérico (R$)
   - Validação: Obrigatório, valor > 0
   - Formato: Moeda brasileira

3. **Renda Mensal Atual (Atingível)**
   - Tipo: Numérico (R$)
   - Validação: Obrigatório, valor > 0

4. **Gastos Mensais Fixos (Atingível)**
   - Tipo: Numérico (R$)
   - Validação: Obrigatório, valor ≥ 0

5. **Valor Disponível para Meta por Mês (Atingível)**
   - Tipo: Numérico (R$)
   - Cálculo automático: (Renda - Gastos Fixos) ou valor manual
   - Validação: Deve ser realista baseado na renda disponível

6. **Importância da Meta (Relevância)**
   - Tipo: Texto livre
   - Validação: Obrigatório, máximo 500 caracteres

7. **Prioridade (Relevância)**
   - Tipo: Escala de 1-5
   - 1: Baixa prioridade
   - 5: Prioridade máxima

8. **Datas (Temporal)**
   - Data de início: Preenchimento automático (data atual) ou manual
   - Data limite: Campo obrigatório

9. **Estratégia de Execução**
    - Tipo: Texto livre
    - Exemplos: "Cortar gastos supérfluos", "Renda extra aos finais de semana"

10. **Valor Mensal Destinado**
    - Tipo: Numérico (R$)
    - Validação: Deve ser ≤ valor disponível mensal

##### 📋 Regras de Negócio - Goal

- O sistema valida se a meta é atingível no prazo com o valor mensal destinado.
- Sugere ajustes se a meta não for viável.
- Gera mantra motivacional com base nos dados da meta.
- Campos e lógica detalhados em [Plan.md - Metas](../../app/src/screens/Plan/Plan.md#2-módulo-de-metas).

---

## Tabela: `projection`
```sql
CREATE TABLE IF NOT EXISTS projection (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT CHECK(type IN ('goal', 'financing', 'investment')) NOT NULL,
    description TEXT,
    parameters JSON NOT NULL,
    results JSON,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

### 🔸 Campos da Tabela Projection

| Campo        | Tipo   | Obrigatório | Descrição                                         |
|--------------|--------|-------------|---------------------------------------------------|
| `id`         | TEXT   | ✅          | Identificador único da projeção                    |
| `user_id`    | TEXT   | ✅          | Usuário dono da projeção                           |
| `name`       | TEXT   | ✅          | Nome da projeção                                   |
| `type`       | TEXT   | ✅          | Tipo: goal, financing, investment                  |
| `description`| TEXT   | ❌          | Descrição da projeção                              |
| `parameters` | JSON   | ✅          | Parâmetros usados para calcular a projeção         |
| `results`    | JSON   | ❌          | Resultados calculados                              |
| `created_at` | TEXT   | ✅          | Data/hora de criação                               |
| `updated_at` | TEXT   | ✅          | Data/hora de atualização                           |

#### 📋 Regras de Negócio - Projection

- Tipos de projeção: metas, financiamentos, investimentos.
- Parâmetros e resultados são armazenados em JSON para flexibilidade.
- Exemplos e lógica detalhados em [Plan.md - Projeções](../../app/src/screens/Plan/Plan.md#4-módulo-de-projeções).

---
