# Sistema de Metas (Goal System)

## Modelagem da Tabela `goal`

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
| `nature`                | TEXT   | ✅          | Usuário dono da meta                            |
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

#### Detalhamento dos Campos

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

Perfeito! A coluna `tipo` (type) na tabela `goal` é fundamental para determinar como as operações vinculadas afetam o progresso da meta, assim como já acontece no orçamento (budget).  
A seguir, apresento os casos de uso, preenchendo cada coluna das tabelas `operations` e `goal`, e explicando como o tipo da meta influencia o cálculo do progresso.

---

## **Nova Estrutura da Tabela `goal`**

Adicione a coluna `type`:

```sql
ALTER TABLE goal ADD COLUMN type TEXT NOT NULL CHECK(type IN ('receita', 'despesa', 'economia', 'compra'));
```

- Exemplos de valores:  
  - `receita` (meta de juntar dinheiro, economizar, aumentar renda)
  - `despesa` ou `compra` (meta de realizar uma compra específica)
  - `economia` (meta de guardar um valor específico)

---

## **Exemplo de Estrutura da Tabela `operations`**

| id  | user_id | nature   | state    | paymentMethod | sourceAccount | destinationAccount | date       | value  | category | details | receipt | project | goal_id | createdAt |
|-----|---------|----------|----------|--------------|--------------|-------------------|------------|--------|----------|---------|---------|---------|---------|-----------|

---

## **Casos de Uso: Registro de Operações e Relação com Metas**

### **Caso 1: Operação de Receita para Meta do Tipo "Receita" ou "Economia"**

**Meta:** Juntar R$ 400 para reserva de emergência (`type = receita`)

#### Registro da operação

| Coluna             | Valor                                  |
|--------------------|----------------------------------------|
| id                 | op-001                                 |
| user_id            | user-1                                 |
| nature             | receita                                |
| state              | recebido                               |
| paymentMethod      | transferência                          |
| sourceAccount      | Conta Corrente                         |
| destinationAccount | Poupança                               |
| date               | 2024-08-01                             |
| value              | 100.00                                 |
| category           | Reserva de Emergência                  |
| details            | Aporte mensal                          |
| receipt            | null                                   |
| project            | null                                   |
| goal_id            | goal-001                               |
| createdAt          | 2024-08-01T10:00:00Z                   |

#### Registro da meta (goal)

| Coluna                 | Valor                        |
|------------------------|------------------------------|
| id                     | goal-001                     |
| user_id                | user-1                       |
| description            | Juntar R$ 400 para emergência|
| type                   | receita                      |
| target_value           | 400.00                       |
| ...                    | ...                          |

**Como afeta a meta:**  
- O valor da operação (100) é somado ao progresso da meta.
- Só operações de `nature = receita` e `goal_id = goal-001` contam para o progresso.

---

### **Caso 2: Operação de Despesa para Meta do Tipo "Compra"**

**Meta:** Comprar uma geladeira de R$ 2.000 (`type = compra` ou `despesa`)

#### Registro da operação

| Coluna             | Valor                                  |
|--------------------|----------------------------------------|
| id                 | op-002                                 |
| user_id            | user-1                                 |
| nature             | despesa                                |
| state              | pago                                   |
| paymentMethod      | cartão de crédito                      |
| sourceAccount      | Conta Corrente                         |
| destinationAccount | Loja Eletrodomésticos                  |
| date               | 2024-08-10                             |
| value              | 2000.00                                |
| category           | Eletrodomésticos                       |
| details            | Compra da geladeira                    |
| receipt            | null                                   |
| project            | null                                   |
| goal_id            | goal-002                               |
| createdAt          | 2024-08-10T15:00:00Z                   |

#### Registro da meta (goal)

| Coluna                 | Valor                        |
|------------------------|------------------------------|
| id                     | goal-002                     |
| user_id                | user-1                       |
| description            | Comprar geladeira            |
| type                   | compra                       |
| target_value           | 2000.00                      |
| ...                    | ...                          |

**Como afeta a meta:**  
- O valor da operação (2000) é somado ao progresso da meta.
- Só operações de `nature = despesa` e `goal_id = goal-002` contam para o progresso.

---

### **Caso 3: Operação de Receita para Meta do Tipo "Compra"**

**Meta:** Comprar uma moto de R$ 10.000 (`type = compra`)

#### Registro da operação

| Coluna             | Valor                                  |
|--------------------|----------------------------------------|
| id                 | op-003                                 |
| user_id            | user-1                                 |
| nature             | receita                                |
| state              | recebido                               |
| paymentMethod      | transferência                          |
| sourceAccount      | Conta Corrente                         |
| destinationAccount | Poupança Moto                          |
| date               | 2024-08-15                             |
| value              | 500.00                                 |
| category           | Poupança                               |
| details            | Aporte para meta moto                  |
| receipt            | null                                   |
| project            | null                                   |
| goal_id            | goal-003                               |
| createdAt          | 2024-08-15T10:00:00Z                   |

#### Registro da meta (goal)

| Coluna                 | Valor                        |
|------------------------|------------------------------|
| id                     | goal-003                     |
| user_id                | user-1                       |
| description            | Comprar moto                 |
| type                   | compra                       |
| target_value           | 10000.00                     |
| ...                    | ...                          |

