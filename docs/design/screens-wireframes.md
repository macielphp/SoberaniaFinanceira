# Telas

## Passos para criar uma nova tela e perguntas habituais em cada etapa

### 1. **Planejamento da Tela**

* Qual é o objetivo principal da tela?
* Quais dados essa tela vai exibir ou manipular?
* Preciso que a tela permita CRUD (criar, ler, atualizar, deletar) ou apenas leitura?
* Essa tela vai interagir com algum contexto ou estado global?
* Qual o fluxo esperado do usuário nessa tela?

### 2. **Definir a Navegação**

* Onde a tela será inserida no fluxo de navegação? Será uma tab, stack, modal, drawer?
* A tela deve ser acessível diretamente pelo menu/tab ou só por navegação interna?
* Quais parâmetros a tela pode receber via rota?
* A tela precisa controlar o header ou ocultá-lo?

### 3. **Estruturação do Componente**

* A tela será funcional ou class-based? (Atualmente, funcional com hooks é padrão.)
* Quais estados internos essa tela deve ter?
* Essa tela vai usar contextos? Quais?
* Quais hooks serão usados (useEffect, useState, useContext)?
* Quais componentes reutilizáveis (ex: botões, cards, formulários) vou utilizar?

### 4. **Definir o Layout e UI**

* Quais componentes visuais compõem a tela? (ScrollView, FlatList, Inputs, Botões etc.)
* Como organizar visualmente os elementos para UX amigável?
* Vou precisar de modal, drawer ou dropdowns nesta tela?
* Quais bibliotecas UI/frameworks vou usar? (MUI, NativeBase, React Native Paper, etc.)
* Quais ícones serão usados e de onde? (No seu caso, Ionicons.)

### 5. **Lógica de Dados e Integração**

* De onde virão os dados? Contexto, API, banco local (SQLite/expo-sqlite)?
* Preciso filtrar ou ordenar dados? Como?
* Como a tela vai reagir a eventos? (Submit, refresh, editar, deletar)
* Que validações são necessárias para formulários? (Yup + react-hook-form, no seu caso)
* Como lidar com erros e estados de loading?

### 6. **Gerenciamento de Estado e Side Effects**

* Preciso sincronizar dados locais com backend/contexto?
* Quando atualizar o estado local ou global?
* Quais efeitos colaterais (side effects) preciso monitorar?
* Quando limpar estados (ex: ao sair da tela)?
* Preciso de otimizações (memo, useCallback, useMemo)?

### 7. **Feedback para o Usuário**

* Como informar sucesso ou erro ao usuário? (Alertas, Snackbar, Toast)
* Devo bloquear UI em carregamentos?
* Preciso de mensagens de confirmação?
* Como mostrar feedback visual para ações (ex: loading spinner)?

### 8. **Testes e Ajustes**

* A tela funciona bem em diferentes tamanhos de tela?
* Testei os fluxos principais e casos de erro?
* O desempenho está aceitável?
* A navegação funciona como esperado?
* O código está organizado e modularizado para manutenção futura?
