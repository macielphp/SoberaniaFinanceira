# Soberania Financeira 💰

Um aplicativo mobile para organização financeira pessoal, desenvolvido como projeto de extensão universitária focado em ajudar brasileiros inadimplentes a retomar o controle de suas finanças.

## 📱 Sobre o Projeto

**Soberania Financeira** é um aplicativo Android desenvolvido em React Native que permite aos usuários organizar suas finanças pessoais, planejar metas, projetar economias e visualizar dívidas de forma clara e intuitiva.

O projeto nasceu da identificação de uma demanda sociocomunitária: milhões de brasileiros enfrentam dificuldades financeiras devido à falta de ferramentas acessíveis para planejamento e controle de gastos.

## 🎯 Objetivos

### Objetivo Geral
Desenvolver uma ferramenta digital que permita ao usuário organizar suas finanças pessoais, planejar metas, projetar economias e visualizar suas dívidas de forma clara e intuitiva.

### Objetivos Específicos
- ✅ Criar sistema de cadastro e visualização de dívidas e despesas recorrentes
- ✅ Implementar projeção de economia futura (3, 6 e 12 meses)
- ✅ Permitir cadastro de metas financeiras
- ✅ Reduzir o uso de métodos manuais de controle financeiro
- ✅ Promover educação financeira através de funcionalidades práticas

## 🚀 Funcionalidades

### Principais Features
- **📊 Dashboard Financeiro**: Visão geral das finanças pessoais
- **💳 Gestão de Dívidas**: Cadastro e acompanhamento de pendências
- **📅 Planejamento Mensal**: Organização de receitas e despesas
- **🎯 Metas Financeiras**: Definição e acompanhamento de objetivos
- **📈 Projeções Futuras**: Simulação de cenários de economia
- **🔄 Sincronização Offline**: Funciona sem conexão com internet
- **📱 Interface Intuitiva**: Design pensado para facilitar o uso

### Diferenciais
- **Offline First**: Funciona sem internet
- **Segurança**: Dados armazenados localmente
- **Simplicidade**: Interface limpa e funcional
- **Educação**: Foco em orientação financeira

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React Native 0.79.4** - Framework principal
- **TypeScript** - Tipagem estática
- **Expo ~53.0.12** - Plataforma de desenvolvimento
- **React Navigation** - Navegação entre telas
- **React Hook Form** - Gerenciamento de formulários
- **Yup** - Validação de dados

### Banco de Dados
- **SQLite** (expo-sqlite) - Banco local
- **Modelo relacional** - Estrutura organizada

### UI/UX
- **React Native Chart Kit** - Gráficos e visualizações
- **React Native Vector Icons** - Ícones
- **React Native Modal** - Modais e popups
- **React Native Reanimated** - Animações

## 📋 Pré-requisitos

- Node.js (versão 18 ou superior)
- npm ou yarn
- Expo CLI
- Android Studio (para emulador Android)
- Dispositivo Android físico (opcional)

## 🔧 Instalação e Configuração

1. **Clone o repositório**
```bash
git clone https://github.com/macielphp/SoberaniaFinanceira.git
cd SoberaniaFinanceira/app
```

2. **Instale as dependências**
```bash
npm install
# ou
yarn install
```

3. **Execute o projeto**
```bash
npm start
# ou
yarn start
```

4. **Execute em dispositivo/emulador**
```bash
# Android
npm run android

# iOS (Mac apenas)
npm run ios

# Web
npm run web
```

## 📱 Como Usar

### 0. Primeiro passo
- Assista à apresentação e aprenda com tutoriais

### 1. Faça
- Faça o cadastro inicial
- Configure suas informações básicas
- Defina sua renda mensal

### 2. Cadastro de Dívidas
- Acesse "Minhas Dívidas"
- Adicione cada pendência com valor e vencimento
- Categorize suas dívidas

### 3. Planejamento Mensal
- Registre suas receitas
- Cadastre gastos fixos e variáveis
- Acompanhe o saldo disponível

### 4. Definição de Metas
- Crie metas financeiras específicas
- Defina prazos e valores
- Acompanhe o progresso

### 5. Projeções
- Visualize cenários futuros
- Simule diferentes estratégias de economia
- Planeje sua reserva de emergência

