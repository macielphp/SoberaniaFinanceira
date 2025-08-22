# Arquitetura do Sistema - Soberania Financeira (Clean Architecture + TDD)

## Visão Geral

O aplicativo **Soberania Financeira** é uma aplicação mobile desenvolvida em React Native com TypeScript, implementando **Clean Architecture** e **Test-Driven Development (TDD)**. A arquitetura é focada em gestão financeira pessoal com regras de negócio robustas, testabilidade e manutenibilidade.

## Tecnologias Principais

### Frontend
- **React Native** - Framework principal para desenvolvimento mobile
- **TypeScript** - Tipagem estática e melhor experiência de desenvolvimento
- **Expo** - Plataforma de desenvolvimento e deployment
- **React Navigation** - Navegação entre telas
- **React Hook Form** - Gerenciamento de formulários
- **Yup** - Validação de schemas

### Banco de Dados
- **SQLite** (expo-sqlite) - Banco de dados local
- **Modelo relacional** - Estrutura organizada para dados financeiros

### Arquitetura e Testes
- **Clean Architecture** - Separação clara de responsabilidades
- **TDD** - Test-Driven Development para qualidade
- **Jest** - Framework de testes
- **React Native Testing Library** - Testes de componentes

## Estrutura do Projeto (Clean Architecture)

```
app/
├── src/
│   ├── clean-architecture/     # 🏗️ Clean Architecture
│   │   ├── domain/            # 🎯 Regras de negócio
│   │   │   ├── entities/      # Entidades de domínio
│   │   │   ├── use-cases/     # Casos de uso
│   │   │   ├── repositories/  # Interfaces de repositórios
│   │   │   └── services/      # Serviços de domínio
│   │   ├── data/              # 💾 Camada de dados
│   │   │   ├── repositories/  # Implementações SQLite
│   │   │   ├── mappers/       # Conversores DTO ↔ Entity
│   │   │   └── dto/           # Data Transfer Objects
│   │   ├── presentation/      # 🎨 Camada de apresentação
│   │   │   ├── view-models/   # Modelos de visualização
│   │   │   ├── ui-adapters/   # Adaptadores React
│   │   │   ├── pure-components/ # Componentes puros
│   │   │   └── screens/       # Telas (composição)
│   │   └── shared/            # 🔧 Infraestrutura compartilhada
│   │       ├── di/            # Injeção de dependência
│   │       ├── events/        # Sistema de eventos
│   │       ├── store/         # Gerenciamento de estado
│   │       └── utils/         # Utilitários
│   ├── __tests__/             # 🧪 Testes (TDD)
│   │   ├── domain/            # Testes de entidades e use cases
│   │   ├── data/              # Testes de repositórios
│   │   └── clean-architecture/ # Testes de apresentação
│   ├── contexts/              # 📚 Arquitetura antiga (legacy)
│   ├── database/              # 📚 Arquitetura antiga (legacy)
│   ├── screens/               # 📚 Arquitetura antiga (legacy)
│   └── services/              # 📚 Arquitetura antiga (legacy)
├── assets/                    # Recursos estáticos
├── App.tsx                    # Componente raiz
└── package.json               # Dependências e scripts
```

## Arquitetura por Camadas (Clean Architecture)

### 1. 🎯 Domain Layer (Regras de Negócio)
**Localização**: `src/clean-architecture/domain/`

**Responsabilidades**:
- Regras de negócio centrais da aplicação
- Entidades de domínio (Operation, Account, Category, Goal, Budget, etc.)
- Use Cases (casos de uso da aplicação)
- Interfaces de repositórios (contratos)
- Serviços de domínio (cálculos, validações)

**Componentes principais**:
- **Entities**: Operation, Account, Category, Goal, Budget, BudgetItem, MonthlyFinanceSummary
- **Use Cases**: CreateOperationUseCase, CalculateBalanceUseCase, etc.
- **Repository Interfaces**: IOperationRepository, IAccountRepository, etc.
- **Domain Services**: ValidationService, CalculationService, AlertService

### 2. 💾 Data Layer (Persistência)
**Localização**: `src/clean-architecture/data/`

**Responsabilidades**:
- Implementação concreta dos repositórios
- Persistência de dados via SQLite
- Conversão entre DTOs e entidades
- Configuração de banco de dados

**Componentes principais**:
- **Repositories**: SQLiteOperationRepository, SQLiteAccountRepository, etc.
- **Mappers**: OperationMapper, AccountMapper, etc.
- **DTOs**: OperationDTO, AccountDTO, etc.
- **Database Configuration**: Configuração SQLite

### 3. 🎨 Presentation Layer (Interface)
**Localização**: `src/clean-architecture/presentation/`

**Responsabilidades**:
- Interface com o usuário
- Gerenciamento de estado da UI
- Adaptação entre domínio e React Native
- Componentes puros e reutilizáveis

