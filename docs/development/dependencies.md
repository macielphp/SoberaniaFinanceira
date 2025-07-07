# 📦 Dependências do Projeto

### ✅ **Lista de dependências instaladas com suas funções:**

| Dependência                        | Descrição                                                                                                                                                    |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **@react-navigation/bottom-tabs**  | Cria uma barra de navegação fixa na parte inferior da tela, usando ícones ou texto para trocar de páginas (telas).                                           |
| **@react-navigation/native**       | Biblioteca principal de navegação no React Native. Gerencia rotas, histórico e navegação entre telas.                                                        |
| **@react-navigation/native-stack** | Implementa navegação empilhada (stack), ou seja, permite ir de uma tela para outra simulando "pilhas" de navegação (avançar e voltar).                       |
| **expo-sqlite**                    | Fornece acesso a um banco de dados **SQLite local**, permitindo salvar dados no dispositivo de forma persistente, sem precisar de internet.                  |
| **expo-status-bar**                | Permite controlar e customizar a barra de status do dispositivo (cor, visibilidade, estilo, etc.).                                                           |
| **react-native-chart-kit**         | Biblioteca de gráficos simples e fácil de usar, compatível com Expo, suportando gráficos de barras, linhas, pizza, etc.                                      |
| **react-native-gesture-handler**   | Gerencia e melhora a performance dos gestos (toques, swipes, arrastar) dentro do aplicativo. É requisito para navegação funcionar corretamente.              |
| **react-native-reanimated**        | Permite criar **animações fluidas e performáticas** no React Native, incluindo animações usadas na navegação e componentes visuais.                          |
| **react-native-safe-area-context** | Garante que os conteúdos da interface respeitem as áreas seguras da tela, como bordas, notches (entalhes) e barras do sistema.                               |
| **react-native-screens**           | Melhora a performance da navegação, controlando melhor o ciclo de vida das telas. Trabalha junto com `react-navigation/native-stack`.                        |
| **react-native-svg**               | Adiciona suporte a gráficos e imagens vetoriais em SVG dentro do React Native. É dependência essencial para bibliotecas como `react-native-chart-kit`.       |
| **react-native-vector-icons**      | Biblioteca de **ícones prontos** (Material Icons, Ionicons, FontAwesome, etc.) para usar na interface do app, principalmente na barra de navegação e botões. |

---

### 🚀 **Passo 1 – Crie o projeto com Expo:**

```bash
npx create-expo-app@latest
# Selecione: Blank (TypeScript)
cd app
npm run start
```

---

### 🚀 **Passo 2 – Instale as dependências:**

```bash
npm install \
@react-navigation/bottom-tabs \
@react-navigation/native \
@react-navigation/native-stack \
expo-sqlite \
expo-status-bar \
react-native-chart-kit \
react-native-gesture-handler \
react-native-reanimated \
react-native-safe-area-context \
react-native-screens \
react-native-svg \
react-native-vector-icons
```