## 📊 Público-Alvo

### Perfil Principal
**Brasileiros inadimplentes** que buscam retomar o controle financeiro:

- **Faixa etária**: 26 a 60 anos (69,1% do público)
- **Localização**: Todo território nacional
- **Situação**: Pessoas com restrições no CPF
- **Necessidade**: Ferramentas de organização financeira

### Dados do Mercado
Segundo o Mapa da Inadimplência da Serasa (2024):
- 41 a 60 anos – 35,1%
- 26 a 40 anos – 34%
- Acima de 60 anos – 18,9%
- 18 a 25 anos – 11,7%

## 📁 Estrutura do Projeto

```
app/
├── src/
│   ├── components/          # Componentes reutilizáveis
│   ├── contexts/           # Contextos (estado global)
│   ├── database/           # Configuração SQLite
│   ├── screens/            # Telas da aplicação
│   ├── services/           # Serviços e lógica de negócio
│   ├── styles/             # Estilos globais
│   └── utils/              # Funções utilitárias
├── assets/                 # Imagens e recursos
├── docs/                   # Documentação do projeto
├── App.tsx                 # Componente raiz
└── package.json           # Dependências
```

## 🎨 Design System

O projeto segue diretrizes de design focadas em:
- **Acessibilidade**: Interfaces claras e legíveis
- **Usabilidade**: Fluxos intuitivos e simples
- **Consistência**: Padrões visuais uniformes
- **Responsividade**: Adaptação a diferentes telas

## 🧪 Testes

### Estratégia de Testes
- **Testes Unitários**: Funções e hooks
- **Testes de Componentes**: Interfaces isoladas
- **Testes de Integração**: Fluxos completos
- **Testes de Usabilidade**: Validação com usuários reais

### Executar Testes
```bash
npm test
# ou
yarn test
```

## 📈 Metodologia de Desenvolvimento

### Abordagem Ágil
1. **Levantamento de Requisitos** - Entrevistas com usuários
2. **Prototipação** - Design no Figma
3. **Desenvolvimento Incremental** - Entregas funcionais
4. **Testes Contínuos** - Validação constante
5. **Feedback e Ajustes** - Melhorias baseadas no uso real

### Avaliação de Resultados
- **Métricas de Uso**: Cadastros, simulações, metas criadas
- **Usabilidade**: Tempo de interação, dificuldades encontradas
- **Impacto**: Mudanças no comportamento financeiro
- **Satisfação**: Feedback direto dos usuários

## 🚀 Roadmap

### Versão Atual (v1.0)
- ✅ Cadastro de dívidas e despesas
- ✅ Planejamento mensal básico
- ✅ Interface responsiva

### Próximas Versões
- 🔄 Sincronização na nuvem
- 📊 Relatórios avançados
- 📊 Projeções
- 🔔 Notificações e lembretes
- 🔐 Autenticação biométrica
- 📤 Export/import de dados
- 🎓 Módulo de educação financeira

## 🤝 Contribuição

Este é um projeto de extensão universitária aberto a contribuições:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Contato

**Desenvolvedor**: [Maciel Alves]
**Email**: [macielalvescontato@gmail.com]
**Universidade**: [Universidade Estácio de Sá]
**Curso**: [Análise e desenvolvimento de sistemas]

**Links do Projeto**:
- 📱 [APK para Download](em breve)
- 📋 [Documentação Completa](docs/)
- 🎨 [Protótipos no Figma](mental ;))

---

## 📊 Expectative de Métricas de Impacto

### Resultados Esperados
- **Usuários Atendidos**: 100+ pessoas
- **Redução de Desorganização**: 80% dos usuários relatam melhora
- **Metas Alcançadas**: 60% conseguem cumprir objetivos definidos
- **Satisfação**: 4.5+ estrelas na avaliação dos usuários
Link do relatório de avaliações: (em breve)

### Impacto Social
- Democratização do planejamento financeiro
- Redução da ansiedade financeira
- Educação financeira prática
- Inclusão digital de públicos vulneráveis

---

*"Promovendo a soberania financeira através da tecnologia e educação."*

[![Made with React Native](https://img.shields.io/badge/Made%20with-React%20Native-blue?style=for-the-badge&logo=react)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)