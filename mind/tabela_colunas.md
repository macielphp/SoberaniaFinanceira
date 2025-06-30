# 📊 Finanças Pessoais


# 📝 Tabela de Registro

O propósito dessa tabela é permitir que você registre todas as **entradas e saídas** das suas contas.

---
## 🔸 Coluna **Natureza**

A coluna **Natureza** define o tipo de movimentação:

1. **Despesa** (saída)
2. **Receita** (entrada)

Front-end: Lista com as opções(despesa, receita)

### ➖ Despesas

Despesas são todos os valores que **saem da sua conta** para adquirir bens ou serviços que **não te dão retorno financeiro**.


### ➕ Receitas

Receitas são todos os valores que **entram na sua conta**, seja através de vendas, serviços, produtos ou horas trabalhadas.  


---
## 🔸 Coluna **Forma de Pagamento**

Itens fixos para essa coluna:

1. Cartão de débito  
2. Cartão de crédito  
3. Pix  
4. TED  
5. Estorno  
6. Transferência bancária (com número da agência)  

front-end: Lista com as opções definidas.
---

## 🔸 Colunas **Conta-origem** e **Conta-destino**

Essas colunas representam as contas envolvidas na transação.  

- Podem ser contas **pessoais (PF)**, **empresariais (PJ)** ou de **comércios**.

front-end: Lista as contas para usuário escolher uma.
front-end: Dever haver espaço dedicado para usuário fazer o crud das contas.

### 🔹 Exemplos:
- Conta-origem: `nu_bank_pessoa_fisica`  
- Conta-destino: `Mercado`  

ou  

- Conta-origem: `PJ Bradesco`  
- Conta-destino: `Farmácia`  

ou  

- Conta-origem: `Hortifrúti Vila Judite`  
- Conta-destino: `PF Bradesco`  

> 💡 **Observação:**  
Se desejar, pode remover as colunas **Conta-origem** e **Conta-destino** e usar uma única coluna chamada **Conta**, indicando de qual conta o dinheiro saiu ou entrou.  

O modelo de origem e destino facilita entender transferências e relações entre contas.  

**Exemplo prático:**  
“R$10 saíram da carteira do João na quinta-feira para pagar os legumes no hortifrúti, ajudando no seu projeto de alimentação saudável.”

---

## 🔸 Coluna **Data**

- A data deve ser sempre completa: **dia, mês e ano**.

front-end: Componente para deixar o usuário selecionar uma data.
---

## 🔸 Coluna **Valor**

- O valor deve ser **preciso**, considerando até **centavos**, sem arredondamento.

front-end: componente para deixar o usuário digitar o valor.

---

## Coluna: **Projeto**

Qual projeto pessoal seu está anexado a operação registrada?
