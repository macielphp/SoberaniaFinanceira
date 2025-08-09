# 🚀 Guia de Migração - Clean Architecture

## 📋 **Visão Geral**

Este guia orienta a migração gradual dos componentes legados para a Clean Architecture usando o sistema de Feature Flags implementado.

## 🎯 **Estratégia de Migração**

### **1. Migração Gradual com Feature Flags**

O sistema permite migrar um componente por vez, mantendo a estabilidade da aplicação:

```typescript
// Exemplo de uso do MigrationWrapper
import { MigrationWrapper } from '../migration/MigrationWrapper';
import { FeatureFlagManager } from '../feature-flags/FeatureFlags';

const featureFlagManager = new FeatureFlagManager();

// Componente que alterna entre legacy e clean architecture
<MigrationWrapper
  featureFlag="USE_CLEAN_OPERATION_FORM"
  featureFlagManager={featureFlagManager}
  legacyComponent={<LegacyOperationForm />}
  cleanComponent={<CleanOperationForm />}
/>
```

### **2. Fases da Migração**

#### **🔥 Fase 1: Componentes Críticos (PRIORIDADE ALTA)**
- `USE_CLEAN_OPERATION_FORM` - Formulário de operações financeiras
- `USE_CLEAN_ACCOUNT_FORM` - Formulário de contas
- `USE_CLEAN_GOAL_FORM` - Formulário de metas

#### **⚡ Fase 2: Componentes de Visualização (PRIORIDADE MÉDIA)**
- `USE_CLEAN_ACCOUNT_CARD` - Cards de conta
- `USE_CLEAN_OPERATION_CARD` - Cards de operação
- `USE_CLEAN_USER_FORM` - Formulário de usuário

#### **🎨 Fase 3: Telas Completas (PRIORIDADE BAIXA)**
- `USE_CLEAN_HOME_SCREEN` - Tela principal
- `USE_CLEAN_REGISTER_SCREEN` - Tela de registro

## 📖 **Como Migrar um Componente**

### **Passo 1: Preparar o Componente Clean Architecture**

```typescript
// 1. Criar o novo componente em presentation/pure-components/
export const CleanOperationForm: React.FC<OperationFormProps> = ({
  onSubmit,
  onCancel,
  initialData
}) => {
  // Implementação seguindo Clean Architecture
  // - Sem lógica de negócio
  // - Props bem definidas
  // - Componente puro
};
```

### **Passo 2: Adicionar Feature Flag**

```typescript
// 2. Adicionar nova flag em FeatureFlags.ts
export type FeatureFlags = 
  | 'USE_CLEAN_OPERATION_FORM'
  | 'USE_CLEAN_NEW_COMPONENT'; // ← Nova flag

// 3. Adicionar na inicialização
private initializeFlags(): void {
  const allFlags: FeatureFlags[] = [
    'USE_CLEAN_OPERATION_FORM',
    'USE_CLEAN_NEW_COMPONENT', // ← Adicionar aqui
  ];
}
```

### **Passo 3: Implementar MigrationWrapper**

```typescript
// 3. Substituir componente original pelo wrapper
// ANTES:
<OperationForm {...props} />

// DEPOIS:
<MigrationWrapper
  featureFlag="USE_CLEAN_OPERATION_FORM"
  featureFlagManager={featureFlagManager}
  legacyComponent={<LegacyOperationForm {...props} />}
  cleanComponent={<CleanOperationForm {...props} />}
/>
```

### **Passo 4: Criar Testes**

```typescript
// 4. Criar testes para o componente migrado
describe('CleanOperationForm Migration', () => {
  it('should render legacy component when flag is disabled', () => {
    featureFlagManager.disable('USE_CLEAN_OPERATION_FORM');
    // ... teste
  });

  it('should render clean component when flag is enabled', () => {
    featureFlagManager.enable('USE_CLEAN_OPERATION_FORM');
    // ... teste
  });
});
```

### **Passo 5: Teste e Deploy**

```bash
# 5. Executar testes
npm test -- --testPathPattern="CleanOperationForm"

# 6. Habilitar flag gradualmente
featureFlagManager.enable('USE_CLEAN_OPERATION_FORM');

# 7. Monitorar em produção
# Se tudo OK: manter habilitado
# Se houver problemas: desabilitar e investigar
```

## 🛡️ **Estratégias de Rollback**

### **Rollback Individual**
```typescript
// Desabilitar componente específico
featureFlagManager.disable('USE_CLEAN_OPERATION_FORM');
```

### **Rollback Completo**
```typescript
// Desabilitar toda Clean Architecture
Object.keys(featureFlagManager.getAllFlags()).forEach(flag => {
  featureFlagManager.disable(flag as any);
});
```

### **Rollback de Emergência**
```typescript
// Em caso de problemas críticos, criar flag de emergência
if (EMERGENCY_ROLLBACK) {
  // Forçar uso de componentes legados
  return <LegacyComponent />;
}
```