**Como afeta a meta:**  
- **Não afeta o progresso da meta!**
- Só operações de `nature = despesa` e `goal_id = goal-003` contam para o progresso, pois o tipo da meta é `compra`.

---

### **Caso 4: Operação de Despesa para Meta do Tipo "Receita"**

**Meta:** Juntar R$ 1.000 para reserva (`type = receita`)

#### Registro da operação

| Coluna             | Valor                                  |
|--------------------|----------------------------------------|
| id                 | op-004                                 |
| user_id            | user-1                                 |
| nature             | despesa                                |
| state              | pago                                   |
| paymentMethod      | débito                                 |
| sourceAccount      | Poupança                               |
| destinationAccount | Conta Corrente                         |
| date               | 2024-08-20                             |
| value              | 100.00                                 |
| category           | Transferência                          |
| details            | Retirada da reserva                    |
| receipt            | null                                   |
| project            | null                                   |
| goal_id            | goal-004                               |
| createdAt          | 2024-08-20T12:00:00Z                   |

#### Registro da meta (goal)

| Coluna                 | Valor                        |
|------------------------|------------------------------|
| id                     | goal-004                     |
| user_id                | user-1                       |
| description            | Juntar R$ 1.000              |
| type                   | receita                      |
| target_value           | 1000.00                      |
| ...                    | ...                          |

**Como afeta a meta:**  
- **Não afeta o progresso da meta!**
- Só operações de `nature = receita` e `goal_id = goal-004` contam para o progresso, pois o tipo da meta é `receita`.

---

### **Resumo da Lógica de Progresso da Meta**

- **Meta do tipo `receita` ou `economia`:**  
  - Soma apenas operações de `nature = receita` vinculadas à meta.
- **Meta do tipo `compra` ou `despesa`:**  
  - Soma apenas operações de `nature = despesa` vinculadas à meta.

---

## **Tabela goal (exemplo com coluna type)**

| id      | user_id | description         | type     | target_value | ... |
|---------|---------|---------------------|----------|--------------|-----|
| goal-001| user-1  | Reserva Emergência  | receita  | 400.00       | ... |
| goal-002| user-1  | Geladeira           | compra   | 2000.00      | ... |
| goal-003| user-1  | Moto                | compra   | 10000.00     | ... |
| goal-004| user-1  | Reserva             | receita  | 1000.00      | ... |

---

## Regras de negócio
- Quando o usuário registrar um valor ou operações com valores que atingam ou ultrapassem a meta, que seja o status da meta seja atualizado automaticamente para completo.


## Sugestões de melhoras futuras
1. Histórico de Progresso da Meta
O que é: Registrar cada alteração relevante no progresso da meta (ex: cada aporte, cada despesa relevante, cada mudança de status).
Benefício: Permite ao usuário visualizar uma linha do tempo do progresso, entender quando e como avançou, e identificar padrões de comportamento.
2. Alertas e Notificações Inteligentes
O que é: Notificar o usuário quando:
Está atrasado em relação ao plano mensal.
Está próximo de atingir a meta.
A meta foi atingida ou ultrapassada.
Benefício: Mantém o usuário engajado e motivado, além de evitar esquecimentos.
3. Metas Parciais/Submetas
O que é: Permitir que uma meta seja dividida em etapas ou submetas (ex: “Viagem Europa” pode ter “Passagem”, “Hospedagem”, “Passeios”).
Benefício: Ajuda o usuário a planejar melhor e celebrar pequenas conquistas ao longo do caminho.
4. Integração Visual com o Orçamento
O que é: Mostrar, na tela de orçamento, quanto do saldo disponível está sendo destinado para metas, e quanto está livre para outros usos.
Benefício: Ajuda o usuário a equilibrar vida financeira e objetivos de longo prazo.
5. Regras de Recorrência e Automação
O que é: Permitir que o usuário configure aportes automáticos para metas (ex: todo mês, transferir R$ 100 para a meta X).
Benefício: Facilita o hábito de poupar e reduz o risco de esquecer de investir na meta.
6. Meta com Data Flexível ou Sem Data
O que é: Permitir metas sem data limite (ex: “Aposentadoria”) ou com data flexível, ajustando o valor mensal conforme a evolução.
Benefício: Atende diferentes perfis de usuário e objetivos.
7. Meta Colaborativa (Multiusuário)
O que é: Permitir que mais de um usuário contribua para uma mesma meta (ex: casal juntando para uma viagem).
Benefício: Expande o uso do app para famílias, casais ou grupos.
8. Motivação e Gamificação
O que é: Adicionar conquistas, medalhas, frases motivacionais, ou até ranking de metas atingidas.
Benefício: Torna o processo mais divertido e engajador.
9. Relatórios e Insights
O que é: Gerar relatórios automáticos mostrando:
Quais metas estão mais próximas de serem atingidas.
Quais metas estão atrasadas.
Quanto foi aportado em cada meta nos últimos meses.
Benefício: Ajuda o usuário a tomar decisões melhores e ajustar o planejamento.
10. API para Integração Externa
O que é: Permitir que o usuário conecte o goal-system a outros apps (bancos, planilhas, etc).
Benefício: Facilita a automação e o uso avançado para usuários power users.