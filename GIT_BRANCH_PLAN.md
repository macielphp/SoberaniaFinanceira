# 🌿 Plano de Branches Git - Refatoração Soberania Financeira

## 📋 Estratégia de Branches

**Estratégia:** Git Flow  
**Branch Principal:** `main` (produção)  
**Branch Desenvolvimento:** `develop` (integração)  
**Branches de Feature:** `feature/*` (desenvolvimento de funcionalidades)  
**Branches de Release:** `release/*` (preparação para produção)  
**Branches de Hotfix:** `hotfix/*` (correções urgentes)

---

## 🚀 Fase 1: Foundation & Setup

### Comandos para iniciar o projeto:

```bash
# 1. Criar branch de desenvolvimento
git checkout main
git pull origin main
git checkout -b develop
git push -u origin develop

# 2. Criar branch para Foundation
git checkout develop
git checkout -b feature/clean-architecture-setup
```

### Tarefas da Fase 1:
- [ ] **1.1** Criar nova estrutura de pastas
- [ ] **1.2** Configurar TypeScript paths
- [ ] **1.3** Implementar Dependency Container
- [ ] **1.4** Criar interfaces base
- [ ] **1.5** Configurar ambiente de testes
- [ ] **1.6** Avaliar dependências

### Comandos para finalizar Fase 1:

```bash
# Commit das mudanças
git add .
git commit -m "feat: implement foundation for clean architecture

- Add new folder structure following Clean Architecture
- Configure TypeScript paths and aliases
- Implement Dependency Container
- Create base interfaces for DI
- Setup testing environment
- Add necessary dependencies

Closes #1"

# Push e merge
git push origin feature/clean-architecture-setup
git checkout develop
git merge feature/clean-architecture-setup
git push origin develop

# Limpar branch
git branch -d feature/clean-architecture-setup
git push origin --delete feature/clean-architecture-setup
```

---

## 🏗️ Fase 2: Domain Layer

### Comandos para iniciar Fase 2:

```bash
git checkout develop
git checkout -b feature/domain-layer
```

### Tarefas da Fase 2:
- [ ] **2.1** Criar entidade Operation
- [ ] **2.2** Criar entidade Account
- [ ] **2.3** Criar entidade Category
- [ ] **2.4** Criar Value Objects
- [ ] **2.5** Criar CreateOperationUseCase
- [ ] **2.6** Criar UpdateOperationUseCase
- [ ] **2.7** Criar DeleteOperationUseCase
- [ ] **2.8** Criar GetOperationsUseCase
- [ ] **2.9** Criar OperationCalculationService
- [ ] **2.10** Criar OperationValidationService
- [ ] **2.11** Criar DTOs
- [ ] **2.12** Criar interfaces de domínio
- [ ] **2.13** Testes unitários para Entities
- [ ] **2.14** Testes unitários para Use Cases
- [ ] **2.15** Testes unitários para Domain Services

### Comandos para finalizar Fase 2:

```bash
# Commit das mudanças
git add .
git commit -m "feat: implement domain layer

- Add Operation, Account, and Category entities
- Create Value Objects (Money, OperationState, etc.)
- Implement Use Cases for CRUD operations
- Add Domain Services for calculations and validation
- Create DTOs and domain interfaces
- Add comprehensive unit tests for domain layer

Closes #2"

# Push e merge
git push origin feature/domain-layer
git checkout develop
git merge feature/domain-layer
git push origin develop

# Limpar branch
git branch -d feature/domain-layer
git push origin --delete feature/domain-layer
```

---

## 💾 Fase 3: Data Layer

### Comandos para iniciar Fase 3:

```bash
git checkout develop
git checkout -b feature/data-layer
```

### Tarefas da Fase 3:
- [ ] **3.1** Implementar SQLiteOperationRepository
- [ ] **3.2** Implementar SQLiteAccountRepository
- [ ] **3.3** Implementar SQLiteCategoryRepository
- [ ] **3.4** Criar adaptadores para SQLite
- [ ] **3.5** Implementar mapeamentos Entity ↔ Model
- [ ] **3.6** Criar modelos de dados
- [ ] **3.7** Criar modelos para Account e Category
- [ ] **3.8** Criar sistema de migrations
- [ ] **3.9** Testes de integração para Repositories
- [ ] **3.10** Testes de Mappers

### Comandos para finalizar Fase 3:

```bash
# Commit das mudanças
git add .
git commit -m "feat: implement data layer

- Add SQLite repositories for all entities
- Create data adapters and mappers
- Implement data models and DTOs
- Add migration system
- Add comprehensive integration tests
- Ensure proper separation between domain and data

Closes #3"

# Push e merge
git push origin feature/data-layer
git checkout develop
git merge feature/data-layer
git push origin develop

# Limpar branch
git branch -d feature/data-layer
git push origin --delete feature/data-layer
```

