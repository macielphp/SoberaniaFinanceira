# PizzaChart com Victory Native

## 🎯 Por que Victory Native?

### ✅ **Vantagens sobre react-native-chart-kit:**

1. **Controle Total de Estilos**
   - Posicionamento pixel-perfect
   - Cores, tamanhos, fontes totalmente customizáveis
   - Sem comportamentos internos inesperados

2. **Interatividade Nativa**
   - Eventos de toque nativos
   - Animações suaves
   - Feedback visual imediato

3. **Flexibilidade de Layout**
   - Respeita completamente os estilos da tag pai
   - Dimensões dinâmicas baseadas no container
   - Centralização perfeita

4. **Performance**
   - Renderização otimizada
   - Menos re-renders desnecessários
   - Melhor responsividade

## 🚀 **Como Usar:**

### Importação:
```jsx
import PizzaChartVictory from './components/Charts/PizzaChartVictory';
```

### Uso Básico:
```jsx
<PizzaChartVictory 
  data={categoryData} 
  formatCurrency={formatCurrency}
/>
```

### Uso Avançado:
```jsx
<PizzaChartVictory 
  data={categoryData}
  formatCurrency={formatCurrency}
  maxWidth={350}
  centerChart={true}
  containerStyle={{ 
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16
  }}
/>
```

## 📊 **Funcionalidades Mantidas:**

- ✅ **Botões interativos** para cada categoria
- ✅ **Legenda detalhada** ao clicar
- ✅ **Valores e porcentagens** formatados
- ✅ **Cores dinâmicas** para cada categoria
- ✅ **Animações suaves** de seleção

## 🎨 **Customizações Disponíveis:**

### Props:
- `maxWidth`: Largura máxima do gráfico (padrão: 300px)
- `centerChart`: Centralizar o gráfico (padrão: true)
- `containerStyle`: Estilos customizados do container
- `formatCurrency`: Função para formatar valores monetários

### Estilos do Gráfico:
- `innerRadius`: Raio interno (padrão: 15% da largura)
- `labelRadius`: Raio dos labels (padrão: 40% da largura)
- `colorScale`: Cores das fatias
- `stroke`: Borda das fatias
- `fillOpacity`: Opacidade das fatias

## 🔄 **Migração:**

Para migrar do PizzaChart atual:

1. **Substitua o import:**
```jsx
// Antes
import PizzaChart from './components/Charts/PizzaChart';

// Depois
import PizzaChartVictory from './components/Charts/PizzaChartVictory';
```

2. **Mantenha o mesmo uso:**
```jsx
// Funciona exatamente igual!
<PizzaChartVictory 
  data={categoryStats.map(stat => ({
    x: stat.category,
    y: stat.total,
    label: stat.category,
    percentage: (stat.total / totalGeral) * 100
  }))}
  formatCurrency={formatCurrency}
/>
```

## 🎯 **Resultado:**

- **Controle total** sobre posicionamento e estilos
- **Interatividade melhorada** com feedback visual
- **Performance otimizada**
- **Compatibilidade total** com Expo
- **Mantém toda funcionalidade** atual

---
*Esta versão resolve todos os problemas de posicionamento e oferece muito mais flexibilidade para customização.* 