## ⚡ **Checklist de Migração**

### **Antes da Migração:**
- [ ] ✅ Componente Clean Architecture implementado
- [ ] ✅ Testes unitários passando
- [ ] ✅ Feature flag adicionada ao sistema
- [ ] ✅ MigrationWrapper configurado
- [ ] ✅ Testes de integração passando

### **Durante a Migração:**
- [ ] 🔄 Habilitar flag em ambiente de desenvolvimento
- [ ] 🔄 Executar testes de regressão
- [ ] 🔄 Validar funcionalidade em staging
- [ ] 🔄 Habilitar para usuários beta (se aplicável)
- [ ] 🔄 Monitorar métricas de performance

### **Após a Migração:**
- [ ] ✅ Validar que não há regressões
- [ ] ✅ Confirmar melhoria de performance (se esperada)
- [ ] ✅ Documentar mudanças
- [ ] ✅ Agendar remoção do código legado (após período de confiança)

## 🔍 **Monitoramento e Métricas**

### **Métricas de Sucesso:**
```typescript
// Verificar performance
const renderTime = measureComponentRenderTime();
expect(renderTime).toBeLessThan(previousRenderTime);

// Verificar memory usage
const memoryUsage = process.memoryUsage();
expect(memoryUsage.heapUsed).toBeLessThan(acceptableLimit);

// Verificar user satisfaction
const crashRate = getCrashRate();
expect(crashRate).toBeLessThan(0.01); // Menos de 1%
```

### **Alertas e Monitoring:**
- 🚨 **Crash Rate** aumentou > 1%
- ⚠️ **Performance** degradou > 20%
- 📊 **Memory Usage** aumentou > 50%
- 🐛 **Error Rate** aumentou > 5%

## 🏆 **Boas Práticas**

### **DO's ✅**
- ✅ Migrar um componente por vez
- ✅ Manter testes atualizados
- ✅ Monitorar métricas continuamente
- ✅ Documentar mudanças
- ✅ Ter plano de rollback pronto

### **DON'Ts ❌**
- ❌ Migrar múltiplos componentes simultaneamente
- ❌ Ignorar testes de regressão
- ❌ Remover código legado prematuramente
- ❌ Migrar sem monitoramento
- ❌ Fazer mudanças direto em produção

## 🚨 **Troubleshooting**

### **Problema: Component não renderiza após migração**
```typescript
// Verificar se flag está habilitada
console.log(featureFlagManager.isEnabled('USE_CLEAN_OPERATION_FORM'));

// Verificar se props estão corretas
console.log('Props:', props);

// Verificar se componente existe
console.log('Component:', CleanOperationForm);
```

### **Problema: Performance degradada**
```typescript
// Verificar re-renders desnecessários
const MemoizedComponent = React.memo(CleanOperationForm);

// Verificar se useState está otimizado
const [state, setState] = useState(() => initialState);

// Verificar se effects estão otimizados
useEffect(() => {
  // logic
}, [dependency]); // Dependências específicas
```

### **Problema: Funcionalidade quebrada**
```typescript
// Rollback imediato
featureFlagManager.disable('USE_CLEAN_OPERATION_FORM');

// Investigar diferenças
const legacyProps = getLegacyProps();
const cleanProps = getCleanProps();
console.log('Diff:', difference(legacyProps, cleanProps));
```

## 📈 **Roadmap de Migração**

### **Semana 1-2: Componentes Críticos**
- OperationForm
- AccountForm
- GoalForm

### **Semana 3-4: Componentes de Visualização**
- AccountCard
- OperationCard
- UserForm

### **Semana 5-6: Telas Completas**
- HomeScreen
- RegisterScreen

### **Semana 7-8: Limpeza e Otimização**
- Remover código legado
- Otimizar performance
- Documentação final

## 💡 **Dicas Avançadas**

### **Feature Flags Condicionais**
```typescript
// Habilitar para usuários específicos
const shouldUseCleanArchitecture = (userId: string) => {
  if (betaUsers.includes(userId)) {
    return featureFlagManager.isEnabled('USE_CLEAN_OPERATION_FORM');
  }
  return false;
};
```

### **A/B Testing**
```typescript
// Testar performance entre versões
const isTestGroup = userId % 2 === 0;
const useCleanArchitecture = isTestGroup && 
  featureFlagManager.isEnabled('USE_CLEAN_OPERATION_FORM');
```

### **Migração Baseada em Métricas**
```typescript
// Habilitar gradualmente baseado em sucesso
if (successRate > 95 && errorRate < 1) {
  featureFlagManager.enable('USE_CLEAN_OPERATION_FORM');
}
```

---

## 📞 **Suporte**

Em caso de dúvidas ou problemas durante a migração:
1. Verificar este guia primeiro
2. Executar testes de regressão
3. Consultar logs de erro
4. Fazer rollback se necessário
5. Documentar problema para investigação

**Lembre-se: A migração gradual é a chave para o sucesso! 🚀**
