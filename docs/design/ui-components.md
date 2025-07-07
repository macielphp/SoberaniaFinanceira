# Componentes

## Passos para criar um novo componente e perguntas habituais em cada etapa
1. Planejamento do Componente
Qual a responsabilidade única desse componente? (O que ele deve fazer ou mostrar?)

Esse componente será genérico/reutilizável ou específico para uma tela?

Quais props esse componente deve receber para ser configurável?

Preciso que ele tenha estado interno ou será controlado via props?

Esse componente depende de contexto ou hooks externos?

2. Estrutura e Arquitetura
Será um componente funcional (hook-based) ou class-based?

Quais hooks vou precisar? (useState, useEffect, useContext, useMemo, etc.)

Como devo dividir o componente em subcomponentes, se for muito grande?

Preciso usar forwardRef ou React.memo para otimizar?

3. Interface e Props
Quais props são obrigatórias e quais são opcionais?

Qual o tipo esperado para cada prop? (string, number, function, objeto, etc.)

Preciso definir valores padrões (defaultProps ou padrões via ES6)?

Quais callbacks ou eventos o componente precisa expor? (onChange, onPress, onSubmit, etc.)

Como validar as props (PropTypes, TypeScript interfaces)?

4. Estilo e Layout
Qual biblioteca de estilos vou usar? (StyleSheet, styled-components, tailwind, etc.)

O componente precisa respeitar safe areas, margens ou paddings do app?

Como garantir responsividade e acessibilidade?

Precisa suportar temas claro/escuro?

Quais ícones ou imagens precisam ser usados e de onde?

5. Interatividade e Estado
O componente é controlado (controlled) ou não controlado (uncontrolled)?

Como lidar com inputs ou interações do usuário?

Preciso gerenciar loading, erro ou estados especiais?

Como o componente comunica mudanças para o pai?

6. Integração e Contexto
O componente acessa dados do FinanceContext ou outro contexto?

Precisa consumir dados ou funções externas?

Deve disparar side effects ou apenas renderizar?

Precisa suportar testes unitários ou de integração?

7. Feedback Visual
Como indicar visualmente estado ativo, erro, sucesso ou desabilitado?

O componente deve mostrar animações ou transições?

Preciso garantir feedback tátil (toques, vibração)?

8. Testes e Documentação
Já escrevi testes para esse componente? (jest, react-native-testing-library)

O componente está documentado (comentários, README, Storybook)?

Está fácil de usar por outros devs do time?

