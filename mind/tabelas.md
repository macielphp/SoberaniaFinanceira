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

## 🔸 Coluna **Categoria**

A coluna de categorias deve conter palavras gerais que representam o tipo da movimentação.

front-end: dever haver lista de categorias para o usuário escolher uma(fixas, sem crud para usuário)

### 📚 **Sugestões de Categorias:**

1. Reparação  
2. Adiantamento-pessoal  
3. Movimentação interna  
4. Alimento-supermercado  
5. Aluguel  
6. Energia-elétrica  
7. Saneamento-básico  
8. Presente  
9. Doação  
10. Transporte-público (pessoal)  
11. Uber  
12. Combustível  
13. Salário-CLT  
14. PLR/Comissão  
15. Ajuda-custos-PJ  
16. Adiantamento-salário-CLT  
17. Vale-refeição  
18. Vale-alimentação  
19. Cashback  
20. Internet-e-plano-residência/móvel  
21. Lanche-rápido  
22. Vestuário  
23. Costura-roupa  
24. Curso-superior  
25. Curso-técnico  
26. Curso-profissionalizante  
27. Livro  
28. Dentista  
29. Remédio  
30. Oftalmologista  
31. Óculos-de-grau  
32. Suplemento-vitaminas  
33. Gás-cozinha  
34. Financiamento  
35. Consórcio  
36. Dívida  
37. Assinatura-digital-pessoal  
38. Assinatura-digital-profissional  
39. Acessório-celular  

---

---

### 🔧 Categoria: **Reparação**

**Reparação** é o pagamento para **repor, reparar ou cobrir** o valor de um bem danificado.

---

### 💰 Categoria: **Adiantamento**

**Adiantamento** é quando você faz um pagamento por alguém, seja comércio, colega, amigo, familiar ou desconhecido, e depois **recebe esse valor de volta**.

> 🔸 Foram criadas duas linhas:  
- **Linha 1:** Saída da sua conta (**despesa**).  
- **Linha 2:** Entrada na sua conta (**receita**) quando quem te deve te paga de volta.

O estado deve ser **"receber"** (se ainda não recebeu) ou **"recebido"** (se já foi pago).

---

### 🔄 Categoria: **Movimentação interna**

**Movimentação interna** é o registro da movimentação de dinheiro **entre suas próprias contas** (mesmo CPF ou CNPJ).

#### ➖ Sempre envolve:
- Uma linha de **despesa** (saindo da conta origem).    
- Uma linha de **receita** (entrando na conta destino).

#### 💡 **Exemplo 1: transferência já realizada**

| Natureza | Conta-origem           | Conta-destino             | Data       | Mês | Valor       | Categoria    | Estado      |
| -------- | ---------------------- | ------------------------- | ---------- | --- | ----------- | ------------ | ----------- |
| despesa  | nu_bank_pessoa_juridica| nu_bank_pessoa_fisica     | 08/10/2024 | 10  | -R$ 50,00   | movimentação interna | transferido |
| receita  | nu_bank_pessoa_juridica| nu_bank_pessoa_fisica     | 08/10/2024 | 10  | R$ 50,00    | movimentação interna | recebido    |

> 🔹 Nesse exemplo, a movimentação já foi feita (**estado: transferido e recebido**).

---

#### 💡 **Exemplo 2: movimentação interna planejada/futura**

| Natureza | Conta-origem           | Conta-destino             | Data       | Mês | Valor         | Categoria    | Estado      |
| -------- | ---------------------- | ------------------------- | ---------- | --- | ------------- | ------------ | ----------- |
| despesa  | nu_bank_pessoa_juridica| nu_bank_pessoa_fisica     | 08/10/2024 | 10  | -R$ 5.250,00  | movimentação interna| transferir  |
| receita  | nu_bank_pessoa_juridica| nu_bank_pessoa_fisica     | 08/10/2024 | 10  | R$ 5.250,00   | movimentação interna| receber     |

> 🔸 Neste segundo caso, a movimentação interna foi **agendada** e ainda não foi concluída.  

---

#### ✔️ **Resumo das Regras das Categorias:**
- **Reparação:** Entrada por reposição + saída pela compra do bem.
- **Adiantamento:** Você paga por alguém e depois recebe de volta.
- **Movimentação interna:** Movimentação interna entre suas próprias contas.

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

## Coluna: **Projeto**

Qual projeto pessoal seu está anexado a operação registrada?

# Casos de operações

## Caso 1: Despeza | Cartão de crédito | Automóvel | Pagar
O João(conta-origem) pagou no cartão de crédito(forma de pagamento: cartão de crédito) ao Pedro(conta-destino) hoje(data: dd/mm/aaaa) referente à uma peça de carro(categoria: automóvel)

João foi olhar esse seu app na tela de Visualize e viu que ele tem um saldo de 700(1200[anterior] - 500[estado: pago] = 700[saldo atual]) em sua conta. E que tinha 500[estado: pago] em despesas.

Lógica(dev):
- Registro lógico simples:
    - Linha única: Natureza: despesa; forma de pagamento: cartão de crédito; conta-origem(I); conta-destino(P); categoria(automovél); estado(pagar);
- Saldo:
    - Saldo inalterado.
    - Se o usuário mudar o estado de pagar para pago, logo o saldo será alterado.

- Tela:
    - Visualize => Usuário pode ver o valor total que ele tem 'à pagar' na tela de Visualize na seção "Pagamento pendentes"
    - Register => Usuário pode alterar o estado da operação apena na tela Register, na seção de "Gerenciamento".
    - Register => Usuário pode localizar as operações com estado em "pagar" na seção de "Gerenciamento".

