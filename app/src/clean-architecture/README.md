# Clean Architecture - Soberania Financeira

## 📁 Estrutura de Pastas

### 🎯 Domain Layer (Camada de Domínio)
**Localização**: `domain/`

**Responsabilidades**: Contém as regras de negócio centrais da aplicação.

#### Subpastas:
- **`entities/`** - Entidades de domínio (Operation, Account, Category, etc.)
- **`use-cases/`** - Casos de uso da aplicação (CreateOperation, GetBalance, etc.)
- **`repositories/`** - Interfaces dos repositórios (contratos)
- **`services/`** - Serviços de domínio (cálculos financeiros, validações)

### 💾 Data Layer (Camada de Dados)
**Localização**: `data/`

**Responsabilidades**: Implementação do acesso a dados e persistência.

#### Subpastas:
- **`repositories/`** - Implementações concretas dos repositórios
- **`data-sources/`** - Fontes de dados (SQLite, APIs, etc.)
- **`mappers/`** - Conversores entre modelos de dados e entidades
- **`models/`** - Modelos de dados específicos da camada

### 🎨 Presentation Layer (Camada de Apresentação)
**Localização**: `presentation/`

**Responsabilidades**: Interface com o usuário e gerenciamento de estado da UI.

#### Subpastas:
- **`view-models/`** - Modelos de visualização (estado da UI)
- **`ui-adapters/`** - Adaptadores para componentes React Native
- **`pure-components/`** - Componentes puros sem dependências externas

### 🔧 Shared Layer (Camada Compartilhada)
**Localização**: `shared/`

**Responsabilidades**: Utilitários e infraestrutura compartilhada.

#### Subpastas:
- **`di/`** - Injeção de Dependência
- **`events/`** - Sistema de eventos
- **`store/`** - Gerenciamento de estado global
- **`utils/`** - Utilitários gerais

## 🔄 Fluxo de Dados

```
Presentation → Domain ← Data
     ↓           ↑        ↓
   Shared ←→ Shared ←→ Shared
```

## 📋 Regras de Dependência

1. **Domain** não depende de nenhuma outra camada
2. **Data** depende apenas de **Domain**
3. **Presentation** depende apenas de **Domain**
4. **Shared** pode ser usado por todas as camadas

## 🚀 Próximos Passos

1. Implementar entidades de domínio
2. Criar interfaces dos repositórios
3. Implementar casos de uso
4. Configurar injeção de dependência
5. Migrar componentes existentes 