**Componentes principais**:
- **ViewModels**: OperationViewModel, AccountViewModel, etc.
- **UI Adapters**: useOperationAdapter, useAccountAdapter, etc.
- **Pure Components**: OperationForm, AccountCard, etc.
- **Screens**: HomeScreen, RegisterScreen (composição)

### 4. 🔧 Shared Layer (Infraestrutura)
**Localização**: `src/clean-architecture/shared/`

**Responsabilidades**:
- Injeção de dependência
- Sistema de eventos
- Gerenciamento de estado global
- Utilitários compartilhados

**Componentes principais**:
- **DI Container**: Container, ServiceConfiguration
- **EventBus**: Sistema de eventos de domínio
- **ApplicationStore**: Estado global da aplicação
- **Utils**: Money, Result, etc.

## Fluxo de Dados (Clean Architecture)

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   UI Components │───▶│   ViewModels    │───▶│   Use Cases     │───▶│   Repositories  │
│   (Screens)     │    │   (State Mgmt)  │    │   (Business)    │    │   (Data Access) │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
         ▲                       ▲                       ▲                       ▲
         │                       │                       │                       │
         ▼                       ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Input    │    │   UI Adapters   │    │   Domain        │    │   SQLite        │
│   (Forms/Touch) │    │   (React Hooks) │    │   Entities      │    │   (Local DB)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Padrões Arquiteturais (Clean Architecture + TDD)

### 1. 🎯 Domain-Driven Design
- **Entities**: Objetos de domínio com regras de negócio
- **Value Objects**: Money, Result, etc.
- **Use Cases**: Casos de uso específicos da aplicação
- **Domain Services**: Serviços de domínio (AlertService, etc.)

### 2. 🧪 Test-Driven Development (TDD)
- **Red-Green-Refactor**: Ciclo de desenvolvimento
- **Testes Unitários**: Entidades, Use Cases, Services
- **Testes de Integração**: Repositórios, Mappers
- **Testes de Componentes**: Pure Components, ViewModels

### 3. 🔄 Dependency Inversion
- **Interfaces**: Contratos definidos no domínio
- **Implementações**: Concretas na camada de dados
- **Injeção**: Via DI Container

### 4. 🎨 Presentation Patterns
- **ViewModels**: Estado da UI e lógica de apresentação
- **UI Adapters**: Ponte entre ViewModels e React
- **Pure Components**: Componentes sem dependências externas

## Regras de Negócio (Preservadas da Arquitetura Antiga)

### 💰 Sistema Financeiro
```typescript
// Validações rigorosas de valores
- Money value object (não aceita valores negativos)
- Validação de operações financeiras
- Cálculos precisos de saldo
- Verificação de limites de crédito

// Categorias e contas
- Categorias hierárquicas (receita/despesa)
- Múltiplos tipos de conta (corrente, poupança, cartão)
- Validação de transferências entre contas
```

### 📊 Sistema de Orçamentos
```typescript
// Orçamentos manual e automático
- Budget com BudgetItems por categoria
- Cálculo de performance (superávit/déficit)
- Tracking de valores planejados vs. realizados
- MonthlyFinanceSummary para resumos mensais

// Regras específicas
- BudgetType limitado a 'manual'
- BudgetItem com CategoryType ('expense' | 'income')
- Cálculo de variância (Math.abs para Money constraints)
```

### 🎯 Sistema de Metas (Goals)
```typescript
// Metas SMART
- Descrição específica e mensurável
- Valor objetivo e prazo definido
- Renda mensal e gastos fixos
- Cálculo de viabilidade automático
- Prioridade (1-5) e importância

// Validações
- Meta deve ser atingível no prazo
- Valor mensal ≤ disponível mensal
- Sugestões automáticas de ajuste
```

### 🔔 Sistema de Alertas (A Implementar)
```typescript
// Alertas de conta
- Saldo baixo (< R$ 100)
- Saldo negativo
- Limite de crédito próximo (80%+ usado)

// Priorização
- Severidade: error > warning
- Ordenação por valor crítico
- Dismiss de alertas
```

## Estratégia de Testes (TDD)

### 🧪 Tipos de Testes
```typescript
// 1. Testes de Entidades (Domain)
describe('Operation', () => {
  it('should create valid operation', () => {
    const operation = new Operation({...});
    expect(operation.isValid()).toBe(true);
  });
});

// 2. Testes de Use Cases (Domain)
describe('CreateOperationUseCase', () => {
  it('should create operation successfully', async () => {
    const useCase = new CreateOperationUseCase(mockRepo);
    const result = await useCase.execute(validData);
    expect(result.isSuccess()).toBe(true);
  });
});

// 3. Testes de Repositórios (Data)
describe('SQLiteOperationRepository', () => {
  it('should save operation to database', async () => {
    const repo = new SQLiteOperationRepository();
    const saved = await repo.save(operation);
    expect(saved).toEqual(operation);
  });
});

// 4. Testes de ViewModels (Presentation)
describe('OperationViewModel', () => {
  it('should load operations successfully', async () => {
    const viewModel = new OperationViewModel(mockUseCase);
    await viewModel.loadOperations();
    expect(viewModel.operations).toHaveLength(2);
  });
});

// 5. Testes de Componentes (Presentation)
describe('OperationForm', () => {
  it('should render form fields', () => {
    render(<OperationForm onSubmit={mockFn} />);
    expect(screen.getByText('Valor')).toBeInTheDocument();
  });
});
```