---

## 🎨 Fase 4: Presentation Layer

### Comandos para iniciar Fase 4:

```bash
git checkout develop
git checkout -b feature/presentation-layer
```

### Tarefas da Fase 4:
- [ ] **4.1** Criar OperationViewModel
- [ ] **4.2** Criar AccountViewModel
- [ ] **4.3** Criar CategoryViewModel
- [ ] **4.4** Criar adaptadores de UI
- [ ] **4.5** Refatorar OperationForm
- [ ] **4.6** Refatorar AccountsDashboard
- [ ] **4.7** Refatorar Visualize
- [ ] **4.8** Refatorar Plan
- [ ] **4.9** Criar componentes de apresentação puros
- [ ] **4.10** Testes de View Models
- [ ] **4.11** Testes de componentes

### Comandos para finalizar Fase 4:

```bash
# Commit das mudanças
git add .
git commit -m "feat: implement presentation layer

- Add ViewModels for all entities
- Create UI adapters for component communication
- Refactor all components to use ViewModels
- Separate presentation logic from business logic
- Add pure presentation components
- Add comprehensive tests for presentation layer

Closes #4"

# Push e merge
git push origin feature/presentation-layer
git checkout develop
git merge feature/presentation-layer
git push origin develop

# Limpar branch
git branch -d feature/presentation-layer
git push origin --delete feature/presentation-layer
```

---

## 📡 Fase 5: Event-Driven Architecture

### Comandos para iniciar Fase 5:

```bash
git checkout develop
git checkout -b feature/event-driven-architecture
```

### Tarefas da Fase 5:
- [ ] **5.1** Implementar EventBus
- [ ] **5.2** Criar eventos de domínio
- [ ] **5.3** Implementar event handlers
- [ ] **5.4** Conectar Use Cases com EventBus
- [ ] **5.5** Testes de EventBus
- [ ] **5.6** Testes de Event Handlers

### Comandos para finalizar Fase 5:

```bash
# Commit das mudanças
git add .
git commit -m "feat: implement event-driven architecture

- Add EventBus for decoupled communication
- Create domain events for all operations
- Implement event handlers for side effects
- Connect Use Cases with EventBus
- Add comprehensive tests for event system
- Ensure loose coupling between components

Closes #5"

# Push e merge
git push origin feature/event-driven-architecture
git checkout develop
git merge feature/event-driven-architecture
git push origin develop

# Limpar branch
git branch -d feature/event-driven-architecture
git push origin --delete feature/event-driven-architecture
```

---

## 🗃️ Fase 6: State Management

### Comandos para iniciar Fase 6:

```bash
git checkout develop
git checkout -b feature/state-management-refactor
```

### Tarefas da Fase 6:
- [ ] **6.1** Implementar ApplicationStore
- [ ] **6.2** Sincronizar ViewModels com Store
- [ ] **6.3** Implementar selectors para estado
- [ ] **6.4** Conectar eventos com Store
- [ ] **6.5** Testes de ApplicationStore
- [ ] **6.6** Testes de State Selectors

### Comandos para finalizar Fase 6:

```bash
# Commit das mudanças
git add .
git commit -m "feat: implement state management

- Add ApplicationStore for centralized state
- Synchronize ViewModels with Store
- Implement state selectors for efficient queries
- Connect events with Store updates
- Add comprehensive tests for state management
- Remove dependency on React Context for state

Closes #6"

# Push e merge
git push origin feature/state-management-refactor
git checkout develop
git merge feature/state-management-refactor
git push origin develop

# Limpar branch
git branch -d feature/state-management-refactor
git push origin --delete feature/state-management-refactor
```

---

## 🔄 Fase 7: Migration & Integration

### Comandos para iniciar Fase 7:

```bash
git checkout develop
git checkout -b feature/migration-integration
```

### Tarefas da Fase 7:
- [ ] **7.1** Configurar DI Container com todas as implementações
- [ ] **7.2** Implementar migração gradual
- [ ] **7.3** Testes de integração end-to-end
- [ ] **7.4** Otimizar performance
- [ ] **7.5** Corrigir bugs identificados durante migração

### Comandos para finalizar Fase 7:

```bash
# Commit das mudanças
git add .
git commit -m "feat: implement migration and integration

- Configure DI Container with all implementations
- Implement gradual migration strategy
- Add comprehensive integration tests
- Optimize performance and reduce re-renders
- Fix bugs identified during migration
- Ensure backward compatibility

Closes #7"

# Push e merge
git push origin feature/migration-integration
git checkout develop
git merge feature/migration-integration
git push origin develop

# Limpar branch
git branch -d feature/migration-integration
git push origin --delete feature/migration-integration
```

