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
