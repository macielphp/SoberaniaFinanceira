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