## Caso 2: Despeza e Receita | PIX | Movimentação interna | Transferido e Recebido
O Pedro movimentou no pix o valor de 300,00 de sua conta de pessoa física(conta-origem = saldo - 300,00) para sua conta de pessoa juridica(conta-destino = +300).

Pedro foi olhar em sua conta PF e viu que tinha um saldo de 200(500[anterior]-300[estado: transferido] = 200[saldo atual]). Já em sua conta PJ ele tinha 800(500+300[estado: recebido]=800[atual])

Lógica(dev): 
- Registro lógico duplo automático:
    - Linha 1(manual): Natureza: despesa; forma de pagamento: PIX; conta-origem(Y); conta-destino(X); Categoria: Movimentação interna; estado: transferido;
    - Linha 2(automático): Natureza: receita; forma de pagamento: PIX; conta-origem(X); conta-destino(Y); Categoria: Movimentação interna; estado: recebido
- Saldo:
    - Saldo alterado automaticamente
- Tela:
    - Visualize => Usuário pode ver a quantidade de transferências que fez num certo periodo(datas)
    - Register => Usuário poder ver na seção de gerenciamento que foi criada duas operações. Ele até consegue ver que são duas operações "irmãs" por causa do car diferente. Se alterar uma, a outra também será alterada.

## Caso 3: Despesa | Transferência bancária | Aluguel | Pagar
Maria precisa pagar(estado: pagar; natureza: despesa) R$1000 no dia 18/10/2025 referente ao aluguel(categoria: aluguel).
Inverso: Maria precisa receber(estado: receber; natureza: receita) R$1000 no dia 18/10/2025 referente ao aluguel(categoria: aluguel).

Quando ela entrou na tela Visualise na  seção de "Pagamentos pendentes" ela viu que há 1000 a serem pagos na data 18/10/2025. Ela foi até a tela de register, na seção de GERENCIAMENTO e localizou a operação, logo, editou e mudou o estado de pagar para pago.
Inverso: Quando ela entrou na tela Visualise na  seção de "Recebimentos pendentes" ela viu que há 1000 a serem recebidos na data 18/10/2025. Ela foi até a tela de Register, na seção de GERENCIAMENTO e localizou a operação, logo, editou e mudou o estado de Receber para recebido.

Lógica(dev):
- Registro lógico simples:
    - Linha única: Natureza: despesa; forma de pagamento: Transferência bancária; conta-origem(Y); conta-destino(X); Categoria: aluguel; estado: pagar;
    - Linha única(inverso): Natureza: receita; forma de pagamento: Transferência bancária; conta-origem(Y); conta-destino(X); Categoria: aluguel; estado: receber;
- Saldo:
    - Saldo inalterado.
    - Se o usuário mudar o estado de pagar|receber para pago|recebido, logo o saldo será alterado.

## Case 4: Receita e Despesa | PIX | Adiantamento | Recebido e Pagar
Carla recebeu R$40 no PIX a sua amiga Kiti para pagar os passagens de trem para pagar depois.
Inverso: Carla fez R$40 no PIX a sua amiga Kiti para pagar os passagens de trem para pagar depois.

Lógica(dev):
- Registro lógico duplo:
    - Linha 1(manual): Natureza: receita; forma de pagamento: PIX; conta-origem(Kiti = X); conta-destino(Carla = Y); Categoria: Adiantamento; estado: recebido;
    - Linha 1(inverso): Natureza: despesa; forma de pagamento: PIX; conta-origem(Carla = Y); conta-destino(Kiti = X); Categoria: Adiantamento; estado: pagar;
    - Linha 2(automático): Natureza: despesa; forma de pagamento: PIX; conta-origem(Carla = Y); conta-destino(Kiti = X); Categoria: Adiantamento; estado: pagar;
    - Linha 2(inverso)(automático): Natureza: receita; forma de pagamento: PIX; conta-origem(Kiti = X); conta-destino(Carla = Y); Categoria: Adiantamento; estado: receber;
- Saldo:
    - Saldo de Carla foi alterado com a receita. A despesa ainda não foi alterado.
    - Inverso: Saldo de Carla foi alterado com a despesa. A receita ainda não foi alterado.
- Front-end:
    - A despesa do adiantamento só é registrado quando Carla acessar Register > Gerenciamento > alterar o estado da operação "irmã" de pagar para pago.
    - Inverso: A receita do adiantamento só é registrado quando Carla acessar Register > Gerenciamento > alterar o estado da operação "irmã" de receber para recebido.

## Case 5: Receita e Despesa | PIX | Reparação | Recebido e Pagar
O Lucas teve seu carregador de celular quebrado por sua amiga Ana.
Ana combinou de transferir via PIX o valor de R$ 50,00 para que ele comprasse outro.
Lucas recebeu R$ 50,00 da Ana (reparação).
Logo em seguida, Lucas foi até a loja TechPhone e pagou os R$ 48,00 no PIX pelo novo carregador.
Inverso: Lucas teve que pagar 200 pela tela do celular da Ana que quebrou.

Lógica(dev):
- Registro lógico duplo:
    - Linha 1(manual):Natureza: receita; Forma de pagamento: PIX; Conta-origem: Ana(Y); Conta-destino: Lucas(X); Categoria: Reparação; Estado: recebido;
    - Linha 1(manual)(inverso): Natureza: despesa; Forma de pagamento: PIX; conta-origem: Lucas(X); conta-destino(Y); categoria: Reparação; estado: pagar;
    - Linha 2(automática): Natureza: despesa; Forma de pagamento: PIX; conta-origem: Lucas(X); conta-destino: Loja eletrônicos(O); categoria: Reparação; Estado: pago;
    - Linha 2(automático)(inverso): Não existe, pois, Lucas, está pagando por algo que quebrou(despesa) e não vai receber nada em troca, nenhuma receita.