---

## 🧹 Fase 8: Cleanup & Documentation

### Comandos para iniciar Fase 8:

```bash
git checkout develop
git checkout -b feature/cleanup-documentation
```

### Tarefas da Fase 8:
- [ ] **8.1** Remover FinanceContext antigo
- [ ] **8.2** Remover código legado
- [ ] **8.3** Atualizar documentação
- [ ] **8.4** Criar diagramas arquiteturais
- [ ] **8.5** Testes finais
- [ ] **8.6** Preparar para produção

### Comandos para finalizar Fase 8:

```bash
# Commit das mudanças
git add .
git commit -m "feat: cleanup and documentation

- Remove old FinanceContext and legacy code
- Update all documentation with new architecture
- Create architectural diagrams
- Add final comprehensive tests
- Prepare for production deployment
- Complete refactoring to Clean Architecture

Closes #8"

# Push e merge
git push origin feature/cleanup-documentation
git checkout develop
git merge feature/cleanup-documentation
git push origin develop

# Limpar branch
git branch -d feature/cleanup-documentation
git push origin --delete feature/cleanup-documentation
```

---

## 🚀 Release para Produção

### Comandos para criar Release:

```bash
# Criar branch de release
git checkout develop
git checkout -b release/v2.0.0

# Fazer ajustes finais se necessário
# Atualizar version numbers, changelog, etc.

# Commit dos ajustes finais
git add .
git commit -m "chore: prepare release v2.0.0

- Update version numbers
- Update changelog
- Final testing and validation
- Prepare for production deployment"

# Merge para main
git checkout main
git merge release/v2.0.0
git tag v2.0.0
git push origin main --tags

# Merge para develop
git checkout develop
git merge release/v2.0.0
git push origin develop

# Limpar branch de release
git branch -d release/v2.0.0
git push origin --delete release/v2.0.0
```

---

## 🚨 Hotfixes (se necessário)

### Comandos para hotfix:

```bash
# Criar branch de hotfix
git checkout main
git checkout -b hotfix/critical-bug-fix

# Fazer correções
# ...

# Commit das correções
git add .
git commit -m "fix: critical bug fix

- Fix critical issue in production
- Ensure data integrity
- Add regression tests"

# Merge para main
git checkout main
git merge hotfix/critical-bug-fix
git tag v2.0.1
git push origin main --tags

# Merge para develop
git checkout develop
git merge hotfix/critical-bug-fix
git push origin develop

# Limpar branch
git branch -d hotfix/critical-bug-fix
git push origin --delete hotfix/critical-bug-fix
```

---

## 📊 Comandos Úteis para Acompanhamento

### Verificar status das branches:

```bash
# Listar todas as branches
git branch -a

# Verificar branch atual
git branch

# Verificar status
git status

# Verificar commits recentes
git log --oneline -10

# Verificar diferenças entre branches
git diff develop..main
```

### Limpeza de branches:

```bash
# Remover branches locais já mergeadas
git branch --merged | grep -v "\*" | xargs -n 1 git branch -d

# Remover branches remotas já mergeadas
git remote prune origin

# Verificar branches não mergeadas
git branch --no-merged
```

### Backup e rollback:

```bash
# Criar backup antes de mudanças grandes
git tag backup-before-refactor-$(date +%Y%m%d)

# Rollback para commit específico
git reset --hard <commit-hash>

# Rollback para tag
git reset --hard v1.0.0
```

---

## 📋 Checklist de Branches

### Antes de cada merge:
- [ ] Todos os testes passando
- [ ] Code review aprovado
- [ ] Documentação atualizada
- [ ] Commits com mensagens claras
- [ ] Branch atualizada com develop

### Após cada merge:
- [ ] Branch deletada localmente
- [ ] Branch deletada remotamente
- [ ] Develop atualizada
- [ ] Testes de integração passando

### Antes do release:
- [ ] Todas as features completadas
- [ ] Testes de regressão passando
- [ ] Performance validada
- [ ] Documentação finalizada
- [ ] Changelog atualizado

---

## 🎯 Próximos Passos

1. **Executar comando inicial:**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b develop
   git push -u origin develop
   ```

2. **Iniciar Fase 1:**
   ```bash
   git checkout develop
   git checkout -b feature/clean-architecture-setup
   ```

3. **Seguir cronograma** conforme definido no `REFACTORING_PLAN.md`

**Status:** 🌿 Pronto para execução  
**Próxima Ação:** Iniciar Fase 1 - Foundation  
**Responsável:** Dev Principal 