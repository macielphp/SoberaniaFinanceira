## 📄 Coluna: **Estado**

A coluna **Estado** representa a situação atual de uma movimentação financeira.

### 🔸 Possíveis estados:
1. **Receber**
2. **Recebido**
3. **Pagar**
4. **Pago**
5. **Transferir**
6. **Transferido**

---

### 🔹 **Receber**

✅ **Definição:**  
Indica que você **vai receber** um valor **positivo** de alguém (**Conta-origem**), sendo uma **Natureza = receita**.

#### 💡 **Exemplo:**

| Natureza | Conta-origem              | Conta-destino          | Data       | Mês | Valor    | Categoria | Estado   |
| -------- | ------------------------- | ---------------------- | ---------- | --- | -------- | --------- | -------- |
| receita  | carrefour_com_ind_ltda    | nu_bank_pessoa_fisica  | 05/08/2024 | 8   | R$ 326,21| salario   | receber  |

➡️ Existe um valor de **R$ 326,21** a ser **recebido**.  
O valor vai entrar (**receita**) na sua conta no dia **05/08/2024** como **salário**.

---

### 🔹 **Recebido**

✅ **Definição:**  
Indica que o valor **já foi recebido**, sendo a **Natureza = receita**.

Usado principalmente em categorias como:
- **Movimentação interna**
- **salário CLT**
- **ajuda-custos**
- **vale-alimentação**
- **vale-refeição**
- **presente**, entre outras.

#### 💡 **Exemplos:**

| Natureza | Conta-origem             | Conta-destino          | Data       | Mês | Valor   | Categoria    | Estado    |
| -------- | ------------------------ | ---------------------- | ---------- | --- | ------- | ------------ | --------- |
| receita  | nu_bank_pessoa_juridica  | nu_bank_pessoa_fisica  | 31/10/2024 | 10  | R$ 81,45| transferencia| recebido  |
| receita  | construtora metrocasa sa | nu_bank_pessoa_juridica| 15/10/2024 | 10  | R$ 300,00| ajuda-custos | recebido  |

---

### 🔹 **Pagar**

✅ **Definição:**  
Indica que você **tem que pagar** um valor **negativo** para alguém (**Conta-destino**), sendo a **Natureza = despesa**.

#### 💡 **Exemplo:**

| Natureza | Conta-origem             | Conta-destino | Data       | Mês | Valor     | Categoria | Estado |
| -------- | ------------------------ | ------------- | ---------- | --- | --------- | --------- | ------ |
| despesa  | nu_bank_pessoa_juridica  | riachuelo     | 31/10/2024 | 10  | -R$ 800,00| vestimenta| pagar  |

➡️ Você tem uma **dívida de R$ 800,00** com a loja **Riachuelo**.

---

### 🔹 **Pago**

✅ **Definição:**  
Indica que você **já pagou** um valor **negativo**, sendo a **Natureza = despesa**.

#### 💡 **Exemplo:**

| Natureza | Conta-origem             | Conta-destino  | Data       | Mês | Valor      | Categoria   | Estado |
| -------- | ------------------------ | -------------- | ---------- | --- | ---------- | ----------- | ------ |
| despesa  | nu_bank_pessoa_juridica  | Terraço Itália | 31/10/2024 | 10  | -R$ 1000,00| alimentação | pago   |

➡️ Você **pagou R$ 1000,00** para o restaurante **Terraço Itália** por um jantar.

---

### 🔹 **Transferir**

✅ **Definição:**  
Indica que você **ainda vai transferir** um valor **negativo** de uma conta **sua (origem)** para outra conta **sua (destino)** — **ambas no mesmo CPF ou CNPJ**.

> 🔸 **Importante:**  
Se as contas forem de CPF diferentes, o estado correto é **"Pagar"** e não "Transferir".

#### 💡 **Exemplo:**

| Natureza | Conta-origem             | Conta-destino         | Data       | Mês | Valor         | Categoria    | Estado     |
| -------- | ------------------------ | --------------------- | ---------- | --- | ------------- | ------------ | ---------- |
| despesa  | nu_bank_pessoa_juridica  | nu_bank_pessoa_fisica | 31/10/2024 | 10  | -R$ 10.000,00 | transferencia| transferir |
| receita  | nu_bank_pessoa_juridica  | nu_bank_pessoa_fisica | 31/10/2024 | 10  | R$ 10.000,00  | transferencia| receber    |

➡️ Primeira linha: **despesa**, representa que o dinheiro vai sair da sua conta jurídica.  
➡️ Segunda linha: **receita**, representa que o dinheiro vai entrar na sua conta física.

---

### 🔹 **Transferido**

✅ **Definição:**  
Indica que você **já transferiu** um valor entre suas próprias contas (mesmo CPF/CNPJ).

#### 💡 **Exemplo:**

| Natureza | Conta-origem             | Conta-destino         | Data       | Mês | Valor     | Categoria    | Estado     |
| -------- | ------------------------ | --------------------- | ---------- | --- | --------- | ------------ | ---------- |
| despesa  | nu_bank_pessoa_juridica  | nu_bank_pessoa_fisica | 08/10/2024 | 10  | -R$ 50,00 | transferencia| transferido|
| receita  | nu_bank_pessoa_juridica  | nu_bank_pessoa_fisica | 08/10/2024 | 10  | R$ 50,00  | transferencia| recebido   |

➡️ A movimentação interna foi **concluída com sucesso**, saindo da conta jurídica e entrando na conta física.

---

### ✔️ **Resumo Visual dos Estados**

| Estado      | Descrição                                            |
| ------------| ----------------------------------------------------- |
| **Receber** | Você vai receber dinheiro (**Natureza: receita**)    |
| **Recebido**| Você já recebeu dinheiro (**Natureza: receita**)     |
| **Pagar**   | Você deve pagar um valor (**Natureza: despesa**)     |
| **Pago**    | Você já pagou um valor (**Natureza: despesa**)       |
| **Transferir** | Você vai transferir entre contas próprias         |
| **Transferido**| Você já transferiu entre contas próprias          |


## Coluna: **Detalhes**

Descreva sobre a operação. 

## Coluna: **Recibo**

Anexe o recibo: foto ou pdf