### 📋 Cobertura de Testes
- **Domain Layer**: 100% (entidades, use cases, serviços)
- **Data Layer**: 100% (repositórios, mappers)
- **Presentation Layer**: 90%+ (view models, componentes)
- **Integration Tests**: Fluxos completos

## Performance e Otimização

### ⚡ Otimizações Clean Architecture
- **Desacoplamento**: Mudanças isoladas por camada
- **Testabilidade**: Testes unitários rápidos
- **Manutenibilidade**: Código organizado e previsível
- **Escalabilidade**: Fácil adição de novas funcionalidades

### 🚀 Otimizações React Native
- **React.memo**: Componentes puros
- **useMemo/useCallback**: Cálculos pesados
- **FlatList**: Listas grandes
- **Lazy loading**: Telas sob demanda

## Migração da Arquitetura Antiga

### 📚 Legacy Code
- **Contexts**: FinanceContext.tsx (42KB) - migração gradual
- **Database**: Operações SQLite diretas - migração para repositórios
- **Screens**: Register.tsx (36KB) - migração para Clean Architecture
- **Services**: AlertService.ts - migração para domain services

### 🔄 Estratégia de Migração
1. **Feature Flags**: Migração gradual por funcionalidade
2. **MigrationWrapper**: Componente de transição
3. **Testes de Regressão**: Garantir funcionalidade durante migração
4. **Documentação**: Guias de migração atualizados

## Segurança e Privacidade

### 🔒 Dados Financeiros
- **Validação Rigorosa**: Regras de negócio no domínio
- **Integridade**: Transações SQLite
- **Privacidade**: Dados locais, sem transmissão
- **Auditoria**: Logs de operações críticas

### ✅ Validação
- **Domain Validation**: Regras de negócio nas entidades
- **Input Validation**: Yup schemas
- **Error Handling**: Result pattern para tratamento de erros

## Escalabilidade

### 🏗️ Clean Architecture Benefits
- **Independência**: Camadas isoladas
- **Testabilidade**: Testes unitários independentes
- **Flexibilidade**: Troca de implementações
- **Manutenibilidade**: Código organizado

### 📈 Crescimento
- **Novos Use Cases**: Fácil adição
- **Novas Entidades**: Padrão estabelecido
- **Novas Telas**: Composição de componentes
- **Novas Fontes de Dados**: Implementação de repositórios

## Deployment

### 🚀 Expo
- **Build Automatizado**: CI/CD pipeline
- **Multi-ambiente**: Dev, Staging, Production
- **Over-the-air**: Updates sem nova versão
- **Analytics**: Performance e uso

### 📱 Plataformas
- **Android**: Play Store
- **iOS**: App Store
- **Web**: PWA (futuro)

## Considerações Futuras

### 🔮 Melhorias Planejadas
1. **Sistema de Alertas**: Implementação completa na Clean Architecture
2. **RegisterScreen**: Migração das 5 subtelas
3. **Use Cases**: Implementação de todos os casos de uso
4. **ViewModels**: Completar todos os view models
5. **Testes E2E**: Cenários completos de usuário

### 🛠️ Tecnologias Futuras
- **React Native New Architecture**: Fabric/TurboModules
- **Reanimated 3**: Animações avançadas
- **Biometric Auth**: Segurança avançada
- **Offline Sync**: Sincronização na nuvem

## Documentação Relacionada

- [Data Model](./data-model.md) - Estrutura dos dados
- [Database Schema](./database-schema.md) - Esquema do banco
- [Budget System](./budget-system.md) - Sistema de orçamentos
- [Goal System](./goal-system.md) - Sistema de metas
- [Design System](../design/design-system.md) - Padrões visuais
- [UI Components](../design/ui-components.md) - Componentes
- [Screens Wireframes](../design/screens-wireframes.md) - Telas
- [Clean Architecture Guide](../clean_architecture/5-step%20of%20understanding) - Guia detalhado

## Status da Implementação

### ✅ Concluído
- **Domain Layer**: Entidades, interfaces, value objects
- **Data Layer**: Repositórios SQLite, mappers, DTOs
- **Presentation Layer**: ViewModels, UI Adapters, Pure Components
- **Shared Layer**: DI Container, EventBus, ApplicationStore
- **Testes**: 962 testes passando (100% green)

### 🚧 Em Andamento
- **Sistema de Alertas**: Migração para Clean Architecture
- **RegisterScreen**: Implementação das 5 subtelas
- **Use Cases**: Implementação completa

### 📋 Próximos Passos
1. Implementar sistema de alertas (TDD)
2. Completar RegisterScreen (TDD)
3. Implementar todos os use cases (TDD)
4. Testes de integração completos